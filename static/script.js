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
const resultSection = document.getElementById('result-section');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');
const newExtractionBtn = document.getElementById('new-extraction');
const retryBtn = document.getElementById('retry-btn');
const systemStatus = document.getElementById('system-status');
const reportSection = document.getElementById('report-section');
const viewReportBtn = document.getElementById('view-report-btn');
const addToReportBtn = document.getElementById('add-to-report-btn');
const inputDataSaida = document.getElementById('input-data-saida');
const inputHoraSaida = document.getElementById('input-hora-saida');
const inputHoraChegada = document.getElementById('input-hora-chegada');
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
    inicializarDatePicker();
    inicializarTimePicker();
    carregarEscolas();
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
        // Exibir seções de data/hora e origem/destino quando imagens estiverem carregadas
        if (origemDestinoSection) origemDestinoSection.classList.remove('hidden');
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
        if (kmSaida) kmSaida.textContent = data.saida.kilometrage || 'N/A';
        document.getElementById('result-saida').style.opacity = '1';
    } else {
        if (kmSaida) kmSaida.textContent = '--';
        document.getElementById('result-saida').style.opacity = '0.5';
    }
    
    // Resultado Chegada
    if (data.chegada) {
        if (kmChegada) kmChegada.textContent = data.chegada.kilometrage || 'N/A';
        document.getElementById('result-chegada').style.opacity = '1';
    } else {
        if (kmChegada) kmChegada.textContent = '--';
        document.getElementById('result-chegada').style.opacity = '0.5';
    }
    
    // Mostrar data/hora, origem/destino e relatório
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
    if (inputDataSaida) inputDataSaida.value = '';
    if (inputHoraSaida) inputHoraSaida.value = '';
    if (inputHoraChegada) inputHoraChegada.value = '';
}

// ============================================
// Relatório
// ============================================

function addToReport() {
    if (!resultData || (!resultData.saida && !resultData.chegada)) {
        alert('Processe as imagens primeiro antes de adicionar ao relatório.');
        return;
    }
    
    const origem = inputOrigem ? inputOrigem.value.trim() : '';
    const destino = inputDestino ? inputDestino.value.trim() : '';
    const dataSaidaInput = inputDataSaida ? inputDataSaida.value : '';
    const horaSaidaInput = inputHoraSaida ? inputHoraSaida.value : '';
    const horaChegadaInput = inputHoraChegada ? inputHoraChegada.value : '';
    
    // Criar objeto de leitura com dados de saída e chegada
    const leitura = {
        data: dataSaidaInput || (resultData.saida ? resultData.saida.date : (resultData.chegada ? resultData.chegada.date : new Date().toLocaleDateString('pt-BR'))),
        hora_saida: horaSaidaInput || (resultData.saida ? resultData.saida.time : ''),
        odometro_saida: resultData.saida ? resultData.saida.kilometrage.replace(/[^0-9]/g, '') : '',
        hora_chegada: horaChegadaInput || (resultData.chegada ? resultData.chegada.time : ''),
        km_chegada: resultData.chegada ? resultData.chegada.kilometrage.replace(/[^0-9]/g, '') : '',
        destino: `${origem || 'Origem'} -> ${destino || 'Destino'}`,
        origem: origem,
        destino_final: destino
    };
    
    // Salvar no localStorage (compartilhado entre abas)
    let leituras = JSON.parse(localStorage.getItem('leituras_quilometragem') || '[]');
    leituras.push(leitura);
    localStorage.setItem('leituras_quilometragem', JSON.stringify(leituras));
    
    // Abrir relatório em nova aba e passar dados via postMessage
    const relatorioWindow = window.open('/relatorio', '_blank');
    
    // Aguardar a aba carregar antes de enviar a mensagem (3s de margem)
    setTimeout(() => {
        if (relatorioWindow) {
            // Usa a mesma origem do app (não wildcard) para evitar vazamento de dados
            relatorioWindow.postMessage({ tipo: 'adicionar_leitura', dados: leitura }, window.location.origin);
        }
    }, 3000);
    
    alert('Leitura adicionada ao relatório! A aba do relatório foi aberta.');
}

