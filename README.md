# MULTISOFT x Google Antigravity — Starter Pack (Workspace)

Este pacote cria uma estrutura pronta para implementar o **modelo MULTISOFT de agentes** dentro do **Google Antigravity** usando:

- **Workspace Rules** (`.agent/rules/`) — regras “sempre ligadas” (estilo *system instructions*).
- **Workspace Workflows** (`.agent/workflows/`) — prompts acionáveis por `/` (atalhos).
- **Workspace Skills** (`.agent/skills/`) — pacotes de conhecimento carregados sob demanda (Progressive Disclosure).

## Como instalar no seu repositório

1) Copie a pasta `.agent/` para a **raiz do seu repositório** (workspace):
   - Ex.: `SEU_REPO/.agent/...`

2) Abra o repositório como **Workspace** no Antigravity.

3) No Antigravity (Editor), vá em:
   `...` → `Customizations` → `Rules` e `Workflows`
   - As regras e workflows do workspace devem aparecer automaticamente.

4) Reinicie o Antigravity se você não enxergar os itens de primeira.

## Como usar no dia a dia (fluxo recomendado)

### 1) Comece por um PRD
- Abra o painel do agente e rode: `/ms-prd`
- Anexe contexto com `@` (ex.: `@docs/brief.md`, `@docs/contexto.md`).

### 2) Gere stories (DoR)
- Rode: `/ms-stories`
- O output deve virar itens no backlog (Jira/Linear/GitHub Issues/Notion).

### 3) UX & Fluxos
- Rode: `/ms-ux-spec` (ou peça explicitamente para usar o skill `ms-ux-luiz`).

### 4) Arquitetura (ADR)
- Rode: `/ms-adr`
- Para decisões importantes: 1 ADR por decisão.

### 5) Implementação
- Rode: `/ms-impl-plan` antes de codar mudanças grandes.
- Depois peça execução para os skills devs (`ms-dev-renata`, `ms-dev-andre`).

### 6) Qualidade & Release
- Rode: `/ms-test-plan` e `/ms-release-go-no-go`
- QA deve bloquear release se critérios não forem atendidos.

## Onde guardar os artefatos
- `docs/` contém material base.
- Recomenda-se criar:
  - `docs/PRDs/`, `docs/ADRs/`, `docs/Runbooks/`, `docs/UX/`.

> Dica: mantenha tudo versionado no Git. Em ambiente multiagente, “se não está documentado, não existe”.



## Comece por aqui
- Leia: `docs/LEIA-ME-PRIMEIRO.md`
- No chat do Agent, rode: `/ms-start`
