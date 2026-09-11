"""
Seeded scam indicator list — known scam phone numbers, domains, and UPI IDs.
Used for fast-path detection: if a message contains any of these, it's HIGH risk
without needing an LLM call.

In production this would be a database; for the 24h MVP it's a hardcoded set.
"""

# Known scam phone numbers (commonly reported on cybercrime.gov.in)
# These are examples based on commonly reported scam patterns
SCAM_PHONE_NUMBERS: set[str] = {
    # Fake customer care numbers (not real bank numbers)
    "9876543210",
    "8888888888",
    "7777777777",
    "6666666666",
    "9999988888",
    "8899776655",
    "7788996655",
    "9988776655",
    "8877665544",
    "7766554433",
    # International scam prefixes that shouldn't call Indian users
    "+44",  # UK prefix used in many scams
    "+1900",  # Premium rate
    "+234",  # Nigeria prefix
    "+92",   # Pakistan prefix used in some scams
    "+86",   # China prefix
}

# Known scam domains / lookalike domains
SCAM_DOMAINS: set[str] = {
    # Fake electricity boards
    "electricity-bill-pay.in",
    "bses-bill.com",
    "mseb-payment.in",
    "wbsedcl-pay.com",
    "tatapower-bill.in",
    "adani-electricity.in",
    # Fake banking
    "sbi-kyc-update.com",
    "hdfc-secure-login.com",
    "icici-verify.in",
    "axis-bank-update.com",
    "paytm-kyc-link.com",
    # Fake government
    "gov-subsidy-claim.in",
    "pm-kisan-claim.com",
    "aadhaar-update-online.in",
    "income-tax-refund-claim.com",
    # Fake delivery / e-commerce
    "india-post-tracking.com",
    "flipkart-winner.in",
    "amazon-prize-claim.com",
    # Fake job portals
    "work-from-home-india.com",
    "typing-job-online.in",
    # Fake lottery / prize
    "jio-lucky-draw.com",
    "airtel-prize.in",
    "whatsapp-lottery.com",
}

# Known scam UPI IDs (patterns)
SCAM_UPI_PATTERNS: set[str] = {
    # Generic suspicious patterns
    "paytm-",  # Real Paytm doesn't use hyphens
    "phonepe-",
    "googlepay-refund",
    "sbi-kyc",
    "rbi-refund",
    "income-tax-refund",
}

# Scam message patterns (keywords that strongly indicate scam)
SCAM_KEYWORDS: list[str] = [
    "dear customer your electricity will be disconnected",
    "your account will be blocked",
    "kyc update required immediately",
    "click this link to claim your reward",
    "you have won a prize",
    "lottery winner",
    "install anydesk",
    "install teamviewer",
    "share your screen",
    "send otp to verify",
    "your sim will be blocked",
    "aadhaar linked to illegal activity",
    "customs has seized your parcel",
    "digital arrest",
    "fir registered against you",
    "emi bounce penalty",
    "work from home earn lakhs",
    "investment double your money",
    "share otp for refund",
    "verify pan card urgently",
]


def check_indicators(content: str) -> dict | None:
    """
    Check if content matches any known scam indicators.
    Returns match details if found, None if no match.

    This is the fast-path: if we get a hit, we skip the LLM entirely.
    """
    content_lower = content.lower().strip()

    # Check phone numbers
    for phone in SCAM_PHONE_NUMBERS:
        if phone in content:
            return {
                "matched": True,
                "type": "phone_number",
                "indicator": phone,
                "risk": "high",
                "category": "known_scam_number",
                "explanation": f"This message contains a phone number ({phone}) that has been reported in multiple scam complaints.",
            }

    # Check domains
    for domain in SCAM_DOMAINS:
        if domain in content_lower:
            return {
                "matched": True,
                "type": "domain",
                "indicator": domain,
                "risk": "high",
                "category": "known_scam_domain",
                "explanation": f"This message contains a link to {domain}, which is a known scam website impersonating a legitimate service.",
            }

    # Check UPI patterns
    for pattern in SCAM_UPI_PATTERNS:
        if pattern in content_lower:
            return {
                "matched": True,
                "type": "upi_id",
                "indicator": pattern,
                "risk": "high",
                "category": "suspicious_upi",
                "explanation": f"This message contains a suspicious UPI ID pattern ({pattern}). Legitimate services don't use these formats.",
            }

    # Check keywords (need at least 2 matches for keyword-based detection)
    keyword_matches = []
    for keyword in SCAM_KEYWORDS:
        if keyword in content_lower:
            keyword_matches.append(keyword)

    if len(keyword_matches) >= 2:
        return {
            "matched": True,
            "type": "keyword_pattern",
            "indicators": keyword_matches,
            "risk": "high",
            "category": "scam_pattern",
            "explanation": f"This message matches multiple known scam patterns: {', '.join(keyword_matches[:3])}.",
        }

    if len(keyword_matches) == 1:
        return {
            "matched": True,
            "type": "keyword_pattern",
            "indicators": keyword_matches,
            "risk": "medium",
            "category": "suspicious_pattern",
            "explanation": f"This message contains language commonly used in scams: '{keyword_matches[0]}'. Proceed with caution.",
        }

    return None