// ============================================
// Datepicker e Timepicker (CORRIGIDO)
// ============================================

function inicializarDatePicker() {
    // Verifica se flatpickr está disponível
    if (typeof flatpickr === 'undefined') {
        console.warn('Flatpickr não carregado. Usando input manual para data.');
        if (inputDataSaida) {
            inputDataSaida.placeholder = 'DD/MM/AA (digite manualmente)';
            inputDataSaida.addEventListener('blur', validarDataManual);
        }
        return;
    }
    
    // Tenta obter o locale português de diferentes formas
    let ptLocale = null;
    if (flatpickr.l10n && flatpickr.l10n.pt) {
        ptLocale = flatpickr.l10n.pt;
    } else if (flatpickr.l10n && flatpickr.l10n.default && flatpickr.l10n.default.pt) {
        ptLocale = flatpickr.l10n.default.pt;
    }
    
    try {
        if (inputDataSaida) {
            const config = {
                dateFormat: 'd/m/y',
                allowInput: true,
                maxDate: 'today',
                defaultDate: new Date(),
                onChange: function(selectedDates, dateStr) {
                    console.log('Data selecionada:', dateStr);
                }
            };
            
            // Adiciona locale apenas se disponível
            if (ptLocale) {
                config.locale = ptLocale;
            }
            
            flatpickr(inputDataSaida, config);
            console.log('Datepicker inicializado com sucesso' + (ptLocale ? ' (com locale pt)' : ' (sem locale)'));
        }
    } catch (error) {
        console.error('Erro ao inicializar datepicker:', error);
        if (inputDataSaida) {
            inputDataSaida.placeholder = 'DD/MM/AA (digite manualmente)';
            inputDataSaida.addEventListener('blur', validarDataManual);
        }
    }
}

function validarDataManual(e) {
    const input = e.target;
    const valor = input.value.trim();
    // Validação simples de formato DD/MM/AA
    const regex = /^\d{2}\/\d{2}\/\d{2}$/;
    if (valor && !regex.test(valor)) {
        input.style.borderColor = 'var(--danger-color)';
        console.warn('Formato de data inválido. Use DD/MM/AA');
    } else {
        input.style.borderColor = '';
    }
}

function inicializarTimePicker() {
    // Verifica se flatpickr está disponível
    if (typeof flatpickr === 'undefined') {
        console.warn('Flatpickr não carregado. Usando input manual para hora.');
        if (inputHoraSaida) {
            inputHoraSaida.placeholder = 'HHhMM (ex: 08h30)';
            inputHoraSaida.addEventListener('blur', validarHoraManual);
        }
        if (inputHoraChegada) {
            inputHoraChegada.placeholder = 'HHhMM (ex: 09h45)';
            inputHoraChegada.addEventListener('blur', validarHoraManual);
        }
        return;
    }
    
    try {
        if (inputHoraSaida) {
            flatpickr(inputHoraSaida, {
                enableTime: true,
                noCalendar: true,
                time_24hr: true,
                dateFormat: 'H\\hi',
                allowInput: true,
                defaultDate: new Date(),
                onChange: function(selectedDates, dateStr) {
                    console.log('Hora saída selecionada:', dateStr);
                }
            });
        }
        
        if (inputHoraChegada) {
            flatpickr(inputHoraChegada, {
                enableTime: true,
                noCalendar: true,
                time_24hr: true,
                dateFormat: 'H\\hi',
                allowInput: true,
                defaultDate: new Date(),
                onChange: function(selectedDates, dateStr) {
                    console.log('Hora chegada selecionada:', dateStr);
                }
            });
        }
        console.log('Timepicker inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar timepicker:', error);
        if (inputHoraSaida) {
            inputHoraSaida.placeholder = 'HHhMM (ex: 08h30)';
            inputHoraSaida.addEventListener('blur', validarHoraManual);
        }
        if (inputHoraChegada) {
            inputHoraChegada.placeholder = 'HHhMM (ex: 09h45)';
            inputHoraChegada.addEventListener('blur', validarHoraManual);
        }
    }
}

