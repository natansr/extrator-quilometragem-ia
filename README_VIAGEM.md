# Extrator de Quilometragem - Viagem (Saída/Chegada)

## 🆕 Nova Funcionalidade: Controle de Viagem

O sistema agora suporta o fluxo completo de **viagem com imagens de Saída e Chegada**, extraindo automaticamente data, hora e quilometragem de cada imagem.

---

## 📋 Como Funciona

### Fluxo de Viagem:

1. **Upload de 2 Imagens**
   - 1ª imagem: **Saída** (início da viagem)
   - 2ª imagem: **Chegada** (fim da viagem)

2. **Extração Automática**
   - **Saída**: Data, Hora e Odômetro
   - **Chegada**: Data, Hora e Odômetro

3. **Envio para Relatório**
   - Dados são organizados em uma única linha na tabela
   - Campos preenchidos automaticamente

---

## 🚀 Como Usar

### 1. Acessar o Sistema

```
http://localhost:5000
```

### 2. Fazer Upload das Imagens

#### Imagem de SAÍDA (1ª):
- Clique no card "Imagem de SAÍDA" ou arraste a imagem
- A imagem será processada para extrair:
  - ✅ Data da foto (EXIF)
  - ✅ Hora da foto (EXIF)
  - ✅ Quilometragem do odômetro (IA)

#### Imagem de CHEGADA (2ª):
- Clique no card "Imagem de CHEGADA" ou arraste a imagem
- A imagem será processada para extrair:
  - ✅ Data da foto (EXIF)
  - ✅ Hora da foto (EXIF)
  - ✅ Quilometragem do odômetro (IA)

### 3. Extrair Quilometragem

- Clique em **"Extrair Quilometragem"**
- Aguarde o processamento das imagens
- Visualize os resultados separadamente:
  - Card **SAÍDA** com dados completos
  - Card **CHEGADA** com dados completos

### 4. Preencher Origem e Destino

- Campo **📍 Origem**: Local de partida
- Campo **🏁 Destino**: Local de chegada
- Os campos são flexíveis e ajustam o tamanho da fonte automaticamente

### 5. Adicionar ao Relatório

- Clique em **"Adicionar ao Relatório"**
- Uma nova aba será aberta com o relatório
- A linha da tabela será preenchida com:
  - **DATA**: Data da imagem de saída
  - **HORA (Saída)**: Hora da imagem de saída
  - **ODÔMETRO**: Quilometragem de saída
  - **HORA (Chegada)**: Hora da imagem de chegada
  - **KM**: Quilometragem de chegada
  - **Origem/Destino**: "Origem -> Destino"

---

## 📊 Dados Extraídos

### Metadados EXIF:

A biblioteca **ExifRead** extrai automaticamente:

| Campo | Origem | Formato |
|-------|--------|---------|
| Data | EXIF DateTimeOriginal | DD/MM/AA |
| Hora | EXIF DateTimeOriginal | HHhMM |

*Se não houver EXIF, usa data de criação do arquivo*

### Quilometragem:

Extraída via IA (Ollama + Gemma3):

| Campo | Origem | Formato |
|-------|--------|---------|
| Odômetro Saída | IA na imagem de saída | XXXXX km |
| Odômetro Chegada | IA na imagem de chegada | XXXXX km |

---

## 📄 Estrutura do Relatório

Cada viagem gera **uma linha** na tabela:

```
| DATA     | HORA (Saída) | ODÔMETRO | HORA (Chegada) | KM      | Origem/Destino        |
|----------|--------------|----------|----------------|---------|-----------------------|
| 07/03/26 | 08h15        | 29419    | 09h30          | 29462   | Garagem -> Escola ABC |
```

---

## 🎯 Recursos Implementados

### Upload:
- ✅ Dois cards independentes (Saída/Chegada)
- ✅ Drag & Drop em cada card
- ✅ Preview individual das imagens
- ✅ Nome do arquivo abaixo de cada preview
- ✅ Botão para remover cada imagem separadamente

### Processamento:
- ✅ Extração de metadata EXIF (data/hora)
- ✅ Leitura de odômetro via IA
- ✅ Fallback para data do arquivo se não houver EXIF
- ✅ Processamento paralelo das imagens

### Resultados:
- ✅ Cards separados para Saída e Chegada
- ✅ Exibição clara de data, hora e KM
- ✅ Opacidade reduzida se não houver imagem

### Relatório:
- ✅ Campos Origem e Destino separados
- ✅ Fonte dinâmica (ajusta ao tamanho do texto)
- ✅ Envio automático para tabela do relatório
- ✅ Formato "Origem -> Destino"

---

## 🔧 Tecnologias Utilizadas

| Componente | Tecnologia |
|------------|------------|
| Backend | Flask (Python 3) |
| IA | Ollama + Gemma3 |
| Metadata | ExifRead |
| Frontend | HTML5, CSS3, JavaScript |
| Comunicação | Fetch API, postMessage |

---

## 📝 Exemplo de Uso

### Cenário: Viagem para Escola

1. **Saída (08:15)**
   - Foto do odômetro: 29419 km
   - Local: Garagem da SEDF

2. **Chegada (09:30)**
   - Foto do odômetro: 29462 km
   - Local: Escola ABC

3. **Preencher**
   - Origem: "Garagem SEDF"
   - Destino: "Escola ABC"

4. **Enviar**
   - Clicar em "Adicionar ao Relatório"
   - Linha será:
   ```
   | 07/03/26 | 08h15 | 29419 | 09h30 | 29462 | Garagem SEDF -> Escola ABC |
   ```

---

## ⚠️ Notas Importantes

### EXIF Metadata:
- ✅ Funciona com JPG, PNG (com EXIF)
- ⚠️ Algumas câmeras/celulares não salvam EXIF
- 🔄 Fallback: usa data de criação do arquivo

### Imagens:
- 📸 Formato: JPG, PNG, GIF, WEBP
- 📦 Tamanho máximo: 10MB por imagem
- 🔢 Mínimo: 1 imagem (Saída OU Chegada)
- 💡 Ideal: 2 imagens (Saída E Chegada)

### Relatório:
- 💾 Dados salvos no sessionStorage
- 🖨️ Imprimir como PDF a qualquer momento
- ✏️ Todos os campos são editáveis

---

## 🌐 URLs do Sistema

| Página | URL |
|--------|-----|
| **Principal** | `http://localhost:5000` |
| **Relatório** | `http://localhost:5000/relatorio` |
| **Health** | `http://localhost:5000/api/health` |
| **API Extrair** | `http://localhost:5000/api/extract` |

---

## 🐛 Solução de Problemas

### "Servidor não responde":
```bash
# Reiniciar servidor
pkill -f "python3 app.py"
python3 app.py
```

### "Erro ao extrair EXIF":
- Verifique se a imagem tem metadata
- O sistema usará data de criação como fallback

### "IA não reconhece KM":
- Verifique qualidade da imagem
- Iluminação adequada
- Ângulo frontal do odômetro

---

## 📱 Responsividade

- **Desktop**: Cards lado a lado
- **Mobile**: Cards empilhados verticalmente
- **Campos Origem/Destino**: Flexíveis em qualquer tamanho

---

## 🎨 Dicas de Uso

1. ✅ Tire fotos com boa iluminação
2. ✅ Enquadre apenas o odômetro
3. ✅ Mantenha o celular/câmera estável
4. ✅ Preencha Origem e Destino antes de enviar
5. ✅ Revise dados no relatório antes de imprimir

---

**Versão:** 2.0 - Viagem Saída/Chegada  
**Última Atualização:** Março 2026
