# FASE 01 — Análise de Contexto (VALIDADA)

## 1) Resumo

A empresa atua no ramo de **aluguel de containers e módulos habitacionais**. Possui 4 sistemas legados em Visual FoxPro (tecnologia descontinuada) que precisam ser unificados em um **sistema web moderno e autossuficiente**.

---

## 2) Mapeamento dos Sistemas Legados (VALIDADO)

### 2.1 SisReC — Sistema de Recuperação de Créditos ✅
| Item | Detalhe |
|------|---------|
| **Função** | Gestão de cobrança e recuperação de créditos de clientes inadimplentes |
| **Módulos** | Controle de inadimplentes, gerenciamento de licitações, exportação de dados, perfis |

### 2.2 SCC — Sistema de Controle de Ativos de Aluguel ✅
| Item | Detalhe |
|------|---------|
| **Função** | Controle dos ativos (containers e módulos habitacionais) disponíveis para aluguel — rastreamento de status, localização, condição e alocação |
| **Módulos** | Gestão multi-empresa/filial (Multi Macaé, Multi Rio, Petroteiner), integração por ODBC, e-mail |

### 2.3 FrotaN — Sistema de Gerenciamento de Frota ✅
| Item | Detalhe |
|------|---------|
| **Função** | Gerenciamento da frota de veículos que transportam containers/módulos |
| **Módulos** | Cadastro de veículos, checklists de inspeção, agendamento, rotas/localização, gráficos/relatórios |

### 2.4 SisCaC — Sistema de Gestão de Contratos ✅
| Item | Detalhe |
|------|---------|
| **Função** | Gestão de contratos de aluguel com clientes |
| **Módulos** | Cadastro de contratos, movimentação de saída/entrada, cancelamento de medições, controle operacional |

---

## 3) Contexto de Negócio (VALIDADO)

| Item | Valor |
|------|-------|
| **Ramo** | Aluguel de containers e módulos habitacionais |
| **Região** | Macaé / Rio de Janeiro (mercado de petróleo & gás) |
| **Empresas** | Multi Macaé, Multi Rio, Petroteiner (multi-filial) |
| **Usuários simultâneos** | 6 a 20 |
| **Prioridade** | Todos os módulos igualmente importantes |

---

## 4) Fluxo de Negócio Unificado

```
  CLIENTE solicita aluguel
         │
         ▼
  ┌──────────────┐
  │   SisCaC     │ ← Cria contrato de aluguel
  │  (Contratos) │
  └──────┬───────┘
         │ Contrato ativo
         ▼
  ┌──────────────┐
  │     SCC      │ ← Aloca containers/módulos ao contrato
  │   (Ativos)   │   Rastreia status: disponível → alugado → em manutenção
  └──────┬───────┘
         │ Precisa transportar
         ▼
  ┌──────────────┐
  │   FrotaN     │ ← Despacha veículo para entregar/recolher
  │   (Frota)    │   container/módulo no cliente
  └──────┬───────┘
         │ Fatura vence e não paga
         ▼
  ┌──────────────┐
  │   SisReC     │ ← Inicia processo de recuperação de crédito
  │  (Cobrança)  │   Controla inadimplência
  └──────────────┘
```

---

## 5) Status: FASE 01 CONCLUÍDA ✅