function validarHoraManual(e) {
    const input = e.target;
    const valor = input.value.trim();
    // Validação simples de formato HHhMM
    const regex = /^\d{2}h\d{2}$/;
    if (valor && !regex.test(valor)) {
        input.style.borderColor = 'var(--danger-color)';
        console.warn('Formato de hora inválido. Use HHhMM (ex: 08h30)');
    } else {
        input.style.borderColor = '';
    }
}

// ============================================
// Autocomplete Customizado (CORRIGIDO)
// ============================================

let escolasList = [];
let autocompleteAtivo = null;

async function carregarEscolas() {
    try {
        const response = await fetch('/api/schools');
        if (response.ok) {
            escolasList = await response.json();
            console.log(`Carregadas ${escolasList.length} escolas para autocomplete`);
            inicializarAutocomplete();
        } else {
            throw new Error('Falha ao carregar escolas');
        }
    } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        // Fallback para lista básica se API falhar
        escolasList = [
            'Shopping ID', 'Ced Casa Grande', 'Escola Classe 09',
            'Ifb - Campus Brasilia', 'Cef 01 de Brasilia', 'Cem 01 de Planaltina',
            'Cem 01 de Taguatinga', 'Cem 01 do Gama', 'Cem 01 de Sobradinho',
            'Cem 01 de Ceilandia', 'Cem 01 do Paranoa', 'Cem 01 de Samambaia'
        ];
        inicializarAutocomplete();
    }
}

function inicializarAutocomplete() {
    if (inputOrigem) {
        criarAutocomplete(inputOrigem);
    }
    if (inputDestino) {
        criarAutocomplete(inputDestino);
    }
}

function criarAutocomplete(inputElement) {
    // Usar o container de sugestões já existente no HTML (irmão seguinte do input)
    const suggestionsContainer = inputElement.parentNode.querySelector('.autocomplete-suggestions');
    
    if (!suggestionsContainer) {
        console.error('Container autocomplete-suggestions não encontrado para', inputElement.id);
        return;
    }
    
    let selectedIndex = -1;
    let suggestions = [];
    
    // Mostrar sugestões ao focar
    inputElement.addEventListener('focus', () => {
        if (inputElement.value.length >= 1) {
            filtrarSugestoes(inputElement.value);
        }
    });
    
    // Filtrar ao digitar
    inputElement.addEventListener('input', (e) => {
        const valor = e.target.value.trim();
        if (valor.length >= 1) {
            filtrarSugestoes(valor);
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Navegação com teclado
    inputElement.addEventListener('keydown', (e) => {
        if (suggestionsContainer.style.display === 'none') return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
            atualizarSelecao();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            atualizarSelecao();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                selecionarSugestao(suggestions[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Esconder ao clicar fora
    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    function filtrarSugestoes(query) {
        const queryLower = query.toLowerCase();
        suggestions = escolasList.filter(escola => 
            escola.toLowerCase().includes(queryLower)
        ).slice(0, 10); // Limita a 10 sugestões
        
        renderizarSugestoes();
    }
    
    function renderizarSugestoes() {
        suggestionsContainer.innerHTML = '';
        selectedIndex = -1;
        
        if (suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        suggestions.forEach((escola, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-suggestion';
            item.textContent = escola;
            item.style.cssText = `
                padding: 0.5rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
                color: var(--text-primary);
                font-size: 0.875rem;
            `;
            
            item.addEventListener('mouseenter', () => {
                selectedIndex = index;
                atualizarSelecao();
            });
            
            item.addEventListener('click', () => {
                selecionarSugestao(escola);
            });
            
            suggestionsContainer.appendChild(item);
        });
        
        suggestionsContainer.style.display = 'block';
    }
    
    function atualizarSelecao() {
        const items = suggestionsContainer.querySelectorAll('.autocomplete-suggestion');
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.style.background = 'var(--primary-color)';
                item.style.color = 'white';
            } else {
                item.style.background = '';
                item.style.color = '';
            }
        });
    }
    
    function selecionarSugestao(escola) {
        inputElement.value = escola;
        suggestionsContainer.style.display = 'none';
        inputElement.focus();
    }
}

// ============================================
// Utilitários
// ============================================

function log(message, data = null) {
    console.log(`[Extrator] ${message}`, data || '');
}

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
