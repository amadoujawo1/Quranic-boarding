FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

# --- Install Python backend ---
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built React dist from frontend-build stage into backend/dist so Flask can serve it
COPY --from=frontend-build /app/frontend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 10000

CMD ["sh", "-c", "python init_db.py && gunicorn --bind 0.0.0.0:${PORT:-10000} wsgi:app"]
