import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
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

  const handleAnalyze = async (customMessage = null, customType = null) => {
    const textToAnalyze = (customMessage !== null ? customMessage : message).trim();
    const typeToUse = customType !== null ? customType : messageType;

    if (!textToAnalyze) {
      setError('Please paste or type a suspicious message to inspect.');
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
    <div className="min-h-screen flex flex-col bg-[#070913] text-[#f8fafc] relative selection:bg-pink-500/30 selection:text-white">
      {/* Dynamic Luminous Multi-Color Atmospheric Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/25 to-pink-600/25 rounded-full blur-[140px] animate-ambient-1" />
        <div className="absolute top-[28%] -left-48 w-[600px] h-[500px] bg-gradient-to-br from-cyan-500/25 to-blue-600/20 rounded-full blur-[130px] animate-ambient-2" />
        <div className="absolute top-[48%] -right-48 w-[650px] h-[550px] bg-gradient-to-bl from-pink-600/25 via-purple-600/20 to-indigo-600/25 rounded-full blur-[140px] animate-ambient-3" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] bg-teal-500/15 rounded-full blur-[150px]" />
      </div>

      {/* Floating Translucent Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10 relative z-10">
        {activeTab === 'awareness' ? (
          <ScamAwareness />
        ) : (
          <div className="space-y-10">
            {/* Hero Header with Shimmering Jewel Gradient */}
            <div className="text-center max-w-2xl mx-auto space-y-3.5 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 border border-white/20 text-xs font-bold tracking-wide text-cyan-200 shadow-lg shadow-purple-500/10 backdrop-blur-xl">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Next-Gen Scam Intelligence</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-b from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
                Scams Exposed. <br />
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                  Instantly Explained.
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
                Paste suspicious emails, SMS alerts, job offers, or delivery notices. PromptShield pinpoints deception traps with explainable AI forensics.
              </p>
            </div>

            {/* Radiant One-Tap Preset Tokens */}
            <AppleQuickPresets
              samples={samples}
              onSelectSample={handleSelectSample}
              activeSampleId={activeSampleId}
            />

            {/* Glowing Chromatic Input Capsule */}
            <div className="gradient-border-capsule shadow-2xl shadow-indigo-500/15">
              <div
                className={`rounded-[26px] bg-[#0c0e20]/90 backdrop-blur-3xl p-5 sm:p-7 transition-all duration-300 ${
                  isInputFocused ? 'bg-[#0f1228]/95' : ''
                }`}
              >
                {/* Privacy Badge */}
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-emerald-300" />
                    </div>
                    <span className="font-semibold text-emerald-300">Encrypted In-Memory Processing</span>
                    <span className="text-slate-600">•</span>
                    <span className="hidden sm:inline text-slate-400">Zero Server Logging</span>
                  </div>
                  {message && (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Seamless High-Contrast Textarea */}
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
                    placeholder="Paste the suspicious text, email, job offer, or delivery link here..."
                    className="w-full bg-transparent text-white placeholder-slate-400 text-base sm:text-lg focus:outline-none resize-none font-medium leading-relaxed tracking-tight"
                  />
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Message Type Selector */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <div className="relative inline-flex items-center">
                      <select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value)}
                        className="appearance-none bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-cyan-200 border border-cyan-400/30 rounded-full pl-3.5 pr-8 py-2 focus:outline-none transition cursor-pointer shadow-sm shadow-cyan-500/10"
                      >
                        <option value="general" className="bg-[#121633] text-white">General Message</option>
                        <option value="email" className="bg-[#121633] text-white">Email Phishing</option>
                        <option value="sms" className="bg-[#121633] text-white">SMS / Text</option>
                        <option value="job_offer" className="bg-[#121633] text-white">Job / Task Scam</option>
                        <option value="payment_upi" className="bg-[#121633] text-white">UPI / QR Fraud</option>
                        <option value="delivery" className="bg-[#121633] text-white">Courier Smishing</option>
                        <option value="lottery" className="bg-[#121633] text-white">Lottery Fraud</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-300 absolute right-3 pointer-events-none" />
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                      {message.length} chars
                    </span>
                  </div>

                  {/* Luminous Inspect Button */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1 font-semibold">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] text-slate-200 font-mono text-[10px]">⌘</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] text-slate-200 font-mono text-[10px]">↵</kbd>
                    </span>

                    <button
                      onClick={() => handleAnalyze()}
                      disabled={isLoading || !message.trim()}
                      className={`w-full sm:w-auto px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                        isLoading || !message.trim()
                          ? 'bg-white/[0.08] text-slate-500 border border-white/10 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 hover:from-cyan-300 hover:via-indigo-400 hover:to-pink-400 text-white shadow-xl shadow-indigo-500/35 active:scale-95'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Running Forensics...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-cyan-200" />
                          <span>Inspect Threat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {analysisResult && (
              <div id="analysis-results-section" className="space-y-8 pt-4 scroll-mt-24">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      Forensic Security Report
                    </h2>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-400/25">
                    ● Analysis Completed
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

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#060814]/80 backdrop-blur-xl py-8 text-xs text-slate-400 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-white">PromptShield</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-medium">Luminous Edition</span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI guidance, not a guarantee. When unsure, verify through official channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300">
            <span>National Helpline: <strong className="text-rose-400 font-bold">1930</strong></span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              cybercrime.gov.in
            </a>
            <span className="text-slate-600">•</span>
            <span>Zero Data Retention</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
