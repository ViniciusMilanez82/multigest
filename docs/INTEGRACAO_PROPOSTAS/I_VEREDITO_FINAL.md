# ETAPA 8 — Revisão Multiagente Final

**Documento:** I) Veredito Final + Próximos Passos

---

## 1. Pareceres dos agentes

### PO (Juliana)
- **Entendeu:** Ciclo Proposta → Contrato → Saída → Faturamento → Retorno para Venda, Locação e Evento.
- **Bom:** Integração incremental; valor entregue por fases.
- **Falta:** Priorizar escopo de Venda (fatura direta vs SaleOrder).
- **Riscos:** Proposta sem status na origem; possível confusão entre proposta e orçamento.
- **Recomendação:** Fase 1 com foco em propostas; validar conversão com usuários antes da Fase 2.
- **Perguntas:** Proposta tem prazo de validade? Existe fluxo de aprovação interna?

### Analista (Carlos)
- **Entendeu:** Entidades, estados, mapeamento Proposta → Customer/Contract/Invoice.
- **Bom:** Mapeamento de dados documentado; regras de idempotência.
- **Falta:** Tratamento explícito quando ativo não existe no mapeamento itens.
- **Riscos:** Duplicação de Customer; itens com tipo/modelo não cadastrado.
- **Recomendação:** Definir regra obrigatória para ativo inexistente (bloquear, criar placeholder ou permitir sem vínculo).

### UX (Luiz)
- **Entendeu:** Wizard em 4 etapas; integração ao dashboard MULTIGEST.
- **Bom:** Wizard já validado no sistema original.
- **Falta:** Estados vazios, loading, mensagens de erro no novo módulo.
- **Riscos:** Duas UIs (jQuery vs React) se manter HTML separado.
- **Recomendação:** Reimplementar wizard em React (Next.js) para consistência.

### CTO (Eduardo)
- **Entendeu:** Estratégia incremental; Proposal como entidade no MULTIGEST.
- **Bom:** Opção 3; ADRs; CompanyGuard; auditoria.
- **Falta:** Decisão de migração de dados (se há propostas em produção no sistema antigo).
- **Riscos:** Dois bancos (propostas legado vs MULTIGEST) durante migração.
- **Recomendação:** ADR-001 a 004 aprovados; schema Proposal com companyId desde o início.

### Dev (Renata/André)
- **Entendeu:** Tarefas por fase; endpoints; mapeamento.
- **Bom:** Plano claro; contrato de integração definido.
- **Falta:** package.json e dependências do sistema Propostas (para migração).
- **Riscos:** Itens JSONB vs tabela normalizada; performance com muitos itens.
- **Recomendação:** JSONB na Fase 1; avaliar normalização se necessário.

### DevOps (Fernanda)
- **Entendeu:** Deploy via tar.gz; rollback; backups.
- **Bom:** Runbook alinhado ao DEPLOY.md.
- **Falta:** Migration automatizada no pipeline de deploy.
- **Riscos:** Esquecer `prisma migrate deploy` ao adicionar Proposal.
- **Recomendação:** Incluir migration no script de deploy.

### QA (Patrícia)
- **Entendeu:** Plano de testes; critérios Go/No-Go.
- **Bom:** Cobertura de funcional, erro, permissões, E2E.
- **Falta:** Automação dos testes E2E.
- **Riscos:** Regressão em contratos e faturas.
- **Recomendação:** Bloquear se qualquer teste Crítico falhar; incluir Proposal nos testes de regressão.

### PM (Rafael)
- **Entendeu:** Fases 1–3; dependências; responsáveis.
- **Bom:** Gates por fase; ordem lógica.
- **Falta:** Estimativa de esforço (dias) por fase.
- **Riscos:** Escopo da Fase 1 crescer.
- **Recomendação:** Fase 1 = 1–2 sprints; Fase 2 = 1 sprint; Fase 3 = 1 sprint (estimativa inicial).

---

## 2. STATUS FINAL

# APROVADO

**Condições para liberação da Fase 1:**
1. Proposal no schema com companyId, status, itens JSONB
2. CompanyGuard em todos os endpoints
3. Testes críticos passando
4. DoD MULTISOFT atendido

---

## 3. Próximos passos

| # | Ação | Responsável |
|---|------|-------------|
| 1 | Criar migration Proposal (Prisma) | Dev |
| 2 | Implementar ProposalsModule (NestJS) | Dev |
| 3 | Módulo Propostas no frontend (listagem + wizard) | Dev |
| 4 | Incluir prisma migrate no deploy | DevOps |
| 5 | Definir regra para ativo inexistente na conversão | Analista |
| 6 | Validar prioridade Venda (fatura direta) com negócio | PO |

---

## 4. Documentos gerados

| Doc | Caminho |
|-----|---------|
| A) Dossiê | `A_DOSSIE_SISTEMA_ZIPADO.md` |
| B) Mapa do Ciclo | `B_MAPA_DO_CICLO.md` |
| C) Gap Analysis | `C_GAP_ANALYSIS.md` |
| D) Estratégia | `D_ESTRATEGIA_INTEGRACAO.md` |
| E) Plano de Execução | `E_PLANO_EXECUCAO.md` |
| F) Contrato de Integração | `F_CONTRATO_INTEGRACAO.md` |
| G) Plano de Testes | `G_PLANO_TESTES.md` |
| H) Runbook | `H_RUNBOOK_OPERACAO.md` |
| I) Veredito Final | `I_VEREDITO_FINAL.md` |

---

## PRONTO PARA REVISÃO

**Integração Propostas ↔ MULTIGEST — documentação completa.**
