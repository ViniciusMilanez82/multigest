# Testes MultiGest

## Visão geral

| Comando | O que testa | Requer DB? |
|---------|-------------|------------|
| `npm run test` | Unitários (services com mocks) | Não |
| `npm run test:e2e:smoke` | Validação de rota (auth/login) | Não* |
| `npm run test:e2e` | Todos os e2e (API completa) | Sim |

\* O smoke faz POST /auth/login com body vazio → validação retorna 400 sem acessar o banco.

## Requisitos para E2E completo

1. PostgreSQL acessível (DATABASE_URL no .env)
2. Banco migrado: `npx prisma migrate dev`
3. Seed aplicado: `npx prisma db seed`

## Executar

```bash
# Unitários (rápido, sem DB) — sempre passa
cd backend && npm run test

# Smoke e2e (rota /auth existe, validation funciona)
cd backend && npm run test:e2e:smoke

# E2E completo (Auth, Customers, Contracts, Dashboard, etc.)
cd backend && npm run test:e2e
```

## Cobertura

| Módulo | Unitários | E2E |
|--------|-----------|-----|
| DashboardService | getExpeditionPanel (items + serviceOrders) | ✓ |
| ContractsService | reajusteIgpmPreview, nextSupplyOrderNumber | ✓ |
| Auth | — | login, me |
| Módulos completos | — | Customers, Contracts, Assets, etc. |
