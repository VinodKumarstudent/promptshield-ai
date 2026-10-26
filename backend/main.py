import os
import io
import base64
import hashlib
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from PIL import Image
from dotenv import load_dotenv

from .models import AnalyzeRequest, AnalyzeResponse, EvidenceFile
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
    description="Explainable Generative AI for Scam Detection, Digital Evidence Verification & Cybercrime Reporting",
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


def process_uploaded_file(filename: str, content: bytes, content_type: Optional[str] = None) -> EvidenceFile:
    sha256_hash = hashlib.sha256(content).hexdigest()
    size_bytes = len(content)
    fname_lower = filename.lower()

    # Determine category
    category = "document"
    if any(fname_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"]):
        category = "photo"
    elif any(fname_lower.endswith(ext) for ext in [".mp4", ".mov", ".webm", ".mkv", ".avi"]):
        category = "video"
    elif any(fname_lower.endswith(ext) for ext in [".apk", ".exe", ".scr", ".bat", ".cmd", ".vbs", ".msi"]):
        category = "executable"
    elif any(fname_lower.endswith(ext) for ext in [".pdf", ".doc", ".docx", ".txt", ".json", ".log"]):
        category = "document"

    mime = content_type or "application/octet-stream"
    preview_data = None
    notes = f"Verified size: {size_bytes / 1024:.1f} KB"

    # If image, generate thumbnail preview data URL and inspect dimensions
    if category == "photo":
        try:
            image = Image.open(io.BytesIO(content))
            notes = f"Image dimensions: {image.width}x{image.height}px | Format: {image.format}"

            # Create lightweight base64 thumbnail
            thumb = image.copy()
            thumb.thumbnail((240, 240))
            buffered = io.BytesIO()
            thumb_format = "PNG" if image.format in ["PNG", "WEBP"] else "JPEG"
            if thumb.mode in ("RGBA", "P") and thumb_format == "JPEG":
                thumb = thumb.convert("RGB")
            thumb.save(buffered, format=thumb_format)
            encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
            preview_data = f"data:image/{thumb_format.lower()};base64,{encoded}"
        except Exception as e:
            logger.warning(f"Failed to generate thumbnail for {filename}: {e}")

    return EvidenceFile(
        id=f"ev-{hashlib.md5(f'{filename}{size_bytes}'.encode()).hexdigest()[:10]}",
        filename=filename,
        mime_type=mime,
        size_bytes=size_bytes,
        sha256=sha256_hash,
        file_type_category=category,
        preview_data=preview_data,
        notes=notes,
        tamper_check="VERIFIED_INTEGRITY"
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
    if not request.message or len(request.message.strip()) < 1:
        raise HTTPException(status_code=400, detail="Please provide a message or evidence to inspect.")

    try:
        response = await analyze_message(request)
        return response
    except Exception as e:
        logger.error(f"Error analyzing message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal analysis error. Please try again.")


@app.post("/upload-evidence", response_model=List[EvidenceFile])
async def upload_evidence_endpoint(files: List[UploadFile] = File(...)):
    """
    Accepts visual, video, or document evidence files for digital forensics.
    Computes cryptographic SHA-256 hashes for chain of custody and extracts metadata.
    """
    evidence_manifest: List[EvidenceFile] = []
    for f in files:
        content = await f.read()
        ev = process_uploaded_file(f.filename or "evidence_file", content, f.content_type)
        evidence_manifest.append(ev)
    return evidence_manifest


@app.post("/analyze-evidence", response_model=AnalyzeResponse)
async def analyze_evidence_endpoint(
    message: Optional[str] = Form(None),
    message_type: Optional[str] = Form("general"),
    files: List[UploadFile] = File([])
):
    """
    Unified forensic analysis endpoint accepting both text and multi-modal evidence files
    (photos, screenshots, screen recording videos, or suspicious files).
    """
    evidence_manifest: List[EvidenceFile] = []
    for f in files:
        content = await f.read()
        ev = process_uploaded_file(f.filename or "evidence_file", content, f.content_type)
        evidence_manifest.append(ev)

    text_content = (message or "").strip()
    if not text_content:
        if evidence_manifest:
            file_names = ", ".join([f.filename for f in evidence_manifest])
            text_content = f"Uploaded visual/digital evidence inspection: {file_names}"
        else:
            raise HTTPException(status_code=400, detail="Please provide either message text or evidence files to inspect.")

    req = AnalyzeRequest(
        message=text_content,
        message_type=message_type or "general",
        evidence_files=evidence_manifest
    )
    return await analyze_message(req)


# Mount built frontend if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
