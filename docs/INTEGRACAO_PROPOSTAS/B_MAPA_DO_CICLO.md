# ETAPA 1 — Mapa do Ciclo Proposta → Contrato → Saída → Faturamento → Retorno

**Documento:** B) Mapa do Ciclo  
**Data:** 2026-02-11  
**Escopo:** Venda, Locação e Evento  
**Metodologia:** MULTISOFT

---

## 1. Ciclo Desejado (Visão Geral)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PROPOSTA   │───▶│   CONTRATO   │───▶│ SAÍDA/ENTREGA│───▶│  FATURAMENTO │───▶│RETORNO/FEED. │
│ (orçamento)  │    │(formalização)│    │ (ordem/check) │    │ (nota/boleto) │    │ (pós-venda)  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 2. O que existe HOJE

### 2.1 Sistema de Propostas (ZIP)

| Entidade | Campos principais | Estados | Eventos |
|----------|------------------|---------|---------|
| **Usuario** | id, username, password, email | — | registro, login |
| **Proposta** | id, data, numero, tipo (venda/locacao/evento), empresa, telefone, email, contato, itens (JSONB), valor_total, usuario_id | **Nenhum** (sem status) | criado, atualizado, excluído |

**Estrutura de itens (JSONB):**
```json
[
  { "tipo": "maritimo|modulo|acessorios", "modelo": "...", "quantidade": 1, "valorUnitario": 0, "valorTotal": 0, "frete": 0 }
]
```

**Integrações:** PDF (jsPDF cliente), WhatsApp (link wa.me), E-mail (mailto)

**Clientes:** Derivados de propostas (SELECT DISTINCT empresa, telefone, email, contato) — não é entidade própria.

---

### 2.2 MULTIGEST

| Entidade | Campos principais | Estados | Onde |
|----------|-------------------|---------|------|
| **Company** | id, cnpj, razaoSocial, nomeFantasia | isActive | schema.prisma |
| **User** | id, name, email, passwordHash, role | isActive | schema.prisma |
| **Customer** | id, companyId, cpfCnpj, razaoSocial, nomeFantasia | — | schema.prisma |
| **Contract** | id, companyId, customerId, contractNumber, type, status, startDate, endDate | DRAFT, ACTIVE, SUSPENDED, TERMINATED, CANCELLED | schema.prisma |
| **ContractItem** | id, contractId, assetId, dailyRate, startDate, endDate, departureDate, returnDate | isActive | schema.prisma |
| **Measurement** | id, contractId, periodStart, periodEnd, totalValue, status | DRAFT, APPROVED, INVOICED, CANCELLED | schema.prisma |
| **ContractMovement** | id, contractId, type, assetCode, movementDate, address | — | schema.prisma |
| **Invoice** | id, companyId, customerId, contractId?, invoiceNumber, amount, status | OPEN, PAID, PARTIALLY_PAID, OVERDUE, IN_AGREEMENT, CANCELLED, WRITTEN_OFF | schema.prisma |
| **InvoicePayment** | id, invoiceId, paymentDate, amount | — | schema.prisma |
| **CollectionAction** | id, invoiceId, type, description | — | schema.prisma |
| **DefaulterRecord** | id, customerId, totalDebt, isResolved | — | schema.prisma |
| **Asset** | id, companyId, code, assetTypeId, status | — | schema.prisma |
| **Bidding** | id, companyId, number, modality, status | — | schema.prisma |

**ContractType (MULTIGEST):** ANTECIPADO, MEDICAO, AUTOMATICO — **todos para locação**

**MovementType:** DELIVERY, PICKUP, SWAP

---

## 3. Diagrama de Entidades e Relações

### 3.1 Sistema de Propostas (atual)

```
Usuario (1) ──────┬─────── (N) Proposta
                 │
                 └─── Proposta.itens: JSONB (tipo, modelo, qtd, valorUnitario, valorTotal, frete)
```

### 3.2 MULTIGEST (atual)

```
Company (1) ──────┬─────── (N) Contract
                  ├─────── (N) Customer
                  ├─────── (N) Invoice
                  ├─────── (N) Asset
                  └─────── (N) Bidding

Customer (1) ─────┬─────── (N) Contract
                  └─────── (N) Invoice

Contract (1) ─────┬─────── (N) ContractItem ──────── (N) Asset
                  ├─────── (N) ContractMovement
                  ├─────── (N) Measurement
                  ├─────── (N) ContractAddendum
                  └─────── (N) Invoice

Invoice (1) ──────┬─────── (N) InvoicePayment
                  ├─────── (N) InvoiceItem
                  ├─────── (N) CollectionAction
                  └─────── (0..1) Measurement
```

### 3.3 Ciclo desejado (integrado)

