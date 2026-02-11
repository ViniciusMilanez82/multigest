// Sistema de Propostas - Lógica da Aplicação

// Variáveis globais
let items = []; // Array para armazenar os itens da proposta
let currentItemIndex = -1; // Índice do item atual sendo editado
let currentFreightItemIndex = -1; // Índice do item para adicionar frete
let clients = []; // Array para armazenar clientes para autocompletar

// Modelos disponíveis por tipo de item
const modelOptions = {
    maritimo: ['Container 20 pés', 'Container 40 pés', 'Container Refrigerado', 'Container Open Top'],
    modulo: ['Escritório 15m²', 'Escritório 30m²', 'Habitacional 15m²', 'Habitacional 30m²'],
    acessorios: ['Kit Elétrico', 'Kit Hidráulico', 'Ar Condicionado', 'Mobiliário Básico']
};

// Clientes de exemplo para autocompletar
const sampleClients = [
    { empresa: 'Empresa ABC Ltda', telefone: '(11) 98765-4321', email: 'contato@empresaabc.com.br', contato: 'João Silva' },
    { empresa: 'Construtora XYZ S/A', telefone: '(11) 91234-5678', email: 'comercial@construtoraxyz.com.br', contato: 'Maria Santos' },
    { empresa: 'Indústria Delta', telefone: '(21) 99876-5432', email: 'vendas@industriadelta.com.br', contato: 'Pedro Oliveira' },
    { empresa: 'Comércio Omega', telefone: '(31) 98765-1234', email: 'atendimento@comercioomega.com.br', contato: 'Ana Souza' }
];

// Inicialização quando o documento estiver pronto
$(document).ready(function() {
    // Inicializar data e número da proposta
    initializeProposal();
    
    // Inicializar máscaras para campos
    initializeMasks();
    
    // Carregar clientes de exemplo (em produção, viria do backend)
    loadSampleClients();
    
    // Configurar eventos de navegação do wizard
    setupWizardNavigation();
    
    // Configurar eventos para adicionar/remover itens
    setupItemsHandling();
    
    // Configurar eventos para edição inline na tabela
    setupInlineEditing();
    
    // Configurar autocompletar para dados de cliente
    setupClientAutocomplete();
    
    // Configurar eventos para visualização prévia e ações finais
    setupPreviewAndActions();
    
    // Configurar validação de formulários
    setupFormValidation();
    
    // Esconder alerta de "sem itens" inicialmente
    updateItemsVisibility();
});

// Inicializar data e número da proposta
function initializeProposal() {
    const today = new Date();
    
    // Formatar data no padrão brasileiro
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // Gerar número da proposta (DDMMYY-HHMM)
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const shortYear = String(year).substring(2);
    const proposalNumber = `${day}${month}${shortYear}-${hours}${minutes}`;
    
    // Preencher campos
    $('#date').val(formattedDate);
    $('#proposalNumber').val(proposalNumber);
}

// Inicializar máscaras para campos
function initializeMasks() {
    $('#phone').mask('(00) 00000-0000');
    $('#unitPrice').mask('0.000,00', {reverse: true});
    $('#freightValue').mask('0.000,00', {reverse: true});
}

// Carregar clientes de exemplo
function loadSampleClients() {
    clients = sampleClients;
}

// Configurar navegação do wizard
function setupWizardNavigation() {
    // Próximo passo
    $('.next-step').click(function() {
        const nextStep = $(this).data('next');
        
        // Validar o passo atual antes de avançar
        if (validateCurrentStep()) {
            // Atualizar navegação
            $(`#${nextStep}-tab`).tab('show');
            
            // Se estiver indo para o passo de revisão, atualizar resumo
            if (nextStep === 'step4') {
                updateSummary();
            }
        }
    });
    
    // Passo anterior
    $('.prev-step').click(function() {
        const prevStep = $(this).data('prev');
        $(`#${prevStep}-tab`).tab('show');
    });
    
    // Permitir clicar diretamente nas abas (se o passo anterior estiver válido)
    $('.wizard-steps .nav-link').click(function(e) {
        const clickedStep = $(this).attr('id').replace('-tab', '');
        const currentStep = $('.wizard-steps .nav-link.active').attr('id').replace('-tab', '');
        
        // Verificar se está tentando avançar
        if (getStepNumber(clickedStep) > getStepNumber(currentStep)) {
            // Validar o passo atual antes de avançar
            if (!validateCurrentStep()) {
                e.preventDefault();
                return false;
            }
            
            // Se estiver indo para o passo de revisão, atualizar resumo
            if (clickedStep === 'step4') {
                updateSummary();
            }
        }
    });
}

