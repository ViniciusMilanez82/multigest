// Módulo de segurança para o sistema de propostas
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

// Configuração de segurança para Express
const configureSecurityMiddleware = (app) => {
  // Proteção de cabeçalhos HTTP com Helmet
  app.use(helmet());
  
  // Configurar CORS com opções restritivas
  const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Cache'],
    credentials: true,
    maxAge: 86400 // 24 horas
  };
  
  app.use(cors(corsOptions));
  
  // Limitar tamanho do corpo das requisições
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Proteção contra XSS (Cross-Site Scripting)
  app.use(xss());
  
  // Proteção contra poluição de parâmetros HTTP
  app.use(hpp());
  
  // Configurar Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'code.jquery.com', 'cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'cdnjs.cloudflare.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    })
  );
  
  // Configurar outros cabeçalhos de segurança
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.expectCt());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());
  
  // Adicionar cabeçalho de segurança personalizado
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  
  return app;
};

// Configurar rate limiting para diferentes rotas
const configureLimiter = (app, logger) => {
  // Limiter para rotas de autenticação
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas tentativas de login. Por favor, tente novamente após 15 minutos.',
    handler: (req, res, next, options) => {
      logger.logSecurityEvent('rate-limit-exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      res.status(options.statusCode).json({
        error: options.message
      });
    }
  });
  
  // Limiter para rotas de API
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // 60 requisições por minuto
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições. Por favor, tente novamente após 1 minuto.',
    handler: (req, res, next, options) => {
      logger.logSecurityEvent('rate-limit-exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      res.status(options.statusCode).json({
        error: options.message
      });
    }
  });
  
  // Aplicar limiters às rotas
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/', apiLimiter);
  
  return app;
};

// Validadores para diferentes entidades
const validators = {
  // Validador para registro de usuário
  registerValidator: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Nome de usuário deve ter entre 3 e 30 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Nome de usuário deve conter apenas letras, números e underscore')
      .escape(),
    body('email')
      .trim()
      .isEmail()
      .withMessage('E-mail inválido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter pelo menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial')
  ],
  
  // Validador para login
  loginValidator: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Nome de usuário é obrigatório')
      .escape(),
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória')
  ],
  
  // Validador para proposta
  propostaValidator: [
    body('data')
      .isDate()
      .withMessage('Data inválida'),
    body('numero')
      .isString()
      .isLength({ min: 5, max: 20 })
      .withMessage('Número de proposta inválido')
      .escape(),
    body('tipo')
      .isIn(['venda', 'locacao', 'evento'])
      .withMessage('Tipo de proposta inválido'),
    body('empresa')
      .isString()
      .isLength({ min: 2, max: 255 })
      .withMessage('Nome da empresa inválido')
      .escape(),
    body('telefone')
      .matches(/^\(\d{2}\) \d{5}-\d{4}$/)
      .withMessage('Telefone inválido'),
    body('email')
      .isEmail()
      .withMessage('E-mail inválido')
      .normalizeEmail(),
    body('contato')
      .isString()
      .isLength({ min: 2, max: 255 })
      .withMessage('Nome de contato inválido')
      .escape(),
    body('itens')
      .isArray({ min: 1 })
      .withMessage('A proposta deve ter pelo menos um item'),
    body('valorTotal')
      .isFloat({ min: 0 })
      .withMessage('Valor total inválido')
  ]
};

// Middleware para validar resultados
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Funções de segurança para dados sensíveis
const security = {
  // Gerar hash seguro para senha
  hashPassword: async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },
  
  // Verificar senha
  verifyPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },
  
  // Gerar token JWT
  generateToken: (payload, expiresIn = '24h') => {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
      { expiresIn }
    );
  },
  
  // Verificar token JWT
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    } catch (err) {
      return null;
    }
  },
  
  // Middleware para verificar autenticação
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const user = security.verifyToken(token);
    
    if (!user) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    
    req.user = user;
    next();
  },
  
  // Sanitizar dados de entrada
  sanitizeInput: (data) => {
    if (typeof data === 'string') {
      // Sanitizar string
      return data.replace(/<(?:.|\n)*?>/gm, '').trim();
    } else if (Array.isArray(data)) {
      // Sanitizar array
      return data.map(item => security.sanitizeInput(item));
    } else if (typeof data === 'object' && data !== null) {
      // Sanitizar objeto
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = security.sanitizeInput(value);
      }
      return sanitized;
    }
    
    // Retornar outros tipos sem alteração
    return data;
  },
  
  // Middleware para sanitizar corpo da requisição
  sanitizeBody: (req, res, next) => {
    if (req.body) {
      req.body = security.sanitizeInput(req.body);
    }
    next();
  }
};

