/* ============================================
   Extrator de Quilometragem - JavaScript v2
   ============================================ */

// Elementos DOM
const fileInputSaida = document.getElementById('file-input-saida');
const fileInputChegada = document.getElementById('file-input-chegada');
const dropZoneSaida = document.getElementById('drop-zone-saida');
const dropZoneChegada = document.getElementById('drop-zone-chegada');
const previewSaidaContainer = document.getElementById('preview-saida-container');
const previewChegadaContainer = document.getElementById('preview-chegada-container');
const imagePreviewSaida = document.getElementById('image-preview-saida');
const imagePreviewChegada = document.getElementById('image-preview-chegada');
const fileNameSaida = document.getElementById('file-name-saida');
const fileNameChegada = document.getElementById('file-name-chegada');
const removeSaidaBtn = document.getElementById('remove-saida');
const removeChegadaBtn = document.getElementById('remove-chegada');
const processSection = document.getElementById('process-section');
const processBtn = document.getElementById('process-btn');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const kmSaida = document.getElementById('km-saida');
const kmChegada = document.getElementById('km-chegada');
const dataSaida = document.getElementById('data-saida');
const horaSaida = document.getElementById('hora-saida');
const dataChegada = document.getElementById('data-chegada');
const horaChegada = document.getElementById('hora-chegada');
const resultSection = document.getElementById('result-section');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');
const newExtractionBtn = document.getElementById('new-extraction');
const retryBtn = document.getElementById('retry-btn');
const systemStatus = document.getElementById('system-status');
const reportSection = document.getElementById('report-section');
const viewReportBtn = document.getElementById('view-report-btn');
const addToReportBtn = document.getElementById('add-to-report-btn');
const origemDestinoSection = document.getElementById('origem-destino-section');
const inputOrigem = document.getElementById('input-origem');
const inputDestino = document.getElementById('input-destino');

// Estado da aplicação
let currentFileSaida = null;
let currentFileChegada = null;
let resultData = null;

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkSystemHealth();
    setupEventListeners();
});

// ============================================
// Verificação de Saúde do Sistema
// ============================================

async function checkSystemHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        const indicator = systemStatus.querySelector('.status-indicator');
        const text = systemStatus.querySelector('.status-text');
        
        if (data.status === 'healthy') {
            indicator.className = 'status-indicator success';
            text.textContent = `Sistema online | Modelo: ${data.model}`;
        } else if (data.status === 'degraded') {
            indicator.className = 'status-indicator error';
            text.textContent = 'Conexão com Ollama instável';
        } else {
            indicator.className = 'status-indicator error';
            text.textContent = 'Erro de conexão com Ollama';
        }
    } catch (error) {
        const indicator = systemStatus.querySelector('.status-indicator');
        const text = systemStatus.querySelector('.status-text');
        indicator.className = 'status-indicator error';
        text.textContent = 'Não foi possível conectar ao servidor';
    }
}

// ============================================
// Configuração de Event Listeners
// ============================================

function setupEventListeners() {
    // Click nos drop zones
    dropZoneSaida.addEventListener('click', () => fileInputSaida.click());
    dropZoneChegada.addEventListener('click', () => fileInputChegada.click());
    
    // Mudança nos inputs de arquivo
    fileInputSaida.addEventListener('change', handleFileSelectSaida);
    fileInputChegada.addEventListener('change', handleFileSelectChegada);
    
    // Drag and drop Saída
    dropZoneSaida.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneSaida.classList.add('drag-over');
    });
    dropZoneSaida.addEventListener('dragleave', () => dropZoneSaida.classList.remove('drag-over'));
    dropZoneSaida.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZoneSaida.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0], 'saida');
    });
    
    // Drag and drop Chegada
    dropZoneChegada.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneChegada.classList.add('drag-over');
    });
    dropZoneChegada.addEventListener('dragleave', () => dropZoneChegada.classList.remove('drag-over'));
    dropZoneChegada.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZoneChegada.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0], 'chegada');
    });
    
    // Remover imagens
    removeSaidaBtn.addEventListener('click', removeSaida);
    removeChegadaBtn.addEventListener('click', removeChegada);
    
    // Processar imagens
    processBtn.addEventListener('click', processImages);
    
    // Nova extração
    newExtractionBtn.addEventListener('click', resetApp);
    
    // Tentar novamente
    retryBtn.addEventListener('click', resetApp);
    
    // Ver relatório
    if (viewReportBtn) {
        viewReportBtn.addEventListener('click', () => {
            window.open('/relatorio', '_blank');
        });
    }
    
    // Adicionar ao relatório
    if (addToReportBtn) {
        addToReportBtn.addEventListener('click', addToReport);
    }
}

// ============================================
// Handlers de Arquivo
// ============================================

function handleFileSelectSaida(e) {
    const files = e.target.files;
    if (files.length > 0) handleFile(files[0], 'saida');
}

function handleFileSelectChegada(e) {
    const files = e.target.files;
    if (files.length > 0) handleFile(files[0], 'chegada');
}

function handleFile(file, type) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('Formato de arquivo não suportado. Use JPG, PNG, GIF ou WEBP.');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showError('Arquivo muito grande. Máximo 10MB.');
        return;
    }
    
    if (type === 'saida') {
        currentFileSaida = file;
        showPreview(file, 'saida');
    } else {
        currentFileChegada = file;
        showPreview(file, 'chegada');
    }
    
    checkProcessButton();
}

// ============================================
// Preview de Imagem
// ============================================

