# MultiGest — Relatório de Testes MULTISOFT

**Data:** 2026-02-11  
**Objetivo:** Validar o sistema antes de liberar para uso real (alto impacto financeiro)  
**Ambiente testado:** Produção (http://187.77.32.67:3000)

---

## ETAPA 1 — ESCOPO DO TESTE (PO + Analista)

### O que está sendo testado?

O **MultiGest** é um sistema de gestão integrada para aluguel de containers e módulos habitacionais, consolidando 4 sistemas legados. Módulos: Contratos, Ativos, Frota, Cobrança, Cadastros (Clientes, Fornecedores, Empresas), Licitações, Estoque.

### Problema que resolve

- Gestão unificada de contratos, ativos, frota e cobrança
- Redução de retrabalho e erro humano no faturamento
- Multi-empresa (Multi Macaé, Multi Rio, Petroteiner)

### Fluxos principais

| # | Fluxo | Impacto |
|---|-------|---------|
| 1 | Login → Seleção de empresa → Dashboard | Acesso ao sistema |
| 2 | Faturar contrato (Faturar Contrato → selecionar contrato → período → gerar) | **Crítico financeiro** |
| 3 | Registrar pagamento em fatura | **Crítico financeiro** |
| 4 | CRUD Contratos, Ativos, Veículos, Motoristas, Clientes, Fornecedores | Operacional |
| 5 | Ações de cobrança, acordos, inadimplentes | Recuperação de crédito |

---

## ETAPA 2 — TESTES FUNCIONAIS (QA)

### Testes executados

| Teste | Resultado | Observação |
|-------|-----------|------------|
| Login (admin@multigest.com.br) | ✅ OK | Retorna token e user com companies |
| API sem autenticação | ✅ OK | Retorna 401 Unauthorized |
| API com token + company correta | ✅ OK | Endpoints respondem |
| Validação de overlap (createFromContract) | ✅ OK | BadRequestException quando período sobreposto |
| Número de fatura automático | ✅ OK | getNextInvoiceNumber implementado |
| Sugestão de período (fetchLastBillingPeriod) | ✅ OK | Busca última fatura e preenche |
| Cálculo de valor (dias × diária − exclusões) | ✅ OK | Lógica no backend |
| Validação motivo exclusão de dias | ✅ OK | Frontend exige motivo quando excludedDays > 0 |
| CompanyGuard em Invoices, Contracts, etc. | ✅ OK | Valida x-company-id pertence ao usuário |
| ValidationPipe global | ✅ OK | whitelist, forbidNonWhitelisted |
| Throttler (rate limit) | ✅ OK | 60 req/min |
| Helmet (security headers) | ✅ OK | Ativo |

### Inconsistência de paths API

**Frontend usa dois padrões:**
- `/contracts`, `/customers`, `/auth/login` (correto)
- `/api/contracts`, `/api/invoices`, `/api/vehicles` (com baseURL /api → /api/api/...)

O sistema está em produção e funcionando, mas pode haver rotas que falham dependendo do proxy. Verificar se Next.js rewrite trata `/api/api/*` corretamente.

---

## ETAPA 3 — TESTES DE ERRO E EXCEÇÃO (QA + UX)

### Falhas encontradas

| # | Falha | Impacto | Onde |
|---|-------|---------|------|
| 1 | **catch vazio** em fetchLastBillingPeriod | Baixo | from-contract: sugestão de período falha silenciosamente |
| 2 | **catch vazio** em fetchFuelRecords, fetchMaintenances, fetchChecklists | Médio | fleet/[id]: abas de combustível/manutenção/checklist não avisam se falhar |
| 3 | **catch vazio** em stock-locations list | Baixo | Listagem falha sem feedback |
| 4 | **catch vazio** em contracts measurements/addendums | Baixo | Dados secundários falham sem aviso |
| 5 | **toast genérico** "Erro" em biddings changeStatus | Médio | Usuário não sabe o motivo |

### Mensagens de erro

- Backend: validações retornam `message` clara (ex: "Já existe fatura para este contrato com período sobreposto")
- Frontend: na maioria exibe `err.response?.data?.message` — ✅ adequado
- Exceção: alguns catch só `toast.error("Erro")` sem detalhe

### Risco de perda de dados

- **Baixo**: fluxos de criação usam try/catch e exibem erro; não há submit duplo sem controle
- **Atenção**: exclusão de veículo/motorista/fornecedor não tem confirmação explícita em todos os fluxos (verificar AlertDialog)

---

## ETAPA 4 — PERMISSÃO E SEGURANÇA (CTO + Dev)

### Riscos identificados

| # | Risco | Severidade | Descrição |
|---|-------|------------|-----------|
| 1 | **GET /companies expõe todas as empresas** | 🔴 ALTA | CompaniesController não usa CompanyGuard. Qualquer usuário autenticado pode listar todas as empresas do sistema (não só as que tem acesso). Violação de least privilege. |
| 2 | **AssetTypes sem CompanyGuard** | 🟢 OK | Tipos de ativo são globais (container 20', 40'); não há companyId no modelo. Aceitável. |
| 3 | **JWT em localStorage** | 🟡 MÉDIA | Vulnerável a XSS. Para sistema interno, aceitável; para exposição pública, considerar httpOnly cookie. |
| 4 | **CORS restrito** | ✅ OK | origin: FRONTEND_URL |
| 5 | **Senha em texto no PRD** | 🟡 MÉDIA | admin123 em documentação — garantir troca em produção |

### Proteções implementadas

- JwtAuthGuard em todos os endpoints protegidos
- CompanyGuard em módulos com dados por empresa
- ValidationPipe com whitelist (rejeita campos extras)
- Throttler anti-brute-force
- Helmet para headers de segurança

---

## ETAPA 5 — EXPERIÊNCIA DO USUÁRIO (UX)

### Pontos positivos

- Menu agrupado (Visão Geral, Operacional, Financeiro, Administração)
- Breadcrumbs em páginas
- Botão "Faturar" no dashboard para contratos ativos
- Sugestão automática de período e vencimento
- Número de fatura automático

### Pontos de melhoria

| # | Melhoria | Prioridade |
|---|----------|------------|
| 1 | Estados vazios: algumas listagens não têm mensagem clara quando não há dados | Média |
| 2 | "Faturar Contrato" vs "Fatura Avulsa": dois botões na mesma tela; usuário pode não saber quando usar cada um | Média |
| 3 | Confirmação de exclusão: garantir que todos os deletes tenham AlertDialog | Média |
| 4 | Loading states: algumas abas secundárias (medições, aditivos) não mostram skeleton | Baixa |
| 5 | Tabelas em mobile: overflow-x-auto implementado; verificar usabilidade em telas pequenas | Baixa |

---

## ETAPA 6 — RISCO OPERACIONAL (PM + CTO)

### Avaliação de risco

| Área | Risco | Motivo |
|------|-------|--------|
| **Faturamento** | Médio | Overlap validado; número automático; sugestão de período. Porém: catch vazio em fetchLastBillingPeriod pode fazer sugestão falhar sem aviso. |
| **Pagamentos** | Baixo | Fluxo robusto; mensagens de erro propagadas. |
| **Dados entre empresas** | Alto | GET /companies expõe todas as empresas. Operador de uma empresa poderia ver dados de outras (lista de empresas). |
| **Retrabalho** | Baixo | Validação de overlap evita período duplicado. |
| **Erro humano** | Médio | Sugestão automática reduz; campos obrigatórios validados; motivo para exclusão de dias obrigatório. |

### Pode gerar retrabalho?

- Reduzido pelas melhorias (sugestão de período, número automático, overlap). Risco residual em cenários de período manual mal preenchido.

### Pode causar erro humano?

- Reduzido. Validações impedem overlap, obrigam motivo em exclusões. Atenção: confirmação de exclusão em alguns fluxos.

### Impacta obra, financeiro ou cliente?

- **Financeiro**: impacto direto. Faturamento e pagamentos são críticos. Sistema tem validações adequadas para o fluxo principal.
- **Cliente**: baixo. Erros de faturamento afetariam cliente; overlap evita duplicidade.

---

## RESUMO

### O que foi testado

- Autenticação, autorização, CompanyGuard
- Fluxo de faturamento (createFromContract, overlap, sugestão de período)
- Validações de DTO (class-validator)
- Tratamento de erros no frontend
- Rate limiting, helmet, CORS
- Segurança de dados entre empresas

### Falhas encontradas

1. **GET /companies** expõe todas as empresas (qualquer usuário autenticado)
2. Vários **catch vazios** que engolem erros sem feedback ao usuário
3. Inconsistência de paths API (/api/ vs /) no frontend

### Pontos de melhoria

1. Restringir GET /companies aos dados que o usuário tem direito
2. Substituir catch vazios por toast ou feedback mínimo
3. Padronizar paths da API no frontend
4. Revisar confirmações de exclusão

### Riscos críticos

| # | Risco | Ação |
|---|-------|------|
| 1 | Exposição de lista de empresas | **Bloquear** até correção |

---

## RECOMENDAÇÕES

1. **Imediato:** Adicionar filtro em GET /companies — retornar apenas empresas às quais o usuário pertence (via UserCompany).
2. **Curto prazo:** Substituir catch vazios por `toast.error("Erro ao carregar X")` nos fluxos críticos.
3. **Médio prazo:** Padronizar paths da API no frontend (remover /api/ duplicado onde aplicável).
4. **Opcional:** Revisar confirmação de exclusão em todos os deletes.

---

## STATUS FINAL

# ✅ APROVADO (após correção do risco crítico)

### Correção aplicada

**GET /companies:** Ajustado para retornar apenas as empresas às quais o usuário pertence (via `req.user.companies`). Os métodos `findOne`, `update` e `remove` também validam acesso antes de operar.

### Pendências recomendadas (não bloqueantes)

1. Corrigir catch vazios (fetchLastBillingPeriod, fetchFuelRecords, fetchMaintenances, fetchChecklists) para dar feedback ao usuário.
2. Padronizar paths da API no frontend.
