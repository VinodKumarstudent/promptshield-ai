import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from .models import AnalyzeRequest, AnalyzeResponse
from .analyzer import analyze_message
from .samples import SAMPLE_MESSAGES

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("promptshield.api")

app = FastAPI(
    title="PromptShield API",
    description="Explainable Generative AI for Scam Detection and Digital Safety",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and external hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PromptShield AI",
        "has_claude_key": bool(os.getenv("ANTHROPIC_API_KEY")),
        "has_openai_key": bool(os.getenv("OPENAI_API_KEY")),
        "has_gemini_key": bool(os.getenv("GEMINI_API_KEY")),
    }


@app.get("/samples")
async def get_samples():
    """Return pre-configured sample messages for one-click testing"""
    return SAMPLE_MESSAGES


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(request: AnalyzeRequest):
    """
    Primary endpoint: Analyzes suspicious email, SMS, job offer, or message.
    Executes rule-based checks + Generative AI analysis with explainable red flags.
    """
    if not request.message or len(request.message.strip()) < 3:
        raise HTTPException(status_code=400, detail="Please provide a message with at least 3 characters.")

    try:
        response = await analyze_message(request)
        return response
    except Exception as e:
        logger.error(f"Error analyzing message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal analysis error. Please try again.")


# Mount built frontend if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Prevent path traversal outside frontend_dist
        safe_full_path = full_path.lstrip("/")
        target_file = os.path.abspath(os.path.join(frontend_dist, safe_full_path))
        if os.path.commonpath([frontend_dist, target_file]) == frontend_dist and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index file not found")
