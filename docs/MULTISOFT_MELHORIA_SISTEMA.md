# MultiGest — Processo de Melhoria MULTISOFT

**Objetivo:** Tornar o sistema mais simples, intuitivo, eficiente, com menos erro humano e mais escalável.

**Princípios obrigatórios:**
1. **Redução de erro humano e automação** — prioridade máxima.
2. **Soluções simples antes de complexas** — preferir o mínimo que resolve.

**Implementações recentes (Fase 2 — redução de erro):**
- **Sugestão de período** — ao selecionar contrato, busca última fatura e preenche automaticamente início/fim do período + vencimento (fim + 10 dias).
- **Vencimento automático** — ao alterar fim do período, vencimento ajusta para fim + 10 dias (se estava vazio ou desatualizado).
- **Botão Faturar** — em contratos recentes no dashboard, atalho direto para faturamento com contrato pré-selecionado.
- **Filtro por contrato** — listagem de faturas aceita `contractId` para buscar faturas de um contrato específico.

---

## ETAPA 1 — ENTENDIMENTO (PO)

### O que é o processo/sistema atual?

O **MultiGest** é um sistema de gestão integrada para empresa de aluguel de containers e módulos habitacionais. Consolida 4 sistemas legados em uma plataforma web única:

| Módulo | Origem | Função |
|--------|--------|--------|
| Contratos | SisCaC | Contratos de aluguel, medições, movimentações, aditivos |
| Ativos | SCC | Containers/módulos, status, localização, manutenção |
| Frota | FrotaN | Veículos, motoristas, checklists, abastecimento |
| Cobrança | SisReC | Faturas, pagamentos, inadimplência, acordos, licitações |

**Cadastros:** Clientes, Fornecedores, Empresas, Locais de Estoque.

**Usuários:** 6 a 20 simultâneos. Multi-empresa (Multi Macaé, Multi Rio, Petroteiner).

### Qual problema real existe?

1. **Fluxo de faturamento fragmentado** — Faturar exige várias telas (Contratos → Cobrança → Faturar Contrato) e preenchimento manual de muitos campos.
2. **Navegação plana** — 11 itens no menu lateral sem agrupamento lógico; usuário não sabe por onde começar.
3. **Falta de visão de fluxo** — Não há "jornada do container" nem "jornada da fatura" visíveis.
4. **Retrabalho** — Exclusão de dias na fatura exige motivo por container; não há atalhos nem padrões.
5. **Dados desconectados** — Inadimplentes, acordos e ações de cobrança ficam em telas separadas; falta visão unificada.

### Quem usa?

- Operadores de contrato (criar, alterar, adicionar itens)
- Financeiro (faturar, receber pagamentos, cobrar)
- Frota (motoristas, veículos, checklists)
- Gestores (visão geral, KPIs)

### Onde dói?

| Dor | Impacto |
|-----|---------|
| Faturar contrato exige muitos passos | Lentidão, erro humano |
| Não saber qual contrato faturar | Retrabalho, esquecimento |
| 11 itens no menu sem hierarquia | Confusão, cliques perdidos |
| Sem alertas (CNH vencida, contrato vencendo) | Risco operacional |
| Sem relatórios/exportação | Dependência de planilhas externas |

### O que não está funcionando?

- **Dashboard** não oferece ações rápidas (ex: "Faturar este contrato").
- **Fluxo de faturamento** não sugere período nem número de fatura automaticamente.
- **Sem breadcrumbs** — usuário perde contexto ao navegar.
- **Sem atalhos** — tarefas recorrentes exigem vários cliques.
- **Módulo de Relatórios** inexistente (M8 planejado, não implementado).

---

## ETAPA 2 — MAPEAMENTO DETALHADO (Analista)

### Fluxo atual: Faturar um contrato

```
1. Login → Dashboard
2. Clicar em "Cobrança" no menu
3. Clicar em "Faturar Contrato"
4. Selecionar contrato no dropdown (lista até 500)
5. Preencher: Nº fatura, emissão, vencimento, período início/fim
6. Marcar containers a faturar (todos vêm marcados)
7. Para cada container: informar dias excluídos + motivo (se houver)
8. Ver total calculado
9. Clicar em "Gerar Fatura"
10. Ser redirecionado para a fatura criada
```

**Total:** ~10 passos, 6+ campos obrigatórios, possibilidade de erro em cada um.

