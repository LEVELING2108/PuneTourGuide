FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    WEB_CONCURRENCY=2

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py dsa_engine.py ./
RUN useradd --system --no-create-home safety
USER safety

EXPOSE 8000
CMD ["sh", "-c", "gunicorn main:app --workers ${WEB_CONCURRENCY} --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT} --forwarded-allow-ips '*'"]
