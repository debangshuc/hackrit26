"""
Response engine — the core pipeline:
1. Pick template spine from severity table
2. Branch on facts (if-statements for bank hotline, time window, etc.)
3. LLM renders each step into user's language
4. Validator checks all phone numbers/URLs
5. Fallback to raw template if LLM fails

This is deterministic by design. The LLM translates/adapts, never invents.
"""
import json
import copy
from typing import Optional

from app.schemas import (
    IncidentFacts, EmergencyPlan, PlanStep, Severity, Language,
    ScamType, PaymentMethod,
)
from app.incidents.templates import get_template
from app.incidents.severity import assess_severity
from app.incidents.resources import OFFICIAL_RESOURCES
from app.response.validator import validate_plan_output


async def generate_emergency_plan(
    facts: IncidentFacts,
    lang: Language,
    incident_id: str,
    gemini_client=None,
) -> EmergencyPlan:
    """
    Main entry point: facts → severity → template → LLM render → validate → plan.
    """
    # Step 1: Assess severity and get template key
    severity, template_key = assess_severity(facts)

    # Step 2: Get template and customize based on facts
    template = get_template(template_key)
    customized_steps = _customize_template(template, facts)

    # Step 3: If we have a Gemini client and language is not English, translate
    if gemini_client and lang != Language.EN:
        try:
            translated_steps = await _render_with_llm(
                customized_steps, facts, lang, gemini_client
            )
            # Step 4: Validate LLM output
            validated_steps, is_valid = validate_plan_output(translated_steps, template)
            if is_valid:
                return EmergencyPlan(
                    incident_id=incident_id,
                    severity=severity,
                    plan_steps=validated_steps,
                    template_key=template_key,
                    language=lang,
                    is_fallback=False,
                )
            else:
                # Retry once
                translated_steps = await _render_with_llm(
                    customized_steps, facts, lang, gemini_client
                )
                validated_steps, is_valid = validate_plan_output(translated_steps, template)
                if is_valid:
                    return EmergencyPlan(
                        incident_id=incident_id,
                        severity=severity,
                        plan_steps=validated_steps,
                        template_key=template_key,
                        language=lang,
                        is_fallback=False,
                    )
        except Exception as e:
            print(f"LLM rendering failed: {e}")
            # Fall through to fallback

    # Fallback: return raw English template (or with hardcoded translations)
    fallback_steps = _build_fallback_steps(customized_steps, lang, template)
    return EmergencyPlan(
        incident_id=incident_id,
        severity=severity,
        plan_steps=fallback_steps,
        template_key=template_key,
        language=lang if lang == Language.EN else Language.EN,
        is_fallback=(lang != Language.EN),  # Only flagged if we wanted translation but couldn't
    )


def _customize_template(template: dict, facts: IncidentFacts) -> list[dict]:
    """
    Customize template steps based on specific facts.
    This is pure if-statement logic — no LLM.
    """
    steps = copy.deepcopy(template["steps"])

    # If money was sent via UPI, add UPI-specific guidance
    if ScamType.MONEY_SENT in facts.scam_types and facts.payment_method == PaymentMethod.UPI:
        for step in steps:
            if "bank" in step["title"].lower() and step["step_number"] == 1:
                step["how"] += (
                    " Also contact NPCI UPI Helpline at 1800-120-1740 for "
                    "UPI-specific dispute resolution."
                )
                step["official_resource"] = OFFICIAL_RESOURCES["npci_upi"]["phone"]

    # If amount is large (>50k), add urgency note
    if facts.amount_band and facts.amount_band.value in ("50k_to_1l", "over_1l"):
        for step in steps:
            if step["step_number"] == 1:
                step["title"] = "⚡ " + step["title"]
                step["why"] = (
                    "LARGE AMOUNT INVOLVED. " + step["why"]
                )

    # If remote access is still connected, emphasize step 0
    if facts.remote_still_connected is True:
        for step in steps:
            if step["step_number"] == 0:
                step["title"] = "🚨 " + step["title"]
                step["is_urgent"] = True

    return steps


async def _render_with_llm(
    steps: list[dict],
    facts: IncidentFacts,
    lang: Language,
    gemini_client,
) -> list[PlanStep]:
    """
    Use Gemini to render template steps into the user's language.
    System prompt enforces translation-only behavior.
    """
    lang_name = {"bn": "Bengali (বাংলা)", "hi": "Hindi (हिन्दी)", "en": "English"}[lang.value]

    system_prompt = (
        "You are Scam Shield's safety engine. Your role is to translate and adapt "
        "the provided emergency action steps into the user's language. "
        "CRITICAL RULES:\n"
        "1. NEVER invent new steps, phone numbers, URLs, bank names, or procedures.\n"
        "2. NEVER change the order of steps.\n"
        "3. NEVER add or remove steps.\n"
        "4. Translate the content naturally — not word-by-word.\n"
        "5. Keep all phone numbers, URLs, and official names in their original form.\n"
        "6. If unsure about a translation, keep the original English term.\n"
        "7. Maintain the urgency tone for urgent steps.\n"
        "8. Use simple, clear language a non-technical person would understand."
    )

    steps_json = json.dumps(steps, ensure_ascii=False, indent=2)

    user_prompt = (
        f"Translate the following emergency action plan steps into {lang_name}.\n"
        f"Return a JSON array where each element has: step_number, title, why, how, is_urgent, official_resource.\n"
        f"Keep phone numbers and URLs exactly as they are.\n\n"
        f"Steps to translate:\n{steps_json}"
    )

    response = await gemini_client.generate_content_async(
        contents=[
            {"role": "user", "parts": [{"text": system_prompt + "\n\n" + user_prompt}]}
        ],
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.1,  # Low temperature for faithful translation
        },
    )

    # Parse response
    try:
        response_text = response.text
        # Clean markdown fences if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            response_text = response_text.rsplit("```", 1)[0]

        translated = json.loads(response_text)
        return [
            PlanStep(
                step_number=s.get("step_number", i),
                title=s.get("title", ""),
                why=s.get("why", ""),
                how=s.get("how", ""),
                is_urgent=s.get("is_urgent", False),
                official_resource=s.get("official_resource"),
            )
            for i, s in enumerate(translated)
        ]
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        raise ValueError(f"Failed to parse LLM response: {e}")


def _build_fallback_steps(
    steps: list[dict],
    lang: Language,
    template: dict,
) -> list[PlanStep]:
    """
    Build plan steps from raw template — no LLM needed.
    Uses hardcoded translated titles where available.
    """
    result = []
    for step in steps:
        result.append(PlanStep(
            step_number=step["step_number"],
            title=step["title"],
            why=step["why"],
            how=step["how"],
            is_urgent=step.get("is_urgent", False),
            official_resource=step.get("official_resource"),
        ))
    return result
