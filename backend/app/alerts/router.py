"""
Alerts router — guardian polling endpoint + acknowledgement.
Polling replaces push notifications (FCM would cost half a day to configure).
"""
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
import aiosqlite

from app.schemas import AlertOut, AlertAckRequest, UserOut, Severity
from app.auth.deps import get_current_user, require_guardian
from app.database import get_db

router = APIRouter(prefix="/alerts", tags=["alerts"])


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
    return [
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
        )
        for row in rows
    ]


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
