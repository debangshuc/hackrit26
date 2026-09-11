"""
Alert severity policy — routing rules and cooldown logic.
In-memory cooldown tracking (no Redis needed for demo).
"""
from datetime import datetime, timezone, timedelta
from typing import Optional

from app.schemas import Severity

# In-memory cooldown tracker: {member_id: last_alert_timestamp}
_cooldown_tracker: dict[str, datetime] = {}

# Cooldown period: max 1 alert per member per 15 minutes
COOLDOWN_SECONDS = 900


def should_alert_guardian(severity: Severity) -> bool:
    """
    Alert policy from the blueprint:
    LOW → nothing
    MEDIUM → app warning only (no guardian alert)
    HIGH → guardian alert
    CRITICAL → guardian alert + banner on guardian home
    """
    return severity in (Severity.HIGH, Severity.CRITICAL)


def should_show_banner(severity: Severity) -> bool:
    """CRITICAL → banner on guardian home."""
    return severity == Severity.CRITICAL


def check_cooldown(member_id: str) -> bool:
    """
    Check if we can send an alert for this member.
    Returns True if alert is allowed, False if in cooldown.
    """
    last_alert = _cooldown_tracker.get(member_id)
    if last_alert is None:
        return True

    elapsed = (datetime.now(timezone.utc) - last_alert).total_seconds()
    return elapsed >= COOLDOWN_SECONDS


def record_alert(member_id: str):
    """Record that we sent an alert for this member (updates cooldown)."""
    _cooldown_tracker[member_id] = datetime.now(timezone.utc)


def get_alert_level(severity: Severity) -> dict:
    """Get alert presentation details based on severity."""
    levels = {
        Severity.LOW: {
            "color": "gray",
            "icon": "info",
            "guardian_alert": False,
            "banner": False,
            "label": "Low Risk",
        },
        Severity.MEDIUM: {
            "color": "yellow",
            "icon": "warning",
            "guardian_alert": False,
            "banner": False,
            "label": "Medium Risk — App Warning",
        },
        Severity.HIGH: {
            "color": "orange",
            "icon": "alert",
            "guardian_alert": True,
            "banner": False,
            "label": "High Risk — Guardian Alerted",
        },
        Severity.CRITICAL: {
            "color": "red",
            "icon": "emergency",
            "guardian_alert": True,
            "banner": True,
            "label": "Critical — Immediate Action Required",
        },
    }
    return levels.get(severity, levels[Severity.MEDIUM])
