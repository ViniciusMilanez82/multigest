# FASE 03 — Arquitetura e Stack Tecnológica

## 1) Resumo

Proposta de arquitetura para o sistema unificado **MultiGest** (nome sugerido — Sistema de Gestão Integrada Multi), que consolidará os 4 sistemas legados em uma plataforma web moderna, autossuficiente, com banco de dados próprio, backend e frontend integrados.

---

## 2) Nome do Sistema

**MultiGest** — Sistema de Gestão Integrada
> Unifica: Contratos + Ativos + Frota + Cobrança

---

## 3) Stack Tecnológica Proposta

### Backend
| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Runtime** | Node.js 20 LTS | Estável, performático, grande ecossistema |
| **Framework** | NestJS (TypeScript) | Arquitetura modular, injeção de dependência, ideal para sistemas corporativos com múltiplos módulos |
| **ORM** | Prisma | Type-safe, migrations automáticas, excelente DX |
| **Autenticação** | JWT + bcrypt | Stateless, seguro, padrão de mercado |
| **Validação** | class-validator + class-transformer | Validação robusta de DTOs |
| **Documentação API** | Swagger/OpenAPI (integrado ao NestJS) | Documentação automática da API |

### Frontend
| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Framework** | Next.js 14 (React 18) | SSR, roteamento automático, performance |
| **UI Library** | shadcn/ui + Tailwind CSS | Componentes modernos, acessíveis, customizáveis |
| **Estado** | Zustand | Leve, simples, sem boilerplate |
| **Formulários** | React Hook Form + Zod | Performance, validação type-safe |
| **Tabelas** | TanStack Table | Tabelas com filtro, ordenação, paginação |
| **Gráficos** | Recharts | Dashboards e relatórios visuais |
| **HTTP Client** | Axios | Interceptors, retry, padrão |

### Banco de Dados
| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **SGBD** | PostgreSQL 16 | Robusto, gratuito, suporta JSON, full-text search, constraints complexas |
| **Migrations** | Prisma Migrate | Versionamento do schema integrado ao ORM |
| **Seeds** | Scripts TypeScript | Dados iniciais para desenvolvimento |

### Infraestrutura / DevOps
| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Containerização** | Docker + Docker Compose | Ambiente reproduzível, deploy simplificado |
| **CI/CD** | GitHub Actions | Automação de testes e deploy |
| **Monitoramento** | Logs estruturados (winston) | Observabilidade mínima (MULTISOFT DoD) |

---

## 4) Arquitetura do Sistema

### 4.1 Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                         │
│              (Chrome, Firefox, Edge)                     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js)                       │
│  ┌───────────┬───────────┬───────────┬───────────┐      │
│  │ Contratos │  Ativos   │   Frota   │ Cobrança  │      │
│  │ (SisCaC)  │  (SCC)    │ (FrotaN)  │ (SisReC)  │      │
│  └───────────┴───────────┴───────────┴───────────┘      │
│  ┌──────────────────────────────────────────────┐       │
│  │        Módulos Transversais                   │       │
│  │  Dashboard │ Cadastros │ Relatórios │ Admin   │       │
│  └──────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (NestJS)                         │
│  ┌───────────┬───────────┬───────────┬───────────┐      │
│  │ Contracts │  Assets   │  Fleet    │Collection │      │
│  │  Module   │  Module   │  Module   │  Module   │      │
│  └───────────┴───────────┴───────────┴───────────┘      │
│  ┌──────────────────────────────────────────────┐       │
│  │         Módulos Transversais                  │       │
│  │  Auth │ Users │ Companies │ Reports │ Common  │       │
│  └──────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────┐
│              POSTGRESQL (Banco Único)                    │
│  Schemas: public (compartilhado)                        │
│  ┌──────────┬──────────┬──────────┬──────────┐          │
│  │Contratos │ Ativos   │ Frota    │Cobrança  │          │
│  │Clientes  │Containers│Veículos  │Títulos   │          │
│  │Empresas  │ Módulos  │Motoristas│Acordos   │          │
│  │Endereços │Alocações │Checklists│Histórico │          │
│  └──────────┴──────────┴──────────┴──────────┘          │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Módulos do Sistema

