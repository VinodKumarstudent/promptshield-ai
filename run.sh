#!/bin/bash
# PromptShield - Hackathon Unified Runner Script

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🛡️  Starting PromptShield - Digital Safety & Scam Detection"
echo "=========================================================="

# Check Python virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r backend/requirements.txt
fi

# Check frontend build
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend static assets..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Load environment variables if .env exists
if [ -f "backend/.env" ]; then
    export $(grep -v '^#' backend/.env | xargs)
fi

PORT=${PORT:-8000}
HOST=${HOST:-0.0.0.0}

echo ""
echo "🚀 PromptShield server running on: http://localhost:$PORT"
echo "📊 API Documentation (Swagger):    http://localhost:$PORT/docs"
echo "🧪 Running with AI Engine:         ${ANTHROPIC_API_KEY:+Claude LLM}${OPENAI_API_KEY:+OpenAI GPT}${GEMINI_API_KEY:+Gemini LLM}${ANTHROPIC_API_KEY:-${OPENAI_API_KEY:-${GEMINI_API_KEY:-PromptShield Heuristic AI Engine (Zero-Config)}}}${ANTHROPIC_API_KEY:+ }"
echo "=========================================================="
echo ""

exec ./venv/bin/uvicorn backend.main:app --host "$HOST" --port "$PORT" --reload
