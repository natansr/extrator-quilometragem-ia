# Extrator de Quilometragem com Tesseract OCR

Script Python para extração de quilometragem de fotos de painéis de veículos usando Tesseract OCR.

## 📋 Pré-requisitos

### 1. Instalar Tesseract OCR

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-por
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install -y tesseract tesseract-langpack-por
```

**macOS:**
```bash
brew install tesseract
```

**Windows:**
1. Baixe o instalador em: https://github.com/UB-Mannheim/tesseract/wiki
2. Execute o instalador e adicione o caminho do Tesseract às variáveis de ambiente

### 2. Instalar Dependências Python

```bash
pip install -r requirements.txt
```

Ou manualmente:
```bash
pip install pytesseract opencv-python numpy
```

## 🚀 Como Usar

### Processar todas as imagens na pasta atual:
```bash
python extrator_quilometragem.py
```

### Processar uma imagem específica:
```python
from extrator_quilometragem import process_image

resultado = process_image('caminho/para/imagem.jpg')
print(f"Quilometragem: {resultado['kilometrage']}")
```

### Processar pasta personalizada:
```python
from extrator_quilometragem import process_all_images

resultados = process_all_images(folder_path='./fotos', pattern='*.jpg')
```

## 📁 Estrutura do Projeto

```
.
├── extrator_quilometragem.py    # Script principal
├── requirements.txt             # Dependências Python
├── README.md                    # Este arquivo
├── check_deps.py               # Script de verificação de dependências
└── *.jpg                       # Imagens de exemplo
```

## 🔧 Funcionalidades

- ✅ Pré-processamento de imagem (escala de cinza, blur, threshold, dilatação)
- ✅ Extração de texto com Tesseract OCR
- ✅ Identificação automática de padrões de quilometragem
- ✅ Suporte a múltiplos formatos (km, KM, Km)
- ✅ Processamento em lote de múltiplas imagens
- ✅ Exportação de resultados para arquivo

## 📊 Padrões de Quilometragem Suportados

- `12345 km`
- `12.345 KM`
- `123,456 km`
- `12345` (apenas números com 5-7 dígitos)

## ⚠️ Notas Importantes

1. **Qualidade da Imagem:** Imagens com melhor iluminação e contraste produzem melhores resultados
2. **Ângulo da Foto:** Fotos tiradas frontalmente ao painel têm melhor precisão
3. **Resolução:** Imagens de maior resolução geralmente funcionam melhor
4. **Idioma:** O script está configurado para português, mas pode ser ajustado

## 🔍 Solução de Problemas

### Tesseract não encontrado:
```bash
# Verificar instalação
tesseract --version

# Se não estiver no PATH, especificar caminho no Python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### Baixa precisão no OCR:
- Melhore a iluminação da foto
- Use imagens com maior resolução
- Ajuste os parâmetros de pré-processamento no script

## 📝 Próximas Evoluções

- [ ] Treinamento customizado do Tesseract para painéis específicos
- [ ] Detecção automática da região do odômetro
- [ ] Suporte a múltiplos formatos de painel
- [ ] Interface gráfica (GUI)
- [ ] API REST para integração

## 📄 Licença

Uso livre para desenvolvimento e testes.
