# Plano de Integração Propostas — Visão Multiagente

**Documento:** J) Plano Multiagente  
**Objetivo:** Integrar a parte de Propostas no MULTIGEST, coordenando todos os agentes MULTISOFT  
**Referências:** APP PROPOSTAS (e:\APP PROPOSTAS), docs A–I desta pasta

---

## 1. Estado Atual

### 1.1 O que já está no MULTIGEST

| Item | Status | Local |
|------|--------|-------|
| Modelo Proposal (Prisma) | ✅ | `backend/prisma/schema.prisma` |
| CRUD + status (RASCUNHO → ENVIADA → ACEITA → RECUSADA → CONVERTIDA) | ✅ | `proposals.service.ts` |
| Conversão proposta → contrato (locação/evento) | ✅ | `convertToContract()` |
| Conversão proposta → fatura (venda) | ✅ | `convertToInvoice()` |
| CompanyGuard + JWT | ✅ | Controller |
| Listagem, wizard, edição, detalhe | ✅ | `frontend/.../proposals/` |
| PDF (jsPDF) | ✅ | `proposal-pdf.ts` |
| Links WhatsApp / E-mail | ✅ | Página de detalhe |
| Menu Propostas | ✅ | Layout dashboard |
| Mapeamento proposta → Customer (criar se não existir) | ✅ | Service |

### 1.2 O que existe no APP PROPOSTAS (referência)

| Item | APP PROPOSTAS | MULTIGEST |
|------|---------------|-----------|
| Fluxo criação | Form único (tipo, cliente, itens) | Wizard em etapas |
| Stack | React + Bootstrap, backend Express simples | Next.js + shadcn, NestJS |
| Itens | tipo (maritimo/modulo/acessorios), modelo, qtd, valorUnitario, frete | JSONB equivalente |
| Autocomplete cliente | Não (manual) | Autocomplete Customer (parcial) |

### 1.3 Gaps restantes (priorizados)

| # | Gap | Prioridade | Responsável sugerido |
|---|-----|------------|----------------------|
| G1 | Mapeamento itens proposta → ContractItem + Asset (locação) | Alta | Dev (André/Renata) |
| G2 | Conversão venda: Invoice com itens detalhados (não só valor total) | Média | Dev |
| G3 | Autocomplete Customer ao criar proposta (busca por nome/CNPJ) | Média | Dev + UX |
| G4 | Estados vazios, loading, erros no frontend (checklist UX) | Média | UX (Luiz) |
| G5 | Auditoria nas transições de status (AuditLog) | Baixa | Dev |
| G6 | Testes automatizados (E2E proposta → contrato) | Alta | QA (Patrícia) |
| G7 | Runbook de operação para módulo Propostas | Baixa | DevOps (Fernanda) |

---

## 2. Mapa da Missão por Agente

### 2.1 Orquestrador (ms-orquestrador)

- **Papel:** Coordenar o fluxo de execução e gates.
- **Entregáveis:**
  - Checklist de DoR antes de cada fase.
  - Bloqueio se DoD não atendido.
  - Rastreabilidade PRD → US → ADR → testes.

### 2.2 PO — Juliana (ms-po-juliana)

- **Papel:** Validar critérios de produto e priorização.
- **Tarefas:**
  - [ ] Validar que RF de propostas atendem ao ciclo Proposta → Contrato/Invoice.
  - [ ] Priorizar gaps G1–G7 no backlog.
  - [ ] Definir métricas de sucesso (ex: % propostas convertidas).
- **Entregáveis:** Backlog priorizado, métricas.

### 2.3 Analista — Carlos (ms-analista-carlos)

- **Papel:** Detalhar stories com DoR.
- **Tarefas:**
  - [ ] Detalhar US para mapeamento itens → ContractItem (G1).
  - [ ] Detalhar US para Invoice com itens (G2).
  - [ ] Detalhar US para autocomplete Customer (G3).
- **Entregáveis:** US-XXX com Gherkin, matriz de rastreabilidade.

### 2.4 UX — Luiz (ms-ux-luiz)

- **Papel:** Especificar estados e fluxos.
- **Tarefas:**
  - [ ] Checklist UX: estados vazio, carregando, erro, sem permissão em Propostas.
  - [ ] Microcopy e fluxo do autocomplete Customer.
  - [ ] Validação de acessibilidade nas telas de proposta.
