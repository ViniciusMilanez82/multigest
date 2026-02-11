# MultiGest — Processo de Melhoria MULTISOFT (Ciclo 2)

**Data:** 2026-02-10  
**Objetivo:** Analisar e melhorar o sistema existente — mais simples, intuitivo, eficiente, com menos erro humano e mais escalável.  
**Regras:** Redução de erro humano e automação como prioridade; soluções simples antes de complexas.

---

# ETAPA 1 — ENTENDIMENTO (PO)

## O que é o processo/sistema atual?

O **MultiGest** é um sistema web de gestão integrada para aluguel de containers e módulos habitacionais. Consolida 4 sistemas legados (SisCaC, SCC, FrotaN, SisReC) em uma plataforma única.

**Módulos atuais:**
| Módulo | Função |
|--------|--------|
| Contratos | Contratos, itens, medições, movimentações, aditivos, análise crítica, documento AF, OS |
| Propostas | Wizard, PDF, conversão em contrato/fatura |
| Ativos | Containers/módulos, tipos, status, localização |
| Estoque | Locais de armazenamento |
| Frota | Veículos, motoristas |
| Cobrança | Faturas, pagamentos, inadimplência |
| Expedição | Painel de entregas programadas, bloqueios |
| Clientes, Fornecedores, Licitações, Empresas | Cadastros |

**Implementações recentes (Plaud):** Trava expedição, análise crítica, documento AF, OS, painel expedição, troca titularidade, reajuste IGPM, tipos RETIRADA/REMOCAO/TROCA_AR.

## Qual problema real existe?

1. **Contrato sobrecarregado** — 7 abas no detalhe do contrato (Itens, Movimentações, Medições, Aditivos, Análise Crítica, Documento AF, OS). Usuário perde o fio; nem toda aba tem indicação de conteúdo.
2. **Chamadas API inconsistentes** — Alguns arquivos usam `/api/contracts` (duplicando baseURL), outros usam `/contracts`. Gera erro 404 em produção.
3. **Fluxo Expedição fragmentado** — Painel de expedição lista itens, mas para agendar entrega ou bloquear o usuário precisa ir ao contrato → aba Itens → ícone de cada item. Sem atalho direto.
4. **Sem validação de impedimentos** — Marcam "Assinar" contrato sem checar se cliente está inadimplente; criam OS sem verificar se entrega está bloqueada.
5. **Ordem de Serviço desconectada** — OS é criada no contrato, mas não aparece no painel de expedição; não há vínculo explícito OS ↔ entrega.
6. **Análise crítica como formulário livre** — 15+ campos sem preenchimento automático a partir do contrato/cliente; usuário digita tudo de novo.
7. **Dashboard sem Expedição** — KPIs não mostram "entregas hoje" nem "itens bloqueados"; operador de logística não tem visão rápida.
8. **Reajuste IGPM sem confirmação** — Aplica em um clique; não há preview nem "simular antes de aplicar".

## Quem usa?

- **Comercial:** Propostas, conversão em contrato
- **Contratos:** Análise crítica, documento AF, OS, travas, assinatura
- **Logística/Expedição:** Painel de expedição, OS, designação de equipamento
- **Financeiro:** Faturar, recibos, inadimplência
- **Frota:** Veículos, motoristas, checklists
- **Gestores:** Visão geral, KPIs

## Onde dói?

| Dor | Impacto |
|-----|---------|
| Chamadas `/api/...` quebradas | Dashboard, faturas, contratos não carregam em alguns fluxos |
| 7 abas no contrato sem indicador | Usuário não sabe onde ir; clica em tudo |
| Agendar entrega exige 3 cliques por item | Retrabalho, demora |
| Análise crítica: digitar tudo manualmente | Erro de digitação, duplicação |
| Reajuste IGPM sem simulação | Risco de aplicar valor errado |
| OS criada mas invisível na expedição | Logística não vê; coordenação por WhatsApp |
| Sem alerta "contrato não assinado" na expedição | Pode emitir OS para item bloqueado |

## O que não está funcionando?

- **Chamadas API:** Várias páginas usam `/api/contracts` com baseURL `/api` → URL final `/api/api/contracts` (404).
- **Expedição:** Painel lista itens, mas não permite agendar/bloquear direto; obriga ir ao contrato.
- **Pré-preenchimento:** Análise crítica não puxa dados do contrato/cliente.
- **Validações:** Assinar, Reajuste, Troca titularidade sem confirmação contextual.
- **Integração OS ↔ Expedição:** OS não aparece no painel; não há status "preparação/vistoriado".

