"""
Detection router — scam check endpoints.
Supports text paste and screenshot upload.
Pipeline: seeded indicator check → if hit: skip LLM → else Gemini classification.
"""
import uuid
import json
import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import aiosqlite

from app.schemas import (
    TextCheckRequest, DetectionResult, RiskLevel, Language,
    UserOut, Severity,
)
from app.auth.deps import get_current_user
from app.detection.indicators import check_indicators
from app.detection.classifier import classify_text, classify_screenshot
from app.config import get_settings
from app.database import get_db

router = APIRouter(prefix="/detect", tags=["detection"])
settings = get_settings()


@router.post("/text", response_model=DetectionResult)
async def detect_text(
    req: TextCheckRequest,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    Analyze text for scam indicators.
    Fast path: check seeded indicator list first.
    Slow path: Gemini classification.
    """
    # Step 1: Check seeded indicators (fast path — no LLM needed)
    indicator_match = check_indicators(req.content)
    if indicator_match:
        result = DetectionResult(
            risk=RiskLevel(indicator_match["risk"]),
            category=indicator_match["category"],
            indicators=indicator_match.get("indicators", [indicator_match.get("indicator", "")]),
            confidence="High",
            explanation=indicator_match["explanation"],
            action="Do NOT respond to this message. Block the sender immediately.",
            matched_known_indicator=True,
        )
    else:
        # Step 2: LLM classification
        gemini_client = _get_gemini_client()
        result = await classify_text(req.content, req.lang, gemini_client)

    # Persist message + analysis
    msg_id = str(uuid.uuid4())
    await db.execute(
        """INSERT INTO messages (id, user_id, content, lang, risk, confidence, analysis_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (msg_id, user.id, req.content, req.lang.value, result.risk.value,
         result.confidence, result.model_dump_json()),
    )
    await db.commit()

    # Fire alert if MEDIUM+ risk and user has family
    if user.family_id and result.risk in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        await _fire_detection_alert(db, user, result)

    return result


@router.post("/screenshot", response_model=DetectionResult)
async def detect_screenshot(
    file: UploadFile = File(...),
    lang: str = Form(default="en"),
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    Analyze screenshot using Gemini's multimodal capability.
    Image-only, 5MB cap, type-sniffed.
    """
    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Only image files are allowed. Got: {file.content_type}",
        )

    # Read and validate size
    image_bytes = await file.read()
    if len(image_bytes) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB.",
        )

    # Encode for Gemini
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    lang_enum = Language(lang)

    # First check if OCR'd text matches indicators (basic check)
    # For screenshots, we go straight to Gemini multimodal
    gemini_client = _get_gemini_client()
    result = await classify_screenshot(image_b64, file.content_type, lang_enum, gemini_client)

    # Persist
    msg_id = str(uuid.uuid4())
    await db.execute(
        """INSERT INTO messages (id, user_id, content, lang, risk, confidence, analysis_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (msg_id, user.id, "[screenshot upload]", lang, result.risk.value,
         result.confidence, result.model_dump_json()),
    )
    await db.commit()

    # Fire alert if HIGH+ risk
    if user.family_id and result.risk in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        await _fire_detection_alert(db, user, result)

    return result


def _get_gemini_client():
    """Get Gemini client if API key is configured."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel(settings.GEMINI_MODEL)
    except Exception as e:
        print(f"Failed to initialize Gemini: {e}")
        return None


async def _fire_detection_alert(
    db: aiosqlite.Connection,
    user: UserOut,
    result: DetectionResult,
):
    """Fire a sanitized alert to guardian for HIGH+ risk detections."""
    alert_id = str(uuid.uuid4())
    summary = f"⚠ {result.risk.value.upper()} — Possible {result.category.replace('_', ' ')} pattern detected on {user.name}'s device."
    why = f"Indicators: {', '.join(result.indicators[:3])}"

    await db.execute(
        """INSERT INTO alerts (id, family_id, member_id, severity, category, summary, why, payload_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (alert_id, user.family_id, user.id, result.risk.value, result.category,
         summary, why, json.dumps({"type": "detection", "risk": result.risk.value})),
    )
    await db.commit()
