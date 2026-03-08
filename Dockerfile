FROM python:3.10-slim

WORKDIR /app

# Instalar dependências do sistema (apenas curl para healthcheck)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicação
COPY . .

# Criar pasta de uploads e ajustar permissões
RUN mkdir -p uploads && \
    useradd -m appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expor porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Variáveis de ambiente padrão
ENV FLASK_DEBUG=false \
    PYTHONUNBUFFERED=1

# Comando de inicialização
CMD ["python3", "app.py"]