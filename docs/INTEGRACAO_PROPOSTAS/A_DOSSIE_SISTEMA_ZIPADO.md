# ETAPA 0 — Dossiê do Sistema Zipado (Versão 0.1)

**Documento:** A) Dossiê do Sistema Zipado  
**Data:** 2026-02-11  
**Sistema analisado:** `sistema-propostas-completo (1).zip`  
**Metodologia:** MULTISOFT / Orquestrador

---

## 1. Inventário do ZIP

### 1.1 Estrutura de pastas extraída

```
sistema-propostas-analise/
├── backend/
│   ├── server.js       # Ponto de entrada, API REST, rotas
│   ├── cache.js        # Cache Redis/NodeCache (não usado em server.js)
│   ├── logging.js      # Logs estruturados, Prometheus (não usado em server.js)
│   └── security.js     # Proteções SQL Injection (não usado em server.js)
├── frontend/
│   ├── index.html      # Página única (SPA-like)
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js      # Lógica principal, jQuery, wizard
├── docs/
│   ├── documentacao_tecnica.md
│   ├── manual_usuario.md
│   └── gerar_imagens.js
└── run-tests.sh        # Script de testes E2E (Playwright), init-db.sql embutido
```

### 1.2 Linguagem e Stack

| Camada | Tecnologia | Evidência |
|--------|------------|-----------|
| **Backend** | Node.js + Express | `server.js` linhas 1-18 |
| **Banco** | PostgreSQL | `server.js` linhas 39-47, Pool |
| **Auth** | JWT + bcrypt | `server.js` linhas 6, 59-75, 118-169 |
| **Validação** | express-validator | `server.js` linhas 8, 82-86, 122-127 |
| **Segurança** | helmet, cors, rate-limit | `server.js` linhas 21-37 |
| **Frontend** | HTML5, CSS3, JS (jQuery) | `index.html`, `app.js` |
| **UI** | Bootstrap 5 | `index.html` linha 9 |
| **PDF** | jsPDF (mencionado na doc) | `manual_usuario.md` – não visível no app.js analisado |

### 1.3 Dependências (inferidas do código)

```json
{
  "express": "^4.x",
  "cors": "*",
  "body-parser": "*",
  "pg": "*",
  "jsonwebtoken": "*",
  "bcrypt": "*",
  "express-validator": "*",
  "dotenv": "*",
  "morgan": "*",
  "helmet": "*",
  "express-rate-limit": "*"
}
```

**Nota:** Não há `package.json` no ZIP. As dependências foram inferidas pelos `require()` em `server.js`.

### 1.4 O que NÃO está no ZIP

- `package.json` / `package-lock.json`
- `database.sql` (o schema está na documentação e no `run-tests.sh`)
- `.env` / `.env.example`
- `node_modules`
- Dockerfile / docker-compose
- Migrations versionadas
- Seeds
- Testes unitários (apenas E2E no `run-tests.sh`)
- Integração com Redis, Winston, Prometheus (módulos existem mas não são importados em `server.js`)

---

## 2. Mapa do Projeto

### 2.1 Pastas principais e função

| Pasta | Função |
|-------|--------|
| `backend/` | API REST, autenticação, CRUD de propostas |
| `frontend/` | Interface wizard (4 etapas), geração PDF, compartilhamento |
| `docs/` | Documentação técnica e manual do usuário |

### 2.2 Módulos/serviços

| Módulo | Onde | Descrição |
|--------|------|-----------|
| Auth | `server.js` L78-169 | Registro, login, JWT |
| Propostas | `server.js` L172-370 | CRUD completo |
| Clientes | `server.js` L374-391 | Autocomplete (derivado de propostas) |
| Health | `server.js` L394-396 | GET /api/health |

### 2.3 Modelos/entidades (schema)

**Arquivo:** definido na doc e em `run-tests.sh` (init-db.sql)

| Tabela | Campos principais |
|--------|-------------------|
| `usuarios` | id, username, password, email, created_at, updated_at |
| `propostas` | id, data, numero, tipo (venda/locacao/evento), empresa, telefone, email, contato, itens (JSONB), valor_total, usuario_id, created_at, updated_at |

### 2.4 Rotas/Controllers

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/register | Não | Registrar usuário |
| POST | /api/auth/login | Não | Login (username/password) |
| POST | /api/propostas | Sim | Criar proposta |
| GET | /api/propostas | Sim | Listar (paginado, por usuario_id) |
| GET | /api/propostas/:id | Sim | Obter proposta |
| PUT | /api/propostas/:id | Sim | Atualizar proposta |
| DELETE | /api/propostas/:id | Sim | Excluir proposta |
| GET | /api/clientes?q= | Sim | Autocomplete (empresa) |
| GET | /api/health | Não | Health check |

### 2.5 Telas/fluxos (frontend)

