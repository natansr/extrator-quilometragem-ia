# Extrator de Quilometragem com Ollama + Gemma3 (Visão)

Script Python para extração de quilometragem de fotos de painéis de veículos usando **Ollama** com o modelo **Gemma3** que possui capacidade de visão computacional.

## 📋 Pré-requisitos

### 1. Container Ollama Rodando

O container do Ollama deve estar rodando localmente na porta **11434**.

**Verificar se o container está rodando:**
```bash
docker ps | grep ollama
```

**Iniciar container (se necessário):**
```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
```

### 2. Modelo Gemma3 Disponível

O modelo `gemma3:4b-it-q4_K_M` deve estar disponível no Ollama.

**Verificar modelos disponíveis:**
```bash
curl http://localhost:11434/api/tags
```

**Baixar o modelo (se necessário):**
```bash
curl http://localhost:11434/api/pull -d '{"name": "gemma3:4b-it-q4_K_M"}'
```

### 3. Dependências Python

```bash
pip install -r requirements_ollama.txt
```

Ou manualmente:
```bash
pip install requests
```

## 🚀 Como Usar

### Processar todas as imagens na pasta atual:
```bash
python extrator_quilometragem_ollama.py
```

### Usar como módulo Python:
```python
from extrator_quilometragem_ollama import OllamaKilometrageExtractor

# Criar extrator
extractor = OllamaKilometrageExtractor(
    ollama_host='http://localhost',
    ollama_port=11434,
    model='gemma3:4b-it-q4_K_M'
)

# Verificar conexão
if extractor.check_connection():
    # Processar imagem
    resultado = extractor.extract_from_image('caminho/para/imagem.jpg')
    
    if resultado['success']:
        print(f"Quilometragem: {resultado['kilometrage']}")
        print(f"Resposta completa: {resultado['raw_response']}")
    else:
        print(f"Erro: {resultado['error']}")
```

### Processar pasta personalizada:
```python
from extrator_quilometragem_ollama import process_all_images_ollama

resultados = process_all_images_ollama(
    folder_path='./fotos',
    pattern='*.jpg',
    ollama_host='http://localhost',
    ollama_port=11434,
    model='gemma3:4b-it-q4_K_M'
)
```

## 📁 Estrutura do Projeto

```
.
├── extrator_quilometragem_ollama.py  # Script principal (Ollama)
├── extrator_quilometragem.py         # Script alternativo (Tesseract)
├── requirements_ollama.txt           # Dependências Python (Ollama)
├── requirements.txt                  # Dependências Python (Tesseract)
├── README_OLLAMA.md                  # Este arquivo
├── README.md                         # README do Tesseract
├── check_deps.py                     # Verificação de dependências
└── *.jpg                             # Imagens de exemplo
```

## 🔧 Configurações Personalizáveis

### Parâmetros do Extrator:

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `ollama_host` | `http://localhost` | Host do Ollama |
| `ollama_port` | `11434` | Porta da API do Ollama |
| `model` | `gemma3:4b-it-q4_K_M` | Modelo de visão a usar |

### Exemplo com configurações customizadas:
```python
extractor = OllamaKilometrageExtractor(
    ollama_host='http://192.168.1.100',  # Ollama em outro servidor
    ollama_port=11434,
    model='gemma3:4b-it-q4_K_M'
)
```

## 🔍 Prompt Utilizado

O prompt enviado ao modelo é:

```
Esta imagem se trata de um painel de um veículo, nosso foco é ler o valor em 
quilometragem que o odometro está exibindo, normalmente a quilometragem é dada 
em multiplos de mil. A resposta deverá ser: xxxxxxx km
```

## 📊 Formato de Saída

A quilometragem extraída é formatada como:
- `12345 km`
- `123.456 km`
- `1.234.567 km`

## ⚙️ Opções da API Ollama

O script utiliza as seguintes opções para o modelo:

```python
'options': {
    'temperature': 0.1,  # Baixa para respostas consistentes
    'top_p': 0.9
}
```

## 🐛 Solução de Problemas

### Erro: "Não foi possível conectar ao Ollama"

1. Verifique se o container está rodando:
   ```bash
   docker ps | grep ollama
   ```

2. Verifique se a porta 11434 está exposta:
   ```bash
   docker port ollama
   ```

3. Teste a conexão manualmente:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Erro: "Modelo não encontrado"

1. Liste os modelos disponíveis:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Pull do modelo:
   ```bash
   curl http://localhost:11434/api/pull -d '{"name": "gemma3:4b-it-q4_K_M"}'
   ```

### Timeout na requisição

O timeout está configurado para 120 segundos. Se necessário, ajuste no código:

```python
response = requests.post(
    self.api_endpoint,
    json=payload,
    timeout=120  # Ajuste este valor
)
```

## 📝 Vantagens desta Abordagem

- ✅ **Mais precisa** que OCR tradicional para painéis complexos
- ✅ **Entende contexto** da imagem (odômetro vs outros números)
- ✅ **Tolerante a variações** de iluminação e ângulo
- ✅ **Não requer pré-processamento** de imagem
- ✅ **Funciona com múltiplos formatos** de painel

## 🔄 Comparação: Tesseract vs Ollama

| Característica | Tesseract OCR | Ollama + Gemma3 |
|----------------|---------------|------------------|
| Precisão | Média | Alta |
| Processamento | Rápido | Moderado |
| Requerimento | Pacote system | Container Docker |
| Pré-processamento | Necessário | Não necessário |
| Inteligência | Baixa | Alta (LLM) |

## 📝 Próximas Evoluções

- [ ] Suporte a múltiplos modelos de visão
- [ ] Cache de resultados para imagens repetidas
- [ ] API REST para integração
- [ ] Interface web para upload de imagens
- [ ] Histórico e comparação de leituras
- [ ] Detecção de tentativas de fraude/manipulação

## 📄 Licença

Uso livre para desenvolvimento e testes.
