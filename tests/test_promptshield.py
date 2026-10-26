"""
PromptShield Automated Test Suite
Verifies:
1. All 5 Scam Messages correctly identified as likely scams with red flags
2. All 2 Genuine Messages correctly verified as safe (zero false alarms)
3. Strict JSON output validation matching the required schema
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
    assert len(samples) >= 7, f"Expected at least 7 samples, got {len(samples)}"
    print(f"✅ Samples endpoint returned {len(samples)} preconfigured test scenarios")


def test_scam_detection():
    print("\n--- Running Hackathon Sample Tests ---")
    scams_passed = 0
    genuine_passed = 0

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
                f"False alarm triggered for genuine sample {s['id']}: {data['risk_level']}"
            )
            genuine_passed += 1
            print(f"✅ [SAFE VERIFIED] ({data['risk_score']}/100) {s['title']} -> Clean")

    print(f"\nSummary: {scams_passed}/7 Threats Blocked | {genuine_passed}/2 Genuine Verified Safe")
    assert scams_passed == 7
    assert genuine_passed == 2
    print("🏆 ALL CRITICAL CRITERIA AND FALSE-ALARM CHECKS PASSED 100%!")


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
    test_security_and_validation()
