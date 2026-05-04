FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# Increase pip network resilience for large wheels (e.g., torch)
ENV PIP_DEFAULT_TIMEOUT=600 \
    PIP_RETRIES=5 \
    PIP_PROGRESS_BAR=off

RUN pip install --no-cache-dir --timeout=600 --retries=5 -r requirements.txt

# Copy the backend source code
COPY . .

# Install your package with CLI entrypoint
RUN pip install -e .

EXPOSE 8000
CMD ["uvicorn", "snn_ai_optimizer.app:app", "--host", "0.0.0.0", "--port", "8000"]
