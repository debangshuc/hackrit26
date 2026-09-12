"""
Application configuration — all settings in one place.
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """App settings loaded from environment variables."""

    # App
    APP_NAME: str = "RedFlag"
    DEBUG: bool = True

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "scam-shield-demo-secret-key-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours for demo

    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./scam_shield.db"
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "./scam_shield.db")

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 120

    # File upload
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]

    # Demo
    DEMO_OTP: str = "123456"
    DEMO_PHONES: list[str] = [
        "+919000000001",
        "+919000000002",
        "+919000000003",
        "+919000000004",
        "+919000000005",
    ]

    # Alert polling
    ALERT_COOLDOWN_SECONDS: int = 900  # 15 minutes

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
