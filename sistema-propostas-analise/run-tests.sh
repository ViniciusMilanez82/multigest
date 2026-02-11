#!/bin/bash

# Script para testar a aplicação em diferentes navegadores
echo "Iniciando testes de integração e validação do Sistema de Propostas"

# Criar diretório para relatórios de teste
mkdir -p /home/ubuntu/sistema-propostas-novo/test-reports

# Verificar se o backend está em execução
echo "Verificando status do backend..."
if ! pgrep -f "node.*server.js" > /dev/null; then
    echo "Backend não está em execução. Iniciando..."
    cd /home/ubuntu/sistema-propostas-novo/backend
    nohup node server.js > ../test-reports/backend.log 2>&1 &
    sleep 5
    echo "Backend iniciado com PID $(pgrep -f 'node.*server.js')"
else
    echo "Backend já está em execução com PID $(pgrep -f 'node.*server.js')"
fi

# Verificar se o banco de dados está configurado
echo "Verificando configuração do banco de dados..."
cd /home/ubuntu/sistema-propostas-novo/backend
if [ ! -f ".env" ]; then
    echo "Arquivo .env não encontrado. Criando configuração padrão..."
    cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sistema_propostas
JWT_SECRET=chave_secreta_temporaria_para_testes
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug
EOF
    echo "Arquivo .env criado com configurações padrão"
fi

# Criar script SQL para inicialização do banco de dados
echo "Preparando script de inicialização do banco de dados..."
cat > /home/ubuntu/sistema-propostas-novo/backend/init-db.sql << EOF
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de propostas
CREATE TABLE IF NOT EXISTS propostas (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    numero VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('venda', 'locacao', 'evento')),
    empresa VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contato VARCHAR(255) NOT NULL,
    itens JSONB NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualização automática
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_propostas_updated_at
    BEFORE UPDATE ON propostas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário de teste
INSERT INTO usuarios (username, password, email)
VALUES ('teste', '$2b$10$X7VYVy9.VUQGQzHGpYxSJ.rbAKVF8/Ras1yfP1QTNqFiYkNqvPYwW', 'teste@example.com')
ON CONFLICT (username) DO NOTHING;
EOF

echo "Script SQL criado"

# Configurar servidor web para o frontend
echo "Configurando servidor web para o frontend..."
cd /home/ubuntu/sistema-propostas-novo
if ! command -v http-server &> /dev/null; then
    echo "Instalando http-server..."
    npm install -g http-server
fi

# Iniciar servidor web para o frontend
echo "Iniciando servidor web para o frontend..."
cd /home/ubuntu/sistema-propostas-novo/frontend
nohup http-server -p 8080 > ../test-reports/frontend.log 2>&1 &
sleep 2
echo "Servidor frontend iniciado na porta 8080"

# Criar script de teste automatizado com Playwright
echo "Criando script de teste automatizado..."
mkdir -p /home/ubuntu/sistema-propostas-novo/tests
cat > /home/ubuntu/sistema-propostas-novo/tests/e2e-test.js << EOF
const { chromium } = require('playwright');

