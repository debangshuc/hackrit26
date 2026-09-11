"""
Alerts router — guardian polling endpoint, acknowledgement, and emergency alerts.
Polling replaces push notifications (FCM would cost half a day to configure).
"""
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
import aiosqlite

from app.schemas import (
    AlertOut, AlertAckRequest, UserOut, Severity,
    GuardianEmergencyAlertRequest, GuardianEmergencyAlertResponse,
    EmergencyPlan, PlanStep, IncidentStatus, EventType,
)
from app.auth.deps import get_current_user, require_guardian
from app.database import get_db

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("/emergency", response_model=GuardianEmergencyAlertResponse)
async def create_emergency_alert(
    req: GuardianEmergencyAlertRequest,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    Emergency Mode -> Alert My Guardian.
    Creates an emergency incident and broadcasts an immediate alert to the user's Guardian.
    """
    if not user.family_id:
        raise HTTPException(
            status_code=400,
            detail="No Guardian connected. Please link your account to a family group first.",
        )

    incident_id = str(uuid.uuid4())
    alert_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    # 1. Create a structured EmergencyPlan with standard 8 action steps
    plan_steps = [
        PlanStep(
            step_number=1,
            title="Contact Bank / Payment Provider Immediately",
            why="Fastest way to stop fraud before settlement.",
            how="Call the official fraud helpline on your card or UPI app to freeze the account/transaction.",
            is_urgent=True,
            official_resource="1930",
        ),
        PlanStep(
            step_number=2,
            title="Report Fraudulent Transaction",
            why="Generates an official complaint reference for chargebacks.",
            how="Request a formal dispute ticket and save the reference number.",
            is_urgent=True,
            official_resource=None,
        ),
        PlanStep(
            step_number=3,
            title="Save Screenshots & Transaction Details",
            why="Preserves essential evidence required by cyber police.",
            how=f"Recorded UTR: {req.transaction_id or 'Pending'} | Amount: {req.amount or 'Pending'}",
            is_urgent=False,
            official_resource=None,
        ),
        PlanStep(
            step_number=4,
            title="Preserve Scam Conversations",
            why="Evidence of deception helps prove fraud intent.",
            how="Do not delete chat logs, SMS, or caller records.",
            is_urgent=False,
            official_resource=None,
        ),
        PlanStep(
            step_number=5,
            title="Save Scammer Contact Details",
            why="Helps authorities trace beneficiary bank accounts.",
            how=f"Scammer Contact: {req.scammer_contact or 'Not provided'}",
            is_urgent=False,
            official_resource=None,
        ),
        PlanStep(
            step_number=6,
            title="Do NOT Pay Any 'Recovery' Fees",
            why="Recovery fees are secondary scam traps.",
            how="Never transfer money to unverified individuals promising refund recovery.",
            is_urgent=True,
            official_resource=None,
        ),
        PlanStep(
            step_number=7,
            title="Secure Compromised Accounts",
            why="Prevents secondary withdrawals or unauthorized access.",
            how="Change banking passwords, UPI PINs, and revoke suspicious app permissions.",
            is_urgent=True,
            official_resource=None,
        ),
        PlanStep(
            step_number=8,
            title="File Cybercrime Complaint on 1930 / cybercrime.gov.in",
            why="Formal police cyber complaint within golden hour maximizes freeze success.",
            how="Dial 1930 or submit details on National Cyber Crime Reporting Portal.",
            is_urgent=True,
            official_resource="https://cybercrime.gov.in",
        ),
    ]

    plan = EmergencyPlan(
        incident_id=incident_id,
        severity=req.severity,
        plan_steps=plan_steps,
        template_key="emergency_guardian_alert",
        language=user.lang,
        generated_at=now,
        is_fallback=False,
    )

    facts_dict = {
        "incident_type": req.incident_type,
        "category": req.category,
        "amount": req.amount,
        "currency": req.currency,
        "payment_method": req.payment_method,
        "transaction_id": req.transaction_id,
        "scammer_contact": req.scammer_contact,
        "what_happened": req.what_happened,
        "checklist_progress": req.checklist_progress,
    }

    # 2. Insert into incidents table
    scam_types_str = "money_sent" if req.amount else "not_sure"
    await db.execute(
        """INSERT INTO incidents (id, family_id, reported_by, scam_types, severity, status, facts_json, plan_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            incident_id,
            user.family_id,
            user.id,
            scam_types_str,
            req.severity.value,
            IncidentStatus.OPEN.value,
            json.dumps(facts_dict),
            plan.model_dump_json(),
        ),
    )

    # 3. Insert events into incident_events
    event_created_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO incident_events (id, incident_id, event_type, payload) VALUES (?, ?, ?, ?)",
        (event_created_id, incident_id, EventType.CREATED.value, json.dumps({"reported_by": user.id, "facts": facts_dict})),
    )

    event_alert_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO incident_events (id, incident_id, event_type, payload) VALUES (?, ?, ?, ?)",
        (event_alert_id, incident_id, EventType.ALERT_SENT.value, json.dumps({
            "alert_id": alert_id,
            "severity": req.severity.value,
            "category": req.category,
            "amount": req.amount,
            "transaction_id": req.transaction_id,
        })),
    )

    # 4. Insert alert into alerts table
    amount_str = f" Amount: {req.amount}" if req.amount else ""
    tx_str = f" | Tx: {req.transaction_id}" if req.transaction_id else ""
    summary = f"🚨 {req.severity.value.upper()} SCAM INCIDENT — {req.category} reported by {user.name}.{amount_str}{tx_str}"
    why = f"Victim initiated Emergency Protocol. Payment: {req.payment_method or 'Not specified'} | Contact: {req.scammer_contact or 'Not specified'}"

    payload_dict = {
        "incident_id": incident_id,
        "amount": req.amount,
        "currency": req.currency,
        "payment_method": req.payment_method,
        "transaction_id": req.transaction_id,
        "category": req.category,
        "scammer_contact": req.scammer_contact,
        "checklist_progress": req.checklist_progress,
    }

    await db.execute(
        """INSERT INTO alerts (id, family_id, member_id, severity, category, summary, why, payload_json, sent_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            alert_id,
            user.family_id,
            user.id,
            req.severity.value,
            req.category,
            summary,
            why,
            json.dumps(payload_dict),
            now.isoformat(),
        ),
    )

    await db.commit()

    return GuardianEmergencyAlertResponse(
        status="alert_sent",
        alert_id=alert_id,
        incident_id=incident_id,
        family_id=user.family_id,
        severity=req.severity,
        summary=summary,
        timestamp=now,
    )


@router.get("/poll", response_model=list[AlertOut])
async def poll_alerts(
    unacked_only: bool = Query(default=True),
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    Guardian polls this every 5 seconds for new alerts.
    Returns sanitized alerts — never raw message content.
    """
    if not user.family_id:
        return []

    if unacked_only:
        cursor = await db.execute(
            """SELECT a.*, u.name as member_name FROM alerts a
               JOIN users u ON a.member_id = u.id
               WHERE a.family_id = ? AND a.acked_at IS NULL AND a.is_false_alarm = 0
               ORDER BY a.sent_at DESC LIMIT 20""",
            (user.family_id,),
        )
    else:
        cursor = await db.execute(
            """SELECT a.*, u.name as member_name FROM alerts a
               JOIN users u ON a.member_id = u.id
               WHERE a.family_id = ?
               ORDER BY a.sent_at DESC LIMIT 50""",
            (user.family_id,),
        )

    rows = await cursor.fetchall()
    results = []
    for row in rows:
        payload_data = None
        if row["payload_json"]:
            try:
                payload_data = json.loads(row["payload_json"])
            except Exception:
                payload_data = None

        results.append(
            AlertOut(
                id=row["id"],
                family_id=row["family_id"],
                member_id=row["member_id"],
                member_name=row["member_name"],
                severity=Severity(row["severity"]),
                category=row["category"],
                summary=row["summary"],
                why=row["why"],
                created_at=row["sent_at"],
                acked_at=row["acked_at"],
                is_false_alarm=bool(row["is_false_alarm"]),
                payload=payload_data,
            )
        )
    return results


@router.post("/{alert_id}/ack")
async def acknowledge_alert(
    alert_id: str,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Acknowledge an alert (guardian has seen it)."""
    cursor = await db.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    alert = await cursor.fetchone()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert["family_id"] != user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "UPDATE alerts SET acked_at = ? WHERE id = ?",
        (now, alert_id),
    )
    await db.commit()
    return {"status": "acknowledged"}


@router.post("/{alert_id}/false-alarm")
async def mark_false_alarm(
    alert_id: str,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Mark alert as false alarm."""
    cursor = await db.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    alert = await cursor.fetchone()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert["family_id"] != user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "UPDATE alerts SET is_false_alarm = 1, acked_at = ? WHERE id = ?",
        (now, alert_id),
    )
    await db.commit()
    return {"status": "marked_false_alarm"}
