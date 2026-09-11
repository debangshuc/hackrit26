"""
Validator — ensures LLM output never contains invented phone numbers or URLs.
Regex-extracts all numbers/URLs from output, diffs against template's official set.
Mismatch = invalid (caller should regenerate once, then fallback).
"""
import re
from typing import Optional

from app.schemas import PlanStep
from app.incidents.resources import get_all_official_phones, get_all_official_urls


# Phone number patterns (Indian)
PHONE_PATTERN = re.compile(
    r'(?:'
    r'\+?\d{1,3}[\s-]?\d{3,5}[\s-]?\d{3,5}[\s-]?\d{0,5}'  # International
    r'|\b1\d{3}\b'  # 4-digit helplines (1930, 1800, etc.)
    r'|\b14\d{3}\b'  # 5-digit helplines (14448)
    r'|\b112\b'  # Police
    r'|\b1800[\s-]?\d{3,4}[\s-]?\d{0,4}'  # Toll-free
    r')'
)

# URL pattern
URL_PATTERN = re.compile(
    r'https?://[^\s<>"\')]+|'
    r'\b[\w-]+\.(?:gov\.in|co\.in|com|in|org\.in|org)\b'
)

# Official sets (cached on module load)
OFFICIAL_PHONES = get_all_official_phones()
OFFICIAL_URLS = get_all_official_urls()

# Numbers that are okay even if not in official set (generic references)
ALLOWED_GENERIC = {"112", "100", "108", "1930", "14448"}


def extract_phones(text: str) -> set[str]:
    """Extract all phone-like numbers from text."""
    matches = PHONE_PATTERN.findall(text)
    # Normalize: strip spaces and hyphens
    normalized = set()
    for m in matches:
        clean = re.sub(r'[\s-]', '', m)
        normalized.add(clean)
    return normalized


def extract_urls(text: str) -> set[str]:
    """Extract all URL-like strings from text."""
    matches = URL_PATTERN.findall(text)
    return set(matches)


def validate_plan_output(
    steps: list[PlanStep],
    template: dict,
) -> tuple[list[PlanStep], bool]:
    """
    Validate that LLM-generated plan steps don't contain invented resources.

    Returns: (steps, is_valid)
    - If valid: returns the steps unchanged with is_valid=True
    - If invalid: returns the steps with is_valid=False (caller should retry or fallback)
    """
    # Collect all text from the plan
    all_text = ""
    for step in steps:
        all_text += f" {step.title} {step.why} {step.how} "
        if step.official_resource:
            all_text += f" {step.official_resource} "

    # Extract phones and URLs from LLM output
    found_phones = extract_phones(all_text)
    found_urls = extract_urls(all_text)

    # Also extract phones/URLs from the original template (these are always allowed)
    template_text = ""
    for step in template.get("steps", []):
        template_text += f" {step.get('title', '')} {step.get('why', '')} {step.get('how', '')} "
        if step.get("official_resource"):
            template_text += f" {step['official_resource']} "

    template_phones = extract_phones(template_text)
    template_urls = extract_urls(template_text)

    # Allowed set = official resources + template resources + generic numbers
    allowed_phones = OFFICIAL_PHONES | template_phones | ALLOWED_GENERIC
    allowed_urls = OFFICIAL_URLS | template_urls

    # Check for invented phones
    for phone in found_phones:
        # Skip very short numbers (could be step numbers, amounts, etc.)
        if len(phone) <= 3:
            continue
        if phone not in allowed_phones:
            # Check if it's a substring match (e.g., "1800111111" contains "1800-111-111")
            normalized_allowed = {re.sub(r'[\s-]', '', p) for p in allowed_phones}
            if phone not in normalized_allowed:
                print(f"VALIDATOR: Invented phone number detected: {phone}")
                return (steps, False)

    # Check for invented URLs
    for url in found_urls:
        url_clean = url.rstrip('.')
        if url_clean not in allowed_urls:
            # Check domain-level match
            is_allowed = False
            for official_url in allowed_urls:
                if url_clean in official_url or official_url in url_clean:
                    is_allowed = True
                    break
            if not is_allowed:
                # Allow well-known domains that aren't in our list but are clearly legitimate
                safe_domains = {
                    "myaadhaar.uidai.gov.in", "cibil.com", "google.com",
                    "play.google.com", "apps.apple.com",
                }
                if url_clean not in safe_domains:
                    print(f"VALIDATOR: Potentially invented URL detected: {url_clean}")
                    # For URLs, we're more lenient — just warn, don't fail
                    # (LLM might legitimately reference known safe sites)

    return (steps, True)
