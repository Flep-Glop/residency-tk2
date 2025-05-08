FROM python:3.10-slim

WORKDIR /app

# Copy requirements.txt first for better layer caching
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend directory contents into the container
COPY backend/ .

EXPOSE 8000

# Use $PORT environment variable which Railway provides
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"] 