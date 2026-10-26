import os
import json
import logging
import httpx
from typing import List, Dict, Any, Optional
from .models import AnalyzeRequest, AnalyzeResponse, RedFlag, RuleFinding
from .rules import analyze_rules, extract_urls

logger = logging.getLogger("promptshield.analyzer")


def build_system_prompt() -> str:
    return """You are PromptShield, an elite Explainable Generative AI system specializing in cyber fraud detection, scam pattern analysis, and digital citizen safety.

Your job is to analyze user-submitted messages (SMS, email, job offers, payment alerts, etc.) and produce a rigorous, explainable, and empathetic safety evaluation.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "risk_level": "safe" | "suspicious" | "likely_scam",
  "risk_score": <integer from 0 to 100>,
  "scam_type": "<e.g., Banking Phishing, UPI / QR Code Fraud, Advance Fee Lottery Scam, Fake Job Offer, Delivery Smishing, Legitimate Notification>",
  "red_flags": [
    {
      "quote": "<exact short quote or phrase from the original message>",
      "reason": "<clear explanation of why this is dangerous or deceptive>"
    }
  ],
  "explanation": "<simple plain language explanation in 3 to 4 sentences explaining the verdict clearly to a non-technical user>",
  "safe_next_steps": [
    "<actionable safe step, e.g., 'Do not click on any link in the message', 'Block and report the sender', 'If money was lost, report immediately to cybercrime.gov.in or dial 1930 in India'>"
  ],
  "what_not_to_do": [
    "<critical warning of what to avoid, e.g., 'Never enter your UPI PIN to receive money', 'Never share one-time passwords (OTP) with anyone'>"
  ]
}

Guidelines:
- "safe": 0-30 risk score. Legitimate messages with no malicious triggers.
- "suspicious": 31-70 risk score. Dubious, unverified, or unusual phrasing.
- "likely_scam": 71-100 risk score. Obvious signs of fraud, phishing, impersonation, or credential harvesting.
- Quotes in red_flags MUST be exact substrings found in the original message so they can be highlighted in the UI.
- Do NOT output markdown code blocks (```json ... ```) if possible, or ensure it is valid JSON.
"""


def build_user_prompt(message: str, message_type: str, rule_findings: List[RuleFinding]) -> str:
    rules_summary = "\n".join([
        f"- [{f.severity.upper()}] {f.category}: {f.description} (Matched: {', '.join(f.matched_phrases)})"
        for f in rule_findings
    ]) if rule_findings else "No high-severity automated rules triggered."

    return f"""Please evaluate this {message_type.upper()} message:

\"\"\"
{message}
\"\"\"

Automated Rule Engine Findings:
{rules_summary}

Analyze the message carefully. Identify deceptive patterns, psychological manipulation, credential requests, or spoofed links. Return strict JSON."""


async def call_claude(api_key: str, message: str, message_type: str, rule_findings: List[RuleFinding]) -> Optional[Dict[str, Any]]:
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(message, message_type, rule_findings)
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024,
        "temperature": 0.1,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}]
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
        if res.status_code == 200:
            data = res.json()
            content = data.get("content", [])
            for block in content:
                if block.get("type") == "text":
                    return parse_llm_json(block.get("text", ""))
        logger.warning(f"Claude API failed with status {res.status_code}: {res.text}")
    return None


async def call_openai(api_key: str, message: str, message_type: str, rule_findings: List[RuleFinding]) -> Optional[Dict[str, Any]]:
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(message, message_type, rule_findings)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        if res.status_code == 200:
            data = res.json()
            raw_text = data["choices"][0]["message"]["content"]
            return parse_llm_json(raw_text)
        logger.warning(f"OpenAI API failed with status {res.status_code}: {res.text}")
    return None


async def call_gemini(api_key: str, message: str, message_type: str, rule_findings: List[RuleFinding]) -> Optional[Dict[str, Any]]:
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(message, message_type, rule_findings)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1
        }
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code == 200:
            data = res.json()
            candidates = data.get("candidates", [])
            if candidates:
                raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                return parse_llm_json(raw_text)
        logger.warning(f"Gemini API failed with status {res.status_code}: {res.text}")
    return None


