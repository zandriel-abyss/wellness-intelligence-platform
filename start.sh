#!/usr/bin/env bash
# Wellness Intelligence Platform — one-command launch (Mac/Linux)
# Run from project root: ./start.sh

set -e
cd "$(dirname "$0")"
ROOT="$(pwd)"

echo "=============================================="
echo "  Wellness Intelligence Platform — Launch"
echo "=============================================="
echo ""

# Prerequisites
if ! command -v node &>/dev/null; then
  echo "Error: Node.js is required. Install from https://nodejs.org"
  exit 1
fi
if ! command -v docker &>/dev/null; then
  echo "Error: Docker is required. Install Docker Desktop or Docker Engine."
  exit 1
fi
echo "✓ Node $(node -v) and Docker found"
echo ""

# Create .env from example if missing
if [ ! -f backend/.env ]; then
  echo "Creating backend/.env from .env.example (first-time setup)..."
  cp backend/.env.example backend/.env
  echo "✓ backend/.env created. You can edit it to add your MISTRAL_API_KEY."
else
  echo "✓ backend/.env exists"
fi
echo ""

# Install dependencies if needed
if [ ! -d node_modules ] || [ ! -d backend/node_modules ] || [ ! -d frontend/node_modules ]; then
  echo "Installing dependencies (root, backend, frontend)..."
  npm install 2>/dev/null || true
  (cd backend && npm install)
  (cd frontend && npm install)
fi
echo "✓ Dependencies ready"
echo ""

# Start database
echo "Starting PostgreSQL (Docker)..."
docker compose up db -d 2>/dev/null || docker-compose up db -d 2>/dev/null || true
echo "Waiting for database to be ready..."
sleep 5
echo "✓ Database starting"
echo ""

# Run migrations
echo "Applying database migrations..."
(cd backend && npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init --skip-generate 2>/dev/null || true)
echo "✓ Migrations done"
echo ""

# Optional: seed demo users (non-blocking)
if [ ! -f backend/.seed-done ]; then
  echo "Seeding demo users (optional)..."
  (cd backend && npx prisma db seed 2>/dev/null) && touch backend/.seed-done || true
fi
echo ""

echo "=============================================="
echo "  Starting backend + frontend..."
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo "=============================================="
echo ""
echo "Opening browser in ~10 seconds. Press Ctrl+C to stop both servers."
echo ""

# Open browser after delay (background)
(sleep 10 && (open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || true)) &

# Run both servers (concurrently); Ctrl+C will stop both
npm run dev
