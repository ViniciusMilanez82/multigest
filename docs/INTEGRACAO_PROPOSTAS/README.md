# Integração Sistema de Propostas × MULTIGEST

**Ciclo:** Proposta → Contrato → Saída/Entrega → Faturamento → Retorno  
**Tipos:** Venda, Locação, Evento  
**Retorno:** Devolução do container (ContractMovement PICKUP)

---

## Documentos

| # | Documento | Descrição |
|---|-----------|-----------|
| A | [A_DOSSIE_SISTEMA_ZIPADO.md](A_DOSSIE_SISTEMA_ZIPADO.md) | Dossiê do sistema zipado (stack, estrutura, API) |
| B | [B_MAPA_DO_CICLO.md](B_MAPA_DO_CICLO.md) | Entidades, estados, eventos do ciclo |
| C | [C_GAP_ANALYSIS.md](C_GAP_ANALYSIS.md) | O que existe vs o que falta (Must/Should/Could) |
| D | [D_ESTRATEGIA_INTEGRACAO.md](D_ESTRATEGIA_INTEGRACAO.md) | 3 opções + recomendação (Incremental) |
| E | [E_PLANO_EXECUCAO.md](E_PLANO_EXECUCAO.md) | Fases 1–3, tarefas, gates |
| F | [F_CONTRATO_INTEGRACAO.md](F_CONTRATO_INTEGRACAO.md) | APIs, payloads, mapeamento, idempotência |
| G | [G_PLANO_TESTES.md](G_PLANO_TESTES.md) | Testes funcional, erro, permissões, E2E, Go/No-Go |
| H | [H_RUNBOOK_OPERACAO.md](H_RUNBOOK_OPERACAO.md) | Deploy, rollback, logs, backups |
| I | [I_VEREDITO_FINAL.md](I_VEREDITO_FINAL.md) | Revisão multiagente, STATUS: APROVADO |

---

## Status

**APROVADO** — Pronto para iniciar Fase 1 (Propostas no MULTIGEST).

---

## Próximo passo

Implementar Fase 1 conforme [E_PLANO_EXECUCAO.md](E_PLANO_EXECUCAO.md).
