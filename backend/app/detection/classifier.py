"""
Detection classifier — Gemini-based scam classification.
Handles both text and screenshot (multimodal) inputs.
"""
import json
from typing import Optional

from app.schemas import DetectionResult, RiskLevel, Language


async def classify_text(
    content: str,
    lang: Language,
    gemini_client=None,
) -> DetectionResult:
    """
    Classify text content using Gemini.
    Returns structured DetectionResult.
    """
    if not gemini_client:
        # Stub: return a default analysis when Gemini is not configured
        return DetectionResult(
            risk=RiskLevel.MEDIUM,
            category="analysis_unavailable",
            indicators=["AI analysis not configured"],
            confidence="Low",
            explanation="AI-based analysis is not available. Please review the message carefully and check for common scam indicators like urgent payment demands, unknown links, or requests for personal information.",
            action="Review the message carefully. If it asks for money, OTP, or personal details, it is likely a scam.",
            matched_known_indicator=False,
        )

    lang_name = {"bn": "Bengali (বাংলা)", "hi": "Hindi (हिन्दी)", "en": "English"}[lang.value]

    prompt = (
        "You are a scam detection expert for India. Analyze the following message and determine if it's a scam.\n\n"
        f"Message:\n\"\"\"\n{content}\n\"\"\"\n\n"
        "Respond with a JSON object containing:\n"
        "- risk: 'low', 'medium', 'high', or 'critical'\n"
        "- category: a short category name like 'electricity_bill_scam', 'lottery_fraud', 'kyc_scam', 'job_scam', etc.\n"
        "- indicators: array of specific red flags found (e.g., 'urgent payment demand', 'lookalike domain', 'threatens disconnection')\n"
        "- confidence: 'Low', 'Medium', or 'High' (NEVER use percentages)\n"
        f"- explanation: 2 sentences explaining the analysis in {lang_name}. Use simple language.\n"
        "- action: one sentence recommending what to do next\n\n"
        "Rules:\n"
        "- NEVER say 'you are being scammed' — say 'this resembles a known scam pattern'\n"
        "- For medium risk, say 'proceed with caution'\n"
        "- Be specific about which indicators you found\n"
        "- If the message is clearly legitimate, say so clearly"
    )

    try:
        response = await gemini_client.generate_content_async(
            contents=[{"role": "user", "parts": [{"text": prompt}]}],
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.2,
            },
        )

        result_text = response.text
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1]
            result_text = result_text.rsplit("```", 1)[0]

        data = json.loads(result_text)
        return DetectionResult(
            risk=RiskLevel(data.get("risk", "medium")),
            category=data.get("category", "unknown"),
            indicators=data.get("indicators", []),
            confidence=data.get("confidence", "Medium"),
            explanation=data.get("explanation", ""),
            action=data.get("action", "Review this message carefully."),
            matched_known_indicator=False,
        )
    except Exception as e:
        print(f"Gemini classification failed: {e}")
        return DetectionResult(
            risk=RiskLevel.MEDIUM,
            category="analysis_error",
            indicators=["Analysis could not be completed"],
            confidence="Low",
            explanation="We couldn't complete the AI analysis. Please review the message manually for common scam signs.",
            action="Be cautious. Do not share OTP, PIN, or personal information.",
            matched_known_indicator=False,
        )


async def classify_screenshot(
    image_bytes: bytes,
    image_mime: str,
    lang: Language,
    gemini_client=None,
) -> DetectionResult:
    """
    Classify screenshot using Gemini's multimodal capability.
    The model reads the image directly — no OCR pipeline needed.
    """
    if not gemini_client:
        return DetectionResult(
            risk=RiskLevel.MEDIUM,
            category="analysis_unavailable",
            indicators=["AI analysis not configured"],
            confidence="Low",
            explanation="Screenshot analysis requires AI configuration. Please type out the message text instead.",
            action="Type out the message content and use text analysis instead.",
            matched_known_indicator=False,
        )

    lang_name = {"bn": "Bengali (বাংলা)", "hi": "Hindi (হিন্দী)", "en": "English"}[lang.value]

    prompt = (
        "You are a scam detection expert for India. Analyze this screenshot of a message/SMS/notification.\n\n"
        "Read ALL text visible in the image. Then determine if it's a scam.\n\n"
        "Respond with a JSON object containing:\n"
        "- risk: 'low', 'medium', 'high', or 'critical'\n"
        "- category: a short category name\n"
        "- indicators: array of specific red flags found\n"
        "- confidence: 'Low', 'Medium', or 'High'\n"
        f"- explanation: 2 sentences in {lang_name} explaining the analysis\n"
        "- action: one sentence recommending what to do\n"
        "- extracted_text: the text you read from the image\n\n"
        "Rules:\n"
        "- Say 'this resembles a known pattern' not 'you are being scammed'\n"
        "- Check sender name, URLs, phone numbers in the image\n"
        "- Flag lookalike domains (e.g., 'bses-bill.com' vs 'bfrses.co.in')"
    )

    try:
        response = await gemini_client.generate_content_async(
            contents=[{
                "role": "user",
                "parts": [
                    {"inline_data": {"mime_type": image_mime, "data": image_bytes}},
                    {"text": prompt},
                ],
            }],
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.2,
            },
        )

        result_text = response.text
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1]
            result_text = result_text.rsplit("```", 1)[0]

        data = json.loads(result_text)
        return DetectionResult(
            risk=RiskLevel(data.get("risk", "medium")),
            category=data.get("category", "unknown"),
            indicators=data.get("indicators", []),
            confidence=data.get("confidence", "Medium"),
            explanation=data.get("explanation", ""),
            action=data.get("action", "Review this content carefully."),
            matched_known_indicator=False,
        )
    except Exception as e:
        print(f"Gemini screenshot classification failed: {e}")
        return DetectionResult(
            risk=RiskLevel.MEDIUM,
            category="analysis_error",
            indicators=["Screenshot analysis could not be completed"],
            confidence="Low",
            explanation="We couldn't analyze the screenshot. Please type out the message text instead.",
            action="Type out the message and use text analysis.",
            matched_known_indicator=False,
        )
