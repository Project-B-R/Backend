FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_HOST=0.0.0.0 \
    PORT=8000 \
    DATABASE=/app/data/portfolio.db

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py run_server.py ./
COPY templates ./templates
COPY static ./static
COPY data ./data

EXPOSE 8000

CMD ["python", "run_server.py"]