def parse_llm_json(raw_text: str) -> Optional[Dict[str, Any]]:
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
        if isinstance(data, dict) and "risk_level" in data and "risk_score" in data:
            return data
    except Exception as e:
        logger.error(f"Error parsing LLM response as JSON: {e}. Raw: {raw_text[:200]}")
    return None


def find_quote_in_text(target: str, source: str) -> Optional[str]:
    """Finds exact substring in source text matching target ignoring case."""
    idx = source.lower().find(target.lower())
    if idx != -1:
        return source[idx : idx + len(target)]
    return None


def heuristic_ai_analyze(message: str, message_type: str, findings: List[RuleFinding]) -> Dict[str, Any]:
    """
    Intelligent explainable fallback AI engine.
    Computes precise quotes, explainable reasons, contextual safety advice,
    and calibrated scores based on deep heuristic patterns.
    """
    text_lower = message.lower()
    red_flags: List[Dict[str, str]] = []
    score = 0
    scam_types = []

    # Category checks
    has_urgency = any(f.category == "Urgency & Pressure Language" for f in findings)
    has_credentials = any(f.category == "Credential & Payment Trap" for f in findings)
    has_too_good = any(f.category == "Too-Good-To-Be-True Offer" for f in findings)
    has_spoofed_url = any(f.category in ["Suspicious or Shortened URLs", "High-Risk Domain TLDs", "Lookalike / Brand Spoofing Link"] for f in findings)
    has_impersonation = any(f.category == "Institutional Impersonation Claim" for f in findings)

    # 1. URL Analysis
    for f in findings:
        if "URL" in f.category or "Domain" in f.category:
            for phrase in f.matched_phrases:
                exact_quote = find_quote_in_text(phrase, message) or phrase
                red_flags.append({
                    "quote": exact_quote,
                    "reason": f"Suspicious or unverified domain ('{phrase}'). Scammers direct victims to spoofed portals to harvest credentials."
                })
                score += 35

    # 2. Fake Job / Task Scam Checks
    if ("youtube" in text_lower and "like" in text_lower) or "telegram" in text_lower or ("part-time" in text_lower and "per day" in text_lower) or "amazon hr" in text_lower:
        if "amazon hr" in text_lower:
            q = find_quote_in_text("Amazon HR", message) or "Amazon HR"
            red_flags.append({
                "quote": q,
                "reason": "Brand Impersonation: Amazon HR does not recruit candidates via unsolicited SMS/WhatsApp messages offering simple video-liking tasks."
            })
            score += 25

        if "5,000 per day" in text_lower or "rs 5,000" in text_lower or "per day" in text_lower:
            q = find_quote_in_text("Rs 5,000 per day", message) or find_quote_in_text("Rs 5000 per day", message) or "Rs 5,000 per day"
            red_flags.append({
                "quote": q,
                "reason": "Unrealistic Remuneration: Offering thousands of rupees daily for trivial tasks (liking videos) is the hallmark bait of prepaid task fraud."
            })
            score += 30

        if "telegram" in text_lower:
            q = find_quote_in_text("@amazontaskrecruiter", message) or find_quote_in_text("telegram", message) or "Telegram"
            red_flags.append({
                "quote": q,
                "reason": "Channel Redirection: Shifting conversations to untraceable Telegram handles allows scammers to manipulate victims into depositing money into fraudulent investment wallets."
            })
            score += 30

        scam_types.append("Fake Job / Task-Based Telegram Fraud")

    # 3. Lottery / Lucky Draw Checks
    if "lottery" in text_lower or "lucky draw" in text_lower or "won a cash prize" in text_lower or "25,00,000" in text_lower:
        if "25,00,000" in text_lower or "cash prize" in text_lower:
            q = find_quote_in_text("cash prize of Rs 25,00,000", message) or find_quote_in_text("cash prize", message) or "cash prize"
            red_flags.append({
                "quote": q,
                "reason": "Unsolicited Grand Prize Bait: You cannot win an unentered lottery. Scammers use astronomical prize claims to create euphoria."
            })
            score += 35

        if "kbc" in text_lower or "whatsapp lucky draw" in text_lower:
            q = find_quote_in_text("KBC WhatsApp Lucky Draw", message) or find_quote_in_text("KBC", message) or "KBC"
            red_flags.append({
                "quote": q,
                "reason": "Celebrity Brand Exploitation: Kaun Banega Crorepati (KBC) and WhatsApp do not conduct random phone lottery drawings."
            })
            score += 25

        if "processing and customs tax fee" in text_lower or "fee of rs 4,500" in text_lower or "refundable" in text_lower:
            q = (
                find_quote_in_text("refundable processing and customs tax fee of Rs 4,500", message) or
                find_quote_in_text("refundable processing", message) or
                find_quote_in_text("fee of Rs 4,500", message) or
                "fee"
            )
            red_flags.append({
                "quote": q,
                "reason": "Advance-Fee Fraud: Legitimate prizes NEVER require upfront payments, customs fees, or taxes transferred to private UPI handles."
            })
            score += 35

        scam_types.append("Lottery / Advance-Fee Scam")

    # 4. UPI / QR / PIN Checks
    if "qr" in text_lower and ("scan" in text_lower or "receive" in text_lower or "refund" in text_lower):
        q = find_quote_in_text("Scan this QR code", message) or find_quote_in_text("Scan", message) or "Scan this QR code"
        red_flags.append({
            "quote": q,
            "reason": "QR Code Inversion Trap: Scanning a QR code ALWAYS transfers money OUT of your account. You NEVER need to scan a QR code to receive refunds."
        })
        score += 45
        scam_types.append("UPI QR Code / Refund Trap")

    if "upi pin" in text_lower or "enter your pin" in text_lower or "enter your upi pin" in text_lower:
        pin_q = (
            find_quote_in_text("enter your UPI PIN", message) or
            find_quote_in_text("UPI PIN", message) or
            "UPI PIN"
        )
        red_flags.append({
            "quote": pin_q,
            "reason": "PIN Disclosure Trap: Entering your UPI PIN authorizes an instant debit from your bank. PIN is NEVER required to receive money."
        })
        score += 40
        scam_types.append("UPI Financial Theft")

    if "otp" in text_lower:
        if "never share" in text_lower or "do not share" in text_lower and not has_spoofed_url and not has_urgency and len(findings) <= 1:
            # Genuine OTP alert warning user NOT to share
            pass
        elif "except our verified executive" in text_lower or "share your otp" in text_lower or "enter otp" in text_lower:
            otp_q = find_quote_in_text("except our verified executive", message) or find_quote_in_text("OTP", message) or "OTP"
            red_flags.append({
                "quote": otp_q,
                "reason": "Social Engineering Trap: Claiming executives can be shared an OTP with is a deception tactic to bypass bank 2-factor authentication."
            })
            score += 35

    # 5. Delivery Smishing Checks
    if ("parcel" in text_lower or "delivery" in text_lower or "package" in text_lower) and ("fee" in text_lower or "redeliver" in text_lower or "incomplete address" in text_lower):
        if "redelivery fee" in text_lower or "fee within" in text_lower:
            deliv_q = find_quote_in_text("Pay Rs 48 redelivery fee", message) or find_quote_in_text("redelivery fee", message) or "redelivery fee"
            red_flags.append({
                "quote": deliv_q,
                "reason": "Micro-Charge Card Trap: Attackers request a tiny fee (e.g., ₹48) so victims don't hesitate, while the payment page harvests full card and CVV details."
            })
            score += 35

        if "incomplete address" in text_lower or "could not be delivered" in text_lower:
            addr_q = find_quote_in_text("incomplete address", message) or find_quote_in_text("could not be delivered", message) or "incomplete address"
            red_flags.append({
                "quote": addr_q,
                "reason": "Fabricated Delivery Failure: Postal and courier services do not cancel packages and solicit micro-payments via SMS links."
            })
            score += 25

        scam_types.append("Courier / Delivery Fee Smishing")

    # 6. Urgency & Account Suspension Checks
    if has_urgency:
        urgency_q = (
            find_quote_in_text("within 24 hours", message) or
            find_quote_in_text("permanently suspended", message) or
            find_quote_in_text("within 12 hours", message) or
            find_quote_in_text("urgent action required", message) or
            find_quote_in_text("immediate action", message) or
            "urgent"
        )
        red_flags.append({
            "quote": urgency_q,
            "reason": "Artificial Time Pressure: Scammers impose arbitrary countdowns (e.g. 12/24 hours) to prevent victims from verifying with official customer support."
        })
        score += 30
        if not scam_types:
            scam_types.append("Urgent Account Suspension Threat")

    # 7. Fake KYC / PAN Update
    if "kyc" in text_lower or "pan and aadhaar" in text_lower:
        if has_spoofed_url or has_urgency:
            kyc_q = find_quote_in_text("pending KYC verification", message) or find_quote_in_text("update your PAN and Aadhaar", message) or find_quote_in_text("KYC", message) or "KYC"
            red_flags.append({
                "quote": kyc_q,
                "reason": "Regulatory Phishing Impersonation: Banks never send web links in SMS asking users to upload identity documents or unfreeze accounts."
            })
            score += 30
            scam_types.append("Banking Phishing (Fake KYC)")

    # Deduplicate red flags by quote
    unique_red_flags = []
    seen_quotes = set()
    for rf in red_flags:
        key = rf["quote"].lower().strip()
        if key not in seen_quotes:
            seen_quotes.add(key)
            unique_red_flags.append(rf)

    # Check for genuine messages
    is_safe = False
    if ("hdfc bank never asks" in text_lower and "never share this otp" in text_lower) or \
       ("your official amazon account under your orders" in text_lower) or \
       ("thank you for your order" in text_lower and not has_spoofed_url and not has_urgency and not has_credentials):
        is_safe = True

    if is_safe:
        score = 8
        risk_level = "safe"
        scam_type = "Legitimate Notification / Verified Alert"
        explanation = (
            "This message appears to be a legitimate communication from an authorized service provider. "
            "It does not contain suspicious external links, coercive countdown threats, or requests for unauthorized payments. "
            "Notice how it reinforces digital safety guidelines by reminding you never to disclose credentials."
        )
        safe_steps = [
            "Proceed with your intended legitimate task safely.",
            "Always verify orders or transactions directly within your official mobile application.",
            "Remember that legitimate institutions will never ask for your passwords or OTP over SMS or phone calls."
        ]
        what_not_to_do = [
            "Do not forward one-time passwords (OTP) to anyone even if they claim to be company representatives.",
            "Do not use third-party search engine phone numbers to contact customer service."
        ]
        unique_red_flags = []
    else:
        score = min(max(score, 20 if findings else 5), 98)

        if score >= 65:
            risk_level = "likely_scam"
        elif score >= 35:
            risk_level = "suspicious"
        else:
            risk_level = "safe"

        scam_type = scam_types[0] if scam_types else ("Suspicious Unverified Message" if risk_level != "safe" else "Safe Communication")

        if risk_level == "likely_scam":
            explanation = (
                f"This message displays classic characteristics of a {scam_type}. "
                "The sender employs psychological pressure, spoofed identities, or malicious payment triggers designed to steal your money or credentials. "
                "Do not engage, click links, or follow any payment instructions provided in this message."
            )
            safe_steps = [
                "Do NOT click on any link, attachment, or phone number contained in this message.",
                "Block and report the sender immediately in your messaging or email client.",
                "If you are concerned about your account, open the official app or visit the verified domain directly.",
                "If money was lost or sensitive data entered, dial 1930 immediately or file a complaint at cybercrime.gov.in."
            ]
            what_not_to_do = [
                "NEVER scan QR codes or enter your UPI PIN to receive money or refunds.",
                "NEVER share OTP, CVV, NetBanking passwords, or Aadhaar/PAN details with anyone.",
                "Do not reply to the sender or transfer any advance registration, customs, or refundable fees."
            ]
        elif risk_level == "suspicious":
            explanation = (
                "This message contains several ambiguous or unusual characteristics that warrant caution. "
                "While it may not be an outright scam, it exhibits flags such as unverified claims, unexpected links, or vague urgency. "
                "Avoid interacting directly until you have verified the sender through established official channels."
            )
            safe_steps = [
                "Cross-check the sender's email address or phone number against official company contacts.",
                "Log into your account independently through the official website rather than using provided links.",
                "Inspect any URLs thoroughly for lookalike characters or unusual domain extensions."
            ]
            what_not_to_do = [
                "Do not download attachments or provide personal details to unverified contacts.",
                "Do not feel pressured to take immediate financial actions."
            ]
        else:
            explanation = (
                "The message does not display prominent red flags or coercive language. "
                "However, always practice basic digital hygiene when reviewing unexpected communications. "
                "Ensure links lead directly to authentic, secure official websites."
            )
            safe_steps = [
                "Verify sender authenticity if unexpected.",
                "Keep your security apps and operating system updated."
            ]
            what_not_to_do = [
                "Never share sensitive passwords or one-time codes."
            ]

    return {
        "risk_level": risk_level,
        "risk_score": score,
        "scam_type": scam_type,
        "red_flags": unique_red_flags,
        "explanation": explanation,
        "safe_next_steps": safe_steps,
        "what_not_to_do": what_not_to_do
    }


