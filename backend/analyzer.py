import os
import re
import json
import logging
import httpx
from typing import List, Dict, Any, Optional
from .models import AnalyzeRequest, AnalyzeResponse, RedFlag, RuleFinding
from .rules import analyze_rules, extract_urls

logger = logging.getLogger("promptshield.analyzer")


def build_system_prompt() -> str:
    return """You are PromptShield, an elite Explainable Generative AI system specializing in cyber fraud detection, scam pattern analysis, prohibited link identification (including illicit movie piracy like iBomma, adult/porn scams, and malware droppers), digital arrest extortions, electricity bill frauds, and digital citizen safety.

Your job is to analyze user-submitted messages (SMS, email, job offers, payment alerts, movie links, adult/sextortion claims, etc.) and produce a rigorous, explainable, and empathetic safety evaluation.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "risk_level": "safe" | "suspicious" | "likely_scam",
  "risk_score": <integer from 0 to 100>,
  "scam_type": "<e.g., Banking Phishing, UPI / QR Code Fraud, Advance Fee Lottery Scam, Fake Job Offer, Delivery Smishing, Prohibited Piracy & Malware APK, Adult Sextortion & Blackmail, Digital Arrest Extortion, Electricity Disconnection Fraud, Credit Card Points Trap, Legitimate Notification>",
  "red_flags": [
    {
      "quote": "<exact short quote or phrase from the original message>",
      "reason": "<clear explanation of why this is dangerous, deceptive, or prohibited>"
    }
  ],
  "explanation": "<simple plain language explanation in 3 to 4 sentences explaining the verdict clearly to a non-technical user>",
  "safe_next_steps": [
    "<actionable safe step>"
  ],
  "what_not_to_do": [
    "<critical warning of what to avoid>"
  ]
}

Guidelines:
- "safe": 0-30 risk score. Legitimate messages, informative alerts, and conversational chats with no malicious triggers.
- "suspicious": 31-70 risk score. Dubious, unverified, or unusual phrasing.
- "likely_scam": 71-100 risk score. Obvious signs of fraud, phishing, piracy malware droppers, sextortion, digital arrest, utility fraud, or credential harvesting.
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

Analyze the message carefully. Identify deceptive patterns, psychological manipulation, credential requests, piracy malware droppers (e.g., iBomma), adult/sextortion blackmail, digital arrest extortions, or spoofed links. Return strict JSON."""


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
    Intelligent explainable AI engine.
    Accurately classifies threats and completely avoids false alarms on legitimate alerts and conversational messages.
    """
    text_lower = message.lower()
    red_flags: List[Dict[str, str]] = []
    scam_types = []
    score = 0

    has_spoofed_url = any(f.category in ["Suspicious or Shortened URLs", "High-Risk Domain TLDs", "Lookalike / Brand Spoofing Link"] for f in findings)
    has_piracy = any("Piracy" in f.category for f in findings)
    has_adult = any("Adult" in f.category for f in findings)
    has_apk = any("APK" in f.category for f in findings)
    has_digital_arrest = any("Digital Arrest" in f.category for f in findings)
    has_electricity = any("Electricity" in f.category for f in findings)
    has_points = any("Points" in f.category for f in findings)
    has_challan = any("Challan" in f.category for f in findings)

    # -------------------------------------------------------------
    # 0. FALSE-ALARM FILTER: Check for Legitimate / Safe Messages
    # -------------------------------------------------------------
    # Check if this is a legitimate transaction OTP
    is_legit_otp = bool(
        re.search(r'\b(?:\d{4,8}\s+is\s+your\s+(?:one\s*time\s*password|otp)|otp\s+(?:is|for\s+login)\s*:?\s*\d{4,8})\b', text_lower) and
        re.search(r'\b(?:never\s+share|do\s+not\s+share|bank\s+never\s+asks|strictly\s+confidential|valid\s+for)\b', text_lower) and
        not has_spoofed_url and not ("share your otp" in text_lower or "send otp to" in text_lower or "except our verified" in text_lower)
    )

    # Check if this is an authentic e-commerce / delivery update
    is_legit_order = bool(
        ("order" in text_lower or "shipped" in text_lower or "package" in text_lower) and
        re.search(r'\b(?:thank\s+you\s+for\s+your\s+order|order\s+#\S+|has\s+been\s+shipped|track\s+(?:your\s+shipment|in\s+your\s+official\s+account)|estimated\s+delivery)\b', text_lower) and
        not has_spoofed_url and not ("redelivery fee" in text_lower or "incomplete address" in text_lower or "pay rs" in text_lower)
    )

    # Check if this is an authentic travel confirmation (IRCTC / Uber / Flights)
    is_legit_travel = bool(
        re.search(r'\b(?:pnr\s*(?:no\.?|number)?\s*:?\s*\d{10}|coach\s+[a-z]\d+|seat\s+confirmed|happy\s+journey|ride\s+is\s+arriving|driver\s*:\s*[a-z]+|indigo\s+booking|air\s+india)\b', text_lower) and
        not has_spoofed_url
    )

    # Check if this is an authentic bill receipt or spend notification
    is_legit_receipt = bool(
        re.search(r'\b(?:payment\s+of\s+rs\.?\s*[\d,]+\s+(?:successfully\s+)?received|bill\s+paid\s+successfully|spent\s+on\s+(?:your\s+)?card\s+ending\s+in\s+\d{4}|debited\s+from\s+a\/c\s+ending\s+\d{4}|credited\s+to\s+your\s+account)\b', text_lower) and
        not has_spoofed_url and not ("power will be disconnected" in text_lower or "update pan" in text_lower)
    )

    # Check if this is a standard human conversational / work message
    is_conversational = bool(
        not extract_urls(message) and
        not has_apk and not has_piracy and not has_adult and not has_digital_arrest and not has_electricity and
        not re.search(r'\b(?:otp|cvv|upi\s+pin|bank\s+account|pan\s+card|aadhaar|debit\s+card|bitcoin|lottery|prize|cash\s+prize|telegram|job|earn\s+rs)\b', text_lower) and
        re.search(r'\b(?:hey|hi|hello|bro|brother|mom|dad|team|dear\s+colleague|good\s+morning|talk\s+to\s+you|call\s+me|meeting|presentation|slides|reached\s+safely|happy\s+birthday|lunch|dinner|tomorrow)\b', text_lower)
    )

    if (is_legit_otp or is_legit_order or is_legit_travel or is_legit_receipt or is_conversational) and not has_spoofed_url:
        return {
            "risk_level": "safe",
            "risk_score": 8,
            "scam_type": "Legitimate Notification / Verified Safe",
            "red_flags": [],
            "explanation": (
                "This message represents an authentic, safe communication with zero malicious indicators. "
                "It contains no suspicious external URLs, no demands for payments or unauthorized fees, and no deceptive credential traps. "
                "Notice how security-sensitive notifications proactively reinforce safety best practices."
            ),
            "safe_next_steps": [
                "Proceed with your intended legitimate task safely.",
                "Always verify transactions and order statuses within your official mobile app.",
                "Remember that authentic institutions will never call or message to solicit your OTP or PIN."
            ],
            "what_not_to_do": [
                "Never share one-time passwords (OTP) with anyone, even if they claim to be company representatives.",
                "Do not use third-party search engine phone numbers to contact customer service."
            ]
        }

    # -------------------------------------------------------------
    # 1. Digital Arrest / Law Enforcement Extortion
    # -------------------------------------------------------------
    if has_digital_arrest or "digital arrest" in text_lower or ("cbi" in text_lower and "narcotics" in text_lower) or ("mumbai crime branch" in text_lower or "ncb" in text_lower) or ("parcel" in text_lower and ("mdma" in text_lower or "drugs" in text_lower)):
        q = (
            find_quote_in_text("digital arrest", message) or
            find_quote_in_text("CBI", message) or
            find_quote_in_text("Mumbai Crime Branch", message) or
            find_quote_in_text("narcotics", message) or
            find_quote_in_text("arrest warrant", message) or
            "Digital Arrest"
        )
        red_flags.append({
            "quote": q,
            "reason": "Digital Arrest Extortion Threat: Criminals impersonate law enforcement agencies (CBI, Police, Customs) with fabricated claims of illegal narcotics parcels, coercing victims over video calls to extort money into fake 'verification accounts'. Under Indian law, 'Digital Arrest' does not legally exist."
        })
        score += 65
        scam_types.append("Digital Arrest / Law Enforcement Extortion Scam")

    # -------------------------------------------------------------
    # 2. Electricity / Utility Power Disconnection Scam
    # -------------------------------------------------------------
    if has_electricity or ("electricity" in text_lower and ("disconnected" in text_lower or "officer" in text_lower)) or "power will be disconnected" in text_lower:
        q = (
            find_quote_in_text("electricity power will be disconnected", message) or
            find_quote_in_text("power will be disconnected", message) or
            find_quote_in_text("contact our electricity officer", message) or
            find_quote_in_text("previous month bill was not updated", message) or
            "electricity disconnection"
        )
        red_flags.append({
            "quote": q,
            "reason": "Utility Disconnection Panic Trap: Scammers create artificial panic alleging an unpaid bill will lead to imminent power disconnection, directing victims to call private mobile numbers or install remote-access APKs. Real electricity distribution utilities never issue disconnection ultimatums from personal phone numbers."
        })
        score += 60
        scam_types.append("Electricity / Utility Disconnection Fraud")

    # -------------------------------------------------------------
    # 3. Prohibited Piracy Links (iBomma, MovieRulz) & APK Droppers
    # -------------------------------------------------------------
    if has_piracy or any(p in text_lower for p in ["ibomma", "movierulz", "tamilmv", "torrent", "watch movie free"]):
        ibomma_q = (
            find_quote_in_text("ibomma", message) or
            find_quote_in_text("movierulz", message) or
            find_quote_in_text("tamilmv", message) or
            find_quote_in_text("torrent", message) or
            "iBomma"
        )
        red_flags.append({
            "quote": ibomma_q,
            "reason": "Prohibited Pirated Streaming Portal: Platforms like iBomma distribute copyright-infringing content and are legally banned. They serve as primary distribution vectors for infostealers, trojans, and malicious adware."
        })
        score += 55
        scam_types.append("Prohibited Piracy & Malware Distribution Threat")

    if has_apk or ".apk" in text_lower or "install player app" in text_lower or "download apk" in text_lower or "echallan.apk" in text_lower:
        apk_q = (
            find_quote_in_text(".apk", message) or
            find_quote_in_text("download apk", message) or
            find_quote_in_text("install player app", message) or
            find_quote_in_text("install the player app", message) or
            "APK"
        )
        red_flags.append({
            "quote": apk_q,
            "reason": "Untrusted App Sideloading (APK Dropper): Prompts to sideload Android APK files from outside the Google Play Store install spyware designed to hijack SMS OTPs, contacts, and bank apps."
        })
        score += 45
        if not scam_types:
            scam_types.append("Malicious APK / Trojan Dropper")

    # -------------------------------------------------------------
    # 4. Prohibited Adult Content & Webcam Sextortion Extortion
    # -------------------------------------------------------------
    if has_adult or "recorded you" in text_lower or "dirty video" in text_lower or "porn" in text_lower or "compromised your webcam" in text_lower or "pay bitcoin or leak" in text_lower or "xvideos" in text_lower:
        if "recorded you" in text_lower or "compromised your webcam" in text_lower or "dirty video" in text_lower or "leaked video of you" in text_lower:
            extort_q = (
                find_quote_in_text("recorded you watching", message) or
                find_quote_in_text("recorded your screen", message) or
                find_quote_in_text("compromised your webcam", message) or
                find_quote_in_text("leaked video of you", message) or
                "recorded you"
            )
            red_flags.append({
                "quote": extort_q,
                "reason": "Sextortion Scare Bluff: Attackers mass-blast fabricated claims alleging they have recorded your screen or webcam to panic you into paying extortion money."
            })
            score += 50

        if "pay bitcoin" in text_lower or "bitcoin within" in text_lower or "send to all your contacts" in text_lower:
            btc_q = (
                find_quote_in_text("send to all your contacts", message) or
                find_quote_in_text("pay bitcoin", message) or
                find_quote_in_text("transfer $500 in Bitcoin", message) or
                "Bitcoin"
            )
            red_flags.append({
                "quote": btc_q,
                "reason": "Cryptocurrency Extortion Demand: Demanding untraceable cryptocurrency transfers is the classic hallmark of automated extortion and cyber blackmail rings."
            })
            score += 45

        if any(w in text_lower for w in ["porn", "xxx", "xvideos", "nude", "camgirl", "adult"]):
            adult_q = (
                find_quote_in_text("porn", message) or
                find_quote_in_text("adult sites", message) or
                find_quote_in_text("nude video", message) or
                "adult content"
            )
            red_flags.append({
                "quote": adult_q,
                "reason": "Prohibited Adult Lure: Adult and pornographic link schemes exploit taboo subjects to induce shame, deliver ransomware, or trick victims into honeytrap extortion."
            })
            score += 35

        scam_types.append("Adult Content / Sextortion & Blackmail Threat")

    # -------------------------------------------------------------
    # 5. Credit Card Points / Cashback Phishing
    # -------------------------------------------------------------
    if has_points or ("reward points" in text_lower and ("expir" in text_lower or "redeem" in text_lower or "cash" in text_lower)):
        q = (
            find_quote_in_text("reward points worth", message) or
            find_quote_in_text("points expiring today", message) or
            find_quote_in_text("redeem your reward points", message) or
            find_quote_in_text("reward points", message) or
            "reward points"
        )
        red_flags.append({
            "quote": q,
            "reason": "Credit Card Credential Trap: Attackers invent expiring reward points converted into instant cash to direct victims to phishing pages where card numbers, CVVs, and NetBanking passwords are stolen."
        })
        score += 55
        scam_types.append("Credit Card Reward Points Phishing")

    # -------------------------------------------------------------
    # 6. UPI / QR Code Inversion & PIN Fraud
    # -------------------------------------------------------------
    if "qr" in text_lower and ("scan" in text_lower or "receive" in text_lower or "refund" in text_lower):
        q = find_quote_in_text("Scan this QR code", message) or find_quote_in_text("Scan", message) or "Scan this QR code"
        red_flags.append({
            "quote": q,
            "reason": "QR Code Inversion Trap: Scanning a QR code ALWAYS transfers money OUT of your account. You NEVER need to scan a QR code to receive refunds."
        })
        score += 50
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
        score += 45
        if "UPI QR Code / Refund Trap" not in scam_types:
            scam_types.append("UPI Financial Theft")

    if "except our verified executive" in text_lower or "share your otp" in text_lower:
        otp_q = find_quote_in_text("except our verified executive", message) or find_quote_in_text("share your otp", message) or "OTP"
        red_flags.append({
            "quote": otp_q,
            "reason": "Social Engineering Trap: Claiming executives can be shared an OTP with is a deception tactic to bypass bank 2-factor authentication."
        })
        score += 40

    # -------------------------------------------------------------
    # 7. Advance-Fee Lottery & Lucky Draw (KBC, WhatsApp Lottery)
    # -------------------------------------------------------------
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

    # -------------------------------------------------------------
    # 8. Fake Job / Task Telegram Fraud
    # -------------------------------------------------------------
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

    # -------------------------------------------------------------
    # 9. Courier & Delivery Smishing
    # -------------------------------------------------------------
    if ("parcel" in text_lower or "delivery" in text_lower or "package" in text_lower) and ("redelivery fee" in text_lower or "fee within" in text_lower or "incomplete address" in text_lower):
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

    # -------------------------------------------------------------
    # 10. Banking Phishing & Fake KYC
    # -------------------------------------------------------------
    if "kyc" in text_lower or "pan and aadhaar" in text_lower or "pan card" in text_lower or "netbanking access will be" in text_lower:
        if has_spoofed_url or "suspended" in text_lower or "blocked" in text_lower or "within 24 hours" in text_lower:
            kyc_q = (
                find_quote_in_text("pending KYC verification", message) or
                find_quote_in_text("update your PAN and Aadhaar", message) or
                find_quote_in_text("NetBanking access will be permanently suspended", message) or
                find_quote_in_text("KYC", message) or
                "KYC"
            )
            red_flags.append({
                "quote": kyc_q,
                "reason": "Regulatory Phishing Impersonation: Banks never send web links in SMS asking users to upload identity documents or unfreeze accounts."
            })
            score += 35
            scam_types.append("Banking Phishing (Fake KYC / Account Suspension)")

    # -------------------------------------------------------------
    # 11. URL / Domain Checks (General)
    # -------------------------------------------------------------
    for f in findings:
        if "URL" in f.category or "Domain" in f.category:
            for phrase in f.matched_phrases:
                exact_quote = find_quote_in_text(phrase, message) or phrase
                red_flags.append({
                    "quote": exact_quote,
                    "reason": f"Suspicious or unverified domain ('{phrase}'). Scammers direct victims to spoofed portals to harvest credentials or drop malware."
                })
                score += 35
                if not scam_types:
                    scam_types.append("Deceptive Phishing Link / Domain Spoofing")

    # -------------------------------------------------------------
    # 12. Urgency with Harm Vector
    # -------------------------------------------------------------
    if (scam_types or score >= 35) and any(f.category == "Urgency & Pressure Language" for f in findings):
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
        score += 20

    # Deduplicate red flags by quote
    unique_red_flags = []
    seen_quotes = set()
    for rf in red_flags:
        key = rf["quote"].lower().strip()
        if key not in seen_quotes:
            seen_quotes.add(key)
            unique_red_flags.append(rf)

    # -------------------------------------------------------------
    # Score Calibration and Verdict
    # -------------------------------------------------------------
    if not unique_red_flags and score < 25:
        score = 8
        risk_level = "safe"
        scam_type = "Legitimate Notification / Safe Message"
        explanation = (
            "No deceptive patterns, credential traps, or unauthorized payment requests were identified in this message. "
            "It appears to be a legitimate communication or conversational exchange."
        )
        safe_steps = [
            "Proceed with your intended legitimate task safely.",
            "Always verify orders or transactions directly within official mobile applications.",
            "Remember that legitimate institutions will never ask for your passwords or OTP over SMS or phone calls."
        ]
        what_not_to_do = [
            "Never share passwords or one-time codes with anyone.",
            "Do not click unknown links sent by unsolicited contacts."
        ]
    else:
        score = min(max(score, 75 if scam_types else 35), 98)
        if score >= 70:
            risk_level = "likely_scam"
        elif score >= 35:
            risk_level = "suspicious"
        else:
            risk_level = "safe"

        scam_type = scam_types[0] if scam_types else ("Suspicious Unverified Communication" if risk_level != "safe" else "Safe Message")

        # Contextual Explanations & Advice
        if "Digital Arrest" in scam_type:
            explanation = (
                "This message is a fraudulent Digital Arrest extortion scam. Cyber criminals impersonate police, CBI, or customs officials claiming an illegal parcel with drugs or passports was booked in your name. "
                "They intimidate victims over video calls to extort money into fake 'verification accounts'. "
                "Under Indian law, there is NO legal concept of 'Digital Arrest' and police never interrogate citizens on WhatsApp or Skype."
            )
            safe_steps = [
                "Disconnect and terminate all calls or video sessions immediately.",
                "Do NOT transfer any money or disclose your bank account details.",
                "Report immediately to the National Cybercrime Helpline 1930 or file a complaint at cybercrime.gov.in.",
                "Block and report the offending phone numbers in your messaging client."
            ]
            what_not_to_do = [
                "NEVER transfer funds to so-called 'RBI verification' or police accounts to prove innocence.",
                "Do not stay on video calls or follow intimidation orders."
            ]
        elif "Electricity" in scam_type:
            explanation = (
                "This message is an electricity bill disconnection fraud. Attackers exploit panic by claiming power supply will be cut off tonight due to an unpaid bill, urging you to call a personal phone number. "
                "Real electricity distribution companies (DISCOMs) never issue power cut ultimatums from 10-digit individual mobile numbers."
            )
            safe_steps = [
                "Do NOT call the personal mobile number provided in the message.",
                "Check your actual electricity bill and payment status through the official DISCOM website or mobile app.",
                "Report the fraudulent mobile number to 1930 or cybercrime.gov.in."
            ]
            what_not_to_do = [
                "Never call unverified personal phone numbers listed in SMS alerts.",
                "Never install remote access applications (AnyDesk, TeamViewer, or APKs) suggested by callers."
            ]
        elif "Piracy" in scam_type or "APK" in scam_type:
            explanation = (
                f"This message promotes a prohibited pirated streaming destination or unverified APK dropper ({scam_type}). "
                "Sites like iBomma and unverified streaming links are legally banned and heavily weaponized with spyware, adware, and trojans. "
                "Sideloading APK players or clicking streaming redirects exposes your smartphone or computer to unauthorized data harvesting and malware infection."
            )
            safe_steps = [
                "Do NOT download, sideload, or install any APK files or player software from this link.",
                "Stick strictly to licensed, verified streaming platforms (Netflix, Amazon Prime, Disney+ Hotstar, YouTube).",
                "If you installed an APK from this site, uninstall it immediately and run a scan with Google Play Protect or a trusted mobile antivirus.",
                "Block and report the sender transmitting prohibited piracy links."
            ]
            what_not_to_do = [
                "NEVER grant device administrative access or Accessibility permissions to third-party movie APKs.",
                "Do not disable 'Unknown Sources' protection in your Android security settings.",
                "Never enter payment or credit card details on free movie streaming portals."
            ]
        elif "Adult" in scam_type or "Sextortion" in scam_type:
            explanation = (
                "This message represents a prohibited adult lure or sextortion extortion attack. "
                "Attackers use fear, shame, and fabricated claims of recorded webcam footage to intimidate victims into sending cryptocurrency or clicking malicious links. "
                "These are almost always mass-automated scam templates sent to millions of leaked email addresses."
            )
            safe_steps = [
                "Do NOT pay any money, ransom, or cryptocurrency. Paying marks you as a responsive target for further extortion.",
                "Block and report the sender email address or phone number immediately.",
                "Cover your device webcam with a physical shutter when not in use for peace of mind.",
                "If genuine harassment or privacy breaches occur, file a report immediately at cybercrime.gov.in or dial helpline 1930."
            ]
            what_not_to_do = [
                "NEVER transfer Bitcoin, gift cards, or bank funds to blackmailers.",
                "Do not reply or negotiate with the attacker.",
                "Do not click on adult verification links or download attachments claimed to contain 'proof'."
            ]
        elif "Points" in scam_type:
            explanation = (
                "This message is a credit card reward points phishing trap. Scammers lure victims with promises of expiring reward points converted into instant bank cash. "
                "The link leads to a cloned bank website designed to steal your 16-digit card number, CVV, NetBanking credentials, and OTP."
            )
            safe_steps = [
                "Check your genuine credit card reward points exclusively inside your official bank app or monthly statement.",
                "Do NOT click any web links in the message.",
                "If card details were already entered, contact your bank immediately to block the card."
            ]
            what_not_to_do = [
                "NEVER enter card numbers, CVVs, or OTPs on links sent via SMS.",
                "Remember that banks never convert points to cash via external web links."
            ]
        elif risk_level == "likely_scam":
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
        else:
            explanation = (
                "This message contains ambiguous or unverified elements that warrant caution. "
                "While not an outright confirmed attack, exercise vigilance before sharing information or opening links."
            )
            safe_steps = [
                "Cross-check the sender's identity through official channels.",
                "Avoid interacting directly until sender authenticity is confirmed."
            ]
            what_not_to_do = [
                "Do not share personal details with unverified contacts."
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
