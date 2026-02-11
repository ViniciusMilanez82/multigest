#!/bin/bash
# MultiGest — Script de deploy na VPS
# Rodar na VPS: bash deploy.sh

set -e
cd /opt/multigest 2>/dev/null || cd "$(dirname "$0")"

echo "=== MultiGest Deploy ==="

# Atualizar código (se for git)
if [ -d .git ]; then
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
fi

# Rebuild e subir
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "=== Verificando ==="
docker ps | grep multigest
echo ""
echo "Sistema em: http://srv1353769.hstgr.cloud:3000"