### Gargalos

| Gargalo | Onde | Impacto |
|---------|------|---------|
| Lista de contratos sem filtro por "não faturado" | from-contract | Usuário rola lista inteira |
| Número de fatura manual | from-contract | Risco de duplicidade |
| Período manual | from-contract | Pode errar datas |
| Motivo obrigatório para exclusão de dias | from-contract | Fricção mesmo quando não há exclusão |

### Retrabalho

- Se errar o período → criar nova fatura e cancelar a antiga (ou editar manualmente).
- Se errar container → não há "desfazer" fácil.
- Não há validação se o período já foi faturado para aquele contrato.

### Pontos de erro

| Ponto | Erro possível |
|-------|---------------|
| Seleção de contrato | Escolher contrato errado |
| Período | Overlap com fatura existente |
| Nº fatura | Duplicar número |
| Dias excluídos | Esquecer motivo quando > 0 |
| Containers | Faturar container já faturado no período |

### Dependências

- **Faturar** depende de: Contrato ativo + Itens com data de saída + Período válido.
- **Cobrança** depende de: Fatura criada + Cliente com contato.
- **Dashboard** depende de: API responder; sem cache, cada refresh refaz chamadas.

---

## ETAPA 3 — EXPERIÊNCIA DO USUÁRIO (UX)

### Onde está confuso?

1. **Menu lateral** — 11 itens na mesma hierarquia; Contratos, Ativos, Frota e Cobrança são fluxos relacionados, mas aparecem como iguais a Clientes, Fornecedores, Licitações.
2. **"Faturar Contrato" vs "Fatura Avulsa"** — Dois botões na mesma tela; usuário não sabe quando usar cada um.
3. **Detalhe de contrato** — 4 abas (Itens, Movimentações, Medições, Aditivos) sem indicação de quais têm dados.
4. **Detalhe de fatura** — Ações de cobrança, acordos e inadimplentes em uma única seção; não fica claro o fluxo.

### Onde o usuário pensa demais?

1. **"Qual período colocar na fatura?"** — Não há sugestão com base no último faturamento do contrato.
2. **"Qual número de fatura usar?"** — Não há sequência automática.
3. **"Preciso excluir dias?"** — Formulário mostra campos para todos; usuário precisa decidir por container.
4. **"Onde está o container X?"** — Precisa abrir Ativos → buscar → ver detalhe; não há busca global.

### Onde pode simplificar?

1. **Agrupar menu** — Ex: "Operacional" (Contratos, Ativos, Estoque, Frota, Motoristas) e "Financeiro" (Cobrança, Clientes, Fornecedores, Licitações).
2. **Dashboard com ações** — Em "Contratos recentes", botão "Faturar" direto.
3. **Wizard de faturamento** — Passo 1: contrato. Passo 2: período (sugerido). Passo 3: confirmar itens. Passo 4: revisar e gerar.
4. **Número de fatura automático** — Backend gera sequência por empresa.
5. **Exclusão de dias** — Mostrar campos só quando usuário clicar "Excluir dias" no container.

### O que pode automatizar?

1. **Sugestão de período** — Último dia faturado + 1 até hoje (ou fim do mês).
2. **Número de fatura** — Sequência automática.
3. **Validação de overlap** — Antes de gerar, checar se período já foi faturado.
4. **Alertas** — CNH vencendo, contrato vencendo, fatura atrasada (notificação no dashboard).

---

## ETAPA 4 — VIABILIDADE E RISCO (CTO + Dev)

### O que é viável?

| Melhoria | Viabilidade | Esforço |
|----------|-------------|---------|
| Agrupar menu em categorias | Alta | Baixo (1–2h) |
| Número de fatura automático | Alta | Baixo (backend + frontend) |
| Sugestão de período no faturamento | Alta | Médio (lógica + API) |
| Validação de overlap de período | Alta | Médio (backend) |
| Wizard de faturamento (4 passos) | Média | Médio (refatorar from-contract) |
| Exclusão de dias colapsável | Alta | Baixo |
| Dashboard com botão "Faturar" em contratos | Alta | Baixo |
| Breadcrumbs | Alta | Baixo (componente reutilizável) |
| Módulo de Relatórios completo | Média | Alto |
| Alertas (CNH, contrato, fatura) | Média | Médio (backend + frontend) |

