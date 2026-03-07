"FROM python:3.10-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-por \
    libtesseract-dev \
    libleptonica-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements_final.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements_final.txt

# Copiar aplicação
COPY . .

# Criar pasta de uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c \"import requests; requests.get('http://localhost:5000/api/health')\" || exit 1

# Comando de inicialização
CMD [\"python3\", \"app.py\"]
"