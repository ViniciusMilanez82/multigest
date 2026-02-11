// Configuração do servidor Express com autenticação JWT e validação robusta
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar aplicação Express
const app = express();

// Configuração de middlewares de segurança
app.use(helmet()); // Proteção de cabeçalhos HTTP
app.use(cors()); // Habilitar CORS
app.use(bodyParser.json()); // Parsing de JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined')); // Logging de requisições

// Configurar rate limiting para prevenir ataques de força bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos'
});

// Aplicar rate limiting a todas as rotas
app.use(limiter);

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sistema_propostas',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Testar conexão com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso');
        release();
    }
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado' });
        }
        
        req.user = user;
        next();
    });
};

// Rotas de autenticação
app.post('/api/auth/register', [
    // Validação de campos
    body('username').isLength({ min: 3 }).withMessage('Nome de usuário deve ter pelo menos 3 caracteres'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('email').isEmail().withMessage('E-mail inválido')
], async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { username, password, email } = req.body;
        
        // Verificar se usuário já existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE username = $1 OR email = $2', [username, email]);
        
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado' });
        }
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Inserir novo usuário
        const result = await pool.query(
            'INSERT INTO usuarios (username, password, email, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, username, email',
            [username, hashedPassword, email]
        );
        
        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/auth/login', [
    // Validação de campos
    body('username').notEmpty().withMessage('Nome de usuário é obrigatório'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { username, password } = req.body;
        
        // Buscar usuário
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const user = result.rows[0];
        
        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Erro ao autenticar usuário:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rotas de propostas (protegidas por autenticação)
app.post('/api/propostas', authenticateToken, [
    // Validação de campos
    body('data').isDate().withMessage('Data inválida'),
    body('numero').isString().isLength({ min: 5, max: 20 }).withMessage('Número de proposta inválido'),
    body('tipo').isIn(['venda', 'locacao', 'evento']).withMessage('Tipo de proposta inválido'),
    body('empresa').isString().isLength({ min: 2, max: 255 }).withMessage('Nome da empresa inválido'),
    body('telefone').matches(/^\(\d{2}\) \d{5}-\d{4}$/).withMessage('Telefone inválido'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('contato').isString().isLength({ min: 2, max: 255 }).withMessage('Nome de contato inválido'),
    body('itens').isArray({ min: 1 }).withMessage('A proposta deve ter pelo menos um item'),
    body('valorTotal').isFloat({ min: 0 }).withMessage('Valor total inválido')
], async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { data, numero, tipo, empresa, telefone, email, contato, itens, valorTotal } = req.body;
        
        // Verificar se já existe proposta com o mesmo número
        const propostaCheck = await pool.query('SELECT * FROM propostas WHERE numero = $1', [numero]);
        
        if (propostaCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Já existe uma proposta com este número' });
        }
        
        // Inserir proposta
        const result = await pool.query(
            `INSERT INTO propostas 
            (data, numero, tipo, empresa, telefone, email, contato, itens, valor_total, created_at, updated_at, usuario_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $10) 
            RETURNING id`,
            [data, numero, tipo, empresa, telefone, email, contato, JSON.stringify(itens), valorTotal, req.user.id]
        );
        
        res.status(201).json({
            message: 'Proposta salva com sucesso',
            id: result.rows[0].id
        });
    } catch (err) {
        console.error('Erro ao salvar proposta:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/propostas', authenticateToken, async (req, res) => {
    try {
        // Parâmetros de paginação
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Buscar propostas do usuário com paginação
        const result = await pool.query(
            `SELECT id, data, numero, tipo, empresa, telefone, email, contato, valor_total, created_at, updated_at 
            FROM propostas 
            WHERE usuario_id = $1 
            ORDER BY data DESC 
            LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset]
        );
        
        // Contar total de propostas para paginação
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM propostas WHERE usuario_id = $1',
            [req.user.id]
        );
        
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / limit);
        
        res.json({
            propostas: result.rows,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        });
    } catch (err) {
        console.error('Erro ao buscar propostas:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/propostas/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar proposta específica
        const result = await pool.query(
            'SELECT * FROM propostas WHERE id = $1 AND usuario_id = $2',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar proposta:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.put('/api/propostas/:id', authenticateToken, [
    // Validação de campos
    body('data').isDate().withMessage('Data inválida'),
    body('numero').isString().isLength({ min: 5, max: 20 }).withMessage('Número de proposta inválido'),
    body('tipo').isIn(['venda', 'locacao', 'evento']).withMessage('Tipo de proposta inválido'),
    body('empresa').isString().isLength({ min: 2, max: 255 }).withMessage('Nome da empresa inválido'),
    body('telefone').matches(/^\(\d{2}\) \d{5}-\d{4}$/).withMessage('Telefone inválido'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('contato').isString().isLength({ min: 2, max: 255 }).withMessage('Nome de contato inválido'),
    body('itens').isArray({ min: 1 }).withMessage('A proposta deve ter pelo menos um item'),
    body('valorTotal').isFloat({ min: 0 }).withMessage('Valor total inválido')
], async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { id } = req.params;
        const { data, numero, tipo, empresa, telefone, email, contato, itens, valorTotal } = req.body;
        
        // Verificar se a proposta existe e pertence ao usuário
        const propostaCheck = await pool.query(
            'SELECT * FROM propostas WHERE id = $1 AND usuario_id = $2',
            [id, req.user.id]
        );
        
        if (propostaCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        
        // Verificar se já existe outra proposta com o mesmo número
        const numeroCheck = await pool.query(
            'SELECT * FROM propostas WHERE numero = $1 AND id != $2',
            [numero, id]
        );
        
        if (numeroCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Já existe outra proposta com este número' });
        }
        
        // Atualizar proposta
        await pool.query(
            `UPDATE propostas 
            SET data = $1, numero = $2, tipo = $3, empresa = $4, telefone = $5, email = $6, 
                contato = $7, itens = $8, valor_total = $9, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $10 AND usuario_id = $11`,
            [data, numero, tipo, empresa, telefone, email, contato, JSON.stringify(itens), valorTotal, id, req.user.id]
        );
        
        res.json({
            message: 'Proposta atualizada com sucesso',
            id
        });
    } catch (err) {
        console.error('Erro ao atualizar proposta:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.delete('/api/propostas/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar se a proposta existe e pertence ao usuário
        const propostaCheck = await pool.query(
            'SELECT * FROM propostas WHERE id = $1 AND usuario_id = $2',
            [id, req.user.id]
        );
        
        if (propostaCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        
        // Excluir proposta
        await pool.query(
            'DELETE FROM propostas WHERE id = $1 AND usuario_id = $2',
            [id, req.user.id]
        );
        
        res.json({
            message: 'Proposta excluída com sucesso',
            id
        });
    } catch (err) {
        console.error('Erro ao excluir proposta:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar clientes (para autocompletar)
app.get('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const query = req.query.q || '';
        
        // Buscar clientes com base na consulta
        const result = await pool.query(
            `SELECT DISTINCT empresa, telefone, email, contato 
            FROM propostas 
            WHERE usuario_id = $1 AND empresa ILIKE $2 
            ORDER BY empresa 
            LIMIT 10`,
            [req.user.id, `%${query}%`]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para verificar saúde da API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; // Para testes