### Complexidade

- **Baixa:** Menu agrupado, breadcrumbs, botão "Faturar" no dashboard.
- **Média:** Número automático, sugestão de período, validação overlap, wizard, alertas.
- **Alta:** Relatórios, exportação PDF/Excel.

### Risco técnico

| Risco | Mitigação |
|-------|-----------|
| Número automático: concorrência | Usar transação ou unique constraint + retry |
| Sugestão de período: contrato sem histórico | Fallback: primeiro dia do mês atual |
| Validação overlap: performance | Índice em (contractId, billingPeriodStart, billingPeriodEnd) |

### Custo oculto

- **Wizard:** Pode exigir mudança na API `createFromContract` (payload por etapas).
- **Alertas:** Requer job/cron ou verificação sob demanda no carregamento do dashboard.

### Ordem ideal de implementação

1. **Fase 1 (rápida):** Menu agrupado, breadcrumbs, número de fatura automático.
2. **Fase 2 (média):** Sugestão de período, validação overlap, botão "Faturar" no dashboard, exclusão de dias colapsável.
3. **Fase 3 (maior):** Wizard de faturamento, alertas no dashboard.
4. **Fase 4 (futuro):** Relatórios, exportação.

---

## ETAPA 5 — QUALIDADE E BLOQUEIO (QA)

### Está claro?

- **Sim** — As melhorias propostas têm critérios de aceite definidos.
- **Risco:** "Wizard" pode ser interpretado de formas diferentes; precisa de protótipo ou especificação de telas.

### Resolve o problema real?

| Problema | Melhoria | Resolve? |
|----------|----------|----------|
| Fluxo fragmentado | Wizard + atalhos | Parcialmente (wizard sim; atalhos reduzem cliques) |
| Navegação confusa | Menu agrupado | Sim |
| Número manual | Automático | Sim |
| Período manual | Sugestão | Sim |
| Overlap de fatura | Validação | Sim |
| Sem alertas | Alertas dashboard | Sim |

### Pode gerar novo erro?

- **Número automático:** Se houver falha na geração, usuário pode ficar sem feedback claro.
- **Sugestão de período:** Se contrato for novo, sugestão pode ser inadequada; precisa de fallback visível.
- **Validação overlap:** Falsos positivos (ex: período em contrato diferente) — garantir escopo por contrato.

### Está completo?

- **Fase 1 e 2:** Sim, escopo fechado.
- **Fase 3 (Wizard):** Precisa de definição de telas (mockup ou descrição passo a passo).
- **Fase 4 (Relatórios):** Escopo aberto; definir quais relatórios primeiro.

### Pontos críticos e ajustes

1. **Bloqueio:** Nenhum. Plano pode avançar.
2. **Ajuste:** Na Fase 3, antes de implementar o Wizard, documentar os 4 passos e campos de cada um.
3. **Ajuste:** Garantir que número automático exiba mensagem clara em caso de conflito (ex: "Número já utilizado, tente novamente").

---

## ETAPA 6 — ORQUESTRAÇÃO (PM)

### Ordem de execução

| Ordem | Item | Responsável | Prazo sugerido |
|-------|------|-------------|----------------|
| 1 | Menu agrupado | Frontend | 1 dia |
| 2 | Breadcrumbs | Frontend | 1 dia |
| 3 | Número de fatura automático | Backend + Frontend | 1–2 dias |
| 4 | Sugestão de período | Backend + Frontend | 1–2 dias |
| 5 | Validação overlap | Backend | 1 dia |
| 6 | Botão "Faturar" no dashboard | Frontend | 0,5 dia |
| 7 | Exclusão de dias colapsável | Frontend | 0,5 dia |
| 8 | Documentar Wizard (especificação) | PO/PM | 0,5 dia |
| 9 | Wizard de faturamento | Full-stack | 2–3 dias |
| 10 | Alertas no dashboard | Backend + Frontend | 2 dias |

### Prioridade

- **P0 (crítico):** 1, 2, 3, 5 — reduzem erro e confusão imediatamente.
- **P1 (alto):** 4, 6, 7 — melhoram velocidade e usabilidade.
- **P2 (médio):** 8, 9, 10 — evolução do fluxo.

### Divisão em fases

**Fase 1 — Simplificação (1 semana):**
- Menu agrupado, breadcrumbs, número automático, validação overlap.

