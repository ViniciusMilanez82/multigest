// Gerar imagens para o manual do usuário
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configurações
const imagesDir = path.join(__dirname, 'docs', 'imagens');
const width = 800;
const height = 500;

// Garantir que o diretório existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Função para criar uma imagem de exemplo
function createExampleImage(filename, title, content) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fundo
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Barra superior
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(0, 0, width, 60);

  // Título
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(title, 20, 40);

  // Conteúdo
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  
  // Dividir o conteúdo em linhas
  const lines = content.split('\n');
  let y = 100;
  
  lines.forEach(line => {
    ctx.fillText(line, 20, y);
    y += 30;
  });

  // Adicionar elementos de interface dependendo do tipo de tela
  if (filename.includes('etapa1')) {
    drawStep1Elements(ctx);
  } else if (filename.includes('etapa2')) {
    drawStep2Elements(ctx);
  } else if (filename.includes('etapa3')) {
    drawStep3Elements(ctx);
  } else if (filename.includes('etapa4')) {
    drawStep4Elements(ctx);
  } else if (filename.includes('login')) {
    drawLoginElements(ctx);
  } else if (filename.includes('inicial')) {
    drawHomeElements(ctx);
  } else if (filename.includes('lista_propostas')) {
    drawProposalListElements(ctx);
  } else if (filename.includes('visualizacao')) {
    drawPreviewElements(ctx);
  } else if (filename.includes('adicionar_frete')) {
    drawFreightElements(ctx);
  }

  // Salvar a imagem
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, filename), buffer);
  console.log(`Imagem ${filename} criada com sucesso`);
}

