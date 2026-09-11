"""
Auth dependencies — JWT token verification and current user extraction.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import aiosqlite

from app.config import get_settings
from app.database import get_db
from app.schemas import UserOut, UserRole

security = HTTPBearer()
settings = get_settings()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: aiosqlite.Connection = Depends(get_db),
) -> UserOut:
    """Extract current user from JWT token."""
    payload = verify_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(
        id=row["id"],
        phone=row["phone"],
        name=row["name"],
        role=UserRole(row["role"]),
        lang=row["lang"],
        family_id=row["family_id"],
    )


async def require_guardian(user: UserOut = Depends(get_current_user)) -> UserOut:
    """Require the current user to be a guardian."""
    if user.role != UserRole.GUARDIAN:
        raise HTTPException(status_code=403, detail="Guardian access required")
    return user


async def require_protected(user: UserOut = Depends(get_current_user)) -> UserOut:
    """Require the current user to be a protected user."""
    if user.role != UserRole.PROTECTED:
        raise HTTPException(status_code=403, detail="Protected user access required")
    return user