// Obter número do passo a partir do ID
function getStepNumber(stepId) {
    return parseInt(stepId.replace('step', ''));
}

// Validar o passo atual
function validateCurrentStep() {
    const currentStep = $('.wizard-steps .nav-link.active').attr('id').replace('-tab', '');
    
    switch (currentStep) {
        case 'step1':
            // Validar tipo de proposta
            if (!$('#proposalType').val()) {
                showNotification('Por favor, selecione o tipo de proposta.', 'error');
                $('#proposalType').addClass('is-invalid').focus();
                return false;
            }
            return true;
            
        case 'step2':
            // Validar dados do cliente
            let isValid = true;
            
            if (!$('#company').val()) {
                $('#company').addClass('is-invalid');
                isValid = false;
            }
            
            if (!$('#phone').val() || $('#phone').val().length < 14) {
                $('#phone').addClass('is-invalid');
                isValid = false;
            }
            
            if (!$('#email').val() || !isValidEmail($('#email').val())) {
                $('#email').addClass('is-invalid');
                isValid = false;
            }
            
            if (!$('#contact').val()) {
                $('#contact').addClass('is-invalid');
                isValid = false;
            }
            
            if (!isValid) {
                showNotification('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
                return false;
            }
            
            return true;
            
        case 'step3':
            // Validar se há pelo menos um item
            if (items.length === 0) {
                showNotification('Por favor, adicione pelo menos um item à proposta.', 'error');
                return false;
            }
            
            return true;
            
        default:
            return true;
    }
}

// Validar formato de e-mail
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Configurar manipulação de itens
function setupItemsHandling() {
    // Atualizar opções de modelo quando o tipo de item mudar
    $('#itemType').change(function() {
        updateModelOptions();
    });
    
    // Adicionar item
    $('#addItemBtn').click(function() {
        addItem();
    });
    
    // Configurar modal de frete
    $('#freightModal').on('show.bs.modal', function(e) {
        // Limpar valor anterior
        $('#freightValue').val('');
        
        // Armazenar índice do item
        currentFreightItemIndex = $(e.relatedTarget).data('index');
    });
    
    // Adicionar frete
    $('#addFreightBtn').click(function() {
        addFreight();
    });
    
    // Configurar modal de remoção
    $('#removeItemModal').on('show.bs.modal', function(e) {
        // Armazenar índice do item
        currentItemIndex = $(e.relatedTarget).data('index');
    });
    
    // Confirmar remoção de item
    $('#confirmRemoveBtn').click(function() {
        removeItem(currentItemIndex);
        $('#removeItemModal').modal('hide');
    });
}

// Atualizar opções de modelo com base no tipo selecionado
function updateModelOptions() {
    const itemType = $('#itemType').val();
    const modelSelect = $('#itemModel');
    
    // Limpar opções atuais
    modelSelect.empty();
    modelSelect.append('<option value="" selected disabled>Selecione o modelo</option>');
    
    // Se um tipo válido foi selecionado
    if (itemType && modelOptions[itemType]) {
        // Adicionar novas opções
        modelOptions[itemType].forEach(function(model) {
            modelSelect.append(`<option value="${model}">${model}</option>`);
        });
        
        // Habilitar select
        modelSelect.prop('disabled', false);
    } else {
        // Desabilitar select
        modelSelect.prop('disabled', true);
    }
}

// Adicionar item à proposta
function addItem() {
    // Obter valores dos campos
    const itemType = $('#itemType').val();
    const itemModel = $('#itemModel').val();
    const quantity = parseInt($('#quantity').val());
    const unitPrice = parseFloat($('#unitPrice').val().replace('.', '').replace(',', '.'));
    
    // Validar campos
    if (!itemType) {
        showNotification('Por favor, selecione o tipo de item.', 'error');
        return;
    }
    
    if (!itemModel) {
        showNotification('Por favor, selecione o modelo.', 'error');
        return;
    }
    
    if (isNaN(quantity) || quantity < 1) {
        showNotification('Por favor, informe uma quantidade válida.', 'error');
        return;
    }
    
    if (isNaN(unitPrice) || unitPrice <= 0) {
        showNotification('Por favor, informe um valor unitário válido.', 'error');
        return;
    }
    
    // Calcular valor total
    const totalValue = quantity * unitPrice;
    
    // Criar objeto do item
    const item = {
        tipo: itemType,
        modelo: itemModel,
        quantidade: quantity,
        valorUnitario: unitPrice,
        valorTotal: totalValue,
        frete: 0
    };
    
    // Adicionar ao array de itens
    items.push(item);
    
    // Atualizar tabela
    renderItems();
    
    // Limpar campos
    $('#itemType').val('');
    $('#itemModel').empty().append('<option value="" selected disabled>Selecione o tipo primeiro</option>').prop('disabled', true);
    $('#quantity').val(1);
    $('#unitPrice').val('');
    
    // Mostrar notificação
    showNotification('Item adicionado com sucesso!', 'success');
    
    // Atualizar visibilidade da tabela e alerta
    updateItemsVisibility();
}

// Adicionar frete ao item
function addFreight() {
    // Obter valor do frete
    const freightValue = parseFloat($('#freightValue').val().replace('.', '').replace(',', '.'));
    
    // Validar valor
    if (isNaN(freightValue) || freightValue <= 0) {
        showNotification('Por favor, informe um valor de frete válido.', 'error');
        return;
    }
    
    // Atualizar item
    items[currentFreightItemIndex].frete = freightValue;
    
    // Atualizar tabela
    renderItems();
    
    // Fechar modal
    $('#freightModal').modal('hide');
    
    // Mostrar notificação
    showNotification('Frete adicionado com sucesso!', 'success');
}

// Remover item da proposta
function removeItem(index) {
    // Remover do array
    items.splice(index, 1);
    
    // Atualizar tabela
    renderItems();
    
    // Mostrar notificação
    showNotification('Item removido com sucesso!', 'success');
    
    // Atualizar visibilidade da tabela e alerta
    updateItemsVisibility();
}

// Renderizar itens na tabela
function renderItems() {
    const tbody = $('#itemsBody');
    tbody.empty();
    
    // Calcular total da proposta
    let proposalTotal = 0;
    
    // Adicionar cada item à tabela
    items.forEach(function(item, index) {
        // Calcular total do item (incluindo frete)
        const itemTotal = item.valorTotal + item.frete;
        proposalTotal += itemTotal;
        
        // Formatar valores para exibição
        const formattedUnitPrice = formatCurrency(item.valorUnitario);
        const formattedItemTotal = formatCurrency(item.valorTotal);
        const formattedFreight = formatCurrency(item.frete);
        
        // Criar linha da tabela
        const row = `
            <tr>
                <td class="editable-cell" data-field="tipo" data-index="${index}">${getTipoLabel(item.tipo)}</td>
                <td class="editable-cell" data-field="modelo" data-index="${index}">${item.modelo}</td>
                <td class="editable-cell" data-field="quantidade" data-index="${index}">${item.quantidade}</td>
                <td class="editable-cell" data-field="valorUnitario" data-index="${index}">${formattedUnitPrice}</td>
                <td>${formattedItemTotal}</td>
                <td>
                    ${formattedFreight}
                    <button type="button" class="btn btn-sm btn-outline-primary ms-2" data-bs-toggle="modal" data-bs-target="#freightModal" data-index="${index}">
                        <i class="fas fa-truck"></i>
                    </button>
                </td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#removeItemModal" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        tbody.append(row);
    });
    
    // Atualizar total da proposta
    $('#proposalTotal').text(formatCurrency(proposalTotal));
}

// Obter label para o tipo de item
function getTipoLabel(tipo) {
    const labels = {
        maritimo: 'Marítimo',
        modulo: 'Módulo',
        acessorios: 'Acessórios'
    };
    
    return labels[tipo] || tipo;
}

// Formatar valor como moeda
function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

// Atualizar visibilidade da tabela e alerta
function updateItemsVisibility() {
    if (items.length === 0) {
        $('#itemsTable').addClass('d-none');
        $('#noItemsAlert').removeClass('d-none');
    } else {
        $('#itemsTable').removeClass('d-none');
        $('#noItemsAlert').addClass('d-none');
    }
}

// Configurar edição inline na tabela
function setupInlineEditing() {
    // Delegação de evento para células editáveis (funciona para itens adicionados dinamicamente)
    $('#itemsBody').on('dblclick', '.editable-cell', function() {
        const cell = $(this);
        const field = cell.data('field');
        const index = cell.data('index');
        const item = items[index];
        
        // Verificar se já está em modo de edição
        if (cell.hasClass('editing')) {
            return;
        }
        
        // Marcar como em edição
        cell.addClass('editing');
        
        // Salvar conteúdo atual
        const currentContent = cell.text();
        
        // Criar input apropriado com base no campo
        let inputHtml;
        
        switch (field) {
            case 'tipo':
                inputHtml = `
                    <select class="form-select form-select-sm inline-edit-input">
                        <option value="maritimo" ${item.tipo === 'maritimo' ? 'selected' : ''}>Marítimo</option>
                        <option value="modulo" ${item.tipo === 'modulo' ? 'selected' : ''}>Módulo</option>
                        <option value="acessorios" ${item.tipo === 'acessorios' ? 'selected' : ''}>Acessórios</option>
                    </select>
                `;
                break;
                
            case 'modelo':
                inputHtml = `
                    <select class="form-select form-select-sm inline-edit-input">
                        ${modelOptions[item.tipo].map(model => 
                            `<option value="${model}" ${item.modelo === model ? 'selected' : ''}>${model}</option>`
                        ).join('')}
                    </select>
                `;
                break;
                
            case 'quantidade':
                inputHtml = `
                    <input type="number" class="form-control form-control-sm inline-edit-input" value="${item.quantidade}" min="1">
                `;
                break;
                
            case 'valorUnitario':
                inputHtml = `
                    <input type="text" class="form-control form-control-sm inline-edit-input" value="${item.valorUnitario.toFixed(2).replace('.', ',')}">
                `;
                break;
                
            default:
                cell.removeClass('editing');
                return;
        }
        
        // Substituir conteúdo da célula pelo input
        cell.html(inputHtml);
        
        // Focar no input
        const input = cell.find('.inline-edit-input');
        input.focus();
        
        // Aplicar máscara se for valor unitário
        if (field === 'valorUnitario') {
            input.mask('0.000,00', {reverse: true});
        }
        
        // Manipular evento de perda de foco
        input.blur(function() {
            saveInlineEdit(cell, field, index);
        });
        
        // Manipular evento de tecla Enter
        input.keypress(function(e) {
            if (e.which === 13) {
                saveInlineEdit(cell, field, index);
            }
        });
        
        // Manipular evento de mudança para selects
        if (field === 'tipo' || field === 'modelo') {
            input.change(function() {
                saveInlineEdit(cell, field, index);
            });
        }
    });
}

// Salvar edição inline
function saveInlineEdit(cell, field, index) {
    const input = cell.find('.inline-edit-input');
    const item = items[index];
    
    // Obter novo valor com base no tipo de campo
    let newValue;
    
    switch (field) {
        case 'tipo':
            newValue = input.val();
            item.tipo = newValue;
            
            // Atualizar modelo para o primeiro da nova lista
            if (modelOptions[newValue] && modelOptions[newValue].length > 0) {
                item.modelo = modelOptions[newValue][0];
            }
            break;
            
        case 'modelo':
            newValue = input.val();
            item.modelo = newValue;
            break;
            
        case 'quantidade':
            newValue = parseInt(input.val());
            
            // Validar quantidade
            if (isNaN(newValue) || newValue < 1) {
                showNotification('Por favor, informe uma quantidade válida.', 'error');
                input.focus();
                return;
            }
            
            item.quantidade = newValue;
            
            // Recalcular valor total
            item.valorTotal = item.quantidade * item.valorUnitario;
            break;
            
        case 'valorUnitario':
            newValue = parseFloat(input.val().replace('.', '').replace(',', '.'));
            
            // Validar valor
            if (isNaN(newValue) || newValue <= 0) {
                showNotification('Por favor, informe um valor unitário válido.', 'error');
                input.focus();
                return;
            }
            
            item.valorUnitario = newValue;
            
            // Recalcular valor total
            item.valorTotal = item.quantidade * item.valorUnitario;
            break;
    }
    
    // Remover classe de edição
    cell.removeClass('editing');
    
    // Atualizar tabela
    renderItems();
    
    // Mostrar notificação
    showNotification('Item atualizado com sucesso!', 'success');
}

// Configurar autocompletar para dados de cliente
function setupClientAutocomplete() {
    // Evento de digitação no campo de empresa
    $('#company').on('input', function() {
        const query = $(this).val().toLowerCase();
        
        // Se o campo estiver vazio, esconder sugestões
        if (!query) {
            $('.client-suggestions').addClass('d-none');
            return;
        }
        
        // Filtrar clientes que correspondem à consulta
        const matches = clients.filter(client => 
            client.empresa.toLowerCase().includes(query)
        );
        
        // Se não houver correspondências, esconder sugestões
        if (matches.length === 0) {
            $('.client-suggestions').addClass('d-none');
            return;
        }
        
        // Construir lista de sugestões
        const suggestionsList = $('.client-suggestions .list-group');
        suggestionsList.empty();
        
        matches.forEach(client => {
            suggestionsList.append(`
                <a href="#" class="list-group-item list-group-item-action client-suggestion" 
                   data-company="${client.empresa}"
                   data-phone="${client.telefone}"
                   data-email="${client.email}"
                   data-contact="${client.contato}">
                    <div class="d-flex justify-content-between">
                        <strong>${client.empresa}</strong>
                        <small>${client.contato}</small>
                    </div>
                    <small>${client.email} | ${client.telefone}</small>
                </a>
            `);
        });
        
        // Mostrar sugestões
        $('.client-suggestions').removeClass('d-none');
    });
    
    // Evento de clique em uma sugestão
    $(document).on('click', '.client-suggestion', function(e) {
        e.preventDefault();
        
        // Preencher campos com dados do cliente
        $('#company').val($(this).data('company'));
        $('#phone').val($(this).data('phone'));
        $('#email').val($(this).data('email'));
        $('#contact').val($(this).data('contact'));
        
        // Esconder sugestões
        $('.client-suggestions').addClass('d-none');
        
        // Remover classes de validação
        $('#company, #phone, #email, #contact').removeClass('is-invalid').addClass('is-valid');
        
        // Mostrar notificação
        showNotification('Dados do cliente preenchidos automaticamente!', 'success');
    });
    
    // Esconder sugestões ao clicar fora
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#company, .client-suggestions').length) {
            $('.client-suggestions').addClass('d-none');
        }
    });
}

// Configurar visualização prévia e ações finais
function setupPreviewAndActions() {
    // Visualizar proposta
    $('#previewBtn').click(function() {
        generatePreview();
        $('#previewModal').modal('show');
    });
    
    // Imprimir visualização
    $('#printPreviewBtn').click(function() {
        window.print();
    });
    
    // Criar PDF
    $('#createPdfBtn').click(function() {
        generatePDF();
    });
    
    // Enviar por WhatsApp
    $('#whatsappBtn').click(function() {
        sendWhatsApp();
    });
    
    // Enviar por E-mail
    $('#emailBtn').click(function() {
        sendEmail();
    });
    
    // Salvar proposta
    $('#saveProposalBtn').click(function() {
        saveProposal();
    });
}

// Gerar visualização prévia da proposta
function generatePreview() {
    const previewContent = $('#previewContent');
    
    // Obter dados da proposta
    const proposalNumber = $('#proposalNumber').val();
    const date = $('#date').val();
    const proposalType = $('#proposalType option:selected').text();
    const company = $('#company').val();
    const contact = $('#contact').val();
    const phone = $('#phone').val();
    const email = $('#email').val();
    const total = $('#proposalTotal').text();
    
    // Construir HTML da visualização
    let previewHtml = `
        <div class="preview-header">
            <h2>Proposta Comercial</h2>
            <p class="lead">Nº ${proposalNumber} - ${date}</p>
        </div>
        
        <div class="preview-section">
            <h4 class="preview-section-title">Informações da Proposta</h4>
            <div class="row">
                <div class="col-md-4">
                    <p><strong>Número:</strong> ${proposalNumber}</p>
                </div>
                <div class="col-md-4">
                    <p><strong>Data:</strong> ${date}</p>
                </div>
                <div class="col-md-4">
                    <p><strong>Tipo:</strong> ${proposalType}</p>
                </div>
            </div>
        </div>
        
        <div class="preview-section">
            <h4 class="preview-section-title">Dados do Cliente</h4>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Empresa:</strong> ${company}</p>
                    <p><strong>Contato:</strong> ${contact}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Telefone:</strong> ${phone}</p>
                    <p><strong>E-mail:</strong> ${email}</p>
                </div>
            </div>
        </div>
        
        <div class="preview-section">
            <h4 class="preview-section-title">Itens da Proposta</h4>
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Tipo</th>
                        <th>Modelo</th>
                        <th>Qtd</th>
                        <th>Valor Unit.</th>
                        <th>Frete</th>
                        <th>Valor Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Adicionar itens à tabela
    items.forEach(item => {
        previewHtml += `
            <tr>
                <td>${getTipoLabel(item.tipo)}</td>
                <td>${item.modelo}</td>
                <td>${item.quantidade}</td>
                <td>${formatCurrency(item.valorUnitario)}</td>
                <td>${formatCurrency(item.frete)}</td>
                <td>${formatCurrency(item.valorTotal + item.frete)}</td>
            </tr>
        `;
    });
    
    // Finalizar tabela e HTML
    previewHtml += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="text-end fw-bold">Total da Proposta:</td>
                        <td class="fw-bold">${total}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div class="preview-section">
            <h4 class="preview-section-title">Condições Comerciais</h4>
            <p><strong>Validade da Proposta:</strong> 15 dias</p>
            <p><strong>Prazo de Entrega:</strong> Conforme disponibilidade</p>
            <p><strong>Condições de Pagamento:</strong> A combinar</p>
        </div>
    `;
    
    // Inserir HTML na modal
    previewContent.html(previewHtml);
}

// Gerar PDF da proposta
function generatePDF() {
    // Verificar se jsPDF está disponível
    if (typeof window.jspdf === 'undefined') {
        showNotification('Biblioteca jsPDF não carregada. Não é possível gerar PDF.', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Obter dados da proposta
    const proposalNumber = $('#proposalNumber').val();
    const date = $('#date').val();
    const proposalType = $('#proposalType option:selected').text();
    const company = $('#company').val();
    const contact = $('#contact').val();
    const phone = $('#phone').val();
    const email = $('#email').val();
    
    // Cabeçalho
    doc.setFontSize(22);
    doc.text('Proposta Comercial', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Nº ${proposalNumber} - ${date}`, 105, 30, { align: 'center' });
    
    // Informações da Proposta
    doc.setFontSize(16);
    doc.text('Informações da Proposta', 14, 45);
    doc.line(14, 47, 196, 47);
    
    doc.setFontSize(12);
    doc.text(`Número: ${proposalNumber}`, 14, 55);
    doc.text(`Data: ${date}`, 80, 55);
    doc.text(`Tipo: ${proposalType}`, 140, 55);
    
    // Dados do Cliente
    doc.setFontSize(16);
    doc.text('Dados do Cliente', 14, 70);
    doc.line(14, 72, 196, 72);
    
    doc.setFontSize(12);
    doc.text(`Empresa: ${company}`, 14, 80);
    doc.text(`Contato: ${contact}`, 14, 88);
    doc.text(`Telefone: ${phone}`, 120, 80);
    doc.text(`E-mail: ${email}`, 120, 88);
    
    // Itens da Proposta
    doc.setFontSize(16);
    doc.text('Itens da Proposta', 14, 105);
    doc.line(14, 107, 196, 107);
    
    // Tabela de itens
    const tableColumn = ['Tipo', 'Modelo', 'Qtd', 'Valor Unit.', 'Frete', 'Total'];
    const tableRows = [];
    
    // Preparar dados para a tabela
    items.forEach(item => {
        const itemData = [
            getTipoLabel(item.tipo),
            item.modelo,
            item.quantidade,
            formatCurrency(item.valorUnitario),
            formatCurrency(item.frete),
            formatCurrency(item.valorTotal + item.frete)
        ];
        tableRows.push(itemData);
    });
    
    // Calcular total da proposta
    let proposalTotal = 0;
    items.forEach(item => {
        proposalTotal += item.valorTotal + item.frete;
    });
    
    // Adicionar linha de total
    tableRows.push(['', '', '', '', 'Total:', formatCurrency(proposalTotal)]);
    
    // Gerar tabela
    doc.autoTable({
        startY: 115,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: [33, 37, 41],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        foot: [['', '', '', '', 'Total:', formatCurrency(proposalTotal)]],
        footStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        }
    });
    
    // Condições Comerciais
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(16);
    doc.text('Condições Comerciais', 14, finalY);
    doc.line(14, finalY + 2, 196, finalY + 2);
    
    doc.setFontSize(12);
    doc.text('Validade da Proposta: 15 dias', 14, finalY + 10);
    doc.text('Prazo de Entrega: Conforme disponibilidade', 14, finalY + 18);
    doc.text('Condições de Pagamento: A combinar', 14, finalY + 26);
    
    // Salvar PDF
    doc.save(`Proposta_${proposalNumber}.pdf`);
    
    // Mostrar notificação
    showNotification('PDF gerado com sucesso!', 'success');
}

// Enviar proposta por WhatsApp
function sendWhatsApp() {
    // Obter dados necessários
    const phone = $('#phone').val().replace(/\D/g, '');
    const company = $('#company').val();
    const proposalNumber = $('#proposalNumber').val();
    
    // Validar telefone
    if (!phone || phone.length < 10) {
        showNotification('Telefone inválido. Por favor, verifique o número.', 'error');
        return;
    }
    
    // Calcular total da proposta
    let proposalTotal = 0;
    items.forEach(item => {
        proposalTotal += item.valorTotal + item.frete;
    });
    
    // Preparar mensagem
    const message = `Olá! Segue proposta ${proposalNumber} para ${company} no valor de ${formatCurrency(proposalTotal)}. Aguardamos seu retorno.`;
    
    // Construir URL do WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp em nova janela
    window.open(whatsappUrl, '_blank');
    
    // Mostrar notificação
    showNotification('WhatsApp aberto com a mensagem!', 'success');
}

// Enviar proposta por E-mail
function sendEmail() {
    // Obter dados necessários
    const email = $('#email').val();
    const company = $('#company').val();
    const proposalNumber = $('#proposalNumber').val();
    
    // Validar e-mail
    if (!email || !isValidEmail(email)) {
        showNotification('E-mail inválido. Por favor, verifique o endereço.', 'error');
        return;
    }
    
    // Preparar assunto e corpo do e-mail
    const subject = `Proposta ${proposalNumber} - Sistema de Propostas`;
    const body = `Prezados,\n\nSegue proposta ${proposalNumber} para sua análise.\n\nAtenciosamente,\nEquipe Comercial`;
    
    // Construir URL mailto
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Abrir cliente de e-mail
    window.location.href = mailtoUrl;
    
    // Mostrar notificação
    showNotification('Cliente de e-mail aberto!', 'success');
}

// Salvar proposta no servidor
function saveProposal() {
    // Em uma implementação real, isso enviaria os dados para o backend
    // Por enquanto, apenas simularemos o salvamento
    
    // Obter dados da proposta
    const proposalData = {
        data: formatDateForBackend($('#date').val()),
        numero: $('#proposalNumber').val(),
        tipo: $('#proposalType').val(),
        empresa: $('#company').val(),
        telefone: $('#phone').val(),
        email: $('#email').val(),
        contato: $('#contact').val(),
        itens: items,
        valorTotal: calculateTotal()
    };
    
    // Simular envio para o servidor
    console.log('Dados da proposta a serem enviados:', proposalData);
    
    // Simular resposta do servidor
    setTimeout(() => {
        // Mostrar notificação
        showNotification('Proposta salva com sucesso!', 'success');
        
        // Em uma implementação real, poderíamos redirecionar para uma lista de propostas
        // ou limpar o formulário para uma nova proposta
    }, 1000);
}

// Formatar data para o backend (DD/MM/YYYY -> YYYY-MM-DD)
function formatDateForBackend(dateStr) {
    const parts = dateStr.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Calcular total da proposta
function calculateTotal() {
    let total = 0;
    items.forEach(item => {
        total += item.valorTotal + item.frete;
    });
    return total;
}

// Atualizar resumo na etapa de revisão
function updateSummary() {
    // Informações da proposta
    $('#summaryNumber').text($('#proposalNumber').val());
    $('#summaryDate').text($('#date').val());
    $('#summaryType').text($('#proposalType option:selected').text());
    
    // Dados do cliente
    $('#summaryCompany').text($('#company').val());
    $('#summaryContact').text($('#contact').val());
    $('#summaryPhone').text($('#phone').val());
    $('#summaryEmail').text($('#email').val());
    
    // Itens da proposta
    const summaryItems = $('#summaryItems');
    summaryItems.empty();
    
    // Adicionar cada item à tabela
    items.forEach(function(item) {
        // Formatar valores para exibição
        const formattedUnitPrice = formatCurrency(item.valorUnitario);
        const formattedFreight = formatCurrency(item.frete);
        const formattedItemTotal = formatCurrency(item.valorTotal + item.frete);
        
        // Criar linha da tabela
        const row = `
            <tr>
                <td>${getTipoLabel(item.tipo)}</td>
                <td>${item.modelo}</td>
                <td>${item.quantidade}</td>
                <td>${formattedUnitPrice}</td>
                <td>${formattedFreight}</td>
                <td>${formattedItemTotal}</td>
            </tr>
        `;
        
        summaryItems.append(row);
    });
    
    // Total da proposta
    $('#summaryTotal').text($('#proposalTotal').text());
}

// Configurar validação de formulários
function setupFormValidation() {
    // Remover classe de inválido ao focar no campo
    $('.form-control, .form-select').focus(function() {
        $(this).removeClass('is-invalid');
    });
    
    // Validar campos ao perder o foco
    $('.form-control, .form-select').blur(function() {
        const field = $(this);
        const value = field.val();
        
        // Verificar se o campo é obrigatório
        if (field.prop('required') && !value) {
            field.addClass('is-invalid');
        } else {
            field.removeClass('is-invalid');
            
            // Validações específicas
            if (field.attr('id') === 'email' && value && !isValidEmail(value)) {
                field.addClass('is-invalid');
            }
            
            if (field.attr('id') === 'phone' && value && value.length < 14) {
                field.addClass('is-invalid');
            }
        }
    });
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Definir título com base no tipo
    let title = 'Notificação';
    
    switch (type) {
        case 'success':
            title = 'Sucesso';
            break;
        case 'error':
            title = 'Erro';
            break;
        case 'warning':
            title = 'Atenção';
            break;
    }
    
    // Atualizar conteúdo do toast
    $('#toastTitle').text(title);
    $('#toastMessage').text(message);
    
    // Remover classes de tipo anteriores
    $('#notificationToast').removeClass('success error warning');
    
    // Adicionar classe de tipo
    $('#notificationToast').addClass(type);
    
    // Mostrar toast
    const toast = new bootstrap.Toast($('#notificationToast'));
    toast.show();
}
