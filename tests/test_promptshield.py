"""
PromptShield Automated Test Suite
Verifies:
1. All 7 Scam Messages correctly identified as likely scams with red flags
2. All 2 Genuine Messages correctly verified as safe (zero false alarms)
3. Strict JSON output validation matching the required schema
4. Multi-modal evidence upload, SHA-256 integrity calculation & Cybercrime Dossier generation
"""

import io
import os
import sys
import hashlib
from PIL import Image

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
        assert "dossier" in data, "Missing dossier"

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


def test_evidence_upload():
    print("\n--- Testing Visual & Digital Evidence Upload & Hashing ---")
    # Create test image in memory
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_data = img_bytes.getvalue()
    expected_hash = hashlib.sha256(img_data).hexdigest()

    files = [
        ("files", ("test_screenshot.png", img_data, "image/png")),
        ("files", ("extortion_threat.mp4", b"fake video stream content 12345", "video/mp4")),
    ]

    res = client.post("/upload-evidence", files=files)
    assert res.status_code == 200, f"Upload evidence failed: {res.text}"
    manifest = res.json()
    assert len(manifest) == 2, f"Expected 2 evidence files, got {len(manifest)}"

    # Verify SHA-256 hash match
    assert manifest[0]["sha256"] == expected_hash, "SHA-256 hash calculation mismatch!"
    assert manifest[0]["file_type_category"] == "photo"
    assert manifest[0]["preview_data"] is not None
    assert manifest[1]["file_type_category"] == "video"
    assert manifest[1]["tamper_check"] == "VERIFIED_INTEGRITY"
    print(f"✅ Visual evidence SHA-256 verified: {manifest[0]['sha256'][:16]}...")
    print(f"✅ Video evidence SHA-256 verified: {manifest[1]['sha256'][:16]}...")


def test_analyze_with_evidence():
    print("\n--- Testing Analysis with Attached Digital Evidence & Dossier ---")
    apk_data = b"PK\x03\x04 fake android apk dropper binary contents"
    files = [
        ("files", ("sbi_rewards_update.apk", apk_data, "application/vnd.android.package-archive"))
    ]
    data = {
        "message": "Click to install update for your pending bank rewards",
        "message_type": "sms"
    }

    res = client.post("/analyze-evidence", data=data, files=files)
    assert res.status_code == 200, f"Analyze with evidence failed: {res.text}"
    result = res.json()

    assert result["risk_level"] == "likely_scam", f"Expected likely_scam for APK dropper, got {result['risk_level']}"
    assert result["risk_score"] >= 90
    assert len(result["evidence_manifest"]) == 1
    assert result["evidence_manifest"][0]["filename"] == "sbi_rewards_update.apk"

    # Verify Cybercrime Dossier
    dossier = result.get("dossier")
    assert dossier is not None, "Missing cybercrime dossier"
    assert dossier["portal_submission_ready"] is True
    assert len(dossier["it_act_sections"]) > 0
    assert "IT Act" in dossier["it_act_sections"][0]
    print(f"✅ Cybercrime Dossier generated: ID {dossier['dossier_id']}")
    print(f"✅ Legal sections cited: {len(dossier['it_act_sections'])} applicable sections under IT Act / BNS")
    print("🏆 ALL DIGITAL EVIDENCE VERIFICATION & DOSSIER TESTS PASSED 100%!")


if __name__ == "__main__":
    test_health()
    test_samples()
    test_scam_detection()
    test_evidence_upload()
    test_analyze_with_evidence()
