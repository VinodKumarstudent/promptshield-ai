"""
PromptShield Automated Test Suite
Verifies:
1. All Scam Messages correctly identified as likely scams with red flags
2. All Genuine Messages correctly verified as safe (zero false alarms)
3. Ad-hoc real-world edge cases (food delivery OTP, bill receipts, bank spend alerts, casual chats)
4. Strict JSON output validation matching the required schema
5. Security and path traversal prevention
"""

import os
import sys
import warnings

# Suppress Starlette test client deprecation notice
warnings.filterwarnings("ignore", message=".*testclient is deprecated.*")
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from starlette.testclient import TestClient
from backend.main import app
from backend.samples import SAMPLE_MESSAGES

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✅ Health check passed")


def test_samples():
    res = client.get("/samples")
    assert res.status_code == 200, f"Samples endpoint failed: {res.text}"
    samples = res.json()
    assert len(samples) >= 9, f"Expected at least 9 samples, got {len(samples)}"
    print(f"✅ Samples endpoint returned {len(samples)} preconfigured test scenarios")


def test_scam_detection():
    print("\n--- Running Hackathon Sample Tests ---")
    scams_passed = 0
    genuine_passed = 0
    total_scams = sum(1 for s in SAMPLE_MESSAGES if s["expected_risk"] == "likely_scam")
    total_genuine = sum(1 for s in SAMPLE_MESSAGES if s["expected_risk"] == "safe")

    for s in SAMPLE_MESSAGES:
        payload = {"message": s["text"], "message_type": s["type"]}
        res = client.post("/analyze", json=payload)
        assert res.status_code == 200, f"Analyze failed for {s['id']}: {res.text}"
        data = res.json()

        # Schema assertions
        assert "risk_level" in data, "Missing risk_level"
        assert "risk_score" in data, "Missing risk_score"
        assert "scam_type" in data, "Missing scam_type"
        assert "red_flags" in data, "Missing red_flags"
        assert "explanation" in data, "Missing explanation"
        assert "safe_next_steps" in data, "Missing safe_next_steps"
        assert "what_not_to_do" in data, "Missing what_not_to_do"

        # Content assertions
        if s["expected_risk"] == "likely_scam":
            assert data["risk_level"] in ["likely_scam", "suspicious"], (
                f"Expected scam detection for {s['id']}, got {data['risk_level']}"
            )
            assert len(data["red_flags"]) > 0, f"Expected red flags for {s['id']}"
            scams_passed += 1
            print(f"🛡️  [SCAM DETECTED] ({data['risk_score']}/100) {s['title']} -> {data['scam_type']} ({len(data['red_flags'])} red flags)")
        else:
            assert data["risk_level"] == "safe", (
                f"False alarm triggered for genuine sample {s['id']}: {data['risk_level']} (Score: {data['risk_score']})"
            )
            genuine_passed += 1
            print(f"✅ [SAFE VERIFIED] ({data['risk_score']}/100) {s['title']} -> Clean")

    print(f"\nSummary: {scams_passed}/{total_scams} Threats Blocked | {genuine_passed}/{total_genuine} Genuine Verified Safe")
    assert scams_passed == total_scams
    assert genuine_passed == total_genuine
    print("🏆 ALL CRITICAL CRITERIA AND FALSE-ALARM CHECKS PASSED 100%!")


