import re
from typing import List
from .models import RuleFinding

# URL pattern to extract URLs
URL_PATTERN = re.compile(
    r'(?:https?:\/\/|www\.)[^\s<>"\']+|[a-zA-Z0-9_\-\.]+\.(?:com|org|net|xyz|top|site|club|buzz|info|click|live|in|co|tech|online|store|vip|app|link|cc|icu|rest|work|bar|stream|to|is|pw|me)[^\s<>"\']*',
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
    ".work", ".cc", ".link", ".online", ".site", ".tk", ".ml", ".ga", ".cf", ".gq", ".bar", ".pw"
]

# Targeted lookalike or spoof brand keywords
LOOKALIKE_BRANDS = [
    r"sbi[-_.]?kyc", r"hdfc[-_.]?net", r"icici[-_.]?secure", r"paytm[-_.]?verify",
    r"paypa[l1]", r"amaz[o0]n", r"netfl[i1]x", r"apple[-_.]?id", r"ind[a-z]*post",
    r"fedex[-_.]?track", r"dhl[-_.]?express", r"income[-_.]?tax", r"gov[-_.]?refund",
    r"echallan[-_.]?parivahan", r"jio[-_.]?5g", r"electricity[-_.]?bill"
]

# Piracy / Prohibited illegal streaming platforms (e.g. iBomma, MovieRulz)
PIRACY_DOMAINS_PATTERNS = [
    r"\b(?:ibomma|i-bomma|movierulz|tamilmv|tamilrockers|filmyzilla|bolly4u|pagalworld|123movies|fmovies|torrent|piratebay|yts|rarbg|cinebloom)\b",
    r"\b(?:free\s+movie\s+download|watch\s+movie\s+free|download\s+full\s+movie|hd\s+movie\s+download|watch\s+latest\s+leaked\s+movie)\b",
    r"\b(?:ibomma\.[a-z]+|movierulz\.[a-z]+|tamilmv\.[a-z]+)\b"
]

# Prohibited adult, pornographic lures & sextortion extortion
ADULT_SEXTORTION_PATTERNS = [
    r"\b(?:recorded\s+you\s+watching|recorded\s+your\s+screen|dirty\s+video\s+of\s+you|leaked\s+video\s+of\s+you|compromised\s+your\s+webcam)\b",
    r"\b(?:send\s+to\s+all\s+your\s+contacts|pay\s+bitcoin\s+or\s+leak|reputation\s+destroyed|blackmail)\b",
    r"\b(?:xvideos|xnxx|porn|pornhub|adult\s+cam|nude\s+video|camgirl|escort\s+service|private\s+mms\s+leak|horny\s+girls|adult\s+chat)\b",
    r"\b(?:watch\s+private\s+leaked\s+video|dating\s+hookup\s+app|leaked\s+onlyfans)\b"
]

# Malicious APK droppers & unverified app installation
APK_DROPPER_PATTERNS = [
    r"\b(?:download\s+apk|install\s+apk|download\s+mod\s+apk|\.apk\b|install\s+player\s+app|whatsapp\s+pink|free\s+netflix\s+apk|download\s+loan\s+apk|echallan\.apk)\b"
]

# Digital Arrest & Law Enforcement Impersonation Extortion
DIGITAL_ARREST_PATTERNS = [
    r"\b(?:digital\s+arrest|cbi\s+officer|mumbai\s+crime\s+branch|narcotics\s+control\s+bureau|ncb\s+officer)\b",
    r"\b(?:parcel\s+containing\s+(?:drugs|narcotics|mdma|passports|contraband))\b",
    r"\b(?:arrest\s+warrant\s+(?:issued|pending)|stay\s+on\s+(?:skype|video\s+call)\s+for\s+(?:statement|investigation))\b",
    r"\b(?:transfer\s+(?:funds|money)\s+to\s+rbi\s+verification\s+account|prove\s+your\s+innocence)\b"
]

# Electricity / Utility Power Disconnection Scam
ELECTRICITY_DISCONNECTION_PATTERNS = [
    r"\b(?:electricity\s+power\s+will\s+be\s+disconnected\s+(?:tonight|today|at\s+\d+))\b",
    r"\b(?:power\s+supply\s+will\s+be\s+(?:disconnected|blocked|cut\s+off))\b",
    r"\b(?:previous\s+month\s+bill\s+was\s+not\s+updated|contact\s+our\s+electricity\s+officer)\b"
]

