# ETAPA 2 — Gap Analysis

**Documento:** C) Gap Analysis  
**Prioridade:** Must / Should / Could  
**Escopo:** Venda, Locação e Evento

---

## 1. O que JÁ está pronto

| Item | Onde | Observação |
|------|------|------------|
| CRUD Proposta (tipo venda/locacao/evento) | Sistema ZIP | Migrar para MULTIGEST |
| Wizard 4 etapas (tipo, cliente, itens, revisão) | Sistema ZIP | UI reutilizável |
| Autocomplete cliente | Sistema ZIP | MULTIGEST tem Customer |
| Geração PDF (cliente) | Sistema ZIP | jsPDF |
| Envio WhatsApp/E-mail (links) | Sistema ZIP | Links externos |
| Contrato (locação) | MULTIGEST | Contract + ContractItem |
| Faturamento por contrato | MULTIGEST | Invoice, createFromContract |
| Medições | MULTIGEST | Measurement |
| Movimentações (entrega/recolhimento) | MULTIGEST | ContractMovement |
| Pagamentos, cobrança, inadimplência | MULTIGEST | InvoicePayment, CollectionAction, DefaulterRecord |
| Multi-empresa | MULTIGEST | CompanyGuard, x-company-id |
| Auth JWT | Ambos | Unificar no MULTIGEST |

---

## 2. O que FALTA construir

### Must (bloqueante)

| # | Item | Descrição |
|---|------|-----------|
| M1 | Entidade Proposta no MULTIGEST | Modelo com status (RASCUNHO, ENVIADA, ACEITA, RECUSADA, CONVERTIDA), link para Customer |
| M2 | Mapeamento Proposta → Customer | Criar/identificar Customer a partir de proposta (empresa, cpfCnpj, email, contato) |
| M3 | Fluxo "Aceitar Proposta" → Contrato | Converter proposta aceita em Contract (locação/evento) ou PedidoVenda (venda) |
| M4 | Novo tipo Contract / PedidoVenda para Venda | Venda: fatura direta sem medição; criar SaleOrder ou adaptar Invoice sem contractId |
| M5 | Módulo Propostas no frontend MULTIGEST | Listagem, wizard, pdf, compartilhamento dentro do dashboard |
| M6 | Unificação de auth | Sistema Propostas usa username; MULTIGEST usa email. Migrar usuários ou adaptar |

### Should (importante)

| # | Item | Descrição |
|---|------|-----------|
| S1 | Status na Proposta | RASCUNHO, ENVIADA, ACEITA, RECUSADA, EXPIRADA, CONVERTIDA |
| S2 | Mapeamento itens proposta → ContractItem/Asset | Para locação: vincular a Asset existente; para venda: item de fatura |
| S3 | Tipos de contrato por proposta | Locação→MEDICAO/ANTECIPADO; Evento→MEDICAO curto; Venda→sem contrato |
| S4 | Auditoria proposta→contrato | Quem converteu, quando, ID da proposta em Contract |
| S5 | Contrato vinculado a proposta | Campo proposalId em Contract (opcional) |
| S6 | Fluxo Evento | Tratar evento como locação com vigência curta |

### Could (desejável)

| # | Item | Descrição |
|---|------|-----------|
| C1 | Módulo Retorno/Feedback | **Não prioritário** — Retorno = PICKUP do container (já existe). Pós-venda/satisfação fica para depois. |
| C2 | Nota fiscal / Boleto | Integração externa (foi mencionado em docs) |
| C3 | Envio real de e-mail | Backend envia e-mail (não apenas mailto) |
| C4 | WhatsApp API | Integração real (não apenas link) |
| C5 | Modo offline Propostas | Service Worker, sync (mencionado no manual) |
| C6 | Duplicar proposta | Botão já citado no manual |

---

## 3. O que precisa REFATORAR

| # | Item | Observação |
|---|------|------------|
| R1 | Auth Sistema Propostas | Unificar com MULTIGEST (email ou username como login) |
| R2 | Modelo Customer | Proposta tem empresa+telefone+email+contato; Customer tem cpfCnpj, razaoSocial. Definir mapeamento |
| R3 | Frontend Propostas | jQuery+Bootstrap → Integrar no Next.js/shadcn do MULTIGEST ou manter como sub-app |
| R4 | Banco Sistema Propostas | PostgreSQL separado → Migrar para schema do MULTIGEST |

---

## 4. O que MIGRAR para MULTIGEST

| # | Item | Estratégia |
|---|------|------------|
| 1 | Tabela propostas | Nova tabela `proposals` no Prisma |
| 2 | Tabela usuarios | Já existe User no MULTIGEST — não migrar; usar User |
| 3 | Dados propostas existentes | Script de migração se houver dados em produção |
| 4 | Lógica de itens (JSONB) | Manter JSONB ou normalizar em proposal_items |

---

## 5. O que permanecer como módulo separado (integrado)

| # | Item | Motivo |
|---|------|--------|
| 1 | Geração PDF (jsPDF) | Pode rodar no cliente ou em serviço separado |
| 2 | Links WhatsApp/E-mail | Simples; manter como está |
| 3 | Wizard UI | Pode ser reimplementado em React ou iframe do HTML atual |

---

## PRONTO PARA REVISÃO