| Etapa | ID | Conteúdo | Evidência |
|-------|-----|----------|-----------|
| 1 | step1 | Tipo de proposta (venda/locacao/evento), data, número | `index.html` L56-109 |
| 2 | step2 | Dados do cliente (empresa, telefone, email, contato) | `index.html` L114+ |
| 3 | step3 | Itens (tipo, modelo, quantidade, valor, frete) | `app.js` modelOptions |
| 4 | step4 | Revisão, PDF, WhatsApp, E-mail, Salvar | `manual_usuario.md` |

### 2.6 Configuração de auth/permissão

- **Backend:** Middleware `authenticateToken` (`server.js` L59-75) – valida JWT no header `Authorization: Bearer <token>`.
- **Autorização:** Isolamento por `usuario_id` – cada usuário vê apenas suas propostas.
- **Frontend:** Não há evidência de checagem de permissão (presume-se que o token é enviado nas requisições após login).
- **Multi-tenant:** Não há conceito de empresa/filial; usuário é a unidade de isolamento.

---

## 3. Comandos prováveis para rodar local

```bash
# Backend
cd backend
npm init -y
npm install express cors body-parser pg jsonwebtoken bcrypt express-validator dotenv morgan helmet express-rate-limit
# Criar .env com DB_*, JWT_SECRET, PORT
psql -U postgres -f init-db.sql  # ou criar init-db.sql a partir do run-tests.sh
node server.js

# Frontend
cd frontend
npx http-server -p 8080
# ou: python -m http.server 8080
```

**Portas:** Backend 5000 (padrão), Frontend 8080.

---

## 4. Integrações identificadas

| Integração | Evidência | Status |
|------------|-----------|--------|
| WhatsApp | `manual_usuario.md` – “Enviar por WhatsApp” abre link wa.me | Link externo (não API) |
| E-mail | `manual_usuario.md` – “Enviar por E-mail” abre mailto: | Link externo (não API) |
| PDF | jsPDF no cliente (geração no browser) | Local |
| Redis | `cache.js` – REDIS_URL | Módulo presente, não usado em server.js |
| Prometheus | `logging.js` – métricas | Módulo presente, não usado em server.js |

---

## 5. Perguntas em aberto (antes de rodar)

1. **package.json:** O ZIP não inclui `package.json`. As versões exatas das dependências são desconhecidas.
2. **database.sql:** Não há arquivo; o schema está em `run-tests.sh` e na documentação. O trigger usa `EXECUTE FUNCTION` (PostgreSQL 11+).
3. **Frontend → Backend:** O `app.js` usa `$.ajax` ou `fetch`? Qual é a URL base configurada? (não verificado em detalhe).
4. **Modo offline:** O manual menciona “modo offline” – não há evidência de Service Worker ou armazenamento local no código analisado.
5. **Duplicar proposta:** O manual menciona botão “Duplicar” – não verificado se existe no código.

---

## 6. Respostas às perguntas obrigatórias

### 1) O ZIP contém também o MULTIGEST ou só o sistema de proposta?

**Resposta:** O ZIP contém **apenas** o Sistema de Propostas. Não há código do MULTIGEST no pacote.

### 2) O MULTIGEST tem API disponível?

**Resposta:** **Sim.** O MULTIGEST expõe API REST em NestJS:

- Base: `http://187.77.32.67:3001/api` (produção) ou `http://localhost:3001/api` (local)
- Auth: JWT em `Authorization: Bearer <token>`
- Multi-empresa: header `x-company-id` obrigatório em operações por empresa
- Endpoints relevantes: `/contracts`, `/invoices`, `/customers`, `/assets`, `/auth/login`, etc.

### 3) O ciclo desejado é para Locação, Venda, ou ambos?

**Resposta:** O sistema de propostas suporta **venda**, **locação** e **evento**. O MULTIGEST hoje é focado em **locação** (aluguel de containers/módulos).

**Resposta do usuário:** O ciclo completo deve cobrir **todos os tipos** — Venda, Locação e Evento.

---

## PRONTO PARA REVISÃO

**Próxima etapa:** ETAPA 1 — Entender o domínio (Proposta até Retorno) e mapear entidades, estados e eventos.

---

## Anexo: trechos de código relevantes

```18:47:backend/server.js
// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sistema_propostas',
    ...
});
```

```172:218:backend/server.js
// Rotas de propostas (protegidas por autenticação)
app.post('/api/propostas', authenticateToken, [
    body('tipo').isIn(['venda', 'locacao', 'evento']).withMessage('Tipo de proposta inválido'),
    ...
], async (req, res) => {
    ...
    const result = await pool.query(
        `INSERT INTO propostas 
        (data, numero, tipo, empresa, telefone, email, contato, itens, valor_total, ..., usuario_id) 
        VALUES (...)`,
        [data, numero, tipo, empresa, telefone, email, contato, JSON.stringify(itens), valorTotal, req.user.id]
    );
```
