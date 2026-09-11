# AI Scam Shield — Hackathon MVP

> **"Detect the scam. Understand why. Know what to do next."**

AI Scam Shield is a victim-first cyber fraud detection and post-incident emergency response engine. Unlike traditional security tools that merely label messages as suspicious, AI Scam Shield directly tackles the critical post-scam window: helping victims who have already clicked a malicious link or sent money take immediate, structured action to minimize financial loss and preserve evidence.

---

## 🚀 Key Product Differentiator

Most scam filters stop at: *"This looks like spam."*

**AI Scam Shield asks:**
1. **Is this a scam?** (Semantic analysis across Urdu, Hindi, Hinglish, Bengali, Banglish, and English)
2. **Why is this suspicious?** (Specific red flag indicators: artificial urgency, impersonation, collect requests, remote-access traps)
3. **What must you do right now?** (Sequential, prioritized actions)
4. **Did you already send money?** (One-click transition to emergency response: bank freeze steps, local evidence checklist, incident form, and structured complaint summary generator for cybercrime reporting).

---

## 🏛️ Architecture Overview

The system is built on a modern Next.js TypeScript stack with resilient server-side Gemini semantic analysis:

```
Victim Input (Text / SMS / WhatsApp / Call Transcript)
                  │
                  ▼
         [Next.js App Router]
                  │
                  ▼
        [/api/analyze (Server-Side)]
        ├── 1. Input sanitization & boundaries
        ├── 2. Multilingual semantic analysis
        ├── 3. Google Gemini 2.5 Flash
        └── 4. Zod strict schema validation
                  │
                  ▼
       Structured Analysis UI
       ├── Verdict & Risk Level
       ├── Red Flag Indicators
       └── Prioritized Actions
                  │
                  ▼
      [I ALREADY SENT MONEY]
                  │
                  ▼
     Emergency Response Subsystem
     ├── 8 Immediate Bank/Helpline Steps
     ├── Local Evidence Checklist (localStorage)
     ├── Incident Details Form
     └── Formatted Incident Summary Generator (.txt download & copy)
```

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript.
- **Server API**: Next.js Node.js server route (`/api/analyze`) ensuring `GEMINI_API_KEY` is strictly server-side and never exposed to the browser.
- **Resilience Layer**: Local pattern matcher providing 100% demo uptime and safe fallback guidance even if network or API keys are unavailable.
- **Preserved Backend**: FastAPI + SQLite backend (`/backend`) preserved with full family guardian and timeline export capabilities.

---

## ⚙️ Environment Variables & Setup

Create a `.env.local` file in `hackrit26/frontend/` or set system environment variables:

```bash
# Gemini Configuration (Server-side only)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Security Note:** The API key is read exclusively on the server (`src/app/api/analyze/route.ts`) and is never leaked to client bundles.

---

## 💻 Running the Application

### 1. Prerequisites
- Node.js v20+ (Node v22.14 included in `.tools/node-v22.14.0-win-x64`)
- Python 3.12+ (for optional FastAPI backend)

### 2. Quick Start (Frontend MVP)

```powershell
cd hackrit26\frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```powershell
cd hackrit26\frontend
npm run build
npm start
```

### 4. Running the Optional FastAPI Backend (Preserved Feature)

```powershell
cd hackrit26\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

---

## 🚨 Emergency Response Workflow

When a victim clicks **"I ALREADY SENT MONEY"**:
1. **Helpline Alert**: Prominent guidance to call **1930** (National Cyber Crime Reporting Helpline) or file at `cybercrime.gov.in`.
2. **8 Sequential Actions**: Contact bank fraud desk, report transaction UTR, capture screenshots, preserve chats, avoid recovery scams, secure credentials.
3. **Interactive Evidence Checklist**: Check off items (`Transaction ID`, `Screenshots`, `Scammer phone`, `Bank contacted`, `Account secured`). State is saved in `localStorage` and persists across page reloads.
4. **Incident Details Form**: Capture loss amount, payment method, transaction ID, date/time, scammer contact info, and narrative.
5. **Incident Summary Generator**: Formats a clean, deterministic evidence summary without hallucinations (`Not provided` used for missing fields), ready to copy or download as `.txt`.

---

## 🧪 Verification & Tests

Run automated specification and contract tests:

```powershell
# 1. Test Agent Spec Contract & Rules (24 tests)
node --experimental-strip-types test_spec_verification.mjs

# 2. Test Live HTTP API Endpoints
python test_api_live.py

# 3. Test Backend End-to-End Suite
cd backend
python test_backend_e2e.py
```

---

## 🛡️ Security Review

- **Zero Client Secret Exposure**: `GEMINI_API_KEY` is loaded strictly server-side.
- **Input Sanitization**: Length validation (8,000 char cap), whitespace trimming, and empty input rejection.
- **Schema Validation**: All model output is parsed and verified via Zod before rendering.
- **Safe Guidance & Transparency**: Clearly states it is an evidence organizer; never claims to guarantee fund recovery or file official police complaints autonomously.
- **Local Persistence**: Only non-sensitive checklist selections and user-entered incident drafts are cached in browser `localStorage`.

---

## ⚠️ Known Limitations

1. **OCR / Screenshot Parsing**: Direct text analysis is the primary verified path. Image screenshot analysis uses server-side multimodal prompts when image files are submitted.
2. **Bank Integration**: AI Scam Shield does not connect directly to core banking APIs or initiate chargebacks; it guides the victim to execute them immediately.
3. **Helpline Submission**: Does not autonomously submit police complaints to `cybercrime.gov.in` (which requires victim Aadhaar OTP authentication).