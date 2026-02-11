# ETAPA 4 — Contrato de Integração

**Documento:** F) Contrato de Integração (APIs, dados, regras)

---

## 1. Endpoints Propostas (novos no MULTIGEST)

### Base
- Prefixo: `GET/POST/PUT/DELETE /api/proposals`
- Auth: JWT + CompanyGuard (x-company-id)

### CRUD

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/proposals | Criar proposta |
| GET | /api/proposals | Listar (paginado, filtros) |
| GET | /api/proposals/:id | Obter proposta |
| PUT | /api/proposals/:id | Atualizar |
| DELETE | /api/proposals/:id | Excluir (soft ou hard) |
| PATCH | /api/proposals/:id/accept | Aceitar proposta |
| POST | /api/proposals/:id/convert-to-contract | Converter em contrato (locação/evento) |
| POST | /api/proposals/:id/convert-to-invoice | Converter em fatura (venda) |

---

## 2. Payloads exemplo

### POST /api/proposals (Request)

```json
{
  "type": "locacao",
  "customerId": "uuid-opcional",
  "companyName": "Empresa ABC",
  "contactName": "João Silva",
  "phone": "(11) 98765-4321",
  "email": "contato@abc.com",
  "items": [
    {
      "tipo": "maritimo",
      "modelo": "Container 20 pés",
      "quantidade": 2,
      "valorUnitario": 15000,
      "frete": 2000
    }
  ]
}
```

### Response (201)

```json
{
  "id": "uuid",
  "proposalNumber": "2026-0001",
  "type": "locacao",
  "status": "RASCUNHO",
  "valorTotal": 32000,
  "createdAt": "2026-02-11T..."
}
```

### POST /api/proposals/:id/convert-to-contract (Request)

```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-12-31",
  "paymentTerms": "30 dias",
  "paymentMethod": "BOLETO"
}
```

### Response (201)

```json
{
  "contractId": "uuid",
  "contractNumber": "2026-001",
  "proposalId": "uuid"
}
```

---

## 3. Mapeamento de dados

| Proposta | MULTIGEST |
|----------|-----------|
| empresa | Customer.razaoSocial ou nomeFantasia |
| contato | Customer (contato principal) |
| email | Customer.email |
| telefone | Customer.phone |
| itens[].tipo | AssetType (maritimo→container, modulo→módulo) |
| itens[].modelo | Asset (buscar por tipo/código) |
| itens[].quantidade | ContractItem (ou InvoiceItem para venda) |
| itens[].valorUnitario | ContractItem.dailyRate ou valor |
| tipo=venda | Invoice sem contractId |
| tipo=locacao, evento | Contract |

---

## 4. Regras

### Idempotência
- `convert-to-contract` e `convert-to-invoice`: retornar contrato/fatura existente se proposta já convertida (status=CONVERTIDA).

### Retries
- Cliente deve retentar com backoff em 5xx.
- Timeout sugerido: 30s.

### Auditoria
- Registrar em AuditLog: proposta convertida, userId, timestamp, contractId/invoiceId.

### Versionamento
- API v1: `/api/proposals`. Manter compatibilidade; v2 só se breaking change.

---

## PRONTO PARA REVISÃO