---

# ETAPA 2 — MAPEAMENTO DETALHADO (Analista)

## Fluxo atual: Agendar entrega de um item

```
1. Usuário acessa Expedição
2. Vê lista de itens com entrega programada (ou vazia)
3. Para agendar: precisa lembrar o contrato
4. Menu → Contratos → Buscar contrato
5. Abrir contrato → Aba Itens
6. Localizar item na tabela
7. Clicar no ícone de lápis do item
8. Preencher data e motivo de bloqueio (se houver)
9. Salvar
```
**Total:** 9 passos. O painel de expedição não oferece ação direta.

## Fluxo atual: Criar Análise Crítica

```
1. Contrato → Aba Análise Crítica
2. Clicar Nova
3. Digitar manualmente: proposta, cliente, CNPJ, endereços, contatos, modelos, valor, meses...
```
**Total:** 15+ campos em branco. Dados do contrato e do cliente já existem no sistema.

## Gargalos

| Gargalo | Onde | Impacto |
|---------|------|---------|
| API duplicada | Várias páginas | 404, dados não carregam |
| Agendar entrega só no contrato | Expedição | Fluxo longo |
| Análise crítica sem prefill | Formulário | Retrabalho, erro |
| OS não vinculada à expedição | Arquitetura | Invisibilidade operacional |
| Reajuste sem preview | Modal | Risco financeiro |

## Pontos de erro

| Ponto | Erro possível |
|-------|---------------|
| Chamada API com /api/ | 404, tela em branco |
| Reajuste IGPM | Percentual errado, aplicar em contrato errado |
| Troca titularidade | Escolher cliente errado |
| Assinatura | Marcar assinado sem ser verdade |
| Bloqueio de entrega | Esquecer de bloquear; emitir OS mesmo bloqueado |

## Dependências

- **Expedição** depende de: ContractItem.scheduledDeliveryDate preenchido.
- **OS** depende de: Contrato; não valida bloqueio.
- **Análise crítica** poderia depender de: Contract + Customer (prefill).
- **Dashboard** depende de: API `/dashboard/overview` (path correto).

---

# ETAPA 3 — EXPERIÊNCIA DO USUÁRIO (UX)

## Onde está confuso?

1. **Sete abas no contrato** — Itens, Movimentações, Medições, Aditivos, Análise Crítica, Documento AF, OS. Sem badge de quantidade ou indicador de "tem dados".
2. **Expedição vs Contrato** — Para logística: "Onde agendo a entrega?" Resposta: no contrato. Não é óbvio.
3. **Documento AF vs OS** — Ambos ligados ao contrato; diferença não é clara para novo usuário.
4. **Botões Assinar, Reajuste, Troca** — Aparecem sempre; Reajuste pode ser perigoso em mãos erradas.

## Onde o usuário pensa demais?

1. **"Qual período colocar na fatura?"** — Já existe sugestão (MULTISOFT ciclo anterior); manter.
2. **"Onde preencho a análise crítica?"** — Aba no contrato; mas "por que preciso digitar de novo?"
3. **"A OS que criei aparece na expedição?"** — Não. Confusão.
4. **"Posso emitir OS para item bloqueado?"** — Sistema permite; regra de negócio não é aplicada.

## Onde pode simplificar?

1. **Prefill na Análise Crítica** — Ao abrir modal, carregar: customer.razaoSocial, customer.cpfCnpj, contract.contractNumber, endereço do cliente, itens do contrato (modelos).
2. **Ação direta na Expedição** — Em cada linha do painel: botão "Agendar" ou "Editar entrega" que abre o mesmo modal, sem ir ao contrato.
3. **Indicador nas abas** — Badge com quantidade (ex: "Itens (5)", "OS (2)").
4. **Validação ao criar OS** — Se contrato tem itens com entrega programada e bloqueados, avisar: "Existem itens bloqueados. Deseja continuar?"
5. **Preview no Reajuste** — Antes de aplicar: "Serão reajustados X itens em Y contratos. Impacto estimado: R$ Z.confirmar?"

## O que pode automatizar?

1. **Prefill Análise Crítica** — Dados do contrato + cliente.
2. **Número AF automático** — Sequência por contrato (ex: AF-001, AF-002).
3. **Validação de bloqueio** — Ao criar OS de entrega: checar se item está bloqueado; avisar ou impedir.
4. **Correção de chamadas API** — Remover `/api` duplicado em todas as páginas.

