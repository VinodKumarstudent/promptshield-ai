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
      id: 'fake_job_offer',
      category: 'Fake Job Offer',
      title: 'Telegram / YouTube Work Scam',
      type: 'job_offer',
      text: 'Greetings from Amazon HR! We are offering a flexible Part-Time Work From Home job. Just like 3 YouTube videos and get paid Rs 5,00,000 per day directly to your UPI. Zero experience required. Contact our Telegram supervisor @AmazonTaskRecruiter to claim your Rs 500 joining bonus immediately!',
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error (${response.status})`);
      }

      const data = await response.json();
      setAnalysisResult(data);
      saveToHistory(data, textToAnalyze, typeToUse);

      setTimeout(() => {
        const resultElement = document.getElementById('analysis-results-section');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to connect to the analysis engine. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#f5f5f7] relative selection:bg-cyan-500/30 selection:text-white">
      {/* Apple Intelligence Ambient Aura Light (Subtle Background Glow) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-cyan-500/15 rounded-full blur-[140px] animate-apple-aura" />
        <div className="absolute top-[35%] -left-32 w-[500px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] -right-32 w-[500px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Floating Apple-Grade Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10 relative z-10">
        {activeTab === 'awareness' ? (
          <ScamAwareness />
        ) : (
          <div className="space-y-10">
            {/* Apple Keynote Style Hero Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold tracking-wide text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explainable AI Scam Guardian</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Security, explained.
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
                Inspect suspicious emails, messages, job offers, or payment links with explainable Generative AI forensics.
              </p>
            </div>

            {/* Apple-Style Minimalist Quick Preset Tokens (Replaces the old heavy 7-card box!) */}
            <AppleQuickPresets
              samples={samples}
              onSelectSample={handleSelectSample}
              activeSampleId={activeSampleId}
            />

            {/* Siri / Apple Intelligence Glass Prompt Capsule */}
            <div
              className={`rounded-3xl apple-glass-card p-5 sm:p-7 relative transition-all duration-300 ${
                isInputFocused
                  ? 'border-white/25 ring-2 ring-indigo-500/30 shadow-2xl shadow-indigo-500/10'
                  : 'border-white/[0.08]'
              }`}
            >
              {/* Private Compute Badge */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-slate-300">Private On-Device Protocol</span>
                  <span className="text-slate-600">•</span>
                  <span className="hidden sm:inline text-slate-400">Zero Server Data Retention</span>
                </div>
                {message && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition px-2 py-1 rounded-full hover:bg-white/[0.06]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Seamless Textarea */}
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
                  placeholder="Paste suspicious SMS, email, job offer, or delivery notification here..."
                  className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base sm:text-lg focus:outline-none resize-none font-normal leading-relaxed tracking-tight"
                />
              </div>

              {/* Apple-Style Bottom Floating Toolbar */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Segmented Message Type Picker */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative inline-flex items-center">
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="appearance-none bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 border border-white/[0.1] rounded-full pl-3 pr-7 py-1.5 focus:outline-none transition cursor-pointer"
                    >
                      <option value="general" className="bg-[#121216] text-white">General Message</option>
                      <option value="email" className="bg-[#121216] text-white">Email Phishing</option>
                      <option value="sms" className="bg-[#121216] text-white">SMS / Text</option>
                      <option value="job_offer" className="bg-[#121216] text-white">Job / Task Scam</option>
                      <option value="payment_upi" className="bg-[#121216] text-white">UPI / QR Fraud</option>
                      <option value="delivery" className="bg-[#121216] text-white">Courier Smishing</option>
                      <option value="lottery" className="bg-[#121216] text-white">Lottery Fraud</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                    {message.length} chars
                  </span>
                </div>

                {/* Right Action Trigger (Apple Intelligence Shimmer Button) */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1 font-medium">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300 font-mono text-[10px]">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300 font-mono text-[10px]">↵</kbd>
                  </span>

                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isLoading || !message.trim()}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                      isLoading || !message.trim()
                        ? 'bg-white/[0.06] text-slate-500 border border-white/[0.06] cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white hover:opacity-90 shadow-xl shadow-purple-500/20 active:scale-95'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Evaluating Forensics...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Inspect Threat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Analysis Results Display */}
            {analysisResult && (
              <div id="analysis-results-section" className="space-y-8 pt-4 scroll-mt-24">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Security Assessment Report
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Analysis Completed
                  </span>
                </div>

                {/* 1. Apple Activity Ring / Precision Risk Meter */}
                <RiskMeter
                  riskScore={analysisResult.risk_score}
                  riskLevel={analysisResult.risk_level}
                  scamType={analysisResult.scam_type}
                  engineUsed={analysisResult.engine_used}
                />

                {/* 2. Interactive Message Inspector with Red Flag Highlighter */}
                <InteractiveViewer
                  message={message}
                  redFlags={analysisResult.red_flags}
                  explanation={analysisResult.explanation}
                />

                {/* 3. Action Checklist: What to do next & What NOT to do */}
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

      {/* Apple-Style Minimalist Footer */}
      <footer className="mt-auto border-t border-white/[0.08] py-8 text-xs text-slate-500 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-semibold text-slate-300">PromptShield</span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">Apple Intelligence Edition</span>
            </div>
            <p className="text-[11px] text-slate-500">
              AI guidance, not a guarantee. When unsure, verify through official channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Helpline: <strong className="text-rose-400 font-semibold">1930</strong></span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              cybercrime.gov.in
            </a>
            <span className="text-slate-700">•</span>
            <span>Zero-Retention Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
