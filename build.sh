#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Building frontend assets..."
cd frontend
npm install
npm run build
cd ..

echo "==> Copying frontend dist to backend dist..."
mkdir -p backend/dist
cp -r frontend/dist/* backend/dist/

echo "==> Installing Python dependencies..."
cd backend
pip install -r requirements.txt
python init_db.py
cd ..

echo "==> Build complete!"
