import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Send,
  RotateCcw,
  AlertTriangle,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Command,
  ArrowRight,
  ChevronDown,
  Clipboard,
  PhoneCall,
  Terminal,
  ExternalLink,
} from 'lucide-react';

import Navbar from './components/Navbar';
import AppleQuickPresets from './components/AppleQuickPresets';
import RiskMeter from './components/RiskMeter';
import InteractiveViewer from './components/InteractiveViewer';
import ActionChecklist from './components/ActionChecklist';
import ScamAwareness from './components/ScamAwareness';
import HistoryDrawer from './components/HistoryDrawer';
import { analyzeMessageOffline } from './utils/offlineAnalyzer';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'awareness'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Pre-configured test scenarios
  const [samples, setSamples] = useState([
    {
      id: 'phishing_email',
      category: 'Phishing Email',
      title: 'Bank Account Suspension Alert',
      type: 'email',
      text: 'Dear Valued Customer, Your SBI NetBanking access will be permanently suspended within 24 hours due to pending KYC verification. Please click immediately on http://sbi-kyc-update.xyz/verify to update your PAN and Aadhaar details to avoid account deactivation.',
      expected_risk: 'likely_scam',
      description: 'Classic urgent bank suspension phishing with a fake domain imitating State Bank of India.'
    },
    {
      id: 'digital_arrest',
      category: 'Law Enforcement Scam',
      title: 'Digital Arrest / Police Extortion',
      type: 'sms',
      text: 'This is Mumbai Crime Branch. An international parcel #IND-9028 booked with your Aadhaar card has been seized at Mumbai Airport containing 5 fake passports and 140 grams of MDMA narcotics. Digital arrest warrant issued. Connect immediately on Skype with CBI officer or local police will arrive at your residence.',
      expected_risk: 'likely_scam',
      description: 'Severe digital arrest intimidation extortion coercing victim onto Skype video interrogation.'
    },
    {
      id: 'electricity_bill_scam',
      category: 'Utility Disconnection',
      title: 'Electricity Power Disconnect Scam',
      type: 'sms',
      text: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma on 9876543210.',
      expected_risk: 'likely_scam',
      description: 'Widespread utility shutoff scare trap directing victim to call an unverified 10-digit mobile number.'
    },
    {
      id: 'fake_job_offer',
      category: 'Fake Job Offer',
      title: 'Telegram / YouTube Work Scam',
      type: 'job_offer',
      text: 'Greetings from Amazon HR! We are offering a flexible Part-Time Work From Home job. Just like 3 YouTube videos and get paid Rs 5,000 per day directly to your UPI. Zero experience required. Contact our Telegram supervisor @AmazonTaskRecruiter to claim your Rs 500 joining bonus immediately!',
      expected_risk: 'likely_scam',
      description: 'High-payout daily task scam impersonating Amazon, funneling victims into Telegram deposit traps.'
    },
    {
      id: 'upi_otp_sms',
      category: 'UPI / OTP Fraud',
      title: 'Fake Refund / QR Code & OTP Trap',
      type: 'payment_upi',
      text: 'Dear customer, your refund of Rs 14,999 from PhonePe has been approved. Scan this QR code and enter your UPI PIN to receive money in your bank account immediately. Do not share your OTP with anyone except our verified executive.',
      expected_risk: 'likely_scam',
      description: 'Misleading refund trap claiming user needs to scan a QR code and enter UPI PIN to receive money.'
    },
    {
      id: 'lottery_scam',
      category: 'Lottery / Lucky Draw Scam',
      title: 'KBC / WhatsApp International Lottery',
      type: 'lottery',
      text: 'CONGRATULATIONS! Your mobile number has won a cash prize of Rs 25,00,000 in the KBC WhatsApp Lucky Draw 2026. To claim your prize money, immediately transfer the refundable processing and customs tax fee of Rs 4,500 via GooglePay to the lottery officer.',
      expected_risk: 'likely_scam',
      description: 'Advance fee lottery fraud requiring money transfer to release a non-existent prize.'
    },
    {
      id: 'delivery_fee_scam',
      category: 'Delivery Fee Scam',
      title: 'India Post Courier Redirection',
      type: 'delivery',
      text: 'India Post Alert: Your parcel #IN89201948 could not be delivered due to incomplete address. Urgent action required! Pay Rs 48 redelivery fee within 12 hours at http://tinyurl.com/indapost-redeliver or your package will be returned to sender.',
      expected_risk: 'likely_scam',
      description: 'Smishing attack requesting small token payment via a shortened link to harvest credit/debit card numbers.'
    },
    {
      id: 'ibomma_piracy_malware',
      category: 'Prohibited Piracy Link',
      title: 'iBomma Free Movie & APK Dropper',
      type: 'general',
      text: 'Watch latest blockbuster movies online free in 1080p HD on iBomma! Click http://ibomma.bar/stream-free and install the player app download apk to start watching immediately without subscription.',
      expected_risk: 'likely_scam',
      description: 'Prohibited pirated movie streaming portal link directing users to sideload an untrusted APK dropper containing trojans and spyware.'
    },
    {
      id: 'sextortion_blackmail',
      category: 'Sextortion & Blackmail',
      title: 'Adult Site Webcam Blackmail Scam',
      type: 'email',
      text: 'Warning: I recorded your screen and compromised your webcam while you were watching adult porn sites. I have a split video of you. Transfer $500 in Bitcoin within 24 hours or I will send to all your contacts and family.',
      expected_risk: 'likely_scam',
      description: 'Automated sextortion extortion scam attempting to coerce victim into paying cryptocurrency using fake webcam recording claims.'
    },
    {
      id: 'genuine_order_confirmation',
      category: 'Genuine Order',
      title: 'Official Amazon Order Confirmation',
      type: 'email',
      text: "Hi Rahul, thank you for your order #408-1928301-49281. Your package containing 'Wireless Bluetooth Headphones' has been shipped via BlueDart. You can track your shipment anytime in your official Amazon account under Your Orders. Estimated delivery: Wednesday.",
      expected_risk: 'safe',
      description: 'Standard legitimate order notification with no urgency and official in-app tracking reference.'
    },
    {
      id: 'genuine_bank_otp',
      category: 'Genuine Bank Alert',
      title: 'Legitimate HDFC Bank OTP Alert',
      type: 'sms',
      text: '739201 is your one-time password (OTP) for your HDFC Bank NetBanking login attempt at 14:32. HDFC Bank NEVER asks for your OTP, CVV, or PIN via phone call or SMS. NEVER share this OTP with anyone, including bank staff.',
      expected_risk: 'safe',
      description: 'Genuine bank OTP security message containing explicit warning not to share the OTP.'
    },
    {
      id: 'genuine_personal_chat',
      category: 'Genuine Chat',
      title: 'Normal Conversational WhatsApp Message',
      type: 'general',
      text: 'Hey bro, are we still meeting for lunch tomorrow at 1 PM near the office? Please let me know when you get this.',
      expected_risk: 'safe',
      description: 'Everyday casual conversation with no links, no financial demands, and zero threat vectors.'
    }
  ]);

  // Local storage history
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('promptshield_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    fetch('/samples')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load samples from backend');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSamples(data);
        }
      })
      .catch(() => {});
  }, []);

  const saveToHistory = (result, originalMessage, type) => {
    try {
      const newItem = {
        id: `analysis-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: originalMessage,
        message_type: type,
        risk_level: result.risk_level,
        risk_score: result.risk_score,
        scam_type: result.scam_type,
        explanation: result.explanation,
        red_flags: result.red_flags,
        safe_next_steps: result.safe_next_steps,
        what_not_to_do: result.what_not_to_do,
        engine_used: result.engine_used,
      };

      const updated = [newItem, ...history.filter((h) => h.message !== originalMessage)].slice(0, 30);
      setHistory(updated);
      localStorage.setItem('promptshield_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to local storage history:', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('promptshield_history');
  };

  const handleDeleteHistoryItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('promptshield_history', JSON.stringify(updated));
  };

  const handleSelectHistoryItem = (item) => {
    setMessage(item.message);
    setMessageType(item.message_type || 'general');
    setAnalysisResult(item);
    setActiveSampleId(null);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleSelectSample = (sample) => {
    setActiveSampleId(sample.id);
    setMessage(sample.text);
    setMessageType(sample.type);
    setAnalysisResult(null);
    setError(null);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage(text);
        setError(null);
      }
    } catch {
      // Fallback if browser permission is blocked
    }
  };

  const handleAnalyze = async (customMessage = null, customType = null) => {
    const textToAnalyze = (customMessage !== null ? customMessage : message).trim();
    const typeToUse = customType !== null ? customType : messageType;

    if (!textToAnalyze) {
      setError('Please paste or type a suspicious message, link, or notification to inspect.');
      return;
    }

    const looksLikePassword = /\b(password\s*=\s*\S+|my\s*password\s*is\s*\S+)\b/i.test(textToAnalyze);
    if (looksLikePassword) {
      const confirmProceed = window.confirm(
        'Warning: Your message appears to contain a literal password. Please remove any real private credentials before analyzing. Proceed anyway?'
      );
      if (!confirmProceed) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToAnalyze,
          message_type: typeToUse,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error (${response.status})`);
      }

      const data = await response.json();
      setAnalysisResult(data);
      saveToHistory(data, textToAnalyze, typeToUse);
    } catch (networkOrServerError) {
      console.warn('Backend/network unreachable. Running In-Browser On-Device Offline Engine:', networkOrServerError);
      // Seamless offline fallback execution
      const offlineData = analyzeMessageOffline(textToAnalyze, typeToUse);
      setAnalysisResult(offlineData);
      saveToHistory(offlineData, textToAnalyze, typeToUse);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        const resultElement = document.getElementById('analysis-results-section');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleReset = () => {
    setMessage('');
    setMessageType('general');
    setAnalysisResult(null);
    setError(null);
    setActiveSampleId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#040714] text-slate-100 relative cyber-grid-pattern selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Subtle brand ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-blue-600/5 rounded-full blur-[140px]" />
      </div>

      {/* Floating Translucent Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        {activeTab === 'awareness' ? (
          <ScamAwareness />
        ) : (
          <div className="space-y-8">
            {/* Hero Section with Official Brand Emblem */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
              {/* Official Logo Display */}
              <div className="inline-block relative group mb-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl overflow-hidden border border-cyan-400/40 shadow-2xl shadow-cyan-500/25 bg-[#060919] p-1 transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-300">
                  <img
                    src="/logo.jpg"
                    alt="PromptShield AI"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  PromptShield <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-wider text-cyan-300 uppercase">
                  Detect Scams • Understand Risks • Stay Safe
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
                  Explainable AI forensics to identify deceptive phishing, piracy trojans, UPI traps, and social engineering attacks before you click or pay.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Zero Server Storage</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>100% On-Device Offline Engine</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <PhoneCall className="w-3 h-3 text-rose-400" />
                  <span>Dial 1930 / cybercrime.gov.in</span>
                </span>
              </div>
            </div>

            {/* Interactive Threat Test Bench (Quick Presets) */}
            <AppleQuickPresets
              samples={samples}
              onSelectSample={handleSelectSample}
              activeSampleId={activeSampleId}
            />

            {/* Threat Inspection Console */}
            <div className="cyber-panel rounded-2xl p-5 sm:p-6 transition-all duration-300 border border-cyan-500/20 shadow-xl shadow-black/50">
              {/* Console Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="font-bold uppercase tracking-wider text-slate-200 text-[11px]">
                    Threat Inspection Console
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    Private In-Memory Analysis
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasteClipboard}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 hover:text-white transition px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Paste</span>
                  </button>
                  {message && (
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-300 transition px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                  rows={4}
                  placeholder="Paste suspicious text, SMS alert, email message, job offer, or delivery link here..."
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Console Bottom Action Bar */}
              <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Channel / Type Selector */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative inline-flex items-center">
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="appearance-none bg-slate-900/80 hover:bg-slate-850 text-xs font-semibold text-slate-200 border border-slate-700/80 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                    >
                      <option value="general">General Message / Claim</option>
                      <option value="email">Email Phishing</option>
                      <option value="sms">SMS / Text Message</option>
                      <option value="job_offer">Job / Telegram Task Scam</option>
                      <option value="payment_upi">UPI / QR Code Fraud</option>
                      <option value="delivery">Courier / Redelivery Smishing</option>
                      <option value="lottery">Lottery / Grand Prize</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                    {message.length} chars
                  </span>
                </div>

                {/* Inspect Button & Shortcut */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1 font-semibold">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300 font-mono text-[10px]">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300 font-mono text-[10px]">↵</kbd>
                  </span>

                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isLoading || !message.trim()}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      isLoading || !message.trim()
                        ? 'bg-white/[0.06] text-slate-500 border border-white/[0.08] cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Running Threat Forensics...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-cyan-200" />
                        <span>Inspect for Threats</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Results Section */}
            {analysisResult && (
              <div id="analysis-results-section" className="space-y-6 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-cyan-300" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Forensic Security Audit
                    </h2>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/25">
                    ● Analysis Verified
                  </span>
                </div>

                {/* 1. Luminous Risk Gauge */}
                <RiskMeter
                  riskScore={analysisResult.risk_score}
                  riskLevel={analysisResult.risk_level}
                  scamType={analysisResult.scam_type}
                  engineUsed={analysisResult.engine_used}
                />

                {/* 2. Interactive Message Inspector with Glowing Red Flags */}
                <InteractiveViewer
                  message={message}
                  redFlags={analysisResult.red_flags}
                  explanation={analysisResult.explanation}
                />

                {/* 3. Action Protocol & Critical Warnings */}
                <ActionChecklist
                  safeNextSteps={analysisResult.safe_next_steps}
                  whatNotToDo={analysisResult.what_not_to_do}
                  message={message}
                  scamType={analysisResult.scam_type}
                  riskScore={analysisResult.risk_score}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Footer with Logo & Official Reporting Protocols */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#050818]/90 backdrop-blur-xl py-6 text-xs text-slate-400 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-400/30 bg-[#060919] p-0.5 shrink-0">
              <img src="/logo.jpg" alt="PromptShield AI" className="w-full h-full object-cover rounded" />
            </div>
            <div className="space-y-0.5">
              <div className="font-extrabold text-white text-xs sm:text-sm">
                PromptShield AI <span className="text-slate-500 text-[11px] font-normal">• Detect Scams | Understand Risks | Stay Safe</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Explainable digital safety intelligence. Verify unexpected requests through verified official channels.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300">
            <span>National Helpline: <strong className="text-rose-400 font-bold">1930</strong></span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition inline-flex items-center gap-1"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-600">•</span>
            <span>Zero Data Retention</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
