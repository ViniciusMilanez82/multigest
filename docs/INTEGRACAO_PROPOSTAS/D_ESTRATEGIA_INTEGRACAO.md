# ETAPA 3 — Estratégia de Integração

**Documento:** D) Estratégia de Integração + ADR  
**3 opções:** Mínima / Ideal / Incremental

---

## Opção 1 — Integração Mínima (MVP)

### Descrição
Inserir proposta como módulo no MULTIGEST: criar entidade `Proposal`, migrar lógica, manter wizard em React. Conversão manual "Aceitar → Gerar Contrato" sem automação total.

### Prós
- Baixo risco
- Entregável rápido
- Reutiliza auth e multi-empresa do MULTIGEST

### Contras
- Conversão proposta → contrato manual
- Venda continua sem fluxo formal (fatura avulsa)

### Riscos
- Duplicação de cliente (proposta usa empresa/contato; MULTIGEST usa Customer)

### Custo de manutenção
- Baixo – um módulo a mais

### Impactos no MULTIGEST
- Nova entidade `Proposal`, novo menu "Propostas"
- Sem alteração em Contract/Invoice

### Requisitos dados/segurança
- Proposal com `companyId`, `createdById`
- CompanyGuard em todos os endpoints

---

## Opção 2 — Integração Ideal

### Descrição
Proposta como cidadã de primeira classe: status, conversão automática em Contrato ou SaleOrder, mapeamento completo de itens, auditoria ponto a ponto.

### Prós
- Fluxo completo Proposta → Contrato → Entrega → Faturamento → Retorno
- Suporte claro a Venda, Locação e Evento
- Rastreabilidade proposta ↔ contrato

### Contras
- Maior esforço
- Nova entidade SaleOrder para venda
- Refatoração de faturamento para venda

### Riscos
- Complexidade de regras (venda vs locação vs evento)

### Custo de manutenção
- Médio – mais entidades e fluxos

### Impactos no MULTIGEST
- Proposal, ProposalItem (ou itens JSONB)
- Contract com `proposalId?`
- SaleOrder (nova) ou Invoice direta para venda
- Novos campos/tipos

### Requisitos dados/segurança
- Idempotência na conversão
- Auditoria em cada transição de status

---

## Opção 3 — Integração Incremental

### Descrição
Fases progressivas:

**Fase 1:** Proposta no MULTIGEST (CRUD, wizard, PDF) – sem conversão  
**Fase 2:** Conversão proposta → contrato (locação/evento)  
**Fase 3:** Fluxo de venda (fatura direta ou SaleOrder)  
**Fase 4:** Refinamentos (auditoria, melhorias UX)

### Prós
- Entrega valor por etapas
- Risco diluído
- Feedback entre fases

### Contras
- Demora para ciclo completo
- Possível retrabalho entre fases

### Riscos
- Escopo da Fase 1 crescer

### Custo de manutenção
- Baixo no início, aumenta com as fases

### Impactos no MULTIGEST
- Incrementais por fase

### Requisitos dados/segurança
- Mesmos da Opção 2, aplicados por fase

---

## Recomendação

**Opção 3 — Integração Incremental**

| Motivo |
|--------|
| Entrega valor rápido (Fase 1 = propostas funcionando) |
| Permite validação antes de investir em conversão |
| Adequada a multi-empresa e alto impacto financeiro |
| Permite ajustar Escopo de Venda conforme uso real |

---

## ADR sugeridos

| ID | Decisão |
|----|---------|
| ADR-001 | Proposta será entidade no MULTIGEST; não sistema separado |
| ADR-002 | Itens da proposta em JSONB (fase 1); normalizar depois se necessário |
| ADR-003 | Venda: fatura direta (Invoice sem contractId) na Fase 3 |
| ADR-004 | Retorno = ContractMovement (PICKUP); sem módulo de pós-venda no MVP |

---

## PRONTO PARA REVISÃO
