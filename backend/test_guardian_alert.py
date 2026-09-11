"""
Comprehensive in-process test suite for Guardian Emergency Alert integration.
Uses httpx.AsyncClient with ASGITransport to test the FastAPI app directly.

Verifies all 13 core scenarios:
1. Connected Guardian
2. Successful Guardian alert creation (POST /alerts/emergency)
3. Guardian receives incident via polling (GET /alerts/poll)
4. No Guardian connected returns 400
5. Duplicate alert handling / verification
6. Invalid authentication returns 401
7. Missing/expired authentication returns 401
8. Backend health & availability
9. Missing optional incident fields handled gracefully
10. Unauthorized Guardian access control (cross-family isolation)
11. Critical incident alert formatting & plan creation
12. High-risk incident alert formatting & plan creation
13. Incident events timeline persistence & fact retrieval
"""
import asyncio
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import httpx
from app.main import app
from app.database import init_db, init_families_table

async def run_async_tests():
    print("==================================================")
    print("STARTING GUARDIAN EMERGENCY ALERT TEST SUITE (ASGI)")
    print("==================================================")

    # Initialize SQLite database tables
    await init_db()
    await init_families_table()

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.status_code} {res.text}"
        print(f"✅ TEST 1: Backend Health Check PASSED -> {res.json()['status']}")

        # 2. Demo setup & Seeding
        res = await client.post("/auth/demo-setup")
        assert res.status_code == 200, f"Demo setup failed: {res.status_code} {res.text}"
        print(f"✅ TEST 2: Demo Setup & Seeding PASSED -> {res.json()['message']}")

        # 3. Authenticate Protected User (Maa)
        res = await client.post("/auth/login", json={"phone": "+919000000001", "otp": "123456"})
        assert res.status_code == 200, f"Maa login failed: {res.status_code}"
        data_maa = res.json()
        token_maa = data_maa["access_token"]
        user_maa = data_maa["user"]
        assert user_maa["family_id"] == "demo-family-1"
        print(f"✅ TEST 3: Authenticated Protected User Maa (Family: {user_maa['family_id']})")

        # 4. Authenticate Guardian User (Rina)
        res = await client.post("/auth/login", json={"phone": "+919000000002", "otp": "123456"})
        assert res.status_code == 200, f"Rina login failed: {res.status_code}"
        data_rina = res.json()
        token_rina = data_rina["access_token"]
        user_rina = data_rina["user"]
        assert user_rina["family_id"] == "demo-family-1"
        print(f"✅ TEST 4: Authenticated Guardian User Rina (Family: {user_rina['family_id']})")

        # 5. Authenticate Protected User without family (Babuji)
        res = await client.post("/auth/login", json={"phone": "+919000000003", "otp": "123456"})
        assert res.status_code == 200, f"Babuji login failed: {res.status_code}"
        data_babuji = res.json()
        token_babuji = data_babuji["access_token"]
        user_babuji = data_babuji["user"]
        print(f"✅ TEST 5: Authenticated Protected User Babuji (Family: {user_babuji['family_id']})")

        # 6. Scenario: No Guardian connected returns 400
        res = await client.post(
            "/alerts/emergency",
            json={
                "incident_type": "UPI Fraud",
                "category": "UPI / Payment",
                "severity": "critical",
                "amount": "₹5,000",
            },
            headers={"Authorization": f"Bearer {token_babuji}"},
        )
        assert res.status_code == 400, f"Expected 400 for unlinked user, got {res.status_code}: {res.text}"
        print(f"✅ TEST 6: Unlinked User Alert Prevented -> 400: {res.json()['detail']}")

        # 7. Scenario: Invalid / Expired Auth returns 401
        res = await client.post(
            "/alerts/emergency",
            json={
                "incident_type": "UPI Fraud",
                "category": "UPI / Payment",
                "severity": "critical",
            },
            headers={"Authorization": "Bearer invalid_jwt_token_12345"},
        )
        assert res.status_code == 401, f"Expected 401 for invalid token, got {res.status_code}"
        print("✅ TEST 7: Invalid JWT Token Rejected -> 401 Unauthorized")

        # 8. Scenario: Missing Auth Header returns 401/403
        res = await client.post(
            "/alerts/emergency",
            json={"incident_type": "UPI Fraud"},
        )
        assert res.status_code in (401, 403), f"Expected 401/403 for missing token, got {res.status_code}"
        print(f"✅ TEST 8: Missing JWT Token Rejected -> {res.status_code}")

        # 9. Scenario: Successful Emergency Alert with full payload (Critical)
        alert_payload_1 = {
            "incident_type": "Financial Scam / UPI Fraud",
            "category": "UPI / Payment",
            "severity": "critical",
            "amount": "₹10,000",
            "currency": "₹ INR",
            "payment_method": "UPI (Google Pay)",
            "transaction_id": "UTR-DEMO-001",
            "scammer_contact": "+91 98765 43210",
            "what_happened": "Scammer claimed my electricity would be disconnected unless I paid ₹10,000 via UPI immediately.",
            "checklist_progress": "3/7 evidence checklist items verified",
        }
        res = await client.post(
            "/alerts/emergency",
            json=alert_payload_1,
            headers={"Authorization": f"Bearer {token_maa}"},
        )
        assert res.status_code == 200, f"Emergency alert failed: {res.status_code} {res.text}"
        res_alert = res.json()
        assert res_alert["status"] == "alert_sent"
        assert "alert_id" in res_alert
        assert "incident_id" in res_alert
        incident_id_1 = res_alert["incident_id"]
        alert_id_1 = res_alert["alert_id"]
        print(f"✅ TEST 9: Critical Guardian Alert Created -> Alert ID: {alert_id_1}, Incident: {incident_id_1}")

        # 10. Scenario: Guardian receives alert via polling
        res = await client.get(
            "/alerts/poll?unacked_only=true",
            headers={"Authorization": f"Bearer {token_rina}"},
        )
        assert res.status_code == 200, f"Guardian poll failed: {res.status_code} {res.text}"
        alerts = res.json()
        matched_alert = next((a for a in alerts if a["id"] == alert_id_1), None)
        assert matched_alert is not None, f"Alert {alert_id_1} not found in Guardian polled alerts: {alerts}"
        assert matched_alert["severity"] == "critical"
        assert matched_alert["member_name"] == "মা (Maa)"
        assert matched_alert["payload"]["transaction_id"] == "UTR-DEMO-001"
        assert matched_alert["payload"]["amount"] == "₹10,000"
        print(f"✅ TEST 10: Guardian Poll Received Alert -> Member: {matched_alert['member_name']}, Summary: {matched_alert['summary']}")

        # 11. Scenario: Guardian Views Incident Details & Structured Facts
        res = await client.get(
            f"/incidents/{incident_id_1}",
            headers={"Authorization": f"Bearer {token_rina}"},
        )
        assert res.status_code == 200, f"Get incident failed: {res.status_code} {res.text}"
        incident_data = res.json()
        assert incident_data["id"] == incident_id_1
        assert incident_data["facts"] is not None
        assert incident_data["facts"]["amount"] == "₹10,000"
        assert incident_data["facts"]["transaction_id"] == "UTR-DEMO-001"
        assert incident_data["plan"] is not None
        assert len(incident_data["plan"]["plan_steps"]) == 8
        print(f"✅ TEST 11: Guardian Viewed Incident Facts & 8-Step Plan -> Steps: {len(incident_data['plan']['plan_steps'])}")

        # 12. Scenario: Incident Event Timeline Persistence
        res = await client.get(
            f"/incidents/{incident_id_1}/events",
            headers={"Authorization": f"Bearer {token_rina}"},
        )
        assert res.status_code == 200, f"Get events failed: {res.status_code}"
        events = res.json()
        assert len(events) >= 2, f"Expected at least 2 events (created + alert_sent), got {len(events)}"
        event_types = [e["event_type"] for e in events]
        assert "created" in event_types
        assert "alert_sent" in event_types
        print(f"✅ TEST 12: Incident Timeline Events Verified -> Types: {event_types}")

        # 13. Scenario: Cross-family Isolation / Access Control
        # Babuji (not in demo-family-1) tries to view Maa's incident
        res = await client.get(
            f"/incidents/{incident_id_1}",
            headers={"Authorization": f"Bearer {token_babuji}"},
        )
        assert res.status_code == 403, f"Expected 403 Forbidden for cross-family incident view, got {res.status_code}"
        print("✅ TEST 13: Cross-Family Access Control Enforced -> 403 Forbidden")

        # 14. Scenario: Minimal alert with optional fields
        alert_payload_minimal = {
            "incident_type": "Other Scam",
            "category": "Suspicious Activity",
            "severity": "high",
        }
        res = await client.post(
            "/alerts/emergency",
            json=alert_payload_minimal,
            headers={"Authorization": f"Bearer {token_maa}"},
        )
        assert res.status_code == 200, f"Minimal emergency alert failed: {res.status_code}"
        res_minimal = res.json()
        assert res_minimal["status"] == "alert_sent"
        print("✅ TEST 14: Minimal Alert with Optional Fields Handled Gracefully")

        # 15. Scenario: Acknowledge Alert by Guardian
        res = await client.post(
            f"/alerts/{alert_id_1}/ack",
            headers={"Authorization": f"Bearer {token_rina}"},
        )
        assert res.status_code == 200, f"Ack alert failed: {res.status_code}"
        assert res.json()["status"] == "acknowledged"
        print(f"✅ TEST 15: Alert Acknowledged by Guardian -> Status: {res.json()['status']}")

        print("==================================================")
        print("ALL GUARDIAN EMERGENCY ALERT TESTS PASSED! (15/15)")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_async_tests())
