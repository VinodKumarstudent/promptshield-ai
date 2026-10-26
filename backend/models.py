from typing import List, Optional
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=3, description="Suspicious message, SMS, email, or job offer text")
    message_type: Optional[str] = Field("general", description="email, sms, job_offer, payment_upi, delivery, lottery, or general")


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
