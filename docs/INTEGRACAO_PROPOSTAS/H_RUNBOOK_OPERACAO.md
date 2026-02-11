# ETAPA 7 — Runbook e Operação

**Documento:** H) Runbook, DevOps, Operação

---

## 1. Ambientes

| Ambiente | Uso | URL |
|----------|-----|-----|
| dev | Desenvolvimento local | localhost:3000, localhost:3001 |
| staging | Validação pré-prod | (a definir) |
| prod | Produção | http://187.77.32.67:3000 |

---

## 2. Rodar local (dev)

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev

# Banco (PostgreSQL)
# Migrations: npx prisma migrate dev
# Seed: npx prisma db seed
```

---

## 3. Deploy (produção)

Seguir `DEPLOY.md` existente:

```bash
# Criar pacote
.\criar-deploy.ps1

# Enviar e deploy na VPS
scp multigest-deploy.tar.gz root@srv1353769.hstgr.cloud:/opt/
ssh root@srv1353769.hstgr.cloud "cd /opt && rm -rf multigest && mkdir multigest && tar -xzf multigest-deploy.tar.gz -C multigest && cd multigest && bash deploy.sh"
```

**Nova migration (Proposal):** Executar `npx prisma migrate deploy` no container backend ou antes do build.

---

## 4. CI/CD mínimo

- Build backend + frontend no `criar-deploy.ps1`
- Sem pipeline automatizado no zip; MULTIGEST usa deploy manual
- **Recomendação:** GitHub Actions para build + testes em PR

---

## 5. Segredos

- Não commitar: `.env`, `JWT_SECRET`, credenciais DB
- Produção: variáveis em `docker-compose.prod.yml` ou env da VPS

---

## 6. Logs e métricas

- **Logs:** Estrutura existente (NestJS, Morgan)
- **LGPD:** Não logar: senha, token, CPF/CNPJ completo, e-mail em texto livre
- **Métricas:** Throttler, health check; Prometheus opcional

---

## 7. Rollback

```bash
# Na VPS: voltar para versão anterior
cd /opt
rm -rf multigest
tar -xzf multigest-deploy-backup.tar.gz -C multigest
cd multigest && bash deploy.sh
```

Manter backup do `tar.gz` anterior antes de cada deploy.

---

## 8. Backups

- PostgreSQL: backup configurado no Hostinger/Docker
- Dados críticos: contratos, faturas, propostas — incluir em política de backup

---

## PRONTO PARA REVISÃO
