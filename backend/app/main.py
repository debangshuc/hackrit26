"""
AI Scam Shield — FastAPI monolith.
Single entry point, all modules mounted as routers.
"""
import time
import json
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import aiosqlite

from app.config import get_settings
from app.database import init_db, init_families_table, get_db, DATABASE_PATH
from app.auth.router import router as auth_router
from app.incidents.router import router as incidents_router
from app.detection.router import router as detection_router
from app.alerts.router import router as alerts_router
from app.family.router import router as family_router

settings = get_settings()

# ─── Rate limiter (in-memory, 10 req/min/IP) ─────────────────────────────────
_rate_limit_store: dict[str, list[float]] = defaultdict(list)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialize database."""
    print("[INFO] AI Scam Shield starting...")
    await init_db()
    await init_families_table()
    print("[INFO] Database initialized")
    print(f"[INFO] Demo OTP: {settings.DEMO_OTP}")
    print(f"[INFO] Demo phones: {', '.join(settings.DEMO_PHONES)}")
    yield
    print("[INFO] AI Scam Shield shutting down")


app = FastAPI(
    title="AI Scam Shield API",
    description="Emergency scam response engine — deterministic, source-cited, multilingual.",
    version="1.0.0-mvp",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Demo: allow all. Production: lock down.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Rate Limiter Middleware ──────────────────────────────────────────────────
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Simple rate limiter: 10 requests per minute per IP."""
    # Skip rate limiting for docs and health check
    if request.url.path in ("/docs", "/redoc", "/openapi.json", "/health"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60  # 1 minute

    # Clean old entries
    _rate_limit_store[client_ip] = [
        ts for ts in _rate_limit_store[client_ip] if now - ts < window
    ]

    if len(_rate_limit_store[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please wait a moment and try again."},
        )

    _rate_limit_store[client_ip].append(now)
    return await call_next(request)


# ─── Mount Routers ────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(incidents_router)
app.include_router(detection_router)
app.include_router(alerts_router)
app.include_router(family_router)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0-mvp",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
    }


# ─── PDF Export ───────────────────────────────────────────────────────────────
@app.get("/incidents/{incident_id}/export")
async def export_incident_pdf(
    incident_id: str,
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    Export incident as PDF evidence bundle.
    Uses reportlab for generation.
    """
    from io import BytesIO

    cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    incident = await cursor.fetchone()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    cursor = await db.execute(
        "SELECT * FROM incident_events WHERE incident_id = ? ORDER BY server_ts ASC",
        (incident_id,),
    )
    events = await cursor.fetchall()

    # Generate PDF with reportlab
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, spaceAfter=20)
        story.append(Paragraph("🛡️ AI Scam Shield — Incident Report", title_style))
        story.append(Spacer(1, 12))

        # Incident details
        story.append(Paragraph(f"<b>Incident ID:</b> {incident['id']}", styles['Normal']))
        story.append(Paragraph(f"<b>Severity:</b> {incident['severity'].upper()}", styles['Normal']))
        story.append(Paragraph(f"<b>Status:</b> {incident['status']}", styles['Normal']))
        story.append(Paragraph(f"<b>Created:</b> {incident['created_at']}", styles['Normal']))
        story.append(Paragraph(f"<b>Scam Types:</b> {incident['scam_types']}", styles['Normal']))
        story.append(Spacer(1, 20))

        # Plan
        if incident['plan_json']:
            plan_data = json.loads(incident['plan_json'])
            story.append(Paragraph("<b>Emergency Action Plan:</b>", styles['Heading2']))
            story.append(Spacer(1, 8))
            for step in plan_data.get('plan_steps', []):
                urgent = "🚨 " if step.get('is_urgent') else ""
                story.append(Paragraph(
                    f"{urgent}<b>Step {step['step_number']}:</b> {step['title']}",
                    styles['Normal']
                ))
                story.append(Paragraph(f"<i>Why:</i> {step['why']}", styles['Normal']))
                story.append(Paragraph(f"<i>How:</i> {step['how']}", styles['Normal']))
                if step.get('official_resource'):
                    story.append(Paragraph(
                        f"📞 Official resource: {step['official_resource']}",
                        styles['Normal']
                    ))
                story.append(Spacer(1, 8))

        # Timeline
        story.append(Spacer(1, 16))
        story.append(Paragraph("<b>Incident Timeline:</b>", styles['Heading2']))
        story.append(Spacer(1, 8))
        for event in events:
            payload = json.loads(event['payload']) if event['payload'] else {}
            story.append(Paragraph(
                f"[{event['server_ts']}] <b>{event['event_type']}</b>",
                styles['Normal']
            ))
            if payload:
                detail = ', '.join(f"{k}: {v}" for k, v in payload.items() if k != 'facts')
                if detail:
                    story.append(Paragraph(f"  → {detail}", styles['Normal']))
            story.append(Spacer(1, 4))

        # Disclaimer
        story.append(Spacer(1, 24))
        story.append(Paragraph(
            "⚠️ This report was generated by AI Scam Shield. "
            "Scam Shield will NEVER ask for your OTP, PIN, or password. "
            "All phone numbers and URLs in this report are verified official resources.",
            styles['Normal']
        ))

        doc.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="scam_shield_report_{incident_id[:8]}.pdf"'
            },
        )
    except ImportError:
        # Fallback: return JSON if reportlab not available
        return {
            "incident_id": incident["id"],
            "severity": incident["severity"],
            "status": incident["status"],
            "created_at": str(incident["created_at"]),
            "events": [
                {
                    "event_type": e["event_type"],
                    "payload": json.loads(e["payload"]),
                    "timestamp": str(e["server_ts"]),
                }
                for e in events
            ],
            "note": "PDF export requires reportlab. Install with: pip install reportlab",
        }


# ─── Static Web App Mount ───────────────────────────────────────────────────
import os
from fastapi.staticfiles import StaticFiles

static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

