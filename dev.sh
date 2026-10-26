#!/bin/bash
# PromptShield - Development Mode (Vite Hot-Reload + FastAPI)

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "Starting Backend on http://localhost:8000..."
./venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting Frontend Vite Dev Server on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
