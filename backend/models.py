from typing import List, Optional
from pydantic import BaseModel, Field


class EvidenceFile(BaseModel):
    id: str = Field(..., description="Unique evidence identifier")
    filename: str = Field(..., description="Original filename of the evidence")
    mime_type: str = Field(..., description="MIME content type (e.g. image/png, video/mp4, application/pdf)")
    size_bytes: int = Field(..., description="Exact file size in bytes")
    sha256: str = Field(..., description="Cryptographic SHA-256 integrity hash for court-admissible chain of custody")
    file_type_category: str = Field("photo", description="'photo', 'video', 'document', or 'executable'")
    preview_data: Optional[str] = Field(None, description="Base64/data URL thumbnail or preview if applicable")
    notes: Optional[str] = Field(None, description="User note or extracted description of evidence")
    tamper_check: str = Field("VERIFIED_INTEGRITY", description="Tamper proof validation status")


class CybercrimeDossier(BaseModel):
    dossier_id: str = Field(..., description="Formal reference ID e.g. PS-CYBER-2026-XXXX")
    generated_at: str = Field(..., description="ISO 8601 timestamp of evidence capture")
    incident_type: str = Field(..., description="Official Cybercrime Classification Category")
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="'safe', 'suspicious', or 'likely_scam'")
    summary: str = Field(..., description="Executive incident summary for investigating officer")
    evidence_manifest: List[EvidenceFile] = Field(default_factory=list, description="Cryptographic chain of custody manifest")
    it_act_sections: List[str] = Field(default_factory=list, description="Applicable Indian IT Act 2000 & BNS 2023 legal sections")
    portal_submission_ready: bool = Field(True, description="Ready for direct upload to cybercrime.gov.in")
    reporting_guidelines: List[str] = Field(default_factory=list, description="Guidelines for reporting to 1930 / portal")


class AnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Suspicious message, SMS, email, or job offer text")
    message_type: Optional[str] = Field("general", description="email, sms, job_offer, payment_upi, delivery, lottery, or general")
    evidence_files: Optional[List[EvidenceFile]] = Field(default_factory=list, description="Uploaded photos, videos, or documents")


class RedFlag(BaseModel):
    quote: str = Field(..., description="Exact or close quote from the message")
    reason: str = Field(..., description="Explainable reason why this phrase is suspicious")


class RuleFinding(BaseModel):
    category: str
    severity: str  # high, medium, low
    description: str
    matched_phrases: List[str] = []


class AnalyzeResponse(BaseModel):
    risk_level: str = Field(..., description="'safe', 'suspicious', or 'likely_scam'")
    risk_score: int = Field(..., ge=0, le=100, description="Risk score from 0 (safe) to 100 (high risk)")
    scam_type: str = Field(..., description="Classification category (e.g., Banking Phishing, Delivery Fee Scam, etc.)")
    red_flags: List[RedFlag] = Field(default_factory=list, description="Specific identified red flags")
    explanation: str = Field(..., description="Simple, clear plain-language explanation (3-4 sentences)")
    safe_next_steps: List[str] = Field(default_factory=list, description="Recommended safe actions checklist")
    what_not_to_do: List[str] = Field(default_factory=list, description="Actions that could put the user at risk")
    rule_findings: Optional[List[RuleFinding]] = Field(default_factory=list, description="Findings from heuristic rule checks")
    engine_used: Optional[str] = Field("ai_engine", description="Backend analysis engine used")
    evidence_manifest: Optional[List[EvidenceFile]] = Field(default_factory=list, description="Chain-of-custody verified evidence files")
    dossier: Optional[CybercrimeDossier] = Field(None, description="Official Cybercrime Incident Reporting Dossier")