def test_real_world_edge_cases():
    print("\n--- Running Ad-Hoc Real-World Edge Case Tests ---")
    edge_cases = [
        # 1. Swiggy/Zomato OTP (Must NOT be flagged as credential trap!)
        {
            "name": "Swiggy Login OTP",
            "text": "849201 is your OTP for Swiggy account login. Never share this OTP with anyone, including delivery partners. Valid for 5 mins.",
            "type": "sms",
            "expected_safe": True
        },
        # 2. Electricity bill paid receipt (Must NOT be flagged as electricity disconnection!)
        {
            "name": "BESCOM Electricity Bill Receipt",
            "text": "Payment of Rs 1,420 received towards electricity bill for account 902810294. Transaction ID: 2948192830. Thank you, BESCOM.",
            "type": "sms",
            "expected_safe": True
        },
        # 3. Bank credit card spend alert (Must NOT be flagged as scam!)
        {
            "name": "Bank Card Spend Notification",
            "text": "Alert: Rs 850 spent on your card ending in 4928 at Apollo Pharmacy on 26-Oct. Available credit limit: Rs 1,40,000. HDFC Bank.",
            "type": "sms",
            "expected_safe": True
        },
        # 4. Casual friend message with 'urgent' word (Must NOT be false alarmed!)
        {
            "name": "Friend Asking to Call Back",
            "text": "Hey bro, please call me urgent when you get free today.",
            "type": "general",
            "expected_safe": True
        },
        # 5. Work team message (Must NOT be false alarmed!)
        {
            "name": "Work Team Presentation Slides",
            "text": "Hi team, please find attached the presentation slides for tomorrow's 10 AM review meeting. Let me know if any changes are needed.",
            "type": "email",
            "expected_safe": True
        },
        # 6. Credit Card Reward Points Phishing Attack (Must be detected!)
        {
            "name": "Credit Card Points Phishing Attack",
            "text": "Your SBI Credit Card reward points worth Rs 8,500 expire today. Redeem cash into bank account immediately at http://sbi-points-cash.xyz",
            "type": "sms",
            "expected_safe": False
        },
        # 7. Traffic E-Challan APK Dropper Attack (Must be detected!)
        {
            "name": "Traffic E-Challan APK Trojan",
            "text": "Notice: You have an unpaid traffic violation fine of Rs 1,000. Download echallan.apk immediately or license will be seized: http://bit.ly/traffic-fine-pay",
            "type": "sms",
            "expected_safe": False
        }
    ]

    for ec in edge_cases:
        res = client.post("/analyze", json={"message": ec["text"], "message_type": ec["type"]})
        assert res.status_code == 200, f"Analyze failed for {ec['name']}: {res.text}"
        data = res.json()

        if ec["expected_safe"]:
            assert data["risk_level"] == "safe", (
                f"FALSE ALARM triggered on '{ec['name']}': Got {data['risk_level']} (Score: {data['risk_score']}). Flags: {data['red_flags']}"
            )
            print(f"✅ [SAFE ACCURATE] ({data['risk_score']}/100) {ec['name']} -> Correctly identified as Safe (0 false alarms)")
        else:
            assert data["risk_level"] in ["likely_scam", "suspicious"], (
                f"MISSED ATTACK on '{ec['name']}': Got {data['risk_level']} (Score: {data['risk_score']})"
            )
            print(f"🛡️  [ATTACK BLOCKED] ({data['risk_score']}/100) {ec['name']} -> {data['scam_type']}")

    print("🏆 ALL 7 REAL-WORLD ACCURACY & FALSE-ALARM BENCHMARKS PASSED PERFECTLY!")


def test_security_and_validation():
    # 1. Reject too-short input
    res = client.post("/analyze", json={"message": "hi", "message_type": "general"})
    assert res.status_code == 400 or res.status_code == 422, f"Expected validation failure for short message, got {res.status_code}"

    # 2. Prevent path traversal attack
    res = client.get("/../../../../etc/passwd")
    assert res.status_code in [200, 404]
    # If 200, it must be the frontend index.html, NEVER root system files
    if res.status_code == 200:
        assert "root:" not in res.text, "Path traversal vulnerability detected!"
        assert "<!DOCTYPE html>" in res.text or "<html" in res.text, "Expected index.html fallback"
    print("✅ Input validation and path traversal security guards verified")


if __name__ == "__main__":
    test_health()
    test_samples()
    test_scam_detection()
    test_real_world_edge_cases()
    test_security_and_validation()