```
Proposta (tipo: venda|locacao|evento) ──aceite──▶ Contrato (ou PedidoVenda?)
                           │
                           ├─── Locação: Contract + ContractItem + Asset
                           ├─── Venda: ??? (sem contrato de locação; fatura direta?)
                           └─── Evento: Contract + período curto (data início/fim)

ContractMovement (DELIVERY) = Saída/Entrega
ContractMovement (PICKUP)   = Retorno

Invoice = Faturamento
CollectionAction = Ações de cobrança
Retorno/Feedback = NÃO EXISTE no MULTIGEST
```

---

## 4. Estados e Eventos por Fase

### 4.1 PROPOSTA

| Estado atual (Propostas) | Evento | Observação |
|---------------------------|--------|------------|
| **—** (sem status) | criado | INSERT |
| | atualizado | UPDATE |
| | excluído | DELETE |

**Estados desejados para o ciclo:**
- RASCUNHO
- ENVIADA
- ACEITA
- RECUSADA
- EXPIRADA
- CONVERTIDA_EM_CONTRATO

### 4.2 CONTRATO

| Estado (MULTIGEST) | Evento | Observação |
|--------------------|--------|-------------|
| DRAFT | creado | Contrato criado |
| ACTIVE | ativado | Vigência iniciada |
| SUSPENDED | suspenso | Suspensão temporária |
| TERMINATED | encerrado | Fim normal |
| CANCELLED | cancelado | Cancelamento |

**Gap:** MULTIGEST não tem vínculo com Proposta. Não há `proposalId` em Contract.

### 4.3 SAÍDA/ENTREGA

| Entidade | Tipo | Evento |
|----------|------|--------|
| ContractMovement | DELIVERY | Entrega registrada |
| ContractMovement | PICKUP | Recolhimento |
| ContractMovement | SWAP | Troca |

**Gap:** Não há Ordem de Serviço formal; TransportOrder existe mas não está vinculada ao fluxo de proposta.

### 4.4 FATURAMENTO

| Estado (Invoice) | Evento |
|------------------|--------|
| OPEN | Fatura criada |
| PARTIALLY_PAID | Pagamento parcial |
| PAID | Quitada |
| OVERDUE | Vencida |
| IN_AGREEMENT | Em acordo |
| CANCELLED | Cancelada |
| WRITTEN_OFF | Baixa |

### 4.5 RETORNO

| O que existe | Observação |
|--------------|------------|
| ContractMovement (PICKUP) | **Retorno = devolução do container** — já existe no MULTIGEST. Não é módulo de pós-venda/satisfação; é o recolhimento físico do ativo. |

---

## 5. Fluxo por Tipo (Venda, Locação, Evento)

### 5.1 Locação (fluxo mais completo no MULTIGEST)

```
Proposta (tipo=locacao) → [aceite] → Contract (DRAFT) → ContractItem (ativos)
                                              ↓
                                    Contract (ACTIVE)
                                              ↓
                                    ContractMovement (DELIVERY) = entrega
                                              ↓
                                    Measurement (medição de dias)
                                              ↓
                                    Invoice (faturamento)
                                              ↓
                                    InvoicePayment (pagamento)
                                              ↓
                                    ContractMovement (PICKUP) = retorno
```

### 5.2 Venda (fluxo não existente no MULTIGEST)

```
Proposta (tipo=venda) → [aceite] → ???
                                 → Invoice direta? (sem Contract)
                                 → PedidoVenda? (nova entidade)
```

**Gap:** MULTIGEST não tem modelo de venda. Invoice pode existir sem contractId, mas não há fluxo de "pedido de venda" ou "item vendido".

### 5.3 Evento (similar a locação)

```
Proposta (tipo=evento) → [aceite] → Contract (vigência curta)
                                              ↓
                                    ContractMovement (DELIVERY) = entrega
                                              ↓
                                    Faturamento (período ou valor fixo)
                                              ↓
                                    ContractMovement (PICKUP) = retorno
```

### 5.4 PDF, E-mail, WhatsApp

| Recurso | Onde | Evidência |
|---------|------|-----------|
| PDF | Propostas (frontend) | jsPDF no cliente |
| WhatsApp | Propostas (frontend) | Link wa.me |
| E-mail | Propostas (frontend) | mailto: |
| Nota fiscal | MULTIGEST | Não implementado |
| Boleto | MULTIGEST | Não implementado (mencionado em docs) |

---

## 6. Resumo

| Fase | Sistema Propostas | MULTIGEST | Gap |
|------|------------------|-----------|-----|
| **Proposta** | ✅ Existe (sem status) | ❌ Não existe | Proposta precisa de estados/eventos |
| **Contrato** | ❌ Não existe | ✅ Existe (só locação) | Venda, Evento: adaptar ou criar |
| **Saída/Entrega** | ❌ Não existe | ✅ ContractMovement | OK |
| **Faturamento** | ❌ Não existe | ✅ Invoice | OK |
| **Retorno** | ❌ Não existe | ✅ ContractMovement (PICKUP) | Retorno = recolhimento do container. OK. |

---

## PRONTO PARA REVISÃO

**Próxima etapa:** ETAPA 2 — Gap Analysis (o que falta para o ciclo completo).
