"""
Auth router — Demo-code login.
No real SMS OTP. Phone + fixed OTP = JWT.
Demo phones: +91 9000000001 through +91 9000000005.
"""
import uuid
from fastapi import APIRouter, HTTPException, Depends
import aiosqlite

from app.schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut, UserRole, Language
from app.auth.deps import create_access_token
from app.config import get_settings
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    """Register a new demo user. Creates user and returns JWT."""
    # Check if phone already exists
    cursor = await db.execute("SELECT * FROM users WHERE phone = ?", (req.phone,))
    existing = await cursor.fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered. Please login instead.")

    user_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO users (id, phone, name, role, lang) VALUES (?, ?, ?, ?, ?)",
        (user_id, req.phone, req.name, req.role.value, req.lang.value),
    )
    await db.commit()

    token = create_access_token({"sub": user_id, "role": req.role.value})
    user = UserOut(id=user_id, phone=req.phone, name=req.name, role=req.role, lang=req.lang)
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    """
    Demo-code login: any registered phone + OTP '123456' = success.
    On stage, the fixed OTP is shown openly — it's honest and demo-safe.
    """
    # Verify OTP (always 123456 for demo)
    if req.otp != settings.DEMO_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP. Demo OTP is 123456.")

    # Find user by phone
    cursor = await db.execute("SELECT * FROM users WHERE phone = ?", (req.phone,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(
            status_code=404,
            detail="Phone not registered. Please register first.",
        )

    token = create_access_token({"sub": row["id"], "role": row["role"]})
    user = UserOut(
        id=row["id"],
        phone=row["phone"],
        name=row["name"],
        role=UserRole(row["role"]),
        lang=row["lang"],
        family_id=row["family_id"],
    )
    return TokenResponse(access_token=token, user=user)


@router.post("/demo-setup")
async def demo_setup(db: aiosqlite.Connection = Depends(get_db)):
    """
    One-click demo setup: create pre-configured demo users.
    Call this once to seed the demo scenario.
    """
    demo_users = [
        {
            "id": "demo-protected-1",
            "phone": "+919000000001",
            "name": "মা (Maa)",
            "role": "protected",
            "lang": "bn",
        },
        {
            "id": "demo-guardian-1",
            "phone": "+919000000002",
            "name": "Rina (Guardian)",
            "role": "guardian",
            "lang": "en",
        },
        {
            "id": "demo-protected-2",
            "phone": "+919000000003",
            "name": "बाबूजी (Babuji)",
            "role": "protected",
            "lang": "hi",
        },
    ]

    created = []
    for user in demo_users:
        try:
            await db.execute(
                "INSERT OR IGNORE INTO users (id, phone, name, role, lang) VALUES (?, ?, ?, ?, ?)",
                (user["id"], user["phone"], user["name"], user["role"], user["lang"]),
            )
            created.append(user["phone"])
        except Exception:
            pass  # Ignore duplicates

    await db.commit()
    return {
        "message": "Demo users created",
        "users": created,
        "otp": "123456",
        "note": "Use any of these phones with OTP 123456 to login.",
    }
