import re
from typing import List
from .models import RuleFinding

# URL pattern to extract URLs
URL_PATTERN = re.compile(
    r'(?:https?:\/\/|www\.)[^\s<>"\']+|[a-zA-Z0-9_\-\.]+\.(?:com|org|net|xyz|top|site|club|buzz|info|click|live|in|co|tech|online|store|vip|app|link|cc|icu|rest|work)[^\s<>"\']*',
    re.IGNORECASE
)

# Common shortener domains
SHORTENER_DOMAINS = [
    "bit.ly", "tinyurl.com", "is.gd", "t.co", "cutt.ly", "shorturl.at", "rb.gy",
    "ow.ly", "buff.ly", "rebrand.ly", "bl.ink", "v.ht", "soo.gd", "s.id"
]

# Suspicious top-level domains often used in scam campaigns
SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".club", ".buzz", ".click", ".vip", ".icu", ".rest",
    ".work", ".cc", ".link", ".online", ".site", ".tk", ".ml", ".ga", ".cf", ".gq"
]

# Targeted lookalike or spoof brand keywords
LOOKALIKE_BRANDS = [
    r"sbi[-_.]?kyc", r"hdfc[-_.]?net", r"icici[-_.]?secure", r"paytm[-_.]?verify",
    r"paypa[l1]", r"amaz[o0]n", r"netfl[i1]x", r"apple[-_.]?id", r"ind[a-z]*post",
    r"fedex[-_.]?track", r"dhl[-_.]?express", r"income[-_.]?tax", r"gov[-_.]?refund"
]

# Urgency / Pressure keywords and phrases
URGENCY_PATTERNS = [
    r"\b(?:within\s+\d+\s*(?:hours?|hrs?|minutes?|mins?))\b",
    r"\b(?:immediate\s+action\s+required)\b",
    r"\b(?:account\s+(?:access\s+)?(?:will\s+be\s+)?(?:permanently\s+)?(?:suspended|blocked|deactivated|terminated|frozen|restricted))\b",
    r"\b(?:last\s+(?:chance|notice|warning))\b",
    r"\b(?:final\s+notice)\b",
    r"\b(?:act\s+(?:now|immediately|fast))\b",
    r"\b(?:expires?\s+today)\b",
    r"\b(?:urgent\s+attention|urgent\s+action)\b",
    r"\b(?:arrest\s+warrant|police\s+case|legal\s+notice|court\s+summons|digital\s+arrest)\b",
    r"\b(?:electricity\s+power\s+will\s+be\s+disconnected)\b",
    r"\b(?:kyc\s+expired|pending\s+kyc|pan\s+card\s+blocked)\b"
]

# OTP / Credentials / Sensitive payment requests
CREDENTIAL_PATTERNS = [
    r"\b(?:share|send|enter|verify|provide)\s+(?:your\s+)?(?:otp|one\s*time\s*password|pin|mpin|cvv|password)\b",
    r"\b(?:otp\s+is\s+\d{4,8})\b",
    r"\b(?:debit\s+card|credit\s+card|atm\s+card|cvv)\b",
    r"\b(?:scan\s+(?:this\s+)?qr\s*(?:code)?\s+to\s+(?:receive|accept|credit))\b",
    r"\b(?:transfer\s+to\s+upi|upi\s+pin|enter\s+your\s+upi\s+pin)\b",
    r"\b(?:(?:refundable\s+)?(?:processing|customs|registration|security|tax|redelivery)\s+(?:fee|charge|deposit))\b",
    r"\b(?:pay\s+(?:rs\.?|inr|\$|usd|euro|£)\s*\d+)\b",
    r"\b(?:transfer\s+(?:the\s+)?(?:refundable|processing|tax)\s+fee)\b",
    r"\b(?:gift\s+cards?|crypto|usdt|bitcoin)\b"
]

# Too-good-to-be-true / Lottery / Job offers
TOO_GOOD_PATTERNS = [
    r"\b(?:congratulations|congrats)!?\s+(?:your\s+mobile\s+number\s+has\s+won|you\s+(?:have\s+)?won)\b",
    r"\b(?:lucky\s+draw|kbc\s+lottery|whatsapp\s+lucky\s+draw|jackpot)\b",
    r"\b(?:cash\s+prize\s+of\s+rs\.?\s*[\d,]+|won\s+[\d,]+)\b",
    r"\b(?:part[- ]time\s+(?:work\s+from\s+home\s+)?job)\b",
    r"\b(?:rs\.?\s*[\d,]+\s*per\s*(?:day|hour|task))\b",
    r"\b(?:daily\s+income|guaranteed\s+profit|100%\s+guaranteed|risk[- ]free\s+returns?|double\s+your\s+money)\b",
    r"\b(?:like\s+\d*\s*youtube\s+videos|subscribe\s+to\s+channels|telegram\s+supervisor|joining\s+bonus)\b"
]

