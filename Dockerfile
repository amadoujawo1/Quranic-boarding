FROM python:3.11-slim

# Install Node.js 20 + system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Build React frontend ---
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend/ ./frontend/
# Only build if dist doesn't exist (for faster deploys when dist is pre-built)
RUN cd frontend && (test -d dist || npm run build)

# --- Install Python backend ---
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy React build into backend/dist so Flask can serve it
RUN rm -rf backend/dist && cp -r frontend/dist backend/dist


WORKDIR /app/backend

EXPOSE 10000

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-10000} wsgi:app"]
