FROM python:3.11-slim

WORKDIR /app

# --- Install Python backend ---
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy pre-built React dist into backend/dist so Flask can serve it
# The dist/ is committed to git and built locally before pushing
COPY frontend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 10000

CMD ["sh", "-c", "python init_db.py && gunicorn --bind 0.0.0.0:${PORT:-10000} wsgi:app"]
