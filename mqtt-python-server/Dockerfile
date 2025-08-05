FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including gcc and python3-dev
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
        netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Add execute permission to wait script
RUN chmod +x wait-for-it.sh

# Create a non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

CMD ["python", "app.py"]