| # | Módulo | Origem | Responsabilidade |
|---|--------|--------|-----------------|
| M1 | **Core** (transversal) | Novo | Autenticação, usuários, empresas/filiais, permissões, auditoria |
| M2 | **Cadastros** (transversal) | Compartilhado | Clientes, fornecedores, endereços, contatos — base compartilhada |
| M3 | **Contratos** | SisCaC | Gestão de contratos de aluguel, aditivos, medições, vigência |
| M4 | **Ativos** | SCC | Cadastro e rastreamento de containers/módulos habitacionais, status, alocação |
| M5 | **Frota** | FrotaN | Veículos, motoristas, checklists, manutenção, agendamento de transporte |
| M6 | **Cobrança** | SisReC | Títulos, inadimplência, acordos, régua de cobrança, licitações |
| M7 | **Dashboard** | Novo | Visão gerencial consolidada de todos os módulos |
| M8 | **Relatórios** | Novo | Relatórios operacionais e gerenciais |
| — | **Propostas** | Novo | Wizard, PDF, conversão em contrato ou fatura |
| — | **Expedição** | Novo | Painel de entregas programadas, bloqueios, botão Agendar |
| — | **Estoque** | Novo | Locais de armazenamento (StockLocation), histórico de movimentação |
| — | **Análise Crítica** | Novo | Formulário associado ao contrato (prefill automático) |
| — | **Documento AF** | Novo | SupplyOrder — ordem de fornecimento |
| — | **Ordem de Serviço (OS)** | Novo | ServiceOrder — instalação, retirada, remoção, troca de ar |

### 4.3 Estrutura de Pastas do Projeto

```
multigest/
├── docker-compose.yml          # PostgreSQL + App
├── .env.example
├── README.md
│
├── backend/                    # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de dados
│   │   └── seed.ts             # Dados iniciais
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/             # Pipes, guards, interceptors, decorators
│   │   ├── auth/               # M1: Login, JWT, permissões
│   │   ├── users/              # M1: CRUD de usuários
│   │   ├── companies/          # M1: Empresas/filiais
│   │   ├── customers/          # M2: Clientes
│   │   ├── suppliers/          # M2: Fornecedores
│   │   ├── contracts/          # M3: Contratos de aluguel
│   │   ├── assets/             # M4: Containers e módulos
│   │   ├── fleet/              # M5: Frota (veículos, motoristas)
│   │   ├── collections/        # M6: Cobrança/inadimplência
│   │   ├── dashboard/          # M7: Indicadores
│   │   └── reports/            # M8: Relatórios
│   ├── test/
│   └── package.json
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/                # App Router (Next.js 14)
│   │   │   ├── (auth)/         # Páginas de login
│   │   │   ├── dashboard/      # M7: Dashboard
│   │   │   ├── contracts/      # M3: Contratos
│   │   │   ├── assets/         # M4: Ativos
│   │   │   ├── fleet/          # M5: Frota
│   │   │   ├── collections/    # M6: Cobrança
│   │   │   ├── customers/      # M2: Clientes
│   │   │   ├── reports/        # M8: Relatórios
│   │   │   └── admin/          # M1: Administração
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilitários
│   │   ├── services/           # Chamadas API
│   │   └── types/              # TypeScript types
│   └── package.json
│
└── docs/                       # Documentação do projeto
    ├── FASE_01_ANALISE_CONTEXTO.md
    ├── FASE_03_ARQUITETURA.md
    └── ...
```

---

## 5) Entidades Principais (Prévia do Banco de Dados)

### Módulo Core (M1)
- `Company` — Empresas/filiais (Multi Macaé, Multi Rio, Petroteiner)
- `User` — Usuários do sistema
- `Role` / `Permission` — Perfis e permissões
- `AuditLog` — Log de auditoria

