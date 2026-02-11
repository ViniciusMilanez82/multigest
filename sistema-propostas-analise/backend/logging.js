// Sistema de logs estruturados e monitoramento
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const expressWinston = require('express-winston');
const promClient = require('prom-client');

// Configuração do registro de métricas Prometheus
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();

// Coletar métricas padrão
collectDefaultMetrics({ register });

// Definir métricas personalizadas
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em milissegundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code']
});

const databaseQueryDurationMicroseconds = new promClient.Histogram({
  name: 'database_query_duration_ms',
  help: 'Duração das consultas ao banco de dados em milissegundos',
  labelNames: ['query_type'],
  buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000, 5000]
});

// Registrar métricas personalizadas
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(databaseQueryDurationMicroseconds);

// Formato personalizado para logs de desenvolvimento
const devLogFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''}`;
});

// Criar logger para aplicação
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    process.env.NODE_ENV === 'production' 
      ? json() 
      : combine(colorize(), devLogFormat)
  ),
  defaultMeta: { service: 'sistema-propostas' },
  transports: [
    // Sempre logar para console
    new transports.Console(),
    
    // Em produção, adicionar arquivo de log para erros
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ] : [])
  ],
  // Não encerrar em exceções não tratadas
  exitOnError: false
});

// Middleware para logging de requisições
const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: process.env.NODE_ENV !== 'production',
  // Mascarar dados sensíveis
  requestFilter: (req, propName) => {
    if (propName === 'headers' && req.headers.authorization) {
      const headers = {...req.headers};
      headers.authorization = 'REDACTED';
      return headers;
    }
    if (propName === 'body') {
      const body = {...req.body};
      // Remover campos sensíveis
      if (body.password) body.password = 'REDACTED';
      if (body.token) body.token = 'REDACTED';
      return body;
    }
    return req[propName];
  }
});

// Middleware para logging de erros
const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  msg: 'Erro: {{err.message}}. Rota: {{req.method}} {{req.url}}',
  // Mascarar dados sensíveis
  requestFilter: (req, propName) => {
    if (propName === 'headers' && req.headers.authorization) {
      const headers = {...req.headers};
      headers.authorization = 'REDACTED';
      return headers;
    }
    if (propName === 'body') {
      const body = {...req.body};
      // Remover campos sensíveis
      if (body.password) body.password = 'REDACTED';
      if (body.token) body.token = 'REDACTED';
      return body;
    }
    return req[propName];
  }
});

// Middleware para métricas de requisições HTTP
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Função para registrar métricas após a resposta
  const recordMetrics = () => {
    const duration = Date.now() - start;
    
    // Normalizar rota para evitar cardinalidade alta
    const route = req.route ? req.route.path : req.path;
    const normalizedRoute = route.replace(/\/\d+/g, '/:id');
    
    // Registrar duração e contador
    httpRequestDurationMicroseconds
      .labels(req.method, normalizedRoute, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, normalizedRoute, res.statusCode)
      .inc();
  };
  
  // Registrar métricas após a resposta
  res.on('finish', recordMetrics);
  
  next();
};

// Middleware para expor métricas Prometheus
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error('Erro ao gerar métricas', { error: err.message });
    res.status(500).end();
  }
};

// Middleware para monitorar consultas ao banco de dados
const monitorDatabaseQuery = (pool) => {
  // Salvar referência ao método original
  const originalQuery = pool.query;
  
  // Substituir com versão instrumentada
  pool.query = function instrumentedQuery(text, params) {
    const start = Date.now();
    const queryType = text.trim().split(' ')[0].toLowerCase();
    
    logger.debug('Executando consulta SQL', { 
      query: text.replace(/\s+/g, ' ').trim(),
      params: params ? JSON.stringify(params) : 'none'
    });
    
    // Chamar método original
    const result = originalQuery.apply(this, arguments);
    
    // Para consultas com Promise
    if (result && typeof result.then === 'function') {
      return result.then(res => {
        const duration = Date.now() - start;
        
        databaseQueryDurationMicroseconds
          .labels(queryType)
          .observe(duration);
        
        logger.debug('Consulta SQL concluída', { 
          duration,
          rows: res.rowCount
        });
        
        return res;
      }).catch(err => {
        logger.error('Erro na consulta SQL', { 
          error: err.message,
          query: text.replace(/\s+/g, ' ').trim()
        });
        throw err;
      });
    }
    
    // Para consultas com callback
    return result;
  };
  
  return pool;
};

// Função para registrar eventos de negócio
const logBusinessEvent = (event, data = {}) => {
  logger.info(`Evento de negócio: ${event}`, { 
    event, 
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Função para registrar eventos de segurança
const logSecurityEvent = (event, data = {}) => {
  logger.warn(`Evento de segurança: ${event}`, { 
    event, 
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Função para registrar eventos de sistema
const logSystemEvent = (event, data = {}) => {
  logger.info(`Evento de sistema: ${event}`, { 
    event, 
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Função para registrar erros
const logError = (error, context = {}) => {
  logger.error(`Erro: ${error.message}`, { 
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    },
    ...context,
    timestamp: new Date().toISOString()
  });
};

// Exportar funções e middlewares
module.exports = {
  logger,
  requestLogger,
  errorLogger,
  metricsMiddleware,
  metricsEndpoint,
  monitorDatabaseQuery,
  logBusinessEvent,
  logSecurityEvent,
  logSystemEvent,
  logError,
  metrics: {
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    databaseQueryDurationMicroseconds
  }
};
