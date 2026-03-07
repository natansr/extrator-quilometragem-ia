# Extrator de Quilometragem - Aplicação Web

Aplicação web completa para extração de quilometragem de painéis de veículos usando **Ollama + Gemma3** com visão computacional.

## 🖥️ Interface

A aplicação possui uma interface moderna e responsiva com:
- ✅ Drag & Drop para upload de imagens
- ✅ Preview da imagem antes do processamento
- ✅ Animações de loading durante o processamento
- ✅ Exibição clara do resultado
- ✅ Status do sistema em tempo real
- ✅ Design responsivo (mobile-friendly)

## 📋 Pré-requisitos

### 1. Container Ollama Rodando

```bash
# Verificar se está rodando
docker ps | grep ollama

# Iniciar se necessário
docker run -d -p 11434:11434 --name ollama ollama/ollama
```

### 2. Modelo Gemma3 Disponível

```bash
# Verificar modelos
curl http://localhost:11434/api/tags

# Pull do modelo (se necessário)
curl http://localhost:11434/api/pull -d '{"name": "gemma3:4b-it-q4_K_M"}'
```

### 3. Dependências Python

```bash
pip install -r requirements_web.txt
```

## 🚀 Como Usar

### Iniciar a Aplicação Web

```bash
python app.py
```

A aplicação será iniciada em: **http://localhost:5000**

### Usando o Script CLI

Para processar uma única imagem via linha de comando:

```bash
python extrator_quilometragem_ollama.py imagem.jpg
```

### Opções do CLI

```bash
# Ver ajuda
python extrator_quilometragem_ollama.py --help

# Processar imagem específica
python extrator_quilometragem_ollama.py ./fotos/painel.jpg

# Saída em JSON (para integração)
python extrator_quilometragem_ollama.py imagem.jpg --json

# Usar Ollama em outro servidor
python extrator_quilometragem_ollama.py imagem.jpg --host http://192.168.1.100 --port 11434

# Modo silencioso
python extrator_quilometragem_ollama.py imagem.jpg --quiet
```

## 📁 Estrutura do Projeto

```
.
├── app.py                          # API Flask
├── extrator_quilometragem_ollama.py # Script CLI
├── index.html                      # Página principal
├── static/
│   ├── style.css                   # Estilos
│   └── script.js                   # JavaScript
├── uploads/                        # Pasta temporária de uploads
├── requirements_web.txt            # Dependências web
├── README_WEB.md                   # Este arquivo
└── *.jpg                           # Imagens de exemplo
```

## 🔌 API Endpoints

### POST /api/extract

Extrai quilometragem de uma imagem.

**Request:**
```http
POST /api/extract
Content-Type: multipart/form-data

image: <file>
```

**Response:**
```json
{
  "success": true,
  "kilometrage": "29.462 km",
  "raw_response": "29462 km",
  "error": null
}
```

### GET /api/health

Verifica saúde da API e conexão com Ollama.

**Response:**
```json
{
  "status": "healthy",
  "ollama": "connected",
  "model": "gemma3:4b-it-q4_K_M"
}
```

## 🎨 Recursos da Interface

### Upload de Imagem
- **Drag & Drop**: Arraste e solte a imagem na área designada
- **Click to Upload**: Clique para abrir o seletor de arquivos
- **Preview**: Visualize a imagem antes de processar
- **Validação**: Formatos suportados (JPG, PNG, GIF, WEBP) e tamanho máximo (10MB)

### Processamento
- **Loading Animation**: Spinner animado durante o processamento
- **Status em Tempo Real**: Indicador de conexão com Ollama
- **Timeout**: 120 segundos para processamento de imagens

### Resultados
- **Destaque Visual**: Quilometragem em grande destaque
- **Resposta Completa**: Texto original retornado pela IA
- **Nova Extração**: Botão para processar outra imagem

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `OLLAMA_HOST` | `http://localhost` | Host do Ollama |
| `OLLAMA_PORT` | `11434` | Porta do Ollama |
| `OLLAMA_MODEL` | `gemma3:4b-it-q4_K_M` | Modelo de visão |

### Exemplo de Uso

```bash
OLLAMA_HOST=http://192.168.1.100 OLLAMA_PORT=11434 python app.py
```

## 🐛 Solução de Problemas

### Erro: "Não foi possível conectar ao Ollama"

1. Verifique o container:
   ```bash
   docker ps | grep ollama
   ```

2. Teste a conexão:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. Reinicie o container:
   ```bash
   docker restart ollama
   ```

### Erro: "Modelo não encontrado"

```bash
# Listar modelos disponíveis
curl http://localhost:11434/api/tags

# Baixar o modelo
curl http://localhost:11434/api/pull -d '{"name": "gemma3:4b-it-q4_K_M"}'
```

### Interface não carrega

1. Verifique se a API está rodando:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Verifique as portas:
   ```bash
   netstat -tlnp | grep -E '5000|11434'
   ```

### Imagem não processa

- Verifique o formato (JPG, PNG, GIF, WEBP)
- Verifique o tamanho (máximo 10MB)
- Verifique os logs da aplicação

## 📊 Comparação de Abordagens

| Recurso | CLI Script | Web App |
|---------|-----------|---------|
| Interface | Terminal | Gráfica |
| Upload | Argumento | Drag & Drop |
| Saída | Texto/JSON | Visual |
| Integração | JSON | API REST |
| Uso | Automático | Manual |

## 🔐 Segurança

- ✅ Validação de tipo de arquivo
- ✅ Limpeza automática de uploads
- ✅ Timeout nas requisições
- ✅ CORS configurado
- ✅ Sem persistência de imagens

## 📝 Próximas Funcionalidades

- [ ] Histórico de extrações
- [ ] Export de resultados (CSV, JSON)
- [ ] Comparação de múltiplas imagens
- [ ] Autenticação de usuário
- [ ] Dashboard com estatísticas
- [ ] Integração com banco de dados
- [ ] Upload em lote
- [ ] WebSocket para progresso em tempo real

## 📄 Licença

Uso livre para desenvolvimento e testes.
