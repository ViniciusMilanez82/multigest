# Comandos para rodar Famílias/Subfamílias e Migrations

## Pré-requisito
Configure `.env` no backend com `DATABASE_URL` apontando para o PostgreSQL.

## Prisma

```bash
cd backend

# Gerar Prisma Client
node node_modules/prisma/build/index.js generate
# ou (se prisma estiver no PATH):
npx prisma generate

# Aplicar migrations (cria tabelas item_families e item_subfamilies)
npx prisma migrate deploy

# Popular dados iniciais (famílias Marítimo, Módulo, Acessórios + subfamílias)
npm run prisma:seed
```

## Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## Rodar aplicação

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```
