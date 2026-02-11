# MULTISOFT no Antigravity — LEIA-ME PRIMEIRO (guia para leigos)

Este pacote instala o **modelo MULTISOFT** dentro do seu projeto Antigravity usando:
- **Rules** (regras permanentes do projeto)
- **Workflows** (atalhos com `/` — “prompts salvos”)
- **Skills** (papéis/roles, cada um com um `SKILL.md`)

## Objetivo (o que você ganha)
Você vai conseguir gerar e manter **PRD, stories, UX spec, ADR, plano de testes, runbook e Go/No-Go**
apenas rodando workflows do tipo `/ms-*`, com padrões de qualidade.

---

## Parte 1 — Colocar no seu projeto (passo a passo simples)

### 1) Crie (ou escolha) uma pasta de projeto
Exemplo: `meu-projeto-multisoft/`

### 2) Copie as pastas deste pacote para a raiz do seu projeto
Copie **estas duas pastas** para dentro do seu projeto:

- `.agent/`  ✅ (obrigatório — rules, workflows, skills)
- `docs/`    ✅ (recomendado — guia rápido)

A raiz do seu projeto deve ficar assim:

```
meu-projeto-multisoft/
  .agent/
    rules/
    workflows/
    skills/
  docs/
    MULTISOFT_GUIA_RAPIDO.md
```

### 3) Abra o projeto no Antigravity (como Workspace)
No Antigravity, escolha a pasta `meu-projeto-multisoft/` como workspace.

### 4) Teste se carregou
Abra o chat do Agent e digite `/`:
- Se aparecerem workflows como `ms-prd`, `ms-stories` etc., **está pronto**.

---

## Parte 2 — Usar no dia a dia (o básico)

### Como começar (sempre)
1) Abra o chat do Agent
2) Anexe contexto com `@` (por exemplo: `@docs/MULTISOFT_GUIA_RAPIDO.md`)
3) Rode: `/ms-start`  ✅

### Ordem recomendada (end-to-end)
1. `/ms-prd` (PO)  
2. `/ms-stories` (Analista)  
3. `/ms-ux-spec` (UX)  
4. `/ms-adr` (CTO)  
5. `/ms-impl-plan` (Dev)  
6. `/ms-test-plan` (QA)  
7. `/ms-runbook` (DevOps)  
8. `/ms-release-go-no-go` (QA/PO)  
9. `/ms-sprint-plan` (PM)  

---

## Se algo não funcionar
- Se o menu do `/` não aparecer: reinicie o Antigravity e tente de novo.
- Se ainda não aparecer, procure o menu de Workflows (geralmente um botão com `…` ou “Workflows”).

Pronto. Agora é só rodar os workflows e ir aprovando os artefatos.