- **Entregáveis:** UX-XXX spec, checklist QA UX.

### 2.5 CTO — Eduardo (ms-cto-eduardo)

- **Papel:** Governança técnica e ADRs.
- **Tarefas:**
  - [ ] Validar ADR-002 (itens em JSONB) vs normalização futura.
  - [ ] Validar regras de mapeamento itens → Asset (fallback se ativo não existir).
  - [ ] Definir NFRs para endpoints de conversão (latência, idempotência).
- **Entregáveis:** ADR-XXX se necessário, checklist DoR/DoD.

### 2.6 Dev — André / Renata (ms-dev-andre, ms-dev-renata)

- **Papel:** Implementação e testes de contrato.
- **Tarefas:**
  - [ ] G1: Mapear itens proposta → ContractItem + buscar Asset por tipo/modelo.
  - [ ] G2: Invoice com InvoiceItem a partir dos itens da proposta (venda).
  - [ ] G3: Autocomplete Customer na tela de nova proposta.
  - [ ] G5: Auditoria (AuditLog) nas transições de status.
- **Entregáveis:** Código, testes, logs estruturados.

### 2.7 QA — Patrícia (ms-qa-patricia)

- **Papel:** Plano de testes e go/no-go.
- **Tarefas:**
  - [ ] Plano de testes para fluxo Proposta → Contrato e Proposta → Invoice.
  - [ ] Testes E2E dos fluxos críticos.
  - [ ] Evidências para critérios de aceite.
  - [ ] Recomendação go/no-go para release.
- **Entregáveis:** ms-test-plan, relatório de execução, go/no-go.

### 2.8 DevOps — Fernanda (ms-devops-fernanda)

- **Papel:** Pipeline e operação.
- **Tarefas:**
  - [ ] Runbook para módulo Propostas (logs, rollback, backups).
  - [ ] Validação de observabilidade dos endpoints de conversão.
- **Entregáveis:** ms-runbook, checklist de release.

### 2.9 PM — Rafael (ms-pm-rafael)

- **Papel:** Planejamento e comunicação.
- **Tarefas:**
  - [ ] Plano de sprint com foco nos gaps priorizados.
  - [ ] Status report para stakeholders.
  - [ ] Acompanhar riscos (ex: duplicação de Customer).
- **Entregáveis:** ms-sprint-plan, status report.

---

## 3. Ordem de Execução (Playbook Orquestrador)

```
1) PO: validar backlog e priorizar gaps
2) Analista: detalhar US para G1, G2, G3
3) UX: spec para autocomplete e estados vazios
4) CTO: validar ADRs e NFRs
5) Dev: implementar G1 → G2 → G3 → G5
6) QA: plano de testes + execução + evidências
7) DevOps: runbook
8) Go/No-Go: aprovação final
```

---

## 4. Dependências com APP PROPOSTAS

| APP PROPOSTAS | Ação no MULTIGEST |
|---------------|-------------------|
| Form único (tipo, cliente, itens) | Manter wizard em etapas (já implementado e mais claro) |
| Tipos: maritimo, modulo, acessorios | Mapear para AssetType do MULTIGEST |
| Campo empresa, contato, telefone, email | Já mapeados em Customer/companyName/contactName |
| Backend Express | Não migrar — MULTIGEST já tem NestJS |

**Conclusão:** A integração deve ser **dentro do MULTIGEST** (ADR-001). O APP PROPOSTAS serve como referência de fluxo e dados; não há necessidade de manter o app separado.

---

## 5. Próximos Passos Imediatos

1. **PO:** Priorizar G1 (mapeamento itens → ContractItem) como primeira história.
2. **Analista:** Produzir US com Gherkin para G1.
3. **Dev:** Implementar mapeamento itens proposta → ContractItem + Asset (com fallback).
4. **QA:** Incluir cenário E2E no plano de testes.

---

## 6. Rastreabilidade

| Documento | Descrição |
|-----------|-----------|
| A | Dossiê do sistema zipado |
| B | Mapa do ciclo |
| C | Gap Analysis |
| D | Estratégia (Incremental) |
| E | Plano de Execução (Fases 1–3) |
| F | Contrato de Integração (APIs) |
| G | Plano de Testes |
| H | Runbook Operação |
| I | Veredito Final (APROVADO) |
| **J** | **Este documento — Plano Multiagente** |

---

**Status:** Planejamento concluído. Pronto para execução conforme playbook.