// Middleware para proteção contra CSRF
const csrfProtection = (app, logger) => {
  // Gerar token CSRF
  app.use((req, res, next) => {
    // Apenas para rotas não-GET e não-HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const csrfToken = req.headers['x-csrf-token'];
      const sessionToken = req.session && req.session.csrfToken;
      
      if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
        logger.logSecurityEvent('csrf-attack-attempt', {
          ip: req.ip,
          path: req.path,
          method: req.method
        });
        return res.status(403).json({ error: 'CSRF token inválido' });
      }
    }
    
    // Gerar novo token para a sessão
    if (req.session) {
      req.session.csrfToken = crypto.randomBytes(64).toString('hex');
      // Adicionar token ao cabeçalho da resposta
      res.setHeader('X-CSRF-Token', req.session.csrfToken);
    }
    
    next();
  });
  
  return app;
};

// Middleware para detectar ataques de força bruta
const bruteForceProtection = (app, logger) => {
  // Mapa para armazenar tentativas de login
  const loginAttempts = new Map();
  
  // Middleware para detectar tentativas de login
  app.use('/api/auth/login', (req, res, next) => {
    const ip = req.ip;
    const username = req.body.username;
    
    if (!username) {
      return next();
    }
    
    const key = `${ip}:${username}`;
    const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
    
    // Verificar se está bloqueado
    const now = Date.now();
    const blockDuration = 15 * 60 * 1000; // 15 minutos
    
    if (attempts.count >= 5 && now - attempts.lastAttempt < blockDuration) {
      logger.logSecurityEvent('brute-force-blocked', {
        ip,
        username,
        attempts: attempts.count
      });
      
      return res.status(429).json({
        error: 'Muitas tentativas de login. Conta temporariamente bloqueada. Tente novamente mais tarde.'
      });
    }
    
    // Atualizar tentativas
    attempts.count += 1;
    attempts.lastAttempt = now;
    loginAttempts.set(key, attempts);
    
    // Limpar tentativas antigas periodicamente
    if (attempts.count === 1) {
      setTimeout(() => {
        loginAttempts.delete(key);
      }, blockDuration);
    }
    
    next();
  });
  
  // Middleware para resetar tentativas após login bem-sucedido
  app.use((req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(body) {
      // Se for resposta de login bem-sucedido
      if (req.path === '/api/auth/login' && body && body.token) {
        const ip = req.ip;
        const username = req.body.username;
        const key = `${ip}:${username}`;
        
        // Resetar tentativas
        loginAttempts.delete(key);
        
        logger.logSecurityEvent('login-success', {
          ip,
          username
        });
      }
      
      return originalJson.call(this, body);
    };
    
    next();
  });
  
  return app;
};

// Middleware para proteção contra SQL Injection
const sqlInjectionProtection = (pool, logger) => {
  // Salvar referência ao método original
  const originalQuery = pool.query;
  
  // Substituir com versão protegida
  pool.query = function protectedQuery(text, params) {
    // Verificar por padrões suspeitos de SQL Injection
    const sqlInjectionPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i
    ];
    
    // Verificar texto da query
    const isSuspicious = sqlInjectionPatterns.some(pattern => {
      if (typeof text === 'string' && pattern.test(text)) {
        return true;
      }
      return false;
    });
    
    // Verificar parâmetros
    const hasSuspiciousParams = params && params.some(param => {
      if (typeof param === 'string') {
        return sqlInjectionPatterns.some(pattern => pattern.test(param));
      }
      return false;
    });
    
    if (isSuspicious || hasSuspiciousParams) {
      logger.logSecurityEvent('sql-injection-attempt', {
        query: text,
        params: JSON.stringify(params)
      });
      
      // Lançar erro em vez de executar a query suspeita
      const error = new Error('Possível tentativa de SQL Injection detectada');
      error.code = 'SQLINJECT';
      
      if (typeof arguments[arguments.length - 1] === 'function') {
        // Callback style
        const callback = arguments[arguments.length - 1];
        return callback(error);
      } else {
        // Promise style
        return Promise.reject(error);
      }
    }
    
    // Executar query original se não for suspeita
    return originalQuery.apply(this, arguments);
  };
  
  return pool;
};

// Exportar funções e middlewares
module.exports = {
  configureSecurityMiddleware,
  configureLimiter,
  validators,
  validate,
  security,
  csrfProtection,
  bruteForceProtection,
  sqlInjectionProtection
};