### Módulo Cadastros (M2)
- `Customer` — Clientes (quem aluga)
- `Supplier` — Fornecedores
- `Address` — Endereços (compartilhado)
- `Contact` — Contatos (telefone, email)

### Módulo Contratos (M3) — ex-SisCaC
- `Contract` — Contrato de aluguel
- `ContractItem` — Itens do contrato (quais ativos)
- `ContractAddendum` — Aditivos contratuais
- `Measurement` — Medições periódicas
- `ContractMovement` — Movimentações (entrada/saída)

### Módulo Ativos (M4) — ex-SCC
- `Asset` — Container ou módulo habitacional
- `AssetType` — Tipo (container 20', 40', módulo hab., etc.)
- `AssetAllocation` — Alocação do ativo (onde está, para qual contrato)
- `AssetMaintenance` — Manutenção do ativo
- `AssetStatus` — Histórico de status (disponível, alugado, em manutenção, baixado)

### Módulo Frota (M5) — ex-FrotaN
- `Vehicle` — Veículos (caminhões, carretas)
- `Driver` — Motoristas
- `VehicleChecklist` — Checklists de inspeção
- `TransportOrder` — Ordens de transporte
- `VehicleMaintenance` — Manutenção de veículos
- `FuelRecord` — Registros de combustível

### Módulo Cobrança (M6) — ex-SisReC
- `Invoice` — Títulos/faturas
- `InvoicePayment` — Pagamentos recebidos
- `DefaulterRecord` — Registro de inadimplência
- `CollectionAction` — Ações de cobrança
- `PaymentAgreement` — Acordos de pagamento
- `Bidding` — Licitações

---

## 6) Decisões

| # | Decisão | Justificativa |
|---|---------|---------------|
| D1 | Monolito modular (não microserviços) | Para 6-20 usuários, microserviços seria over-engineering. NestJS permite módulos bem isolados que podem ser separados no futuro se necessário |
| D2 | PostgreSQL banco único | Simplicidade operacional, integridade referencial entre módulos, sem necessidade de event-sourcing |
| D3 | TypeScript full-stack | Mesma linguagem no front e back, reduz contexto-switching, types compartilhados |
| D4 | REST API (não GraphQL) | Mais simples, suficiente para o escopo, melhor tooling para NestJS |
| D5 | Docker Compose para desenvolvimento | Ambiente reproduzível, PostgreSQL como container, sem dependências locais complexas |
| D6 | Cadastro compartilhado de clientes | Um cliente existe uma vez no sistema e é referenciado por todos os módulos |
| D7 | Multi-empresa nativo | O sistema suporta múltiplas empresas/filiais desde o início (Multi Macaé, Multi Rio, Petroteiner) |

---

## 7) Riscos

| # | Risco | Impacto | Mitigação |
|---|-------|---------|-----------|
| R1 | Escopo grande (4 módulos de negócio + transversais) | Alto | Desenvolvimento incremental, MVP com funcionalidades essenciais de cada módulo |
| R2 | Regras de negócio não documentadas nos sistemas legados | Alto | Validação contínua com o usuário a cada módulo |
| R3 | Possível necessidade de migração de dados dos sistemas antigos | Médio | Planejar scripts de importação apenas quando banco estiver modelado |

---

## 8) Perguntas em Aberto

1. **O nome "MultiGest" está bom?** Ou você prefere outro nome para o sistema?
2. **Você já tem PostgreSQL instalado?** Ou prefere que tudo rode via Docker?
3. **Você tem Node.js instalado?** Se sim, qual versão?

---

## 9) Próximo Passo

| Passo | Descrição | Status |
|-------|-----------|--------|
| FASE 01 | Análise de contexto | ✅ FEITO |
| FASE 02 | Validação com usuário | ✅ FEITO |
| **FASE 03** | **Arquitetura e stack** | ✅ **FEITO** |
| FASE 04 | PRD + Modelagem do banco de dados | ⏳ PRÓXIMO |
| FASE 05 | Scaffolding do projeto (estrutura base) | Pendente |
| FASE 06 | Implementação módulo a módulo | Pendente |