// Funções para desenhar elementos específicos de cada tela
function drawLoginElements(ctx) {
  // Formulário de login
  ctx.fillStyle = 'white';
  ctx.fillRect(250, 150, 300, 250);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(250, 150, 300, 250);
  
  // Título do formulário
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Login', 370, 180);
  
  // Campos
  ctx.font = '16px Arial';
  ctx.fillText('Usuário:', 270, 220);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(270, 230, 260, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(270, 230, 260, 40);
  
  ctx.fillStyle = '#212529';
  ctx.fillText('Senha:', 270, 290);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(270, 300, 260, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(270, 300, 260, 40);
  
  // Botão
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(270, 360, 260, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Entrar', 370, 385);
}

function drawHomeElements(ctx) {
  // Menu lateral
  ctx.fillStyle = '#343a40';
  ctx.fillRect(0, 60, 200, height - 60);
  
  // Itens do menu
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Nova Proposta', 20, 100);
  ctx.fillText('Minhas Propostas', 20, 140);
  ctx.fillText('Clientes', 20, 180);
  ctx.fillText('Configurações', 20, 220);
  ctx.fillText('Sair', 20, 260);
  
  // Conteúdo principal
  ctx.fillStyle = 'white';
  ctx.fillRect(220, 80, 560, 400);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(220, 80, 560, 400);
  
  // Título do conteúdo
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Bem-vindo ao Sistema de Propostas', 300, 120);
  
  // Cards
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = 'white';
    ctx.fillRect(240 + i * 190, 150, 170, 150);
    
    ctx.strokeStyle = '#dee2e6';
    ctx.strokeRect(240 + i * 190, 150, 170, 150);
    
    ctx.fillStyle = '#0d6efd';
    ctx.font = 'bold 16px Arial';
    
    if (i === 0) {
      ctx.fillText('Nova Proposta', 270, 200);
    } else if (i === 1) {
      ctx.fillText('Propostas Recentes', 250, 200);
    } else {
      ctx.fillText('Clientes', 290, 200);
    }
  }
}

function drawStep1Elements(ctx) {
  // Wizard steps
  drawWizardSteps(ctx, 1);
  
  // Formulário
  ctx.fillStyle = 'white';
  ctx.fillRect(50, 150, 700, 300);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 150, 700, 300);
  
  // Campos
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Tipo de Proposta:', 70, 190);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(70, 200, 300, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(70, 200, 300, 40);
  
  // Dropdown
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Venda', 80, 225);
  
  // Outros campos
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Número da Proposta:', 70, 270);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(70, 280, 300, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(70, 280, 300, 40);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('150525-1430', 80, 305);
  
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Data:', 400, 270);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(400, 280, 300, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(400, 280, 300, 40);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('15/05/2025', 410, 305);
  
  // Botões
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(650, 380, 100, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Próximo', 670, 405);
}

function drawStep2Elements(ctx) {
  // Wizard steps
  drawWizardSteps(ctx, 2);
  
  // Formulário
  ctx.fillStyle = 'white';
  ctx.fillRect(50, 150, 700, 300);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 150, 700, 300);
  
  // Campos
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Empresa:', 70, 190);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(70, 200, 300, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(70, 200, 300, 40);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Empresa Teste', 80, 225);
  
  // Outros campos
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Telefone:', 400, 190);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(400, 200, 300, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(400, 200, 300, 40);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('(11) 98765-4321', 410, 225);
  
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('E-mail:', 70, 270);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(70, 280, 300, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(70, 280, 300, 40);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('contato@empresa.com', 80, 305);
  
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Contato:', 400, 270);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(400, 280, 300, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(400, 280, 300, 40);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('João Silva', 410, 305);
  
  // Botões
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(540, 380, 100, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Voltar', 565, 405);
  
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(650, 380, 100, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Próximo', 670, 405);
}

function drawStep3Elements(ctx) {
  // Wizard steps
  drawWizardSteps(ctx, 3);
  
  // Formulário
  ctx.fillStyle = 'white';
  ctx.fillRect(50, 150, 700, 300);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 150, 700, 300);
  
  // Campos para adicionar item
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Tipo:', 70, 180);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(70, 190, 150, 30);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(70, 190, 150, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Marítimo', 80, 210);
  
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Modelo:', 230, 180);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(230, 190, 150, 30);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(230, 190, 150, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Container 20 pés', 240, 210);
  
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Qtd:', 390, 180);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(390, 190, 80, 30);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(390, 190, 80, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('2', 400, 210);
  
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Valor Unit.:', 480, 180);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(480, 190, 120, 30);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(480, 190, 120, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('15.000,00', 490, 210);
  
  // Botão adicionar
  ctx.fillStyle = '#198754';
  ctx.fillRect(610, 190, 120, 30);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Adicionar Item', 620, 210);
  
  // Tabela
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(70, 240, 660, 30);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.strokeRect(70, 240, 660, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Tipo', 80, 260);
  ctx.fillText('Modelo', 160, 260);
  ctx.fillText('Qtd', 300, 260);
  ctx.fillText('Valor Unit.', 350, 260);
  ctx.fillText('Valor Total', 450, 260);
  ctx.fillText('Frete', 550, 260);
  ctx.fillText('Ações', 650, 260);
  
  // Linha da tabela
  ctx.fillStyle = 'white';
  ctx.fillRect(70, 270, 660, 30);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.strokeRect(70, 270, 660, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Marítimo', 80, 290);
  ctx.fillText('Container 20 pés', 160, 290);
  ctx.fillText('2', 300, 290);
  ctx.fillText('R$ 15.000,00', 350, 290);
  ctx.fillText('R$ 30.000,00', 450, 290);
  ctx.fillText('R$ 2.000,00', 550, 290);
  
  // Ícones
  ctx.fillStyle = '#dc3545';
  ctx.fillRect(650, 275, 20, 20);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('X', 655, 290);
  
  // Total
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(70, 300, 660, 30);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.strokeRect(70, 300, 660, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Total da Proposta:', 450, 320);
  ctx.fillText('R$ 32.000,00', 550, 320);
  
  // Botões
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(540, 380, 100, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Voltar', 565, 405);
  
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(650, 380, 100, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Próximo', 670, 405);
}

function drawStep4Elements(ctx) {
  // Wizard steps
  drawWizardSteps(ctx, 4);
  
  // Formulário
  ctx.fillStyle = 'white';
  ctx.fillRect(50, 150, 700, 300);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 150, 700, 300);
  
  // Resumo
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Resumo da Proposta', 320, 180);
  
  // Informações
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Informações da Proposta', 70, 210);
  
  ctx.font = '14px Arial';
  ctx.fillText('Número: 150525-1430', 70, 230);
  ctx.fillText('Data: 15/05/2025', 70, 250);
  ctx.fillText('Tipo: Venda', 70, 270);
  
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Dados do Cliente', 350, 210);
  
  ctx.font = '14px Arial';
  ctx.fillText('Empresa: Empresa Teste', 350, 230);
  ctx.fillText('Contato: João Silva', 350, 250);
  ctx.fillText('Telefone: (11) 98765-4321', 350, 270);
  ctx.fillText('E-mail: contato@empresa.com', 350, 290);
  
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Total da Proposta: R$ 32.000,00', 70, 330);
  
  // Botões de ação
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(70, 380, 120, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Visualizar', 100, 405);
  
  ctx.fillStyle = '#198754';
  ctx.fillRect(200, 380, 120, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Gerar PDF', 225, 405);
  
  ctx.fillStyle = '#25d366';
  ctx.fillRect(330, 380, 120, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('WhatsApp', 355, 405);
  
  ctx.fillStyle = '#0dcaf0';
  ctx.fillRect(460, 380, 120, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('E-mail', 495, 405);
  
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(590, 380, 80, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Voltar', 605, 405);
  
  ctx.fillStyle = '#dc3545';
  ctx.fillRect(680, 380, 70, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Salvar', 690, 405);
}

function drawProposalListElements(ctx) {
  // Título
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Minhas Propostas', 50, 100);
  
  // Filtros
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(50, 120, 700, 50);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 120, 700, 50);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Filtrar por:', 60, 145);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(130, 130, 150, 30);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(130, 130, 150, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Cliente', 140, 150);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(290, 130, 150, 30);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(290, 130, 150, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Período', 300, 150);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(450, 130, 150, 30);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(450, 130, 150, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Tipo', 460, 150);
  
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(610, 130, 130, 30);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Aplicar Filtros', 630, 150);
  
  // Tabela
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(50, 180, 700, 30);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.strokeRect(50, 180, 700, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Número', 60, 200);
  ctx.fillText('Data', 150, 200);
  ctx.fillText('Cliente', 220, 200);
  ctx.fillText('Tipo', 350, 200);
  ctx.fillText('Valor', 420, 200);
  ctx.fillText('Ações', 620, 200);
  
  // Linhas da tabela
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'white' : '#f8f9fa';
    ctx.fillRect(50, 210 + i * 30, 700, 30);
    
    ctx.strokeStyle = '#dee2e6';
    ctx.strokeRect(50, 210 + i * 30, 700, 30);
    
    ctx.fillStyle = '#212529';
    ctx.font = '14px Arial';
    ctx.fillText(`150525-${1430 + i}`, 60, 230 + i * 30);
    ctx.fillText('15/05/2025', 150, 230 + i * 30);
    ctx.fillText(`Empresa ${String.fromCharCode(65 + i)}`, 220, 230 + i * 30);
    ctx.fillText(i % 2 === 0 ? 'Venda' : 'Locação', 350, 230 + i * 30);
    ctx.fillText(`R$ ${(30000 + i * 5000).toLocaleString('pt-BR')}`, 420, 230 + i * 30);
    
    // Botões de ação
    ctx.fillStyle = '#0d6efd';
    ctx.fillRect(550, 215 + i * 30, 60, 20);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Editar', 560, 230 + i * 30);
    
    ctx.fillStyle = '#198754';
    ctx.fillRect(620, 215 + i * 30, 60, 20);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Ver', 640, 230 + i * 30);
    
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(690, 215 + i * 30, 50, 20);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('X', 710, 230 + i * 30);
  }
  
  // Paginação
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(300, 370, 200, 30);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.strokeRect(300, 370, 200, 30);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('Página 1 de 3', 350, 390);
  
  // Botões de paginação
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(300, 370, 30, 30);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('<', 310, 390);
  
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(470, 370, 30, 30);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('>', 480, 390);
}

function drawPreviewElements(ctx) {
  // Modal
  ctx.fillStyle = 'white';
  ctx.fillRect(50, 50, 700, 400);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, 700, 400);
  
  // Cabeçalho modal
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(50, 50, 700, 50);
  
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Visualização da Proposta', 70, 80);
  
  // X para fechar
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('×', 730, 80);
  
  // Conteúdo da proposta
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Proposta Comercial', 350, 120);
  
  ctx.font = '16px Arial';
  ctx.fillText('Nº 150525-1430 - 15/05/2025', 330, 140);
  
  // Seções
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Informações da Proposta', 70, 170);
  
  ctx.strokeStyle = '#0d6efd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 175);
  ctx.lineTo(250, 175);
  ctx.stroke();
  
  ctx.font = '14px Arial';
  ctx.fillText('Número: 150525-1430', 70, 195);
  ctx.fillText('Data: 15/05/2025', 70, 215);
  ctx.fillText('Tipo: Venda', 70, 235);
  
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Dados do Cliente', 70, 265);
  
  ctx.strokeStyle = '#0d6efd';
  ctx.beginPath();
  ctx.moveTo(70, 270);
  ctx.lineTo(200, 270);
  ctx.stroke();
  
  ctx.font = '14px Arial';
  ctx.fillText('Empresa: Empresa Teste', 70, 290);
  ctx.fillText('Contato: João Silva', 70, 310);
  ctx.fillText('Telefone: (11) 98765-4321', 70, 330);
  ctx.fillText('E-mail: contato@empresa.com', 70, 350);
  
  // Botões
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(600, 380, 120, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Imprimir', 630, 405);
}

function drawFreightElements(ctx) {
  // Modal
  ctx.fillStyle = 'white';
  ctx.fillRect(200, 150, 400, 200);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(200, 150, 400, 200);
  
  // Cabeçalho modal
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(200, 150, 400, 50);
  
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Adicionar Frete', 220, 180);
  
  // X para fechar
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('×', 580, 180);
  
  // Campo
  ctx.fillStyle = '#212529';
  ctx.font = '16px Arial';
  ctx.fillText('Valor do Frete:', 220, 230);
  
  ctx.fillStyle = 'white';
  ctx.fillRect(220, 240, 360, 40);
  ctx.strokeStyle = '#ced4da';
  ctx.strokeRect(220, 240, 360, 40);
  
  ctx.fillStyle = '#212529';
  ctx.font = '14px Arial';
  ctx.fillText('2.000,00', 230, 265);
  
  // Botão
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(450, 300, 130, 40);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Adicionar Frete', 460, 325);
}

// Função auxiliar para desenhar os passos do wizard
function drawWizardSteps(ctx, activeStep) {
  // Barra de passos
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(50, 100, 700, 40);
  
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 100, 700, 40);
  
  // Passos
  const steps = [
    'Tipo de Proposta',
    'Dados do Cliente',
    'Itens da Proposta',
    'Revisão e Finalização'
  ];
  
  const stepWidth = 700 / steps.length;
  
  for (let i = 0; i < steps.length; i++) {
    // Fundo do passo
    ctx.fillStyle = i + 1 === activeStep ? '#0d6efd' : '#f8f9fa';
    ctx.fillRect(50 + i * stepWidth, 100, stepWidth, 40);
    
    // Borda entre passos
    if (i < steps.length - 1) {
      ctx.strokeStyle = '#dee2e6';
      ctx.beginPath();
      ctx.moveTo(50 + (i + 1) * stepWidth, 100);
      ctx.lineTo(50 + (i + 1) * stepWidth, 140);
      ctx.stroke();
    }
    
    // Número do passo
    ctx.fillStyle = i + 1 === activeStep ? 'white' : '#212529';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`${i + 1}`, 70 + i * stepWidth, 125);
    
    // Nome do passo
    ctx.font = i + 1 === activeStep ? 'bold 14px Arial' : '14px Arial';
    ctx.fillText(steps[i], 90 + i * stepWidth, 125);
  }
}

// Criar imagens para o manual
createExampleImage('tela_login.png', 'Sistema de Propostas', 'Tela de Login\n\nInsira seu nome de usuário e senha para acessar o sistema.');

createExampleImage('tela_inicial.png', 'Sistema de Propostas', 'Tela Inicial\n\nBem-vindo ao Sistema de Propostas.\nEscolha uma das opções no menu lateral ou nos cards abaixo.');

createExampleImage('etapa1.png', 'Sistema de Propostas', 'Etapa 1: Tipo de Proposta\n\nSelecione o tipo de proposta e verifique o número e data gerados automaticamente.');

createExampleImage('etapa2.png', 'Sistema de Propostas', 'Etapa 2: Dados do Cliente\n\nPreencha os dados do cliente ou use o autocompletar digitando o nome da empresa.');

createExampleImage('etapa3.png', 'Sistema de Propostas', 'Etapa 3: Itens da Proposta\n\nAdicione os itens da proposta, especificando tipo, modelo, quantidade e valor unitário.');

createExampleImage('etapa4.png', 'Sistema de Propostas', 'Etapa 4: Revisão e Finalização\n\nRevise os dados da proposta e escolha a ação desejada: visualizar, gerar PDF, enviar ou salvar.');

createExampleImage('lista_propostas.png', 'Sistema de Propostas', 'Lista de Propostas\n\nGerencie suas propostas existentes, com opções para filtrar, editar, visualizar e excluir.');

createExampleImage('visualizacao.png', 'Sistema de Propostas', 'Visualização da Proposta\n\nVisualize a proposta formatada antes de exportar ou compartilhar.');

createExampleImage('adicionar_frete.png', 'Sistema de Propostas', 'Adicionar Frete\n\nAdicione valor de frete a um item específico da proposta.');

console.log('Todas as imagens foram geradas com sucesso!');
