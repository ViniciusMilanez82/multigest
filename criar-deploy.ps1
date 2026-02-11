# MultiGest — Cria pacote de deploy (multigest-deploy.tar.gz)
# Rodar no Windows: .\criar-deploy.ps1
# Depois: enviar multigest-deploy.tar.gz para a VPS e rodar deploy.sh

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$out = Join-Path $root "multigest-deploy.tar.gz"

Write-Host "=== MultiGest - Criando pacote de deploy ===" -ForegroundColor Cyan
Set-Location $root

# Builds (validar que compila)
Write-Host "Build backend..." -ForegroundColor Yellow
Push-Location backend; npm run build; Pop-Location
Write-Host "Build frontend..." -ForegroundColor Yellow
Push-Location frontend; npm run build; Pop-Location

# Remove pacote antigo
if (Test-Path $out) { Remove-Item $out -Force }

# tar (Windows 10+) - Docker faz build na VPS, so enviamos o codigo fonte
Write-Host "Criando multigest-deploy.tar.gz..." -ForegroundColor Yellow
tar --exclude=node_modules --exclude=.next --exclude=dist --exclude=.git --exclude=*.log --exclude=.env --exclude=.env.local --exclude=multigest-deploy.tar.gz -czf $out -C $root .

Write-Host "Pacote criado: $out" -ForegroundColor Green
Write-Host ""
Write-Host "Proximo passo: enviar para VPS e rodar:" -ForegroundColor Cyan
Write-Host "  scp multigest-deploy.tar.gz root@srv1353769.hstgr.cloud:/opt/"
Write-Host "  ssh root@srv1353769.hstgr.cloud"
Write-Host "  cd /opt && rm -rf multigest && mkdir multigest && tar -xzf multigest-deploy.tar.gz -C multigest"
Write-Host "  cd multigest && bash deploy.sh"