# Credit Card Reward Points / Cashback Phishing
REWARD_POINTS_PATTERNS = [
    r"\b(?:credit\s+card\s+(?:reward\s+)?points?\s+(?:worth\s+rs\.?\s*\d+|expir(?:e|ing)\s+today))\b",
    r"\b(?:redeem\s+(?:your\s+)?(?:reward\s+)?points?\s+(?:into|as)\s+cash)\b",
    r"\b(?:sbi\s+card\s+points|hdfc\s+reward\s+points)\b"
]

# Traffic E-Challan Fake Penalty APK
ECHALLAN_PATTERNS = [
    r"\b(?:traffic\s+violation\s+(?:fine|challan)|unpaid\s+traffic\s+challan|e-challan\s+notice)\b",
    r"\b(?:download\s+(?:parivahan|echallan)\.apk|license\s+will\s+be\s+seized)\b"
]

# Income Tax Refund Phishing
TAX_REFUND_PATTERNS = [
    r"\b(?:income\s+tax\s+refund\s+of\s+rs\.?\s*[\d,]+|tax\s+refund\s+has\s+been\s+approved)\b",
    r"\b(?:submit\s+your\s+bank\s+account\s+details\s+to\s+claim\s+refund)\b"
]

# SIM Deactivation / 5G e-SIM KYC Scam
SIM_BLOCK_PATTERNS = [
    r"\b(?:sim\s+(?:card\s+)?(?:will\s+be\s+)?(?:deactivated|blocked|disconnected)\s+today)\b",
    r"\b(?:5g\s+(?:sim|upgrade|esim)\s+kyc\s+pending)\b"
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
    r"\b(?:kyc\s+expired|pending\s+kyc|pan\s+card\s+blocked)\b"
]