function showPreview(file, type) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        if (type === 'saida') {
            imagePreviewSaida.src = e.target.result;
            fileNameSaida.textContent = file.name;
            previewSaidaContainer.classList.remove('hidden');
            dropZoneSaida.classList.add('has-preview');
        } else {
            imagePreviewChegada.src = e.target.result;
            fileNameChegada.textContent = file.name;
            previewChegadaContainer.classList.remove('hidden');
            dropZoneChegada.classList.add('has-preview');
        }
    };
    
    reader.readAsDataURL(file);
}

function removeSaida() {
    currentFileSaida = null;
    fileInputSaida.value = '';
    imagePreviewSaida.src = '';
    fileNameSaida.textContent = '--';
    previewSaidaContainer.classList.add('hidden');
    dropZoneSaida.classList.remove('has-preview');
    checkProcessButton();
}

function removeChegada() {
    currentFileChegada = null;
    fileInputChegada.value = '';
    imagePreviewChegada.src = '';
    fileNameChegada.textContent = '--';
    previewChegadaContainer.classList.add('hidden');
    dropZoneChegada.classList.remove('has-preview');
    checkProcessButton();
}

function checkProcessButton() {
    if (currentFileSaida || currentFileChegada) {
        processSection.classList.remove('hidden');
    } else {
        processSection.classList.add('hidden');
    }
}

// ============================================
// Processamento das Imagens
// ============================================

async function processImages() {
    if (!currentFileSaida && !currentFileChegada) {
        showError('Selecione pelo menos uma imagem.');
        return;
    }
    
    showLoading();
    
    const formData = new FormData();
    if (currentFileSaida) formData.append('image_saida', currentFileSaida);
    if (currentFileChegada) formData.append('image_chegada', currentFileChegada);
    
    try {
        const response = await fetch('/api/extract', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultData = data;
            showResults(data);
        } else {
            showError(data.error_message || 'Erro ao processar imagens.');
        }
    } catch (error) {
        showError('Erro de conexão. Verifique se o servidor está rodando.');
    }
}

// ============================================
// Exibição de Resultados
// ============================================

function showLoading() {
    hideAllResults();
    loadingSection.classList.remove('hidden');
}

function showResults(data) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Resultado Saída
    if (data.saida) {
        kmSaida.textContent = data.saida.kilometrage || 'N/A';
        dataSaida.textContent = data.saida.date || '--';
        horaSaida.textContent = data.saida.time || '--';
        document.getElementById('result-saida').style.opacity = '1';
    } else {
        kmSaida.textContent = '--';
        dataSaida.textContent = '--';
        horaSaida.textContent = '--';
        document.getElementById('result-saida').style.opacity = '0.5';
    }
    
    // Resultado Chegada
    if (data.chegada) {
        kmChegada.textContent = data.chegada.kilometrage || 'N/A';
        dataChegada.textContent = data.chegada.date || '--';
        horaChegada.textContent = data.chegada.time || '--';
        document.getElementById('result-chegada').style.opacity = '1';
    } else {
        kmChegada.textContent = '--';
        dataChegada.textContent = '--';
        horaChegada.textContent = '--';
        document.getElementById('result-chegada').style.opacity = '0.5';
    }
    
    // Mostrar origem/destino e relatório
    if (origemDestinoSection) origemDestinoSection.classList.remove('hidden');
    if (reportSection) reportSection.classList.remove('hidden');
}

function showError(message) {
    loadingSection.classList.add('hidden');
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

function hideAllResults() {
    loadingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    if (reportSection) reportSection.classList.add('hidden');
    if (origemDestinoSection) origemDestinoSection.classList.add('hidden');
}

function resetApp() {
    removeSaida();
    removeChegada();
    hideAllResults();
    if (inputOrigem) inputOrigem.value = '';
    if (inputDestino) inputDestino.value = '';
}

// ============================================
// Relatório
// ============================================

function addToReport() {
    if (!resultData || (!resultData.saida && !resultData.chegada)) {
        alert('Processe as imagens primeiro antes de adicionar ao relatório.');
        return;
    }
    
    const origem = inputOrigem ? inputOrigem.value : '';
    const destino = inputDestino ? inputDestino.value : '';
    
    // Criar objeto de leitura com dados de saída e chegada
    const leitura = {
        data: resultData.saida ? resultData.saida.date : (resultData.chegada ? resultData.chegada.date : new Date().toLocaleDateString('pt-BR')),
        hora_saida: resultData.saida ? resultData.saida.time : '',
        odometro_saida: resultData.saida ? resultData.saida.kilometrage.replace(/[^0-9]/g, '') : '',
        hora_chegada: resultData.chegada ? resultData.chegada.time : '',
        km_chegada: resultData.chegada ? resultData.chegada.kilometrage.replace(/[^0-9]/g, '') : '',
        destino: `${origem || 'Origem'} -> ${destino || 'Destino'}`,
        origem: origem,
        destino_final: destino
    };
    
    // Abrir relatório em nova aba e passar dados
    const relatorioWindow = window.open('/relatorio', '_blank');
    
    setTimeout(() => {
        if (relatorioWindow) {
            relatorioWindow.postMessage({ tipo: 'adicionar_leitura', dados: leitura }, '*');
        }
    }, 1000);
    
    // Salvar localmente
    let leituras = JSON.parse(sessionStorage.getItem('leituras_quilometragem') || '[]');
    leituras.push(leitura);
    sessionStorage.setItem('leituras_quilometragem', JSON.stringify(leituras));
    
    alert('Leitura adicionada ao relatório! A aba do relatório foi aberta.');
}

// ============================================
// Utilitários
// ============================================

function log(message, data = null) {
    console.log(`[Extrator] ${message}`, data || '');
}

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
