# MultiGest — Guia de Deploy na VPS Hostinger

## Pré-requisitos
- VPS Hostinger com Docker (srv1353769.hstgr.cloud)
- PostgreSQL já rodando no Docker Manager (postgresql-a6fb)
- Acesso SSH à VPS

---

## Passo 1: Conectar via SSH

```bash
ssh root@srv1353769.hstgr.cloud
```

## Passo 2: Clonar o repositório

```bash
cd /opt
git clone https://github.com/ViniciusMilanez82/multigest.git
cd multigest
```

## Passo 3: Verificar a rede Docker do PostgreSQL

```bash
# Listar redes Docker
docker network ls

# Encontrar a rede do PostgreSQL existente
docker inspect postgresql-ak9h-postgresql-1 | grep NetworkMode
```

## Passo 4: Configurar variáveis de ambiente

```bash
# Criar .env para produção
cat > .env.prod << 'EOF'
DATABASE_URL=postgresql://A39bokKZClHrBqXC:ex4x8VZVSogaZL0Bpvj7oGNJkFoWbT0K@postgresql-ak9h-postgresql-1:5432/MHL6sIvZvAqZsACp
JWT_SECRET=gere-uma-string-aleatoria-longa-aqui
JWT_EXPIRES_IN=8h
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://srv1353769.hstgr.cloud:3000
EOF
```

## Passo 5: Rodar as migrations no banco

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
cd ..
```

## Passo 6: Deploy com Docker Compose

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Passo 7: Verificar

```bash
# Ver logs
docker logs multigest-api
docker logs multigest-web

# Testar API
curl http://localhost:3001/api/docs
```

## Deploy via pacote (sem Git)

No Windows, criar o pacote:

```powershell
.\criar-deploy.ps1
```

Depois enviar para a VPS e extrair:

```bash
scp multigest-deploy.tar.gz root@srv1353769.hstgr.cloud:/opt/
ssh root@srv1353769.hstgr.cloud
cd /opt && rm -rf multigest && mkdir multigest && tar -xzf multigest-deploy.tar.gz -C multigest
cd multigest && bash deploy.sh
```

---

## Atualizar deploy (quando já está rodando)

**Via Git:**
```bash
cd /opt/multigest
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

**Via pacote:** rodar `criar-deploy.ps1`, enviar o tar.gz, extrair em cima da pasta existente e `bash deploy.sh`.

---

## Acessar o sistema

- Frontend: http://srv1353769.hstgr.cloud:3000
- API Docs: http://srv1353769.hstgr.cloud:3001/api/docs
- Login: admin@multigest.com.br / admin123

---

## Desenvolvimento Local (com túnel SSH)

Para desenvolver localmente conectado ao banco da VPS:

```bash
# Abrir túnel SSH para o PostgreSQL
ssh -L 5432:postgresql-ak9h-postgresql-1:5432 root@srv1353769.hstgr.cloud

# No .env do backend, usar:
DATABASE_URL="postgresql://A39bokKZClHrBqXC:ex4x8VZVSogaZL0Bpvj7oGNJkFoWbT0K@localhost:5432/MHL6sIvZvAqZsACp"
```

Depois rodar localmente:
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```