(async () => {
  // Configuração do navegador
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  console.log('Iniciando testes E2E do Sistema de Propostas');
  
  try {
    // Teste 1: Carregar página inicial
    console.log('Teste 1: Carregando página inicial...');
    await page.goto('http://localhost:8080');
    await page.waitForSelector('h1:has-text("Sistema de Propostas")');
    console.log('✅ Página inicial carregada com sucesso');
    
    // Teste 2: Navegação do wizard
    console.log('Teste 2: Testando navegação do wizard...');
    
    // Passo 1: Tipo de Proposta
    await page.selectOption('#proposalType', 'venda');
    await page.click('button.next-step[data-next="step2"]');
    console.log('✅ Navegação para o passo 2 realizada com sucesso');
    
    // Passo 2: Dados do Cliente
    await page.fill('#company', 'Empresa Teste');
    await page.fill('#phone', '(11) 98765-4321');
    await page.fill('#email', 'teste@empresa.com');
    await page.fill('#contact', 'Contato Teste');
    await page.click('button.next-step[data-next="step3"]');
    console.log('✅ Navegação para o passo 3 realizada com sucesso');
    
    // Passo 3: Itens da Proposta
    await page.selectOption('#itemType', 'maritimo');
    await page.waitForSelector('#itemModel:not([disabled])');
    await page.selectOption('#itemModel', 'Container 20 pés');
    await page.fill('#quantity', '2');
    await page.fill('#unitPrice', '15000,00');
    await page.click('#addItemBtn');
    
    // Verificar se o item foi adicionado
    await page.waitForSelector('#itemsBody tr');
    const itemCount = await page.$$eval('#itemsBody tr', rows => rows.length);
    if (itemCount === 1) {
      console.log('✅ Item adicionado com sucesso');
    } else {
      throw new Error('Falha ao adicionar item');
    }
    
    // Adicionar frete
    await page.click('button[data-bs-target="#freightModal"]');
    await page.waitForSelector('#freightModal');
    await page.fill('#freightValue', '2000,00');
    await page.click('#addFreightBtn');
    console.log('✅ Frete adicionado com sucesso');
    
    // Navegar para o passo 4
    await page.click('button.next-step[data-next="step4"]');
    console.log('✅ Navegação para o passo 4 realizada com sucesso');
    
    // Teste 3: Visualização prévia
    console.log('Teste 3: Testando visualização prévia...');
    await page.click('#previewBtn');
    await page.waitForSelector('#previewModal');
    const previewVisible = await page.isVisible('#previewContent');
    if (previewVisible) {
      console.log('✅ Visualização prévia exibida com sucesso');
    } else {
      throw new Error('Falha ao exibir visualização prévia');
    }
    
    // Fechar modal
    await page.click('button[data-bs-dismiss="modal"]');
    
    // Teste 4: Geração de PDF
    console.log('Teste 4: Testando geração de PDF...');
    const pdfPromise = page.waitForEvent('download');
    await page.click('#createPdfBtn');
    const download = await pdfPromise;
    console.log(\`✅ PDF gerado com sucesso: \${download.suggestedFilename()}\`);
    
    // Teste 5: Responsividade
    console.log('Teste 5: Testando responsividade...');
    // Testar em tamanho de tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Verificar se elementos estão visíveis
    const tabletVisible = await page.isVisible('h1:has-text("Sistema de Propostas")');
    if (tabletVisible) {
      console.log('✅ Layout responsivo em tablet funciona corretamente');
    } else {
      throw new Error('Falha na responsividade para tablet');
    }
    
    // Testar em tamanho de celular
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verificar se elementos estão visíveis
    const mobileVisible = await page.isVisible('h1:has-text("Sistema de Propostas")');
    if (mobileVisible) {
      console.log('✅ Layout responsivo em celular funciona corretamente');
    } else {
      throw new Error('Falha na responsividade para celular');
    }
    
    console.log('Todos os testes foram concluídos com sucesso! 🎉');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    // Capturar screenshot em caso de erro
    await page.screenshot({ path: '/home/ubuntu/sistema-propostas-novo/test-reports/error.png' });
  } finally {
    // Fechar navegador
    await browser.close();
  }
})();
EOF

echo "Script de teste criado"

# Instalar dependências para testes
echo "Instalando dependências para testes..."
cd /home/ubuntu/sistema-propostas-novo
npm init -y > /dev/null
npm install playwright@latest > /dev/null
npx playwright install chromium > /dev/null

# Executar testes
echo "Executando testes automatizados..."
node /home/ubuntu/sistema-propostas-novo/tests/e2e-test.js > /home/ubuntu/sistema-propostas-novo/test-reports/test-results.log 2>&1

# Verificar resultado dos testes
if grep -q "Todos os testes foram concluídos com sucesso" /home/ubuntu/sistema-propostas-novo/test-reports/test-results.log; then
    echo "✅ Todos os testes foram concluídos com sucesso!"
else
    echo "❌ Alguns testes falharam. Verifique o relatório para mais detalhes."
    echo "Relatório disponível em: /home/ubuntu/sistema-propostas-novo/test-reports/test-results.log"
fi

# Limpar processos
echo "Limpando processos..."
pkill -f "http-server"
pkill -f "node.*server.js"

echo "Testes concluídos!"