**Fase 2 — Aceleração (1 semana):**
- Sugestão de período, botão "Faturar" no dashboard, exclusão colapsável.

**Fase 3 — Evolução (2 semanas):**
- Especificação do Wizard, implementação do Wizard, alertas.

### Próximo passo objetivo

**Iniciar Fase 1:** Implementar menu agrupado e breadcrumbs (2 itens de baixo risco, alto impacto visual).

---

# ENTREGA FINAL

## 1) Situação Atual

O MultiGest é um sistema web de gestão integrada para aluguel de containers e módulos habitacionais. Possui 11 módulos no menu, fluxo de faturamento com muitos passos manuais, sem sugestões automáticas, sem agrupamento lógico na navegação e sem alertas preventivos. O sistema funciona, mas exige retrabalho e concentração para evitar erros.

## 2) Problemas Identificados

| # | Problema | Severidade |
|---|----------|------------|
| 1 | Fluxo de faturamento com 10+ passos e muitos campos manuais | Alta |
| 2 | Navegação plana com 11 itens sem hierarquia | Média |
| 3 | Número de fatura manual (risco de duplicidade) | Alta |
| 4 | Período de faturamento manual (sem sugestão) | Média |
| 5 | Ausência de validação de overlap de período | Alta |
| 6 | Sem atalhos no dashboard para tarefas recorrentes | Média |
| 7 | Sem breadcrumbs (perda de contexto) | Baixa |
| 8 | Exclusão de dias sempre visível (fricção) | Baixa |
| 9 | Sem alertas (CNH, contrato, fatura) | Média |
| 10 | Módulo de Relatórios inexistente | Média |

## 3) Melhorias Propostas

| # | Melhoria | Fase | Impacto |
|---|----------|------|---------|
| 1 | Menu agrupado (Operacional / Financeiro) | 1 | Reduz confusão |
| 2 | Breadcrumbs em todas as páginas | 1 | Restaura contexto |
| 3 | Número de fatura automático | 1 | Elimina duplicidade |
| 4 | Validação de overlap antes de gerar fatura | 1 | Evita erro |
| 5 | Sugestão de período no faturamento | 2 | Acelera preenchimento |
| 6 | Botão "Faturar" em contratos no dashboard | 2 | Reduz cliques |
| 7 | Exclusão de dias colapsável | 2 | Reduz fricção |
| 8 | Wizard de faturamento (4 passos) | 3 | Simplifica fluxo |
| 9 | Alertas no dashboard (CNH, contrato, fatura) | 3 | Previne problemas |
| 10 | Módulo de Relatórios (futuro) | 4 | Atende demanda gerencial |

## 4) Plano de Implementação

| Fase | Itens | Duração | Critério de conclusão |
|------|-------|---------|------------------------|
| **Fase 1** | Menu agrupado, breadcrumbs, nº automático, validação overlap | 1 semana | 4 itens em produção |
| **Fase 2** | Sugestão período, botão Faturar, exclusão colapsável | 1 semana | 3 itens em produção |
| **Fase 3** | Especificação Wizard, Wizard, alertas | 2 semanas | 3 itens em produção |
| **Fase 4** | Relatórios (escopo a definir) | A definir | Conforme backlog |

## 5) Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|------------|
| Número automático: conflito em concorrência | Baixa | Médio | Transação + retry |
| Sugestão de período inadequada para contrato novo | Média | Baixo | Fallback claro (ex: 1º dia do mês) |
| Wizard aumenta complexidade do código | Média | médio | Manter steps desacoplados |
| Alertas deixam dashboard lento | Baixa | Médio | Carregar sob demanda ou em segundo plano |

## 6) Próximos Passos

1. **Aprovar** este documento e o plano de fases.
2. **Iniciar Fase 1** com: menu agrupado e breadcrumbs.
3. **Backend:** Implementar geração automática de número de fatura e validação de overlap.
4. **Revisar** após Fase 1 antes de iniciar Fase 2.

## 7) STATUS

# ✅ APROVADO

O plano está completo, claro e sem bloqueios. As melhorias são viáveis, priorizadas e divididas em fases. Pode seguir para implementação da Fase 1.

---

*Documento gerado pelo processo MULTISOFT de melhoria. Revisado por: PO, Analista, UX, CTO, QA, PM.*
