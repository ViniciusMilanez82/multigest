# Documentação Técnica - Sistema de Propostas

## Sumário

1. [Introdução](#introdução)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Frontend](#frontend)
4. [Backend](#backend)
5. [Segurança](#segurança)
6. [Escalabilidade](#escalabilidade)
7. [Logs e Monitoramento](#logs-e-monitoramento)
8. [Instalação e Configuração](#instalação-e-configuração)
9. [API Reference](#api-reference)
10. [Considerações de Manutenção](#considerações-de-manutenção)

## Introdução

O Sistema de Propostas é uma aplicação web completa para criação e gerenciamento de propostas comerciais. Desenvolvido com foco em usabilidade, segurança e escalabilidade, o sistema permite a criação de propostas para diferentes tipos de produtos (marítimos, módulos e acessórios), com funcionalidades para cálculo de valores, adição de fretes, geração de PDF e compartilhamento por diferentes canais.

Esta documentação técnica detalha a arquitetura, componentes, APIs e considerações de segurança e manutenção do sistema.

## Arquitetura do Sistema

O Sistema de Propostas segue uma arquitetura cliente-servidor moderna, com separação clara entre frontend e backend:

### Visão Geral da Arquitetura

```
+------------------+        +------------------+        +------------------+
|                  |        |                  |        |                  |
|     Frontend     |<------>|     Backend      |<------>|   Banco de Dados |
|  (HTML/CSS/JS)   |   API  |   (Node.js)      |   SQL  |   (PostgreSQL)   |
|                  |  REST  |                  |        |                  |
+------------------+        +------------------+        +------------------+
                                    ^
                                    |
                            +-------+-------+
                            |               |
                            |    Cache      |
                            | (Redis/Local) |
                            |               |
                            +---------------+
```

### Componentes Principais

1. **Frontend**: Interface de usuário baseada em HTML5, CSS3 e JavaScript, com design responsivo e interface baseada em etapas (wizard).

2. **Backend**: API RESTful desenvolvida em Node.js com Express, implementando autenticação JWT, validação robusta e proteções de segurança.

3. **Banco de Dados**: PostgreSQL para armazenamento persistente, com estrutura otimizada para consultas e suporte a tipos de dados JSON.

4. **Cache**: Sistema de cache em memória (local) ou Redis (se disponível) para otimização de performance.

### Padrões de Design

- **MVC (Model-View-Controller)**: Separação clara entre dados, apresentação e lógica de negócio.
- **Middleware Pattern**: Uso extensivo de middlewares para processamento de requisições.
- **Repository Pattern**: Abstração do acesso a dados.
- **Factory Pattern**: Criação de objetos complexos.
- **Observer Pattern**: Notificações e eventos do sistema.

## Frontend

### Tecnologias Utilizadas

- **HTML5/CSS3**: Estrutura e estilização da interface.
- **JavaScript (ES6+)**: Lógica de interação e manipulação do DOM.
- **Bootstrap 5**: Framework CSS para layout responsivo.
- **jQuery**: Biblioteca para manipulação do DOM e requisições AJAX.
- **jsPDF**: Biblioteca para geração de documentos PDF no navegador.

### Estrutura de Arquivos

```
/frontend
  ├── index.html          # Página principal da aplicação
  ├── css/
  │   └── styles.css      # Estilos personalizados
  ├── js/
  │   └── app.js          # Lógica principal da aplicação
  └── assets/             # Imagens e outros recursos estáticos
```

### Componentes da Interface

#### 1. Wizard de Navegação

O sistema implementa uma interface baseada em etapas (wizard) para guiar o usuário pelo processo de criação de proposta:

1. **Tipo de Proposta**: Seleção do tipo de proposta e informações básicas.
2. **Dados do Cliente**: Preenchimento dos dados do cliente com autocompletar.
3. **Itens da Proposta**: Adição e gerenciamento de itens com tabela interativa.
4. **Revisão e Finalização**: Visualização final e ações de exportação/compartilhamento.

#### 2. Tabela Interativa

A tabela de itens implementa funcionalidades avançadas:

- **Edição Inline**: Duplo clique em células para edição direta.
- **Responsividade**: Adaptação para diferentes tamanhos de tela.
- **Validação em Tempo Real**: Feedback imediato sobre dados inválidos.
- **Cálculo Automático**: Atualização automática de totais.

#### 3. Autocompletar para Clientes

O sistema oferece sugestões de clientes baseadas em entradas anteriores:

- **Busca em Tempo Real**: Filtragem à medida que o usuário digita.
- **Preenchimento Automático**: Preenchimento de todos os campos relacionados ao cliente.
- **Cache Local**: Armazenamento de clientes frequentes para acesso rápido.

#### 4. Visualização Prévia

Antes de finalizar, o usuário pode visualizar a proposta formatada:

- **Renderização em Tempo Real**: Exibição da proposta como será exportada.
- **Impressão Direta**: Opção para imprimir a visualização.
- **Ajustes Finais**: Possibilidade de voltar e ajustar dados antes da finalização.

### Fluxos de Interação

#### Fluxo Principal: Criação de Proposta

1. Usuário seleciona tipo de proposta.
2. Usuário preenche dados do cliente (com assistência de autocompletar).
3. Usuário adiciona itens à proposta.
4. Usuário revisa e finaliza a proposta.
5. Usuário escolhe ação final (salvar, PDF, WhatsApp, e-mail).

#### Fluxo de Adição de Item

1. Usuário seleciona tipo de item.
2. Sistema carrega opções de modelo correspondentes.
3. Usuário preenche quantidade e valor unitário.
4. Sistema calcula valor total automaticamente.
5. Usuário adiciona item à tabela.
6. Opcionalmente, usuário adiciona frete ao item.

#### Fluxo de Edição Inline

1. Usuário dá duplo clique em célula da tabela.
2. Sistema exibe campo de edição apropriado.
3. Usuário modifica valor.
4. Sistema valida entrada e atualiza dados.
5. Sistema recalcula totais automaticamente.

## Backend

### Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express**: Framework web para criação de APIs.
- **PostgreSQL**: Banco de dados relacional.
- **JWT**: JSON Web Tokens para autenticação.
- **bcrypt**: Biblioteca para hash seguro de senhas.
- **express-validator**: Validação de dados de entrada.
- **Winston**: Sistema de logs estruturados.
- **Prometheus**: Coleta de métricas para monitoramento.

### Estrutura de Arquivos

```
/backend
  ├── server.js           # Ponto de entrada da aplicação
  ├── cache.js            # Sistema de cache
  ├── logging.js          # Configuração de logs
  ├── security.js         # Configurações de segurança
  ├── database.sql        # Script de criação do banco de dados
  ├── .env                # Variáveis de ambiente
  └── logs/               # Diretório para arquivos de log
```

### Módulos Principais

#### 1. Autenticação e Autorização

O sistema implementa autenticação baseada em JWT (JSON Web Tokens):

- **Registro de Usuário**: Criação de conta com validação de dados.
- **Login**: Autenticação com geração de token JWT.
- **Middleware de Autenticação**: Verificação de token em rotas protegidas.
- **Proteção contra Brute Force**: Limitação de tentativas de login.

#### 2. API RESTful

A API segue princípios REST com endpoints bem definidos:

- **Propostas**: CRUD completo para propostas.
- **Clientes**: Busca para autocompletar.
- **Usuários**: Gerenciamento de contas.
- **Saúde**: Verificação de status do sistema.

#### 3. Validação de Dados

Implementação de validação robusta em múltiplas camadas:

- **Validação de Entrada**: Verificação de tipos, formatos e restrições.
- **Sanitização**: Limpeza de dados para prevenir XSS.
- **Validação de Negócio**: Regras específicas do domínio.
- **Feedback de Erros**: Mensagens claras sobre problemas de validação.

#### 4. Cache

Sistema de cache para otimização de performance:

- **Cache em Memória**: Para ambiente de desenvolvimento.
- **Redis**: Para ambiente de produção (quando disponível).
- **Estratégias de Invalidação**: Atualização automática de cache.
- **TTL Configurável**: Tempo de vida ajustável por tipo de dado.

### Banco de Dados

#### Esquema

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de propostas
CREATE TABLE propostas (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    numero VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('venda', 'locacao', 'evento')),
    empresa VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contato VARCHAR(255) NOT NULL,
    itens JSONB NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Índices

```sql
-- Índice para busca por número de proposta
CREATE INDEX idx_propostas_numero ON propostas(numero);

-- Índice para busca por empresa
CREATE INDEX idx_propostas_empresa ON propostas(empresa);

-- Índice para ordenação por data
CREATE INDEX idx_propostas_data ON propostas(data);

-- Índice para busca por usuário
CREATE INDEX idx_propostas_usuario ON propostas(usuario_id);

-- Índice GIN para busca em itens JSON
CREATE INDEX idx_propostas_itens ON propostas USING GIN (itens);
```

## Segurança

### Proteções Implementadas

#### 1. Autenticação e Autorização

- **Hashing de Senhas**: Uso de bcrypt com salt rounds configuráveis.
- **JWT com Expiração**: Tokens com tempo de vida limitado.
- **Proteção de Rotas**: Middleware de autenticação em endpoints protegidos.
- **CSRF Protection**: Tokens para prevenir ataques Cross-Site Request Forgery.

#### 2. Proteção contra Ataques Comuns

- **XSS (Cross-Site Scripting)**: Sanitização de entrada e Content Security Policy.
- **CSRF (Cross-Site Request Forgery)**: Tokens de validação.
- **SQL Injection**: Uso de prepared statements e validação de consultas.
- **Brute Force**: Rate limiting e bloqueio temporário após múltiplas tentativas.
- **MITM (Man-in-the-Middle)**: HTTPS e cabeçalhos de segurança.

#### 3. Cabeçalhos de Segurança

Implementação de cabeçalhos HTTP de segurança via Helmet:

- **Content-Security-Policy**: Restrição de fontes de conteúdo.
- **X-XSS-Protection**: Proteção contra XSS.
- **X-Frame-Options**: Prevenção de clickjacking.
- **X-Content-Type-Options**: Prevenção de MIME sniffing.
- **Strict-Transport-Security**: Forçar HTTPS.

#### 4. Validação e Sanitização

- **Validação de Entrada**: Verificação rigorosa de todos os dados de entrada.
- **Sanitização**: Remoção de conteúdo potencialmente perigoso.
- **Escape de Saída**: Prevenção de injeção de código na saída.

#### 5. Rate Limiting

- **Limitação por IP**: Restrição de número de requisições por IP.
- **Limitação por Rota**: Configurações específicas para rotas sensíveis.
- **Janelas de Tempo**: Períodos configuráveis para reset de contadores.

## Escalabilidade

### Estratégias Implementadas

#### 1. Paginação

- **Paginação de Resultados**: Limitação de número de registros por requisição.
- **Metadados de Paginação**: Informações sobre total de páginas e registros.
- **Navegação Eficiente**: Links para próxima/anterior página.

#### 2. Cache

- **Cache em Memória**: Para ambiente de desenvolvimento.
- **Redis**: Para ambiente de produção.
- **Estratégias de TTL**: Tempo de vida configurável por tipo de dado.
- **Invalidação Seletiva**: Atualização de cache apenas quando necessário.

#### 3. Otimização de Banco de Dados

- **Índices Estratégicos**: Criação de índices para consultas frequentes.
- **Consultas Otimizadas**: Seleção apenas de campos necessários.
- **Transações**: Garantia de consistência em operações complexas.

#### 4. Arquitetura Modular

- **Separação de Responsabilidades**: Módulos independentes e coesos.
- **Injeção de Dependências**: Facilidade de substituição de componentes.
- **Configuração via Ambiente**: Adaptação a diferentes ambientes.

## Logs e Monitoramento

### Sistema de Logs

- **Logs Estruturados**: Formato JSON para facilitar análise.
- **Níveis de Log**: Debug, Info, Warn, Error.
- **Rotação de Arquivos**: Limitação de tamanho e número de arquivos.
- **Mascaramento de Dados Sensíveis**: Proteção de informações confidenciais.

### Métricas e Monitoramento

- **Prometheus**: Coleta de métricas de performance.
- **Histogramas de Latência**: Medição de tempo de resposta.
- **Contadores de Requisições**: Tracking de volume de uso.
- **Métricas de Banco de Dados**: Monitoramento de consultas.

### Eventos de Negócio

- **Registro de Eventos**: Logging de ações importantes do usuário.
- **Auditoria**: Rastreamento de modificações em dados sensíveis.
- **Alertas**: Notificação sobre eventos críticos.

## Instalação e Configuração

### Requisitos

- **Node.js**: v14.x ou superior
- **PostgreSQL**: v12.x ou superior
- **Redis**: v6.x ou superior (opcional)
- **Navegadores Modernos**: Chrome, Firefox, Safari, Edge

### Instalação

#### Backend

```bash
# Clonar repositório
git clone https://github.com/exemplo/sistema-propostas.git
cd sistema-propostas/backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com configurações apropriadas

# Inicializar banco de dados
psql -U postgres -f database.sql

# Iniciar servidor
npm start
```

#### Frontend

```bash
# Navegar para diretório frontend
cd ../frontend

# Servir com http-server ou similar
npx http-server -p 8080
```

### Configuração

#### Variáveis de Ambiente

```
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=sistema_propostas
DB_SSL=false

# Segurança
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=24h

# Servidor
PORT=5000
NODE_ENV=production
LOG_LEVEL=info

# Cache
REDIS_URL=redis://localhost:6379
```

## API Reference

### Autenticação

#### Registro de Usuário

```
POST /api/auth/register

Request:
{
  "username": "usuario",
  "password": "Senha@123",
  "email": "usuario@exemplo.com"
}

Response:
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@exemplo.com"
  }
}
```

#### Login

```
POST /api/auth/login

Request:
{
  "username": "usuario",
  "password": "Senha@123"
}

Response:
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@exemplo.com"
  }
}
```

### Propostas

#### Criar Proposta

```
POST /api/propostas

Headers:
Authorization: Bearer <token>

Request:
{
  "data": "2025-05-15",
  "numero": "150525-1430",
  "tipo": "venda",
  "empresa": "Empresa Exemplo",
  "telefone": "(11) 98765-4321",
  "email": "contato@exemplo.com",
  "contato": "João Silva",
  "itens": [
    {
      "tipo": "maritimo",
      "modelo": "Container 20 pés",
      "quantidade": 2,
      "valorUnitario": 15000.00,
      "valorTotal": 30000.00,
      "frete": 2000.00
    }
  ],
  "valorTotal": 32000.00
}

Response:
{
  "message": "Proposta salva com sucesso",
  "id": 1
}
```

#### Listar Propostas

```
GET /api/propostas?page=1&limit=10

Headers:
Authorization: Bearer <token>

Response:
{
  "propostas": [
    {
      "id": 1,
      "data": "2025-05-15",
      "numero": "150525-1430",
      "tipo": "venda",
      "empresa": "Empresa Exemplo",
      "telefone": "(11) 98765-4321",
      "email": "contato@exemplo.com",
      "contato": "João Silva",
      "valor_total": "32000.00",
      "created_at": "2025-05-15T14:30:00.000Z",
      "updated_at": "2025-05-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Obter Proposta por ID

```
GET /api/propostas/1

Headers:
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "data": "2025-05-15",
  "numero": "150525-1430",
  "tipo": "venda",
  "empresa": "Empresa Exemplo",
  "telefone": "(11) 98765-4321",
  "email": "contato@exemplo.com",
  "contato": "João Silva",
  "itens": [
    {
      "tipo": "maritimo",
      "modelo": "Container 20 pés",
      "quantidade": 2,
      "valorUnitario": 15000.00,
      "valorTotal": 30000.00,
      "frete": 2000.00
    }
  ],
  "valor_total": "32000.00",
  "usuario_id": 1,
  "created_at": "2025-05-15T14:30:00.000Z",
  "updated_at": "2025-05-15T14:30:00.000Z"
}
```

#### Atualizar Proposta

```
PUT /api/propostas/1

Headers:
Authorization: Bearer <token>

Request:
{
  "data": "2025-05-15",
  "numero": "150525-1430",
  "tipo": "venda",
  "empresa": "Empresa Exemplo Atualizada",
  "telefone": "(11) 98765-4321",
  "email": "contato@exemplo.com",
  "contato": "João Silva",
  "itens": [
    {
      "tipo": "maritimo",
      "modelo": "Container 20 pés",
      "quantidade": 3,
      "valorUnitario": 15000.00,
      "valorTotal": 45000.00,
      "frete": 3000.00
    }
  ],
  "valorTotal": 48000.00
}

Response:
{
  "message": "Proposta atualizada com sucesso",
  "id": 1
}
```

#### Excluir Proposta

```
DELETE /api/propostas/1

Headers:
Authorization: Bearer <token>

Response:
{
  "message": "Proposta excluída com sucesso",
  "id": 1
}
```

### Clientes

#### Buscar Clientes (Autocompletar)

```
GET /api/clientes?q=empresa

Headers:
Authorization: Bearer <token>

Response:
[
  {
    "empresa": "Empresa Exemplo",
    "telefone": "(11) 98765-4321",
    "email": "contato@exemplo.com",
    "contato": "João Silva"
  }
]
```

### Saúde da API

```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2025-05-15T14:30:00.000Z"
}
```

## Considerações de Manutenção

### Atualizações e Versionamento

- **Versionamento Semântico**: Seguir padrão MAJOR.MINOR.PATCH.
- **Changelog**: Manter registro de alterações.
- **Migrações de Banco**: Scripts para atualização de esquema.
- **Compatibilidade Retroativa**: Manter suporte a versões anteriores da API.

### Backup e Recuperação

- **Backup Regular**: Agendamento de backups do banco de dados.
- **Estratégia de Retenção**: Política de retenção de backups.
- **Testes de Recuperação**: Verificação periódica de restauração.
- **Documentação de Procedimentos**: Instruções claras para recuperação.

### Monitoramento Contínuo

- **Alertas**: Configuração de notificações para eventos críticos.
- **Dashboards**: Visualização de métricas de performance.
- **Análise de Logs**: Revisão regular de logs de erro.
- **Testes de Carga**: Verificação periódica de capacidade.

### Segurança Contínua

- **Atualizações de Dependências**: Verificação regular de vulnerabilidades.
- **Auditorias de Segurança**: Revisão periódica de código e configurações.
- **Testes de Penetração**: Verificação de resistência a ataques.
- **Plano de Resposta a Incidentes**: Procedimentos para lidar com violações.