# Authority / Organization impersonations
AUTHORITY_PATTERNS = [
    r"\b(?:state\s+bank\s+of\s+india|sbi|sbi\s+netbanking|hdfc\s+bank|icici\s+bank|axis\s+bank|pnb)\b",
    r"\b(?:reserve\s+bank\s+of\s+india|rbi)\b",
    r"\b(?:income\s+tax\s+department|it\s+department|cbi|ncb|mha|cyber\s+crime\s+cell|interpol)\b",
    r"\b(?:india\s+post|speed\s+post|fedex|dhl|bluedart|amazon\s+hr|amazon\s+recruiter|phonepe|googlepay)\b",
    r"\b(?:netflix\s+support|apple\s+security|microsoft\s+support|google\s+security\s+team)\b"
]


def extract_urls(text: str) -> List[str]:
    return URL_PATTERN.findall(text)


def analyze_rules(message: str) -> List[RuleFinding]:
    findings: List[RuleFinding] = []
    text_lower = message.lower()

    # 1. URL Analysis
    urls = extract_urls(message)
    shortened_urls = []
    suspicious_tld_urls = []
    lookalike_urls = []

    for u in urls:
        u_low = u.lower()
        if any(short in u_low for short in SHORTENER_DOMAINS):
            shortened_urls.append(u)
        if any(u_low.endswith(tld) or (tld + "/") in u_low for tld in SUSPICIOUS_TLDS):
            suspicious_tld_urls.append(u)
        for brand in LOOKALIKE_BRANDS:
            if re.search(brand, u_low):
                lookalike_urls.append(u)
                break

    if shortened_urls:
        findings.append(RuleFinding(
            category="Suspicious or Shortened URLs",
            severity="high",
            description="Message contains URL shorteners commonly used to disguise malicious phishing destinations.",
            matched_phrases=shortened_urls
        ))

    if suspicious_tld_urls:
        findings.append(RuleFinding(
            category="High-Risk Domain TLDs",
            severity="high",
            description="Message includes links with non-standard top-level domains frequently abused for disposable scam sites.",
            matched_phrases=suspicious_tld_urls
        ))

    if lookalike_urls:
        findings.append(RuleFinding(
            category="Lookalike / Brand Spoofing Link",
            severity="high",
            description="Message contains domain names deceptively imitating genuine banking or service providers.",
            matched_phrases=lookalike_urls
        ))

    # 2. Urgency and Pressure language
    urgency_matches = []
    for pattern in URGENCY_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            urgency_matches.append(match.group(0))
    if urgency_matches:
        findings.append(RuleFinding(
            category="Urgency & Pressure Language",
            severity="high",
            description="Threatening or artificial urgency used to panic the recipient into acting without verifying.",
            matched_phrases=list(dict.fromkeys(urgency_matches))
        ))

    # 3. Request for OTP / Passwords / Money
    cred_matches = []
    for pattern in CREDENTIAL_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            cred_matches.append(match.group(0))
    if cred_matches:
        findings.append(RuleFinding(
            category="Credential & Payment Trap",
            severity="high",
            description="Requests for sensitive security credentials (OTP/PIN), advance payment, or scam payment triggers.",
            matched_phrases=list(dict.fromkeys(cred_matches))
        ))

    # 4. Too-Good-To-Be-True / Lottery / Job Offers
    offer_matches = []
    for pattern in TOO_GOOD_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            offer_matches.append(match.group(0))
    if offer_matches:
        findings.append(RuleFinding(
            category="Too-Good-To-Be-True Offer",
            severity="high",
            description="Claims of unearned lottery winnings, high daily job payouts, or impossible investment returns.",
            matched_phrases=list(dict.fromkeys(offer_matches))
        ))

    # 5. Authority & Sender Impersonation
    auth_matches = []
    for pattern in AUTHORITY_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            auth_matches.append(match.group(0))
    if auth_matches:
        findings.append(RuleFinding(
            category="Institutional Impersonation Claim",
            severity="medium",
            description="Claims to represent reputable banks, couriers, e-commerce, or government agencies.",
            matched_phrases=list(dict.fromkeys(auth_matches))
        ))

    # 6. Poor Grammar, ALL CAPS, Excessive Punctuation
    punctuation_matches = re.findall(r'!{2,}|\?{2,}|[!A-Z\s]{15,}', message)
    if punctuation_matches:
        findings.append(RuleFinding(
            category="Irregular Formatting & Aggressive Punctuation",
            severity="low",
            description="Unprofessional formatting, excessive punctuation, or aggressive casing typical of spam campaigns.",
            matched_phrases=[p.strip() for p in punctuation_matches if len(p.strip()) > 1][:3]
        ))

    return findings
