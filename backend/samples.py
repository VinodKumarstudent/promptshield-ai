SAMPLE_MESSAGES = [
    {
        "id": "phishing_email",
        "category": "Phishing Email",
        "title": "Bank Account Suspension Alert",
        "type": "email",
        "text": "Dear Valued Customer, Your SBI NetBanking access will be permanently suspended within 24 hours due to pending KYC verification. Please click immediately on http://sbi-kyc-update.xyz/verify to update your PAN and Aadhaar details to avoid account deactivation.",
        "expected_risk": "likely_scam",
        "description": "Classic urgent bank suspension phishing with a fake domain imitating State Bank of India."
    },
    {
        "id": "fake_job_offer",
        "category": "Fake Job Offer",
        "title": "Telegram / YouTube Work From Home Scam",
        "type": "job_offer",
        "text": "Greetings from Amazon HR! We are offering a flexible Part-Time Work From Home job. Just like 3 YouTube videos and get paid Rs 5,000 per day directly to your UPI. Zero experience required. Contact our Telegram supervisor @AmazonTaskRecruiter to claim your Rs 500 joining bonus immediately!",
        "expected_risk": "likely_scam",
        "description": "High-payout daily task scam impersonating Amazon, funneling victims into Telegram deposit traps."
    },
    {
        "id": "upi_otp_sms",
        "category": "UPI / OTP Fraud",
        "title": "Fake Refund / QR Code & OTP Trap",
        "type": "payment_upi",
        "text": "Dear customer, your refund of Rs 14,999 from PhonePe has been approved. Scan this QR code and enter your UPI PIN to receive money in your bank account immediately. Do not share your OTP with anyone except our verified executive.",
        "expected_risk": "likely_scam",
        "description": "Misleading refund trap claiming user needs to scan a QR code and enter UPI PIN to receive money."
    },
    {
        "id": "lottery_scam",
        "category": "Lottery / Lucky Draw Scam",
        "title": "KBC / WhatsApp International Lottery",
        "type": "lottery",
        "text": "CONGRATULATIONS! Your mobile number has won a cash prize of Rs 25,00,000 in the KBC WhatsApp Lucky Draw 2026. To claim your prize money, immediately transfer the refundable processing and customs tax fee of Rs 4,500 via GooglePay to the lottery officer.",
        "expected_risk": "likely_scam",
        "description": "Advance fee lottery fraud requiring money transfer to release a non-existent prize."
    },
    {
        "id": "delivery_fee_scam",
        "category": "Delivery Fee Scam",
        "title": "India Post / Courier Redirection Notice",
        "type": "delivery",
        "text": "India Post Alert: Your parcel #IN89201948 could not be delivered due to incomplete address. Urgent action required! Pay Rs 48 redelivery fee within 12 hours at http://tinyurl.com/indapost-redeliver or your package will be returned to sender.",
        "expected_risk": "likely_scam",
        "description": "Smishing attack requesting small token payment via a shortened link to harvest credit/debit card numbers."
    },
    {
        "id": "genuine_order_confirmation",
        "category": "Genuine Order",
        "title": "Official E-Commerce Order Confirmation",
        "type": "email",
        "text": "Hi Rahul, thank you for your order #408-1928301-49281. Your package containing 'Wireless Bluetooth Headphones' has been shipped via BlueDart. You can track your shipment anytime in your official Amazon account under Your Orders. Estimated delivery: Wednesday.",
        "expected_risk": "safe",
        "description": "Standard legitimate order notification with no urgency, no password/OTP request, and reference to official in-app tracking."
    },
    {
        "id": "genuine_bank_otp",
        "category": "Genuine Bank Alert",
        "title": "Legitimate Bank Transaction OTP",
        "type": "sms",
        "text": "739201 is your one-time password (OTP) for your HDFC Bank NetBanking login attempt at 14:32. HDFC Bank NEVER asks for your OTP, CVV, or PIN via phone call or SMS. NEVER share this OTP with anyone, including bank staff.",
        "expected_risk": "safe",
        "description": "Genuine bank OTP security message containing explicit warning not to share the OTP with anyone."
    }
]
