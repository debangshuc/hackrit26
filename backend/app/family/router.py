"""
Family router — link guardian and protected user via 6-digit code.
Consent screen + family status.
"""
import uuid
import random
import string
import json
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.schemas import (
    FamilyCreateResponse, FamilyJoinRequest, ConsentRequest, ConsentOut,
    FamilyStatusOut, FamilyMemberOut, UserOut, UserRole, Language,
)
from app.auth.deps import get_current_user, require_guardian
from app.database import get_db

router = APIRouter(prefix="/family", tags=["family"])


def _generate_join_code() -> str:
    """Generate a 6-digit alphanumeric join code."""
    return ''.join(random.choices(string.digits, k=6))


@router.post("/create", response_model=FamilyCreateResponse)
async def create_family(
    user: UserOut = Depends(require_guardian),
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    Guardian creates a family group. Gets a 6-digit code to share with parent.
    """
    # Check if user already has a family
    if user.family_id:
        # Return existing family info
        cursor = await db.execute("SELECT * FROM families WHERE id = ?", (user.family_id,))
        family = await cursor.fetchone()
        if family:
            return FamilyCreateResponse(
                family_id=family["id"],
                join_code=family["join_code"],
            )

    family_id = str(uuid.uuid4())
    join_code = _generate_join_code()

    # Create family
    await db.execute(
        "INSERT INTO families (id, join_code, created_by) VALUES (?, ?, ?)",
        (family_id, join_code, user.id),
    )

    # Update user's family_id
    await db.execute(
        "UPDATE users SET family_id = ? WHERE id = ?",
        (family_id, user.id),
    )

    await db.commit()
    return FamilyCreateResponse(family_id=family_id, join_code=join_code)


@router.post("/join")
async def join_family(
    req: FamilyJoinRequest,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """
    Protected user enters 6-digit code to join a family.
    Shows consent screen first (what is shared, what is not).
    """
    # Find family by join code
    cursor = await db.execute("SELECT * FROM families WHERE join_code = ?", (req.join_code,))
    family = await cursor.fetchone()
    if not family:
        raise HTTPException(status_code=404, detail="Invalid join code. Please check and try again.")

    # Update user's family_id
    await db.execute(
        "UPDATE users SET family_id = ? WHERE id = ?",
        (family["id"], user.id),
    )

    await db.commit()
    return {
        "status": "joined",
        "family_id": family["id"],
        "message": "You have joined the family group. Your guardian will receive alerts for high-risk detections.",
        "consent_info": {
            "shared": [
                "Risk level and scam category (e.g., 'HIGH — electricity bill scam pattern')",
                "General indicators (e.g., 'urgent payment demand')",
                "Emergency plan progress",
            ],
            "not_shared": [
                "Your actual messages or SMS content",
                "Your personal conversations",
                "Your browsing history",
                "Your location",
            ],
            "how_to_stop": "You can leave the family group anytime from Settings.",
        },
    }


@router.post("/consent")
async def grant_consent(
    req: ConsentRequest,
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Record consent from protected user for guardian monitoring."""
    await db.execute(
        """INSERT OR REPLACE INTO consents (protected_user_id, guardian_id, granted, version, ts)
           VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)""",
        (user.id, req.guardian_id, 1 if req.consent_granted else 0),
    )
    await db.commit()
    return {"status": "consent_recorded", "granted": req.consent_granted}


@router.get("/status", response_model=FamilyStatusOut)
async def family_status(
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get family members and status."""
    if not user.family_id:
        raise HTTPException(status_code=404, detail="You are not part of a family group.")

    # Get family info
    cursor = await db.execute("SELECT * FROM families WHERE id = ?", (user.family_id,))
    family = await cursor.fetchone()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    # Get all members
    cursor = await db.execute(
        "SELECT * FROM users WHERE family_id = ?",
        (user.family_id,),
    )
    members = await cursor.fetchall()

    return FamilyStatusOut(
        family_id=user.family_id,
        members=[
            FamilyMemberOut(
                id=m["id"],
                name=m["name"],
                phone=m["phone"],
                role=UserRole(m["role"]),
                lang=Language(m["lang"]),
            )
            for m in members
        ],
        join_code=family["join_code"],
    )


@router.post("/leave")
async def leave_family(
    user: UserOut = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Leave the family group."""
    if not user.family_id:
        raise HTTPException(status_code=400, detail="You are not part of a family group.")

    await db.execute(
        "UPDATE users SET family_id = NULL WHERE id = ?",
        (user.id,),
    )
    # Remove consents
    await db.execute(
        "DELETE FROM consents WHERE protected_user_id = ? OR guardian_id = ?",
        (user.id, user.id),
    )
    await db.commit()
    return {"status": "left_family"}
