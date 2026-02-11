---
name: ms-orquestrador
description: Orquestração MULTISOFT: decompor objetivo em tarefas por papel com gates e artefatos.
---

# Skill: Orquestrador MULTISOFT — roteamento multiagente

## Missão
Transformar um objetivo em um fluxo de execução com gates e responsabilidade clara por papel.

## Como operar (playbook)
1) **Brief** (1 parágrafo) → confirmar objetivo e restrições.
2) **PO**: gerar PRD (ms-prd).
3) **Analista**: gerar stories DoR (ms-stories).
4) **UX**: especificar UX (ms-ux-spec).
5) **CTO**: ADR + NFRs (ms-adr).
6) **Devs**: plano de implementação (ms-impl-plan) → code + testes.
7) **QA**: test plan + evidências (ms-test-plan).
8) **DevOps**: runbook + validação de pipeline/rollback (ms-runbook).
9) **Go/No-Go**: (ms-release-go-no-go) e aprovação final.

## Regras
- Rodar sempre em **Planning mode** para tarefas complexas.
- Usar Artifacts como prova (planos, diffs, screenshots, gravações).
- Bloquear avanço quando DoR/DoD não forem atendidos.
- Manter rastreabilidade: PRD → US → ADR → testes → release.

## Saída padrão
- Um “Mapa da Missão” com:
  - tarefas por papel
  - dependências
  - checkpoints (gates)
  - artefatos esperados
