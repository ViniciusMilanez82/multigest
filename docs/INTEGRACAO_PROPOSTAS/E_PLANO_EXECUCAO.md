# ETAPA 5 — Plano de Execução

**Documento:** E) Plano de Execução  
**Ordem lógica:** Fase 1 → 2 → 3

---

## Fase 1 — Propostas no MULTIGEST (MVP)

### Objetivo
Ter propostas funcionando dentro do MULTIGEST: criar, listar, editar, PDF, compartilhar.

### Tarefas

| # | Tarefa | Responsável | Entregável | Gate |
|---|--------|-------------|------------|------|
| 1.1 | Modelo Proposal no Prisma (companyId, customerId?, tipo, status, itens JSONB, valorTotal) | Dev | Migration | Schema aprovado |
| 1.2 | ProposalService + Controller (CRUD) | Dev | Endpoints | Testes passando |
| 1.3 | Módulo Propostas no frontend (listagem, wizard) | Dev | Telas | UX revisado |
| 1.4 | Geração PDF no frontend (jsPDF ou lib) | Dev | Botão PDF | PDF gerado |
| 1.5 | Links WhatsApp/E-mail | Dev | Botões | Links funcionando |
| 1.6 | Mapeamento empresa/contato → Customer (criar ou buscar) | Dev | Integração | Sem duplicação |
| 1.7 | Menu "Propostas" no layout | Dev | Navegação | Acessível |

### Gate de saída Fase 1
- [ ] CRUD propostas funcionando
- [ ] PDF gerado
- [ ] CompanyGuard em todos os endpoints
- [ ] DoD MULTISOFT atendido

### Riscos
- Customer duplicado: mitigar com busca por CPF/CNPJ ou email antes de criar

---

## Fase 2 — Conversão Proposta → Contrato (Locação/Evento)

### Objetivo
Proposta aceita vira Contrato (locação ou evento).

### Tarefas

| # | Tarefa | Responsável | Entregável | Gate |
|---|--------|-------------|------------|------|
| 2.1 | Campo proposalId em Contract (opcional) | Dev | Migration | — |
| 2.2 | Status na Proposal: RASCUNHO, ENVIADA, ACEITA, RECUSADA, CONVERTIDA | Dev | Schema | — |
| 2.3 | Botão "Aceitar" + "Converter em Contrato" | Dev | Fluxo | — |
| 2.4 | Serviço de conversão: Proposal → Contract + ContractItems | Dev | Lógica | Mapeamento itens→ativos |
| 2.5 | Mapeamento itens proposta → ContractItem (buscar Asset por tipo/modelo) | Dev | Regra | Fallback se ativo não existir |
| 2.6 | Tratamento Evento (vigência curta) | Dev | Config | — |

### Gate de saída Fase 2
- [ ] Proposta aceita gera Contrato
- [ ] Itens mapeados
- [ ] Auditoria (quem, quando)

### Riscos
- Ativo não encontrado: definir regra (criar placeholder, bloquear, ou permitir sem ativo)

---

## Fase 3 — Venda e refinamentos

### Objetivo
Fluxo de venda (fatura direta) e ajustes finos.

### Tarefas

| # | Tarefa | Responsável | Entregável | Gate |
|---|--------|-------------|------------|------|
| 3.1 | Proposta tipo=venda → Invoice direta (sem contractId) | Dev | Fluxo | — |
| 3.2 | Itens de venda → InvoiceItem (ou estrutura equivalente) | Dev | Schema se necessário | — |
| 3.3 | Revisão UX (estados vazios, loading, erros) | UX | Checklist | — |
| 3.4 | Auditoria nas transições de status | Dev | Logs | — |

### Gate de saída Fase 3
- [ ] Venda gera fatura
- [ ] Ciclo completo para os 3 tipos

### Riscos
- Invoice sem contractId: validar regras de negócio

---

## Dependências entre fases

```
Fase 1 ─────────────────┐
                        ├──▶ Fase 2 (conversão)
Fase 2 ─────────────────┘
                        └──▶ Fase 3 (venda)
```

---

## PRONTO PARA REVISÃO
