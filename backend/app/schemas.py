"""
Pydantic schemas — the contracts that bind frontend, backend, and LLM.
Every data shape in the system is defined here.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    PROTECTED = "protected"
    GUARDIAN = "guardian"


class Language(str, Enum):
    EN = "en"
    BN = "bn"
    HI = "hi"


class ScamType(str, Enum):
    MONEY_SENT = "money_sent"
    OTP_SHARED = "otp_shared"
    BANK_DETAILS_SHARED = "bank_details_shared"
    APP_INSTALLED = "app_installed"
    REMOTE_ACCESS = "remote_access"
    AADHAAR_PAN = "aadhaar_pan"
    CLICKED_LINK = "clicked_link"
    NOT_SURE = "not_sure"


class TimeBand(str, Enum):
    UNDER_5_MIN = "under_5_min"
    FIVE_TO_30_MIN = "5_to_30_min"
    THIRTY_TO_2H = "30_to_2h"
    OVER_2H = "over_2h"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EventType(str, Enum):
    CREATED = "created"
    SEVERITY_ASSESSED = "severity_assessed"
    PLAN_GENERATED = "plan_generated"
    STEP_STARTED = "step_started"
    STEP_COMPLETED = "step_completed"
    EVIDENCE_ADDED = "evidence_added"
    ALERT_SENT = "alert_sent"
    NOTE_ADDED = "note_added"
    STATUS_CHANGED = "status_changed"


class PaymentMethod(str, Enum):
    UPI = "upi"
    BANK_TRANSFER = "bank_transfer"
    CARD = "card"
    WALLET = "wallet"
    OTHER = "other"


class AmountBand(str, Enum):
    UNDER_1K = "under_1k"
    ONE_TO_10K = "1k_to_10k"
    TEN_TO_50K = "10k_to_50k"
    FIFTY_TO_1L = "50k_to_1l"
    OVER_1L = "over_1l"


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    phone: str = Field(..., description="Phone number in format +91XXXXXXXXXX")
    otp: str = Field(..., description="Demo OTP code")


class RegisterRequest(BaseModel):
    phone: str
    name: str
    role: UserRole
    lang: Language = Language.EN


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserOut(BaseModel):
    id: str
    phone: str
    name: str
    role: UserRole
    lang: Language
    family_id: Optional[str] = None


# ─── Incident Schemas ────────────────────────────────────────────────────────

class IncidentFacts(BaseModel):
    """The structured output of the 3-screen emergency intake."""
    scam_types: list[ScamType] = Field(..., description="What happened (multi-select)")
    time_band: TimeBand = Field(..., description="How long ago")
    # Dynamic follow-ups (Screen 3)
    amount_band: Optional[AmountBand] = None
    payment_method: Optional[PaymentMethod] = None
    service_compromised: Optional[str] = None  # "UPI app", "bank login", etc.
    remote_still_connected: Optional[bool] = None


class EmergencyRequest(BaseModel):
    facts: IncidentFacts
    lang: Language = Language.BN


class PlanStep(BaseModel):
    """A single step in the emergency action plan."""
    step_number: int
    title: str
    why: str
    how: str
    is_urgent: bool = False
    official_resource: Optional[str] = None  # phone/URL from OFFICIAL_RESOURCES


class EmergencyPlan(BaseModel):
    """The complete emergency response plan."""
    incident_id: str
    severity: Severity
    plan_steps: list[PlanStep]
    template_key: str
    language: Language
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    is_fallback: bool = False  # True if LLM failed and we used raw template
    disclaimer: str = "Scam Shield will NEVER ask for your OTP, PIN, or password."


class IncidentOut(BaseModel):
    id: str
    family_id: Optional[str]
    reported_by: str
    scam_types: list[ScamType]
    severity: Severity
    status: IncidentStatus
    created_at: datetime
    plan: Optional[EmergencyPlan] = None


class IncidentEventOut(BaseModel):
    id: str
    incident_id: str
    event_type: EventType
    payload: dict
    server_ts: datetime


class StepUpdateRequest(BaseModel):
    step_number: int
    completed: bool


# ─── Detection Schemas ────────────────────────────────────────────────────────

class TextCheckRequest(BaseModel):
    content: str = Field(..., description="SMS text or message to analyze")
    lang: Language = Language.EN


class DetectionResult(BaseModel):
    """Structured output from scam detection."""
    risk: RiskLevel
    category: str  # e.g., "electricity_bill_scam", "lottery_fraud"
    indicators: list[str]  # e.g., ["urgent payment demand", "lookalike domain"]
    confidence: str  # "Low", "Medium", "High" — never percentages
    explanation: str  # 2 sentences, in user's language
    action: str  # What to do next
    matched_known_indicator: bool = False  # True if hit seeded list


class ScreenshotCheckRequest(BaseModel):
    lang: Language = Language.EN


# ─── Family Schemas ───────────────────────────────────────────────────────────

class FamilyCreateResponse(BaseModel):
    family_id: str
    join_code: str  # 6-digit code


class FamilyJoinRequest(BaseModel):
    join_code: str


class ConsentRequest(BaseModel):
    guardian_id: str
    consent_granted: bool


class ConsentOut(BaseModel):
    protected_user_id: str
    guardian_id: str
    granted: bool
    version: int
    granted_at: datetime


class FamilyMemberOut(BaseModel):
    id: str
    name: str
    phone: str
    role: UserRole
    lang: Language


class FamilyStatusOut(BaseModel):
    family_id: str
    members: list[FamilyMemberOut]
    join_code: str


# ─── Alert Schemas ────────────────────────────────────────────────────────────

class AlertOut(BaseModel):
    id: str
    family_id: str
    member_id: str
    member_name: str
    severity: Severity
    category: str
    summary: str  # Sanitized — never raw message
    why: str
    created_at: datetime
    acked_at: Optional[datetime] = None
    is_false_alarm: bool = False


class AlertAckRequest(BaseModel):
    acked: bool = True


# ─── Message Schemas ──────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    id: str
    user_id: str
    content: str
    lang: Language
    risk: Optional[RiskLevel] = None
    confidence: Optional[str] = None
    analysis: Optional[DetectionResult] = None
    created_at: datetime