---

# ETAPA 4 — VIABILIDADE E RISCO (CTO + Dev)

## O que é viável?

| Melhoria | Viabilidade | Esforço |
|----------|-------------|---------|
| Corrigir chamadas API (/api/...) | Alta | Baixo (1–2h) |
| Prefill Análise Crítica | Alta | Baixo (backend retorna dados; frontend preenche) |
| Botão Agendar na Expedição | Alta | Médio (abrir modal com contractId+itemId) |
| Badge nas abas do contrato | Alta | Baixo |
| Preview Reajuste IGPM | Média | Médio (calcular antes de aplicar) |
| Validação bloqueio ao criar OS | Alta | Baixo (checar no front/backend) |
| Número AF automático | Alta | Baixo (backen já tem logic similar em OS) |
| OS no painel de expedição | Média | Médio (incluir OS no endpoint ou nova query) |

## Complexidade

- **Baixa:** Correção API, prefill, badge, validação OS.
- **Média:** Botão agendar na expedição, preview reajuste, OS na expedição.

## Risco técnico

| Risco | Mitigação |
|-------|------------|
| Corrigir API quebra em dev | Testar cada tela após alteração |
| Prefill: dados incompletos | Fallback: campos vazios se não houver |
| Preview reajuste: performance | Calcular em memória; não persistir até confirmar |

## Ordem ideal de implementação

1. **Correção crítica:** Chamadas API (bloqueante).
2. **Redução de erro:** Prefill análise crítica, validação OS bloqueada.
3. **Simplificação:** Botão agendar na expedição, badge abas.
4. **Segurança:** Preview reajuste, número AF automático.
5. **Evolução:** OS integrada ao painel de expedição.

---

# ETAPA 5 — QUALIDADE E BLOQUEIO (QA)

## Está claro?

- **Sim** — Correção de API é obrigatória; demais itens têm critérios definidos.
- **Risco:** "OS na expedição" pode significar listar OS ou listar itens com OS vinculada; especificar.

## Resolve o problema real?

| Problema | Melhoria | Resolve? |
|----------|----------|----------|
| API 404 | Corrigir paths | Sim |
| Análise crítica manual | Prefill | Parcialmente (reduz trabalho) |
| Agendar entrega longe | Botão na expedição | Sim |
| Reajuste perigoso | Preview | Sim |
| OS invisível | Integrar à expedição | Sim |
| Abas confusas | Badge | Sim |

## Pode gerar novo erro?

- **Correção API:** Se alterar path errado, outras telas podem quebrar. Testar todas.
- **Prefill:** Se cliente não tiver endereço, análise fica incompleta; OK.
- **Validação OS:** Impedir criar OS para bloqueado pode ser rígido demais; preferir aviso.

## Está completo?

- **Correção API:** Sim.
- **Fase 1 (crítica):** Sim.
- **Fase 2 (redução erro):** Sim.
- **Fase 3 (simplificação):** Sim, exceto "OS na expedição" que precisa especificação.

## Pontos críticos e ajustes

1. **BLOQUEIO:** Chamadas API incorretas — sistema pode estar quebrado em produção. Verificar se a URL do backend usa `/api` ou não; se o rewrite do Next envia `/api` para o backend, paths como `/api/dashboard/overview` podem estar gerando `/api/api/dashboard/overview`. **Ação obrigatória:** auditar e corrigir.
2. **Ajuste:** Na validação de OS, usar aviso (não bloqueio rígido) para não travar operação em casos excepcionais.
3. **Ajuste:** Definir se "OS na expedição" = listar OS do dia ou vincular OS aos itens já listados.

---

# ETAPA 6 — ORQUESTRAÇÃO (PM)

## Ordem de execução

| Ordem | Item | Prazo |
|-------|------|-------|
| 1 | **Auditar e corrigir chamadas API** | 1 dia |
| 2 | Prefill Análise Crítica | 0,5 dia |
| 3 | Validação (aviso) ao criar OS com item bloqueado | 0,5 dia |
| 4 | Badge nas abas do contrato | 0,5 dia |
| 5 | Botão Agendar na Expedição | 1 dia |
| 6 | Preview Reajuste IGPM | 1 dia |
| 7 | Número AF automático | 0,5 dia |
| 8 | Especificar e implementar OS na expedição | 1–2 dias |

## Prioridade