# OTP / Credentials / Sensitive payment requests (Harm Vector: Asking user to share/provide/pay)
CREDENTIAL_PATTERNS = [
    r"\b(?:share|send|provide)\s+(?:your\s+)?(?:otp|one\s*time\s*password|pin|mpin|cvv|password)\b",
    r"\b(?:share\s+your\s+otp\s+with|except\s+our\s+verified\s+executive)\b",
    r"\b(?:debit\s+card\s+(?:number|details)|credit\s+card\s+(?:number|details)|cvv)\b",
    r"\b(?:scan\s+(?:this\s+)?qr\s*(?:code)?\s+to\s+(?:receive|accept|credit))\b",
    r"\b(?:enter\s+(?:your\s+)?upi\s*pin\s+to\s+(?:receive|credit|accept))\b",
    r"\b(?:(?:refundable\s+)?(?:processing|customs|registration|security|tax|redelivery)\s+(?:fee|charge|deposit))\b",
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

# Genuine Security & Transaction Patterns (Zero False Alarms)
GENUINE_SECURITY_PATTERNS = [
    r"\b(?:never\s+share\s+(?:this\s+)?otp|do\s+not\s+share\s+otp|bank\s+never\s+asks\s+for\s+otp|strictly\s+confidential)\b",
    r"\b(?:if\s+not\s+(?:requested|initiated)\s+by\s+you|call\s+customer\s+care\s+immediately)\b",
    r"\b(?:valid\s+for\s+\d+\s*(?:minutes?|mins?))\b",
    r"\b(?:for\s+(?:your\s+)?transaction\s+of\s+(?:rs\.?|inr))\b",
    r"\b(?:spent\s+on\s+your\s+card|debited\s+from\s+a\/c|credited\s+to\s+your\s+a\/c|available\s+balance)\b",
    r"\b(?:pnr\s+(?:no\.?|number)?\s*:?\s*\d{10}|coach\s+[a-z]\d+|seat\s+confirmed)\b",
    r"\b(?:track\s+your\s+(?:package|order|shipment)\s+in\s+(?:the\s+)?official\s+app)\b",
    r"\b(?:your\s+ride\s+is\s+arriving|driver\s+(?:name|details)?\s*:?\s*[a-z]+|otp\s+to\s+start\s+ride)\b",
    r"\b(?:bill\s+payment\s+of\s+rs\.?\s*[\d,]+\s*(?:received|successful)|thank\s+you\s+for\s+paying\s+your\s+bill)\b"
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
    piracy_urls = []
    adult_urls = []

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
        if any(p in u_low for p in ["ibomma", "movierulz", "tamilmv", "tamilrockers", "filmyzilla", "torrent"]):
            piracy_urls.append(u)
        if any(a in u_low for a in ["xxx", "porn", "xnxx", "xvideos", "cam", "sex", "nude"]):
            adult_urls.append(u)

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

    # 2. Digital Arrest & Law Enforcement Extortion
    da_matches = []
    for pattern in DIGITAL_ARREST_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            da_matches.append(match.group(0))
    if da_matches:
        findings.append(RuleFinding(
            category="Digital Arrest & Law Enforcement Extortion",
            severity="high",
            description="Fabricated allegations of drug trafficking or digital arrest to intimidate victim into transferring funds.",
            matched_phrases=list(dict.fromkeys(da_matches))
        ))

    # 3. Electricity Disconnection Scam
    elec_matches = []
    for pattern in ELECTRICITY_DISCONNECTION_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            elec_matches.append(match.group(0))
    if elec_matches:
        findings.append(RuleFinding(
            category="Electricity Disconnection Fraud",
            severity="high",
            description="Threat of imminent electricity shutoff to trick victim into calling unverified phone numbers or installing APKs.",
            matched_phrases=list(dict.fromkeys(elec_matches))
        ))

    # 4. Credit Card Reward Points Phishing
    pts_matches = []
    for pattern in REWARD_POINTS_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            pts_matches.append(match.group(0))
    if pts_matches:
        findings.append(RuleFinding(
            category="Credit Card Points Trap",
            severity="high",
            description="Fabricated reward points expiration lure designed to harvest full card numbers, CVVs, and NetBanking passwords.",
            matched_phrases=list(dict.fromkeys(pts_matches))
        ))

    # 5. Traffic E-Challan APK
    challan_matches = []
    for pattern in ECHALLAN_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            challan_matches.append(match.group(0))
    if challan_matches:
        findings.append(RuleFinding(
            category="Traffic E-Challan Fake Penalty",
            severity="high",
            description="False traffic violation fine instructing recipient to download a malicious APK file.",
            matched_phrases=list(dict.fromkeys(challan_matches))
        ))

    # 6. Piracy & Illicit Media Links (iBomma, torrents, etc.)
    piracy_matches = list(piracy_urls)
    for pattern in PIRACY_DOMAINS_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            piracy_matches.append(match.group(0))
    if piracy_matches:
        findings.append(RuleFinding(
            category="Prohibited Piracy & Illicit Streaming Domain",
            severity="high",
            description="Message links to prohibited movie piracy sites (e.g. iBomma, MovieRulz) known for distributing spyware, adware, and illicit trojans.",
            matched_phrases=list(dict.fromkeys(piracy_matches))
        ))

    # 7. Prohibited Adult Content & Sextortion Extortion
    adult_matches = list(adult_urls)
    for pattern in ADULT_SEXTORTION_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            adult_matches.append(match.group(0))
    if adult_matches:
        findings.append(RuleFinding(
            category="Prohibited Adult Content & Sextortion Extortion",
            severity="high",
            description="Message contains adult honeytrap lures, prohibited explicit links, or webcam sextortion threats demanding cryptocurrency ransom.",
            matched_phrases=list(dict.fromkeys(adult_matches))
        ))

    # 8. Untrusted APK Droppers
    apk_matches = []
    for pattern in APK_DROPPER_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            apk_matches.append(match.group(0))
    if apk_matches:
        findings.append(RuleFinding(
            category="Malicious APK / Trojan Dropper",
            severity="high",
            description="Message instructs the recipient to sideload an untrusted Android APK file, risking device compromise and credential theft.",
            matched_phrases=list(dict.fromkeys(apk_matches))
        ))

    # 9. Urgency and Pressure language
    urgency_matches = []
    for pattern in URGENCY_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            urgency_matches.append(match.group(0))
    if urgency_matches:
        findings.append(RuleFinding(
            category="Urgency & Pressure Language",
            severity="medium",
            description="Threatening or artificial urgency used to panic the recipient into acting without verifying.",
            matched_phrases=list(dict.fromkeys(urgency_matches))
        ))

    # 10. Request for OTP / Passwords / Money
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

    # 11. Too-Good-To-Be-True / Lottery / Job Offers
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

    # 12. Authority & Sender Impersonation
    auth_matches = []
    for pattern in AUTHORITY_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            auth_matches.append(match.group(0))
    if auth_matches:
        findings.append(RuleFinding(
            category="Institutional Impersonation Claim",
            severity="low",
            description="Claims to represent reputable banks, couriers, e-commerce, or government agencies.",
            matched_phrases=list(dict.fromkeys(auth_matches))
        ))

    return findings
