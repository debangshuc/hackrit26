"""
Severity decision table — pure code, 6 rows.
Maps IncidentFacts → (Severity, TemplateKey).
No LLM, no ML — deterministic logic only.
"""
from app.schemas import IncidentFacts, Severity, ScamType, TimeBand


def assess_severity(facts: IncidentFacts) -> tuple[Severity, str]:
    """
    Assess severity and select template key based on incident facts.

    Decision table (from blueprint):
    | Facts                          | Severity | Template Key            |
    |-------------------------------|----------|-------------------------|
    | money sent + <1h              | CRITICAL | money_sent_recent       |
    | money sent + >1h              | HIGH     | money_sent_delayed      |
    | OTP/PIN/password shared       | CRITICAL | credentials_shared      |
    | remote access active          | CRITICAL | remote_access           |
    | details shared, no money      | HIGH     | details_shared_no_loss  |
    | anything + "not sure"         | MEDIUM   | default_safe            |

    Returns: (severity, template_key)
    """
    types = set(facts.scam_types)

    # ─── Priority 1: Remote access (most dangerous) ───────────────────
    if ScamType.REMOTE_ACCESS in types:
        # Remote access is always critical regardless of other factors
        return (Severity.CRITICAL, "remote_access")

    # ─── Priority 2: Money sent ───────────────────────────────────────
    if ScamType.MONEY_SENT in types:
        is_recent = facts.time_band in (TimeBand.UNDER_5_MIN, TimeBand.FIVE_TO_30_MIN)
        # Also treat 30m-2h as recent enough for bank freeze attempt
        if facts.time_band == TimeBand.THIRTY_TO_2H:
            is_recent = True

        if is_recent:
            return (Severity.CRITICAL, "money_sent_recent")
        else:
            return (Severity.HIGH, "money_sent_delayed")

    # ─── Priority 3: OTP / credentials shared ────────────────────────
    if ScamType.OTP_SHARED in types:
        return (Severity.CRITICAL, "credentials_shared")

    # ─── Priority 4: Bank details / Aadhaar / PAN shared ─────────────
    if types & {ScamType.BANK_DETAILS_SHARED, ScamType.AADHAAR_PAN}:
        return (Severity.HIGH, "details_shared_no_loss")

    # ─── Priority 5: App installed / clicked link ─────────────────────
    if types & {ScamType.APP_INSTALLED, ScamType.CLICKED_LINK}:
        return (Severity.HIGH, "details_shared_no_loss")

    # ─── Priority 6: Not sure / fallback ──────────────────────────────
    return (Severity.MEDIUM, "default_safe")