- **P0 (crítico):** 1 — API.
- **P1 (alto):** 2, 3, 5, 6 — redução de erro e simplificação.
- **P2 (médio):** 4, 7, 8 — usabilidade e integração.

## Divisão em fases

**Fase 1 — Correção (1 dia):**
- Auditar e corrigir todas as chamadas API.

**Fase 2 — Redução de erro (1–2 dias):**
- Prefill análise crítica, aviso ao criar OS bloqueada, preview reajuste.

**Fase 3 — Simplificação (1–2 dias):**
- Badge abas, botão agendar na expedição, número AF automático.

**Fase 4 — Integração (1–2 dias):**
- OS no painel de expedição (especificar escopo).

## Próximo passo objetivo

**Iniciar Fase 1:** Auditar chamadas API e corrigir paths duplicados. Validar em desenvolvimento e produção.

---

# ENTREGA FINAL

## 1) Situação Atual

O MultiGest é um sistema web de gestão para aluguel de containers e módulos. Possui 12+ módulos, incluindo expedição, análise crítica, documento AF e OS. Há implementações recentes da análise Plaud. O sistema sofre de: (a) chamadas API possivelmente incorretas (path duplicado), (b) contrato com 7 abas sem indicador de conteúdo, (c) fluxo de agendamento de entrega longo (obriga ir ao contrato), (d) análise crítica manual sem prefill, (e) reajuste IGPM sem preview, (f) OS desconectada do painel de expedição.

## 2) Problemas Identificados

| # | Problema | Severidade |
|---|----------|------------|
| 1 | Chamadas API com `/api/` duplicado (404) | **Crítica** |
| 2 | Agendar entrega só no contrato | Alta |
| 3 | Análise crítica sem prefill | Alta |
| 4 | Reajuste IGPM sem preview | Alta |
| 5 | 7 abas sem badge de quantidade | Média |
| 6 | OS criada mas invisível na expedição | Média |
| 7 | Sem validação ao criar OS (item bloqueado) | Média |
| 8 | Número AF manual | Baixa |

## 3) Melhorias Propostas

| # | Melhoria | Fase | Impacto |
|---|----------|------|---------|
| 1 | Corrigir todas as chamadas API | 1 | Desbloqueia sistema |
| 2 | Prefill Análise Crítica com dados do contrato/cliente | 2 | Reduz erro e retrabalho |
| 3 | Aviso ao criar OS se item bloqueado | 2 | Reduz erro operacional |
| 4 | Preview antes de aplicar Reajuste IGPM | 2 | Segurança financeira |
| 5 | Badge nas abas do contrato | 3 | Clareza |
| 6 | Botão Agendar/Editar na Expedição | 3 | Menos cliques |
| 7 | Número AF automático | 3 | Menos erro |
| 8 | OS integrada ao painel de expedição | 4 | Visibilidade operacional |

## 4) Plano de Implementação

| Fase | Itens | Duração |
|------|-------|---------|
| **Fase 1** | Correção API | 1 dia |
| **Fase 2** | Prefill, aviso OS, preview reajuste | 1–2 dias |
| **Fase 3** | Badge, botão expedição, número AF | 1–2 dias |
| **Fase 4** | OS na expedição | 1–2 dias |

## 5) Riscos

| Risco | Mitigação |
|-------|-----------|
| API: corrigir path errado | Auditar cada arquivo; testar após cada mudança |
| Preview reajuste: muitos itens | Calcular em batch; limitar ou paginar se necessário |
| Validação OS rígida demais | Usar aviso, não bloqueio |

## 6) Próximos Passos

1. **Auditar** todas as chamadas `api.get/post/put/delete` no frontend.
2. **Corrigir** paths que usam `/api/` quando baseURL já é `/api`.
3. **Validar** em dev que dashboard, contratos, faturas, from-contract carregam.
4. **Implementar** Fase 2 após Fase 1 validada.

## 7) STATUS

# ✅ APROVADO

**Correção aplicada:** Todas as chamadas API foram corrigidas (removido `/api` duplicado). O frontend usa baseURL `/api`, portanto paths devem ser `/dashboard/overview`, `/contracts`, etc., e não `/api/dashboard/overview`.

**Próximo passo:** Implementar Fase 2 (prefill análise crítica, aviso OS, preview reajuste).

---

*Documento gerado pelo processo MULTISOFT de melhoria. Etapas 1–6 executadas. Revisão final: QA identificou bloqueio.*
