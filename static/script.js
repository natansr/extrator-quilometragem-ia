/* ============================================
   Extrator de Quilometragem - JavaScript
   ============================================ */

// Elementos DOM
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewSection = document.getElementById('preview-section');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image');
const processSection = document.getElementById('process-section');
const processBtn = document.getElementById('process-btn');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const errorSection = document.getElementById('error-section');
const kmValue = document.getElementById('km-value');
const rawResponse = document.getElementById('raw-response');
const errorMessage = document.getElementById('error-message');
const newExtractionBtn = document.getElementById('new-extraction');
const retryBtn = document.getElementById('retry-btn');
const systemStatus = document.getElementById('system-status');
const reportSection = document.getElementById('report-section');
const viewReportBtn = document.getElementById('view-report-btn');
const addToReportBtn = document.getElementById('add-to-report-btn');

// Estado da aplicação
let currentFile = null;

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
    // Click no drop zone
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Mudança no input de arquivo
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // Remover imagem
    removeImageBtn.addEventListener('click', removeImage);
    
    // Processar imagem
    processBtn.addEventListener('click', processImage);
    
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

function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('Formato de arquivo não suportado. Use JPG, PNG, GIF ou WEBP.');
        return;
    }
    
    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('Arquivo muito grande. Máximo 10MB.');
        return;
    }
    
    currentFile = file;
    showPreview(file);
}

// ============================================
// Preview de Imagem
// ============================================

function showPreview(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        document.getElementById('file-name').textContent = file.name;
        dropZone.classList.add('hidden');
        previewSection.classList.remove('hidden');
        processSection.classList.remove('hidden');
    };
    
    reader.readAsDataURL(file);
}

function removeImage() {
    currentFile = null;
    fileInput.value = '';
    imagePreview.src = '';
    document.getElementById('file-name').textContent = '--';
    previewSection.classList.add('hidden');
    processSection.classList.add('hidden');
    dropZone.classList.remove('hidden');
}

// ============================================
// Processamento da Imagem
// ============================================

async function processImage() {
    if (!currentFile) {
        showError('Nenhuma imagem selecionada.');
        return;
    }
    
    // Mostrar loading
    showLoading();
    
    // Preparar FormData
    const formData = new FormData();
    formData.append('image', currentFile);
    
    try {
        const response = await fetch('/api/extract', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult(data);
        } else {
            showError(data.error || 'Erro ao processar imagem.');
        }
    } catch (error) {
        showError('Erro de conexão. Verifique se o servidor está rodando.');
    }
}

// ============================================
// Exibição de Estados
// ============================================

function showLoading() {
    // Manter preview visível durante loading
    loadingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

function showResult(data) {
    // Manter preview visível ao mostrar resultado
    loadingSection.classList.add('hidden');
    
    kmValue.textContent = data.kilometrage || 'Não identificada';
    rawResponse.textContent = data.raw_response || 'Sem resposta';
    
    resultSection.classList.remove('hidden');
    
    // Mostrar seção de relatório se existir
    if (reportSection) {
        reportSection.classList.remove('hidden');
    }
}

function showError(message) {
    // Manter preview visível ao mostrar erro
    loadingSection.classList.add('hidden');
    
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

function hideAllSections() {
    dropZone.classList.add('hidden');
    previewSection.classList.add('hidden');
    processSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

function resetApp() {
    removeImage();
}

// ============================================
// Relatório
// ============================================

function addToReport() {
    if (!currentFile || !resultSection.classList.contains('hidden')) {
        // Se já temos resultado, adicionar ao relatório
        const km = kmValue.textContent;
        const raw = rawResponse.textContent;
        
        // Criar objeto de leitura
        const leitura = {
            data: new Date().toLocaleDateString('pt-BR'),
            hora_saida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            odometro_saida: km.replace(/[^0-9]/g, ''),
            hora_chegada: '',
            km_chegada: km.replace(/[^0-9]/g, ''),
            destino: 'Extraído automaticamente via IA',
            km: km,
            kilometrage: km,
            imagem: currentFile.name
        };
        
        // Abrir relatório em nova aba e passar dados
        const relatorioWindow = window.open('/relatorio', '_blank');
        
        // Aguardar janela carregar e passar dados
        setTimeout(() => {
            relatorioWindow.postMessage({ tipo: 'adicionar_leitura', dados: leitura }, '*');
        }, 1000);
        
        // Salvar localmente também
        let leituras = JSON.parse(sessionStorage.getItem('leituras_quilometragem') || '[]');
        leituras.push(leitura);
        sessionStorage.setItem('leituras_quilometragem', JSON.stringify(leituras));
        
        alert('Leitura adicionada ao relatório! A aba do relatório foi aberta.');
    } else {
        alert('Processe uma imagem primeiro antes de adicionar ao relatório.');
    }
}

// ============================================
// Utilitários
// ============================================

function log(message, data = null) {
    console.log(`[Extrator] ${message}`, data || '');
}

// Prevenir comportamento padrão de drag and drop na janela
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
