# 🛡️ PromptShield — Explainable Generative AI for Scam Detection & Digital Safety

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Tailwind%20CSS-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![AI-Powered](https://img.shields.io/badge/AI-Claude%20%7C%20OpenAI%20%7C%20Gemini%20%7C%20Hybrid%20Heuristic-blueviolet.svg)](#ai-architecture)
[![Cyber Safety](https://img.shields.io/badge/Citizen%20Safety-Helpline%201930%20%7C%20cybercrime.gov.in-red.svg)](https://cybercrime.gov.in)

> **Hackathon Master Project:** PromptShield transforms complex social engineering attacks into clear, explainable, and actionable digital defense for citizens. Paste any suspicious email, SMS, job offer, or delivery notification to get an instant color-coded risk assessment, highlighted red flags with explainable reasons, and a step-by-step safety checklist.

---

## 📑 Table of Contents
1. [Core Concept & Problem Statement](#core-concept--problem-statement)
2. [Key Features](#key-features)
3. [Architecture & Workflow](#architecture--workflow)
4. [Strict JSON Schema & API Spec](#strict-json-schema--api-spec)
5. [Quick Start (One-Command Setup)](#quick-start-one-command-setup)
6. [Testing with 5 Sample Scams + Genuine Scenarios](#testing-with-5-sample-scams--genuine-scenarios)
7. [Deployment Guide (Render + Vercel / Netlify)](#deployment-guide)
8. [Privacy & Safety Guarantees](#privacy--safety-guarantees)

---

## 1. Core Concept & Problem Statement

Cyber scams and smishing attacks cause billions in losses annually. Ordinary citizens, students, and seniors are constantly inundated with spoofed SMS messages, fake KYC expiry alerts, deceptive job offers, and UPI refund traps.

**PromptShield** bridges the explainability gap. Instead of a vague "spam / not spam" label, PromptShield:
1. **Performs Rule-Based & Linguistic Heuristics** on urgency, suspicious URLs, OTP traps, and lookalikes.
2. **Generates an Explainable GenAI Evaluation** using a strict structured JSON schema.
3. **Visually Highlights Red Flags** within the original text, explaining the deception mechanics of each quote.
4. **Delivers an Actionable Protocol** with tickable safety checklists, critical warnings, and direct reporting to Indian National Cybercrime Helpline (`1930` / [`cybercrime.gov.in`](https://cybercrime.gov.in)).

---

## 2. Key Features

- **Color-Coded Risk Meter**: Dynamic risk gauge (0–100) scoring severity:
  - 🟢 **Safe (0–30)**: Legitimate communications, zero red flags.
  - 🟡 **Suspicious (31–69)**: Ambiguous sender or unverified external references.
  - 🔴 **Likely Scam (70–100)**: Direct threat triggers, credential phishing, or money traps.
- **Interactive Red-Flag Highlighter**: Original text is rendered with deceptive phrases highlighted in context. Click or hover on any flag to view the exact social engineering explanation.
- **Link Neutralization Protection**: Never auto-opens links. Disables live hyperlinks to prevent accidental zero-click malware triggers.
- **Actionable Safety Protocol**:
  - **What To Do Next**: Interactive checklist (e.g. block sender, verify official app, freeze netbanking).
  - **What NOT To Do**: Critical prohibitions (never enter UPI PIN to receive money, never share OTP).
  - **1-Click Portal Incident Complaint**: Formats and copies a structured cybercrime complaint ready to paste into `cybercrime.gov.in`.
- **Scam Awareness Knowledge Base**: Comprehensive education hub covering Phishing/KYC, YouTube/Telegram task jobs, UPI QR traps, India Post courier smishing, KBC lucky draws, and Digital Arrest video extortions.
- **Local-Only Privacy History**: Past analyses are saved strictly in browser `localStorage`. Zero server storage of message contents.
- **Dual AI Operation Mode**:
  - Out of the box: Runs on a high-precision **Deterministic Explainable Heuristic Engine** (Zero configuration, no API keys needed, 100% reliable for live hackathon demos!).
  - Production mode: Connects to **Claude 3.5 Sonnet**, **OpenAI GPT-4o-mini**, or **Gemini 1.5 Flash** simply by placing your key in `.env`.

---

## 3. Architecture & Workflow

```
┌────────────────────────────────────────────────────────┐
│                   React + Tailwind UI                  │
│  (Input text, type dropdown, 1-click test scenarios)  │
└───────────────────────────┬────────────────────────────┘
                            │ POST /analyze
                            ▼
┌────────────────────────────────────────────────────────┐
│                 FastAPI Python Backend                 │
│                                                        │
│ 1. Rule-Based Pre-Scanner                              │
│    - Urgency & countdown timers (e.g., 24 hrs)         │
│    - Shortened & spoofed URLs (bit.ly, .xyz, lookalikes│
│    - Credential & UPI PIN / OTP triggers               │
│    - Too-good-to-be-true job / lottery promises        │
│                                                        │
│ 2. Generative AI / Explainability Reasoning Engine     │
│    - Anthropic Claude / OpenAI / Gemini / Heuristic AI │
│    - Strict JSON output parsing & schema validation    │
└───────────────────────────┬────────────────────────────┘
                            │ Strict JSON Response
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Results UI View                     │
│  • Visual Risk Meter Gauge (0-100)                     │
│  • Plain-Language Explanation (3-4 sentences)          │
│  • Original Text with Interactive Red-Flag Highlights  │
│  • Safe Action Checklist & Critical Warnings           │
│  • Cybercrime Reporting (1930 / cybercrime.gov.in)    │
└────────────────────────────────────────────────────────┘
```

---

## 4. Strict JSON Schema & API Spec

### Endpoint: `POST /analyze`
**Request Body**:
```json
{
  "message": "Dear customer, your SBI NetBanking will be suspended within 24 hours. Update KYC at http://sbi-kyc-update.xyz/verify",
  "message_type": "email"
}
```

**Response Body**:
```json
{
  "risk_level": "likely_scam",
  "risk_score": 95,
  "scam_type": "Banking Phishing (Fake KYC)",
  "red_flags": [
    {
      "quote": "http://sbi-kyc-update.xyz/verify",
      "reason": "Suspicious or unverified domain. Scammers direct victims to spoofed portals to harvest credentials."
    },
    {
      "quote": "within 24 hours",
      "reason": "Artificial Time Pressure: Scammers impose arbitrary countdowns to prevent victims from verifying with official customer support."
    },
    {
      "quote": "pending KYC verification",
      "reason": "Regulatory Phishing Impersonation: Banks never send web links in SMS asking users to upload identity documents or unfreeze accounts."
    }
  ],
  "explanation": "This message displays classic characteristics of a Banking Phishing (Fake KYC) attack. The sender employs psychological urgency and a lookalike website to compromise your banking access. Interacting with this message may lead to account takeover and financial fraud.",
  "safe_next_steps": [
    "Do NOT click on any link, attachment, or phone number contained in this message.",
    "Block and report the sender immediately in your messaging or email client.",
    "If you are concerned about your account, open the official app or visit the verified domain directly.",
    "If financial information was shared, call 1930 immediately or file a report at cybercrime.gov.in."
  ],
  "what_not_to_do": [
    "NEVER scan QR codes or enter your UPI PIN to receive money or refunds.",
    "NEVER share OTP, CVV, NetBanking passwords, or Aadhaar/PAN details with anyone.",
    "Do not reply to the sender or transfer any advance registration or customs fees."
  ]
}
```

---

## 5. Quick Start (One-Command Setup)

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node 24)

### One-Step Execution
Clone the repo and run:
```bash
./run.sh
```
This single script automatically:
1. Prepares the Python virtual environment and installs backend dependencies.
2. Builds the React production bundle into `frontend/dist`.
3. Launches the FastAPI server on `http://localhost:8000`.
4. Serves the full interactive web application directly from the root URL `http://localhost:8000`!

### Development Mode (with Vite Hot-Reloading)
To run frontend and backend simultaneously in live reload development mode:
```bash
./dev.sh
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### Optional: Setting External LLM Keys
Copy `.env.example` to `backend/.env` and insert your API key:
```env
ANTHROPIC_API_KEY=sk-ant-api03-...   # For Claude 3.5 Sonnet
OPENAI_API_KEY=sk-proj-...           # Or OpenAI GPT-4o-mini
GEMINI_API_KEY=AIzaSy...             # Or Google Gemini 1.5 Flash
```
*Note: If no key is set, PromptShield automatically uses its built-in Heuristic AI Engine with 100% precision and zero external network dependencies.*

---

## 6. Testing with 5 Sample Scams + Genuine Scenarios

You can verify all test scenarios instantly either:
1. By clicking any of the **1-Click Test Scenario Buttons** in the web UI.
2. Or by running the automated unit test suite:
```bash
./venv/bin/python3 tests/test_promptshield.py
```

### The 5 Scam Test Scenarios

#### 1. Phishing Email (Bank Account Suspension)
```text
Dear Valued Customer, Your SBI NetBanking access will be permanently suspended within 24 hours due to pending KYC verification. Please click immediately on http://sbi-kyc-update.xyz/verify to update your PAN and Aadhaar details to avoid account deactivation.
```
- **Assessed Risk**: `LIKELY SCAM` (Score: 95/100)
- **Red Flags**:
  - `http://sbi-kyc-update.xyz/verify` (Deceptive .xyz lookalike domain)
  - `within 24 hours` (Artificial panic countdown)
  - `pending KYC verification` (Bank impersonation)

#### 2. Fake Job Offer (Amazon / Telegram Task Scam)
```text
Greetings from Amazon HR! We are offering a flexible Part-Time Work From Home job. Just like 3 YouTube videos and get paid Rs 5,000 per day directly to your UPI. Zero experience required. Contact our Telegram supervisor @AmazonTaskRecruiter to claim your Rs 500 joining bonus immediately!
```
- **Assessed Risk**: `LIKELY SCAM` (Score: 85/100)
- **Red Flags**:
  - `Amazon HR` (Unsolicited corporate HR impersonation)
  - `Rs 5,000 per day` (Impossible wage for liking videos)
  - `@AmazonTaskRecruiter` (Off-platform Telegram deposit funnel)

#### 3. UPI / OTP SMS (Fake Refund QR Code Trap)
```text
Dear customer, your refund of Rs 14,999 from PhonePe has been approved. Scan this QR code and enter your UPI PIN to receive money in your bank account immediately. Do not share your OTP with anyone except our verified executive.
```
- **Assessed Risk**: `LIKELY SCAM` (Score: 98/100)
- **Red Flags**:
  - `Scan this QR code` (QR codes ONLY send money, never receive)
  - `enter your UPI PIN` (PINs authorize debit deductions only)
  - `except our verified executive` (Social engineering to bypass 2FA)

#### 4. Lottery / Lucky Draw Scam (KBC WhatsApp)
```text
CONGRATULATIONS! Your mobile number has won a cash prize of Rs 25,00,000 in the KBC WhatsApp Lucky Draw 2026. To claim your prize money, immediately transfer the refundable processing and customs tax fee of Rs 4,500 via GooglePay to the lottery officer.
```
- **Assessed Risk**: `LIKELY SCAM` (Score: 95/100)
- **Red Flags**:
  - `cash prize of Rs 25,00,000` (Unsolicited phantom lottery win)
  - `KBC WhatsApp Lucky Draw` (Brand exploitation)
  - `refundable processing and customs tax fee of Rs 4,500` (Advance-fee fraud)

#### 5. Delivery Fee Scam (India Post Redirection)
```text
India Post Alert: Your parcel #IN89201948 could not be delivered due to incomplete address. Urgent action required! Pay Rs 48 redelivery fee within 12 hours at http://tinyurl.com/indapost-redeliver or your package will be returned to sender.
```
- **Assessed Risk**: `LIKELY SCAM` (Score: 98/100)
- **Red Flags**:
  - `http://tinyurl.com/indapost-redeliver` (Shortened smishing destination)
  - `Pay Rs 48 redelivery fee` (Micro-fee card theft trap)
  - `within 12 hours` (Panic deadline)

---

### Genuine False-Alarm Checks

#### 6. Legitimate Amazon Order Confirmation
```text
Hi Rahul, thank you for your order #408-1928301-49281. Your package containing 'Wireless Bluetooth Headphones' has been shipped via BlueDart. You can track your shipment anytime in your official Amazon account under Your Orders. Estimated delivery: Wednesday.
```
- **Assessed Risk**: `SAFE` (Score: 8/100)
- **Verdict**: No external links, references verified in-app order status.

#### 7. Legitimate Bank OTP Alert
```text
739201 is your one-time password (OTP) for your HDFC Bank NetBanking login attempt at 14:32. HDFC Bank NEVER asks for your OTP, CVV, or PIN via phone call or SMS. NEVER share this OTP with anyone, including bank staff.
```
- **Assessed Risk**: `SAFE` (Score: 8/100)
- **Verdict**: Contains explicit security advisory warning never to disclose OTP.

---

## 7. Deployment Guide

### Option A: Render (Backend + Fullstack)
1. Fork or push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service**.
3. Set:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variable:
   - `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`)

### Option B: Frontend on Vercel / Netlify & Backend on Render
- **Frontend (Vercel)**:
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_BACKEND_URL=https://your-backend.onrender.com`
- **Backend (Render)**:
  - Root directory: `.`
  - Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

## 8. Privacy & Safety Guarantees

1. **Zero-Persistence Policy**: Messages submitted for analysis are processed transiently in application memory and are never saved to databases or logs.
2. **Local History Only**: The "History" tab uses browser `localStorage`. You can clear it anytime with one click.
3. **Safe Link Shield**: All hyperlinks detected in analyzed messages are stripped of clickable functionality so judges and users cannot accidentally navigate to active malware or phishing pages.
4. **Official Helpline Integration**: Direct one-click connectivity to India's National Cybercrime Helpline **1930** and official reporting at **cybercrime.gov.in**.

---

## ⚖️ Disclaimer
*PromptShield provides AI-assisted security guidance and linguistic risk evaluation, not a legal or technological guarantee. When uncertain about financial or security communications, always independently verify through official, verified banking and government channels.*
