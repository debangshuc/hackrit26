"""
Incidents router — emergency intake, incident management, timeline events.
The core of the product.
"""
import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.schemas import (
    EmergencyRequest, EmergencyPlan, IncidentOut, IncidentEventOut,
    IncidentFacts, Severity, IncidentStatus, EventType, ScamType,
    StepUpdateRequest, UserOut,
)
from app.auth.deps import get_current_user
from app.incidents.severity import assess_severity
from app.response.engine import generate_emergency_plan
from app.database import get_db

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("/emergency", response_model=EmergencyPlan)
async def create_emergency(
    req: EmergencyRequest,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    The whole product in one endpoint:
    Facts → Severity → Template → Plan (optionally LLM-translated).
    """
    incident_id = str(uuid.uuid4())

    # Assess severity
    severity, template_key = assess_severity(req.facts)

    # Generate plan (with LLM if available, fallback to raw template)
    # Gemini client is injected later in Phase 3; for now it's None (uses fallback)
    plan = await generate_emergency_plan(
        facts=req.facts,
        lang=req.lang,
        incident_id=incident_id,
        gemini_client=None,  # Wired in Phase 3
    )

    # Persist incident
    scam_types_str = ",".join([t.value for t in req.facts.scam_types])
    facts_json = req.facts.model_dump_json()
    plan_json = plan.model_dump_json()

    await db.execute(
        """INSERT INTO incidents (id, family_id, reported_by, scam_types, severity, status, facts_json, plan_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (incident_id, user.family_id, user.id, scam_types_str, severity.value,
         IncidentStatus.OPEN.value, facts_json, plan_json),
    )

    # Create incident events
    now = datetime.now(timezone.utc).isoformat()

    # Event: created
    await _add_event(db, incident_id, EventType.CREATED, {
        "reported_by": user.id,
        "scam_types": scam_types_str,
        "facts": req.facts.model_dump(),
    })

    # Event: severity assessed
    await _add_event(db, incident_id, EventType.SEVERITY_ASSESSED, {
        "severity": severity.value,
        "template_key": template_key,
    })

    # Event: plan generated
    await _add_event(db, incident_id, EventType.PLAN_GENERATED, {
        "steps_count": len(plan.plan_steps),
        "is_fallback": plan.is_fallback,
        "language": plan.language.value,
    })

    await db.commit()

    # Fire alert to guardian if family is linked and severity is HIGH+
    if user.family_id and severity in (Severity.HIGH, Severity.CRITICAL):
        await _fire_guardian_alert(db, user, severity, req.facts, incident_id)

    return plan


@router.get("/{incident_id}", response_model=IncidentOut)
async def get_incident(
    incident_id: str,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get a single incident with its plan."""
    cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Access control: user must be the reporter or in the same family
    if row["reported_by"] != user.id and row["family_id"] != user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    plan = None
    if row["plan_json"]:
        plan = EmergencyPlan.model_validate_json(row["plan_json"])

    return IncidentOut(
        id=row["id"],
        family_id=row["family_id"],
        reported_by=row["reported_by"],
        scam_types=[ScamType(t) for t in row["scam_types"].split(",")],
        severity=Severity(row["severity"]),
        status=IncidentStatus(row["status"]),
        created_at=row["created_at"],
        plan=plan,
    )


@router.get("/{incident_id}/events", response_model=list[IncidentEventOut])
async def get_incident_events(
    incident_id: str,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get all events for an incident (append-only timeline)."""
    # Verify access
    cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    incident = await cursor.fetchone()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if incident["reported_by"] != user.id and incident["family_id"] != user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    cursor = await db.execute(
        "SELECT * FROM incident_events WHERE incident_id = ? ORDER BY server_ts ASC",
        (incident_id,),
    )
    rows = await cursor.fetchall()
    return [
        IncidentEventOut(
            id=row["id"],
            incident_id=row["incident_id"],
            event_type=EventType(row["event_type"]),
            payload=json.loads(row["payload"]),
            server_ts=row["server_ts"],
        )
        for row in rows
    ]


@router.post("/{incident_id}/steps/update")
async def update_step(
    incident_id: str,
    req: StepUpdateRequest,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Mark a plan step as started or completed."""
    cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    incident = await cursor.fetchone()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if incident["reported_by"] != user.id:
        raise HTTPException(status_code=403, detail="Only the reporter can update steps")

    event_type = EventType.STEP_COMPLETED if req.completed else EventType.STEP_STARTED
    await _add_event(db, incident_id, event_type, {
        "step_number": req.step_number,
        "completed": req.completed,
        "updated_by": user.id,
    })

    # Update incident status to in_progress if still open
    if incident["status"] == IncidentStatus.OPEN.value:
        await db.execute(
            "UPDATE incidents SET status = ? WHERE id = ?",
            (IncidentStatus.IN_PROGRESS.value, incident_id),
        )

    await db.commit()
    return {"status": "updated", "event_type": event_type.value}


@router.get("/", response_model=list[IncidentOut])
async def list_incidents(
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """List all incidents for the current user or their family."""
    if user.family_id:
        cursor = await db.execute(
            "SELECT * FROM incidents WHERE reported_by = ? OR family_id = ? ORDER BY created_at DESC",
            (user.id, user.family_id),
        )
    else:
        cursor = await db.execute(
            "SELECT * FROM incidents WHERE reported_by = ? ORDER BY created_at DESC",
            (user.id,),
        )

    rows = await cursor.fetchall()
    results = []
    for row in rows:
        plan = None
        if row["plan_json"]:
            plan = EmergencyPlan.model_validate_json(row["plan_json"])
        results.append(IncidentOut(
            id=row["id"],
            family_id=row["family_id"],
            reported_by=row["reported_by"],
            scam_types=[ScamType(t) for t in row["scam_types"].split(",")],
            severity=Severity(row["severity"]),
            status=IncidentStatus(row["status"]),
            created_at=row["created_at"],
            plan=plan,
        ))
    return results


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _add_event(
    db: aiosqlite.Connection,
    incident_id: str,
    event_type: EventType,
    payload: dict,
):
    """Append an event to the incident timeline."""
    event_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO incident_events (id, incident_id, event_type, payload) VALUES (?, ?, ?, ?)",
        (event_id, incident_id, event_type.value, json.dumps(payload)),
    )


async def _fire_guardian_alert(
    db: aiosqlite.Connection,
    user: UserOut,
    severity: Severity,
    facts: IncidentFacts,
    incident_id: str,
):
    """Create a sanitized alert for the guardian when severity is HIGH+."""
    # Build sanitized summary (no raw message content)
    scam_type_labels = {
        ScamType.MONEY_SENT: "money transfer",
        ScamType.OTP_SHARED: "OTP/credential sharing",
        ScamType.BANK_DETAILS_SHARED: "bank details shared",
        ScamType.APP_INSTALLED: "suspicious app installed",
        ScamType.REMOTE_ACCESS: "remote access granted",
        ScamType.AADHAAR_PAN: "identity document shared",
        ScamType.CLICKED_LINK: "suspicious link clicked",
        ScamType.NOT_SURE: "suspicious activity",
    }

    primary_type = facts.scam_types[0] if facts.scam_types else ScamType.NOT_SURE
    category = scam_type_labels.get(primary_type, "suspicious activity")
    summary = f"⚠ {severity.value.upper()} — Possible {category} detected on {user.name}'s device."
    why = f"Reported: {', '.join(scam_type_labels.get(t, t.value) for t in facts.scam_types)}"

    alert_id = str(uuid.uuid4())
    await db.execute(
        """INSERT INTO alerts (id, family_id, member_id, severity, category, summary, why, payload_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (alert_id, user.family_id, user.id, severity.value, category, summary, why,
         json.dumps({"incident_id": incident_id})),
    )
