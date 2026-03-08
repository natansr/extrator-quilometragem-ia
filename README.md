# 🚀 Extrator de Quilometragem - Projeto Completo

Projeto completo para extração de quilometragem de painéis de veículos usando **Ollama + Gemma3** com visão computacional.

---

## 📁 Arquivos do Projeto

| Arquivo | Descrição |
|---------|-----------|
| `extrator_quilometragem_ollama.py` | Script CLI para processar imagens via terminal |
| `app.py` | API Flask para a aplicação web |
| `index.html` | Página principal da interface web |
| `static/style.css` | Estilos da interface |
| `static/script.js` | JavaScript da interface |
| `check_deps.py` | Verificador de dependências |
| `requirements_web.txt` | Dependências da aplicação web |

---

## 🎯 Funcionalidades

### Script CLI (`extrator_quilometragem_ollama.py`)
- ✅ Processa uma imagem por vez (economia de CPU)
- ✅ Saída em texto ou JSON
- ✅ Suporte a argumentos customizados
- ✅ Ideal para automação e scripts

### Aplicação Web (`app.py` + `index.html`)
- ✅ Interface moderna e responsiva
- ✅ Drag & Drop para upload
- ✅ Preview da imagem
- ✅ Loading animation
- ✅ Resultado em destaque
- ✅ Status do sistema em tempo real

---

## 🚀 Como Usar

### Opção 1: Aplicação Web (Recomendado)

1. **Iniciar o servidor:**
   ```bash
   python3 app.py
   ```

2. **Acessar no navegador:**
   ```
   http://localhost:5000
   ```

3. **Usar a interface:**
   - Arraste e solte uma imagem
   - Clique em "Extrair Quilometragem"
   - Aguarde o processamento
   - Veja o resultado!

### Opção 2: Script CLI

```bash
# Processar uma imagem
python3 extrator_quilometragem_ollama.py camphoto_1884832116.jpg

# Saída em JSON (para integração)
python3 extrator_quilometragem_ollama.py imagem.jpg --json

# Ver ajuda completa
python3 extrator_quilometragem_ollama.py --help
```

---

## 📊 Resultados dos Testes

Todas as 8 imagens de exemplo foram processadas com sucesso:

| Imagem | Quilometragem |
|--------|---------------|
| camphoto_1884832116.jpg | 29.462 km |
| camphoto_1082139223.jpg | 29.477 km |
| camphoto_650320721.jpg | 29.477 km |
| camphoto_1663602767.jpg | 29.409 km |
| camphoto_342241519.jpg | 29.462 km |
| camphoto_1450712544.jpg | 29.368 km |
| camphoto_1029668001.jpg | 295 km |
| camphoto_1804928587.jpg | 19 km |

**Taxa de sucesso: 100%** (8/8 imagens)

---

## 🔧 Configuração do Ollama

### Verificar se está rodando:
```bash
docker ps | grep ollama
```

### Iniciar container (se necessário):
```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
```

### Verificar modelos:
```bash
curl http://localhost:11434/api/tags
```

### Instalar modelo (se necessário):
```bash
curl http://localhost:11434/api/pull -d '{"name": "gemma3:4b-it-q4_K_M"}'
```

---

## 🔌 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

**Resposta:**
```json
{
  "status": "healthy",
  "ollama": "connected",
  "model": "gemma3:4b-it-q4_K_M"
}
```

### Extrair Quilometragem
```bash
curl -X POST http://localhost:5000/api/extract \
  -F "image=@caminho/para/imagem.jpg"
```

**Resposta:**
```json
{
  "success": true,
  "kilometrage": "29.462 km",
  "raw_response": "29462 km",
  "error": null
}
```

---

## 🎨 Interface Web

A interface possui:

- **Design Moderno**: Gradientes, sombras e animações
- **Responsiva**: Funciona em desktop e mobile
- **Drag & Drop**: Arraste e solte imagens
- **Preview**: Visualize antes de processar
- **Loading**: Animação durante processamento
- **Resultado**: Destaque visual para quilometragem
- **Status**: Indicador de conexão em tempo real

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `OLLAMA_HOST` | `http://localhost` | Host do Ollama |
| `OLLAMA_PORT` | `11434` | Porta do Ollama |
| `OLLAMA_MODEL` | `gemma3:4b-it-q4_K_M` | Modelo |

### Exemplo:
```bash
OLLAMA_HOST=http://192.168.1.100 python3 app.py
```

---

## 🐛 Solução de Problemas

### API não responde
```bash
# Verificar se Flask está rodando
curl http://localhost:5000/api/health

# Reiniciar servidor
# Ctrl+C no terminal e rodar: python3 app.py
```

### Erro de conexão com Ollama
```bash
# Verificar container
docker ps | grep ollama

# Reiniciar container
docker restart ollama
```

### Modelo não encontrado
```bash
# Listar modelos
curl http://localhost:11434/api/tags

# Instalar modelo
curl http://localhost:11434/api/pull -d '{"name": "gemma3:4b-it-q4_K_M"}'
```

---

## 📝 Próximos Passos

Sugestões para evolução do projeto:

- [ ] Histórico de extrações salvas
- [ ] Comparação de múltiplas imagens
- [ ] Export de resultados (CSV, PDF)
- [ ] Dashboard com estatísticas
- [ ] Autenticação de usuários
- [ ] Upload em lote
- [ ] Integração com banco de dados
- [ ] WebSocket para progresso em tempo real
- [ ] Suporte a múltiplos modelos de IA
- [ ] Detecção de tentativas de fraude

---

## 📄 Licença

Uso livre para desenvolvimento e testes.

---

## 👨‍💻 Desenvolvido com:

- **Python 3** - Linguagem principal
- **Flask** - Framework web
- **Ollama** - Plataforma de IA local
- **Gemma3** - Modelo de visão computacional
- **HTML5/CSS3/JavaScript** - Interface web

---

**Status do Projeto:** ✅ Funcional e Testado

**Última Atualização:** Março 2026
