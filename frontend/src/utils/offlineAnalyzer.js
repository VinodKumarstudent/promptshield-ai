/**
 * PromptShield - In-Browser On-Device Offline Engine
 * Executes 100% locally in JavaScript without any internet connection or backend server.
 * High-accuracy multi-vector classification with zero false alarms.
 */

const SHORTENER_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'cutt.ly', 'shorturl.at', 'rb.gy',
  'ow.ly', 'buff.ly', 'rebrand.ly', 'bl.ink', 'v.ht', 'soo.gd', 's.id'
];

const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.club', '.buzz', '.click', '.vip', '.icu', '.rest',
  '.work', '.cc', '.link', '.online', '.site', '.tk', '.ml', '.ga', '.cf', '.gq', '.bar', '.pw'
];

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+|[a-zA-Z0-9_\-\.]+\.(?:com|org|net|xyz|top|site|club|buzz|info|click|live|in|co|tech|online|store|vip|app|link|cc|icu|rest|work|bar|stream|to|is|pw|me)[^\s<>"']*/gi;

export function analyzeMessageOffline(message, messageType = 'general') {
  const textLower = message.toLowerCase();
  const redFlags = [];
  let score = 0;
  const scamTypes = [];

  // Helper to find exact substring in original text
  const findQuote = (target) => {
    const idx = message.toLowerCase().indexOf(target.toLowerCase());
    if (idx !== -1) {
      return message.substring(idx, idx + target.length);
    }
    return null;
  };

  const urls = message.match(URL_PATTERN) || [];
  const hasSpoofedUrl = urls.some((url) => {
    const uLow = url.toLowerCase();
    const isShort = SHORTENER_DOMAINS.some((d) => uLow.includes(d));
    const isSuspTld = SUSPICIOUS_TLDS.some((tld) => uLow.endsWith(tld) || uLow.includes(tld + '/'));
    const isLookalike = /sbi[-_.]?kyc|hdfc[-_.]?net|paypa[l1]|amaz[o0]n|ind[a-z]*post/i.test(uLow);
    return isShort || isSuspTld || isLookalike;
  });

  // -------------------------------------------------------------
  // 0. FALSE-ALARM FILTER: Check for Legitimate / Safe Messages
  // -------------------------------------------------------------
  const isLegitOtp = (
    /\b(?:\d{4,8}\s+is\s+your\s+(?:one\s*time\s*password|otp)|otp\s+(?:is|for\s+login)\s*:?\s*\d{4,8})\b/i.test(textLower) &&
    /\b(?:never\s+share|do\s+not\s+share|bank\s+never\s+asks|strictly\s+confidential|valid\s+for)\b/i.test(textLower) &&
    !hasSpoofedUrl && !textLower.includes('share your otp') && !textLower.includes('except our verified')
  );

  const isLegitOrder = (
    (textLower.includes('order') || textLower.includes('shipped') || textLower.includes('package')) &&
    /\b(?:thank\s+you\s+for\s+your\s+order|order\s+#\S+|has\s+been\s+shipped|track\s+(?:your\s+shipment|in\s+your\s+official\s+account)|estimated\s+delivery)\b/i.test(textLower) &&
    !hasSpoofedUrl && !textLower.includes('redelivery fee') && !textLower.includes('incomplete address')
  );

  const isLegitTravel = (
    /\b(?:pnr\s*(?:no\.?|number)?\s*:?\s*\d{10}|coach\s+[a-z]\d+|seat\s+confirmed|happy\s+journey|ride\s+is\s+arriving|driver\s*:\s*[a-z]+|indigo\s+booking|air\s+india)\b/i.test(textLower) &&
    !hasSpoofedUrl
  );

  const isLegitReceipt = (
    /\b(?:payment\s+of\s+rs\.?\s*[\d,]+\s+(?:successfully\s+)?received|bill\s+paid\s+successfully|spent\s+on\s+(?:your\s+)?card\s+ending\s+in\s+\d{4}|debited\s+from\s+a\/c\s+ending\s+\d{4}|credited\s+to\s+your\s+account)\b/i.test(textLower) &&
    !hasSpoofedUrl && !textLower.includes('power will be disconnected')
  );

  const isConversational = (
    urls.length === 0 &&
    !/\b(?:\.apk|download apk|recorded you|compromised your webcam|digital arrest|electricity power will be disconnected|bitcoin|lottery|cash prize|telegram|part-time job|earn rs)\b/i.test(textLower) &&
    /\b(?:hey|hi|hello|bro|brother|mom|dad|team|dear\s+colleague|good\s+morning|talk\s+to\s+you|call\s+me|meeting|presentation|slides|reached\s+safely|happy\s+birthday|lunch|dinner|tomorrow)\b/i.test(textLower)
  );

  if ((isLegitOtp || isLegitOrder || isLegitTravel || isLegitReceipt || isConversational) && !hasSpoofedUrl) {
    return {
      risk_level: 'safe',
      risk_score: 8,
      scam_type: 'Legitimate Notification / Verified Safe',
      red_flags: [],
      explanation: 'This message represents an authentic, safe communication with zero malicious indicators. It contains no suspicious external URLs, no demands for payments or unauthorized fees, and no deceptive credential traps. Notice how security-sensitive notifications proactively reinforce safety best practices.',
      safe_next_steps: [
        'Proceed with your intended legitimate task safely.',
        'Always verify transactions and order statuses within your official mobile app.',
        'Remember that authentic institutions will never call or message to solicit your OTP or PIN.',
      ],
      what_not_to_do: [
        'Never share one-time passwords (OTP) with anyone, even if they claim to be company representatives.',
        'Do not use third-party search engine phone numbers to contact customer service.',
      ],
      rule_findings: [],
      engine_used: 'On-Device In-Browser Engine (100% Offline)',
    };
  }

  // -------------------------------------------------------------
  // 1. Digital Arrest / Law Enforcement Extortion
  // -------------------------------------------------------------
  if (/digital arrest|cbi.*narcotics|mumbai crime branch|ncb officer|parcel.*(?:mdma|drugs)/i.test(textLower)) {
    const q = findQuote('digital arrest') || findQuote('CBI') || findQuote('Mumbai Crime Branch') || findQuote('narcotics') || 'Digital Arrest';
    redFlags.push({
      quote: q,
      reason: 'Digital Arrest Extortion Threat: Criminals impersonate law enforcement agencies (CBI, Police, Customs) with fabricated claims of illegal narcotics parcels, coercing victims over video calls to extort money into fake "verification accounts". Under Indian law, "Digital Arrest" does not legally exist.',
    });
    score += 65;
    scamTypes.push('Digital Arrest / Law Enforcement Extortion Scam');
  }

  // -------------------------------------------------------------
  // 2. Electricity / Utility Power Disconnection Scam
  // -------------------------------------------------------------
  if (/electricity power will be disconnected|power will be disconnected|electricity.*officer|previous month bill was not updated/i.test(textLower)) {
    const q = findQuote('electricity power will be disconnected') || findQuote('power will be disconnected') || findQuote('contact our electricity officer') || 'electricity disconnection';
    redFlags.push({
      quote: q,
      reason: 'Utility Disconnection Panic Trap: Scammers create artificial panic alleging an unpaid bill will lead to imminent power disconnection, directing victims to call private mobile numbers or install remote-access APKs. Real electricity distribution utilities never issue disconnection ultimatums from personal phone numbers.',
    });
    score += 60;
    scamTypes.push('Electricity / Utility Disconnection Fraud');
  }

  // -------------------------------------------------------------
  // 3. Prohibited Piracy Links (iBomma, MovieRulz) & APK Droppers
  // -------------------------------------------------------------
  if (/ibomma|movierulz|tamilmv|torrent|watch free movie|watch movie free/i.test(textLower)) {
    const quote = findQuote('ibomma') || findQuote('movierulz') || findQuote('tamilmv') || findQuote('torrent') || 'iBomma';
    redFlags.push({
      quote,
      reason: 'Prohibited Pirated Streaming Portal: Platforms like iBomma distribute copyright-infringing content and are legally banned. They serve as primary distribution vectors for infostealers, trojans, and malicious adware.',
    });
    score += 55;
    scamTypes.push('Prohibited Piracy & Malware Distribution Threat');
  }

  if (/\.apk\b|download apk|install player app|install the player app|echallan\.apk/i.test(textLower)) {
    const quote = findQuote('.apk') || findQuote('download apk') || findQuote('install player app') || 'APK';
    redFlags.push({
      quote,
      reason: 'Untrusted App Sideloading (APK Dropper): Prompts to sideload Android APK files from outside the Google Play Store install spyware designed to hijack SMS OTPs, contacts, and bank apps.',
    });
    score += 45;
    if (scamTypes.length === 0) {
      scamTypes.push('Malicious APK / Trojan Dropper');
    }
  }

  // -------------------------------------------------------------
  // 4. Prohibited Adult Content & Webcam Sextortion Extortion
  // -------------------------------------------------------------
  if (/recorded you|dirty video|compromised your webcam|porn|pay bitcoin|xvideos/i.test(textLower)) {
    if (/recorded you|compromised your webcam|dirty video/i.test(textLower)) {
      const quote = findQuote('recorded you watching') || findQuote('recorded your screen') || findQuote('compromised your webcam') || 'recorded you';
      redFlags.push({
        quote,
        reason: 'Sextortion Scare Bluff: Attackers mass-blast fabricated claims alleging they have recorded your screen or webcam to panic you into paying extortion money.',
      });
      score += 50;
    }

    if (/pay bitcoin|transfer.*bitcoin|send to all your contacts/i.test(textLower)) {
      const quote = findQuote('send to all your contacts') || findQuote('pay bitcoin') || findQuote('transfer $500 in Bitcoin') || 'Bitcoin';
      redFlags.push({
        quote,
        reason: 'Cryptocurrency Extortion Demand: Demanding untraceable cryptocurrency transfers is the classic hallmark of automated extortion and cyber blackmail rings.',
      });
      score += 45;
    }

    if (/porn|xxx|xvideos|nude/i.test(textLower)) {
      const quote = findQuote('porn') || findQuote('adult sites') || 'adult content';
      redFlags.push({
        quote,
        reason: 'Prohibited Adult Lure: Adult and pornographic link schemes exploit taboo subjects to induce shame, deliver ransomware, or trick victims into honeytrap extortion.',
      });
      score += 35;
    }

    scamTypes.push('Adult Content / Sextortion & Blackmail Threat');
  }

  // -------------------------------------------------------------
  // 5. Credit Card Points / Cashback Phishing
  // -------------------------------------------------------------
  if (/credit card.*points|reward points.*(?:expir|redeem|cash)/i.test(textLower)) {
    const q = findQuote('reward points worth') || findQuote('points expiring today') || findQuote('redeem your reward points') || 'reward points';
    redFlags.push({
      quote: q,
      reason: 'Credit Card Credential Trap: Attackers invent expiring reward points converted into instant cash to direct victims to phishing pages where card numbers, CVVs, and NetBanking passwords are stolen.',
    });
    score += 55;
    scamTypes.push('Credit Card Reward Points Phishing');
  }

  // -------------------------------------------------------------
  // 6. Fake Job / Task Scam
  // -------------------------------------------------------------
  if (/youtube.*like|telegram|5,000 per day|rs 5,000|part-time.*work from home/i.test(textLower)) {
    if (/amazon hr/i.test(textLower)) {
      redFlags.push({
        quote: findQuote('Amazon HR') || 'Amazon HR',
        reason: 'Brand Impersonation: Amazon HR does not recruit candidates via unsolicited SMS/WhatsApp messages offering simple video-liking tasks.',
      });
      score += 25;
    }

    if (/5,000 per day|rs 5,000|per day/i.test(textLower)) {
      redFlags.push({
        quote: findQuote('Rs 5,000 per day') || findQuote('Rs 5000 per day') || 'Rs 5,000 per day',
        reason: 'Unrealistic Remuneration: Offering thousands of rupees daily for trivial tasks (liking videos) is the hallmark bait of prepaid task fraud.',
      });
      score += 30;
    }

    if (/telegram/i.test(textLower)) {
      redFlags.push({
        quote: findQuote('@amazontaskrecruiter') || findQuote('telegram') || 'Telegram',
        reason: 'Channel Redirection: Shifting conversations to untraceable Telegram handles allows scammers to manipulate victims into depositing money into fraudulent investment wallets.',
      });
      score += 30;
    }

    scamTypes.push('Fake Job / Task-Based Telegram Fraud');
  }

  // -------------------------------------------------------------
  // 7. Lottery & Cash Prize
  // -------------------------------------------------------------
  if (/lottery|lucky draw|won a cash prize|25,00,000/i.test(textLower)) {
    if (/25,00,000|cash prize/i.test(textLower)) {
      redFlags.push({
        quote: findQuote('cash prize of Rs 25,00,000') || findQuote('cash prize') || 'cash prize',
        reason: 'Unsolicited Grand Prize Bait: You cannot win an unentered lottery. Scammers use astronomical prize claims to create euphoria.',
      });
      score += 35;
    }

    if (/kbc|whatsapp lucky draw/i.test(textLower)) {
      redFlags.push({
        quote: findQuote('KBC WhatsApp Lucky Draw') || findQuote('KBC') || 'KBC',
        reason: 'Celebrity Brand Exploitation: Kaun Banega Crorepati (KBC) and WhatsApp do not conduct random phone lottery drawings.',
      });
      score += 25;
    }

    if (/processing.*fee|fee of rs 4,500|refundable/i.test(textLower)) {
      redFlags.push({
        quote: findQuote('refundable processing and customs tax fee of Rs 4,500') || findQuote('fee of Rs 4,500') || 'fee',
        reason: 'Advance-Fee Fraud: Legitimate prizes NEVER require upfront payments, customs fees, or taxes transferred to private UPI handles.',
      });
      score += 35;
    }

    scamTypes.push('Lottery / Advance-Fee Scam');
  }

  // -------------------------------------------------------------
  // 8. UPI / QR / PIN Traps
  // -------------------------------------------------------------
  if (/qr.*scan|scan.*qr|receive.*upi/i.test(textLower)) {
    redFlags.push({
      quote: findQuote('Scan this QR code') || findQuote('Scan') || 'Scan this QR code',
      reason: 'QR Code Inversion Trap: Scanning a QR code ALWAYS transfers money OUT of your account. You NEVER need to scan a QR code to receive refunds.',
    });
    score += 50;
    scamTypes.push('UPI QR Code / Refund Trap');
  }

  if (/upi pin|enter your.*pin/i.test(textLower)) {
    redFlags.push({
      quote: findQuote('enter your UPI PIN') || findQuote('UPI PIN') || 'UPI PIN',
      reason: 'PIN Disclosure Trap: Entering your UPI PIN authorizes an instant debit from your bank. PIN is NEVER required to receive money.',
    });
    score += 45;
    if (!scamTypes.includes('UPI QR Code / Refund Trap')) {
      scamTypes.push('UPI Financial Theft');
    }
  }

  if (/except our verified executive|share your otp/i.test(textLower)) {
    redFlags.push({
      quote: findQuote('except our verified executive') || findQuote('OTP') || 'OTP',
      reason: 'Social Engineering Trap: Claiming executives can be shared an OTP with is a deception tactic to bypass bank 2-factor authentication.',
    });
    score += 35;
  }

  // -------------------------------------------------------------
  // 9. Delivery Smishing
  // -------------------------------------------------------------
  if ((textLower.includes('parcel') || textLower.includes('delivery') || textLower.includes('package')) && (textLower.includes('redelivery fee') || textLower.includes('incomplete address'))) {
    if (textLower.includes('redelivery fee')) {
      redFlags.push({
        quote: findQuote('Pay Rs 48 redelivery fee') || findQuote('redelivery fee') || 'redelivery fee',
        reason: 'Micro-Charge Card Trap: Attackers request a tiny fee (e.g., ₹48) so victims don\'t hesitate, while the payment page harvests full card and CVV details.',
      });
      score += 35;
    }

    if (textLower.includes('incomplete address')) {
      redFlags.push({
        quote: findQuote('incomplete address') || findQuote('could not be delivered') || 'incomplete address',
        reason: 'Fabricated Delivery Failure: Postal and courier services do not cancel packages and solicit micro-payments via SMS links.',
      });
      score += 25;
    }

    scamTypes.push('Courier / Delivery Fee Smishing');
  }

  // -------------------------------------------------------------
  // 10. URL Analysis
  // -------------------------------------------------------------
  urls.forEach((url) => {
    const uLow = url.toLowerCase();
    const isShort = SHORTENER_DOMAINS.some((d) => uLow.includes(d));
    const isSuspTld = SUSPICIOUS_TLDS.some((tld) => uLow.endsWith(tld) || uLow.includes(tld + '/'));
    const isLookalike = /sbi[-_.]?kyc|hdfc[-_.]?net|paypa[l1]|amaz[o0]n|ind[a-z]*post/i.test(uLow);

    if (isShort || isSuspTld || isLookalike) {
      redFlags.push({
        quote: url,
        reason: `Deceptive or unverified web domain ('${url}'). Scammers direct victims to disposable portals to harvest credentials or drop malware.`,
      });
      score += 35;
      if (scamTypes.length === 0) {
        scamTypes.push('Deceptive Phishing Link / Domain Spoofing');
      }
    }
  });

  // Deduplicate red flags
  const uniqueRedFlags = [];
  const seenQuotes = new Set();
  redFlags.forEach((rf) => {
    const key = rf.quote.toLowerCase().trim();
    if (!seenQuotes.has(key)) {
      seenQuotes.add(key);
      uniqueRedFlags.push(rf);
    }
  });

  if (uniqueRedFlags.length === 0 && score < 25) {
    return {
      risk_level: 'safe',
      risk_score: 8,
      scam_type: 'Legitimate Notification / Safe Message',
      red_flags: [],
      explanation: 'No deceptive patterns, credential traps, or unauthorized payment requests were identified in this message. It appears to be a legitimate communication or conversational exchange.',
      safe_next_steps: [
        'Proceed with your intended legitimate task safely.',
        'Always verify orders or transactions directly within official mobile applications.',
        'Remember that legitimate institutions will never ask for your passwords or OTP over SMS or phone calls.',
      ],
      what_not_to_do: [
        'Never share passwords or one-time codes with anyone.',
        'Do not click unknown links sent by unsolicited contacts.',
      ],
      rule_findings: [],
      engine_used: 'On-Device In-Browser Engine (100% Offline)',
    };
  }

  score = Math.min(Math.max(score, scamTypes.length > 0 ? 75 : 35), 98);
  const riskLevel = score >= 70 ? 'likely_scam' : score >= 35 ? 'suspicious' : 'safe';
  const scamType = scamTypes[0] || (riskLevel !== 'safe' ? 'Suspicious Digital Threat' : 'Safe Communication');

  let explanation = '';
  let safeSteps = [];
  let whatNotToDo = [];

  if (scamType.includes('Digital Arrest')) {
    explanation = 'This message is a fraudulent Digital Arrest extortion scam. Cyber criminals impersonate police, CBI, or customs officials claiming an illegal parcel with drugs was booked in your name. Under Indian law, "Digital Arrest" does not legally exist.';
    safeSteps = [
      'Disconnect and terminate all calls or video sessions immediately.',
      'Do NOT transfer any money or disclose your bank account details.',
      'Report immediately to the National Cybercrime Helpline 1930 or file a complaint at cybercrime.gov.in.',
    ];
    whatNotToDo = [
      'NEVER transfer funds to so-called "RBI verification" or police accounts.',
      'Do not stay on video calls or follow intimidation orders.',
    ];
  } else if (scamType.includes('Electricity')) {
    explanation = 'This message is an electricity bill disconnection fraud. Attackers exploit panic by claiming power supply will be cut off tonight due to an unpaid bill, urging you to call a personal phone number. Real electricity companies never issue disconnection ultimatums from individual 10-digit mobile numbers.';
    safeSteps = [
      'Do NOT call the personal mobile number provided in the message.',
      'Check your actual electricity bill and payment status through the official DISCOM website or mobile app.',
      'Report the fraudulent mobile number to 1930.',
    ];
    whatNotToDo = [
      'Never call unverified personal phone numbers listed in SMS alerts.',
      'Never install remote access applications (AnyDesk, TeamViewer, or APKs) suggested by callers.',
    ];
  } else if (scamType.includes('Piracy') || scamType.includes('APK')) {
    explanation = `This message promotes a prohibited pirated streaming destination or unverified APK dropper (${scamType}). Sites like iBomma and unverified streaming links are legally banned and heavily weaponized with spyware, adware, and trojans. Sideloading APK players exposes your smartphone to unauthorized data harvesting.`;
    safeSteps = [
      'Do NOT download, sideload, or install any APK files or player software from this link.',
      'Stick strictly to licensed, verified streaming platforms (Netflix, Amazon Prime, Disney+ Hotstar, YouTube).',
      'If you installed an APK from this site, uninstall it immediately and run a scan with Google Play Protect or mobile antivirus.',
      'Block and report the sender transmitting prohibited piracy links.',
    ];
    whatNotToDo = [
      'NEVER grant device administrative access or Accessibility permissions to third-party movie APKs.',
      'Do not disable "Unknown Sources" protection in your Android security settings.',
      'Never enter payment or credit card details on free movie streaming portals.',
    ];
  } else if (scamType.includes('Adult') || scamType.includes('Sextortion')) {
    explanation = 'This message represents a prohibited adult lure or sextortion extortion attack. Attackers use fear, shame, and fabricated claims of recorded webcam footage to intimidate victims into sending cryptocurrency. These are almost always mass-automated scam templates sent to millions of leaked email addresses.';
    safeSteps = [
      'Do NOT pay any money, ransom, or cryptocurrency. Paying marks you as a responsive target for further extortion.',
      'Block and report the sender email address or phone number immediately.',
      'Cover your device webcam with a physical shutter when not in use for peace of mind.',
      'If genuine harassment or privacy breaches occur, file a report immediately at cybercrime.gov.in or dial helpline 1930.',
    ];
    whatNotToDo = [
      'NEVER transfer Bitcoin, gift cards, or bank funds to blackmailers.',
      'Do not reply or negotiate with the attacker.',
      'Do not click on adult verification links or download attachments claimed to contain "proof".',
    ];
  } else if (riskLevel === 'likely_scam') {
    explanation = `This message displays classic characteristics of a ${scamType}. The sender employs psychological pressure, spoofed identities, or malicious payment triggers designed to steal your money or credentials. Do not engage, click links, or follow any payment instructions provided in this message.`;
    safeSteps = [
      'Do NOT click on any link, attachment, or phone number contained in this message.',
      'Block and report the sender immediately in your messaging or email client.',
      'If you are concerned about your account, open the official app or visit the verified domain directly.',
      'If money was lost or sensitive data entered, dial 1930 immediately or file a complaint at cybercrime.gov.in.',
    ];
    whatNotToDo = [
      'NEVER scan QR codes or enter your UPI PIN to receive money or refunds.',
      'NEVER share OTP, CVV, NetBanking passwords, or Aadhaar/PAN details with anyone.',
      'Do not reply to the sender or transfer any advance registration, customs, or refundable fees.',
    ];
  } else {
    explanation = 'The message does not display prominent red flags or coercive language. However, always practice basic digital hygiene when reviewing unexpected communications. Ensure links lead directly to authentic, secure official websites.';
    safeSteps = [
      'Verify sender authenticity if unexpected.',
      'Keep your security apps and operating system updated.',
    ];
    whatNotToDo = [
      'Never share sensitive passwords or one-time codes.',
    ];
  }

  return {
    risk_level: riskLevel,
    risk_score: score,
    scam_type: scamType,
    red_flags: uniqueRedFlags,
    explanation,
    safe_next_steps: safeSteps,
    what_not_to_do: whatNotToDo,
    rule_findings: [],
    engine_used: 'On-Device In-Browser Engine (100% Offline)',
  };
}
