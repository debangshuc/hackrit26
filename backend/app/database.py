"""
SQLite database setup — 6 tables, async via aiosqlite.
Simple and sufficient for the demo.
"""
import aiosqlite
import os

DATABASE_PATH = os.getenv("DATABASE_PATH", "./scam_shield.db")


async def get_db():
    """Dependency that yields a database connection."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    """Create all 6 tables. Idempotent — safe to call on every startup."""
    db = await aiosqlite.connect(DATABASE_PATH)

    await db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            phone TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('guardian', 'protected')),
            lang TEXT NOT NULL DEFAULT 'en' CHECK(lang IN ('en', 'bn', 'hi')),
            family_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS consents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            protected_user_id TEXT NOT NULL REFERENCES users(id),
            guardian_id TEXT NOT NULL REFERENCES users(id),
            granted INTEGER NOT NULL DEFAULT 0,
            version INTEGER NOT NULL DEFAULT 1,
            ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(protected_user_id, guardian_id)
        );

        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            family_id TEXT,
            reported_by TEXT NOT NULL REFERENCES users(id),
            scam_types TEXT NOT NULL,
            severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
            status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
            facts_json TEXT NOT NULL,
            plan_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS incident_events (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL REFERENCES incidents(id),
            event_type TEXT NOT NULL,
            payload TEXT NOT NULL DEFAULT '{}',
            server_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            lang TEXT NOT NULL DEFAULT 'en',
            risk TEXT,
            confidence TEXT,
            analysis_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            family_id TEXT NOT NULL,
            member_id TEXT NOT NULL REFERENCES users(id),
            severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
            category TEXT NOT NULL DEFAULT '',
            summary TEXT NOT NULL DEFAULT '',
            why TEXT NOT NULL DEFAULT '',
            payload_json TEXT NOT NULL DEFAULT '{}',
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            acked_at TIMESTAMP,
            is_false_alarm INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_incidents_family ON incidents(family_id);
        CREATE INDEX IF NOT EXISTS idx_incident_events_incident ON incident_events(incident_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_family ON alerts(family_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_member ON alerts(member_id);
        CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
    """)

    await db.commit()
    await db.close()


# ─── Families table helper ────────────────────────────────────────────────────
# Families are implicit via users.family_id, but we need a join_code lookup.

async def init_families_table():
    """Separate families lookup table for join codes."""
    db = await aiosqlite.connect(DATABASE_PATH)
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS families (
            id TEXT PRIMARY KEY,
            join_code TEXT UNIQUE NOT NULL,
            created_by TEXT NOT NULL REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    await db.commit()
    await db.close()
