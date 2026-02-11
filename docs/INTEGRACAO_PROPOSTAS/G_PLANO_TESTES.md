# ETAPA 6 — Plano de Testes e Qualidade

**Documento:** G) Plano de Testes + H) Checklist Go/No-Go

---

## 1. Testes Funcionais

| # | Cenário | Severidade | Critério |
|---|---------|------------|----------|
| F1 | Criar proposta (locação) | Crítico | Proposta salva, número gerado |
| F2 | Criar proposta (venda) | Crítico | Proposta salva |
| F3 | Criar proposta (evento) | Crítico | Proposta salva |
| F4 | Listar propostas (paginação) | Alto | Lista correta, filtros |
| F5 | Editar proposta | Alto | Dados atualizados |
| F6 | Aceitar proposta | Crítico | Status = ACEITA |
| F7 | Converter proposta locação → contrato | Crítico | Contrato criado, itens mapeados |
| F8 | Converter proposta venda → fatura | Crítico | Fatura criada |
| F9 | Gerar PDF | Alto | PDF baixado, conteúdo correto |
| F10 | Links WhatsApp/E-mail | Médio | Links abrem corretamente |

---

## 2. Testes de Erro/Exceção

| # | Cenário | Severidade | Critério |
|---|---------|------------|----------|
| E1 | Proposta sem itens | Alto | Validação, mensagem clara |
| E2 | Conversão com ativo inexistente | Alto | Tratamento definido |
| E3 | Conversão proposta já convertida | Médio | Idempotência, não duplicar |
| E4 | Sem x-company-id | Alto | 400 Bad Request |
| E5 | CompanyId inválido | Alto | 403 Forbidden |
| E6 | Token expirado | Alto | 401 Unauthorized |

---

## 3. Testes de Permissões

| # | Cenário | Severidade |
|---|---------|------------|
| P1 | Usuário A não vê propostas da empresa B | Crítico |
| P2 | CompanyGuard em todos os endpoints | Crítico |
| P3 | Proposta só visível para criador ou empresa | Alto |

---

## 4. Testes de Integração

| # | Cenário | Severidade |
|---|---------|------------|
| I1 | Proposta → Customer (criar ou buscar) | Alto |
| I2 | Proposta → Contract + ContractItems | Crítico |
| I3 | Proposta → Invoice (venda) | Crítico |

---

## 5. Testes de Regressão

| # | Módulo | Verificar |
|---|--------|-----------|
| R1 | Contratos | CRUD inalterado |
| R2 | Faturas | createFromContract ok |
| R3 | Clientes | Sem impacto |
| R4 | Dashboard | Sem quebra |

---

## 6. E2E (críticos)

| # | Fluxo | Passos |
|---|-------|--------|
| E2E1 | Proposta → Contrato → Fatura | Criar proposta locação → Aceitar → Converter → Faturar contrato |
| E2E2 | Proposta venda → Fatura | Criar proposta venda → Aceitar → Converter em fatura |

---

## 7. Checklist Go/No-Go

### Aprovar release se:
- [ ] Todos os testes Críticos passando
- [ ] Nenhum teste Alto falhando sem mitigação aceita
- [ ] CompanyGuard em todos os endpoints de propostas
- [ ] Sem vazamento de dados entre empresas
- [ ] PDF gerado corretamente
- [ ] Conversão locação/venda funcionando

### Bloquear se:
- [ ] Qualquer teste Crítico falhando
- [ ] Risco de vazamento de dados entre empresas
- [ ] Conversão gerando dados inconsistentes

---

## PRONTO PARA REVISÃO