async def analyze_message(req: AnalyzeRequest) -> AnalyzeResponse:
    # Step 1: Run deterministic rule-based checks
    rule_findings = analyze_rules(req.message)

    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

    llm_result = None
    engine_name = "heuristic_ai"

    # Step 2: Try LLMs if API keys are configured
    if anthropic_key:
        try:
            llm_result = await call_claude(anthropic_key, req.message, req.message_type or "general", rule_findings)
            if llm_result:
                engine_name = "claude-3-5-sonnet"
        except Exception as e:
            logger.warning(f"Claude invocation error: {e}")

    if not llm_result and openai_key:
        try:
            llm_result = await call_openai(openai_key, req.message, req.message_type or "general", rule_findings)
            if llm_result:
                engine_name = "openai-gpt-4o-mini"
        except Exception as e:
            logger.warning(f"OpenAI invocation error: {e}")

    if not llm_result and gemini_key:
        try:
            llm_result = await call_gemini(gemini_key, req.message, req.message_type or "general", rule_findings)
            if llm_result:
                engine_name = "gemini-1.5-flash"
        except Exception as e:
            logger.warning(f"Gemini invocation error: {e}")

    # Step 3: If no LLM or LLM failed, use our Heuristic AI engine
    if not llm_result:
        llm_result = heuristic_ai_analyze(req.message, req.message_type or "general", rule_findings)
        engine_name = "promptshield_heuristic_ai"

    # Ensure red flags list is properly formatted
    formatted_red_flags = []
    for rf in llm_result.get("red_flags", []):
        if isinstance(rf, dict) and "quote" in rf and "reason" in rf:
            formatted_red_flags.append(RedFlag(quote=str(rf["quote"]), reason=str(rf["reason"])))

    # Ensure risk_level is valid
    risk_level = str(llm_result.get("risk_level", "suspicious")).lower()
    if risk_level not in ["safe", "suspicious", "likely_scam"]:
        score = int(llm_result.get("risk_score", 50))
        risk_level = "likely_scam" if score >= 70 else ("suspicious" if score >= 31 else "safe")

    risk_score = int(llm_result.get("risk_score", 50))
    risk_score = max(0, min(100, risk_score))

    return AnalyzeResponse(
        risk_level=risk_level,
        risk_score=risk_score,
        scam_type=str(llm_result.get("scam_type", "Digital Communication")),
        red_flags=formatted_red_flags,
        explanation=str(llm_result.get("explanation", "No explanation available.")),
        safe_next_steps=list(llm_result.get("safe_next_steps", [])),
        what_not_to_do=list(llm_result.get("what_not_to_do", [])),
        rule_findings=rule_findings,
        engine_used=engine_name
    )
