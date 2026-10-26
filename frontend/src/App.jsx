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
} from 'lucide-react';

import Navbar from './components/Navbar';
import SampleSelector from './components/SampleSelector';
import RiskMeter from './components/RiskMeter';
import InteractiveViewer from './components/InteractiveViewer';
import ActionChecklist from './components/ActionChecklist';
import ScamAwareness from './components/ScamAwareness';
import HistoryDrawer from './components/HistoryDrawer';

const BACKEND_URL = ''; // Proxied via Vite in dev, or relative in production

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'awareness'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);

  // Sample scenarios fallback (if backend /samples is still starting up)
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

  // Fetch backend samples if available
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
      .catch(() => {
        // Fallback already pre-loaded
      });
  }, []);

  // Save history to localStorage
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
    window.scrollTo({ top: 380, behavior: 'smooth' });
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
      setError('Please enter or paste a suspicious message to analyze.');
      return;
    }

    // Safety warning check for obvious raw passwords or card credentials
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

      // Smooth scroll to results
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
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'awareness' ? (
          <ScamAwareness />
        ) : (
          <div className="space-y-8">
            {/* Hero / Header Intro */}
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainable AI Scam Guardian</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Inspect Any Message Before You Click
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Paste suspicious emails, SMS alerts, job offers, or delivery notices. PromptShield pinpoints deception patterns, explains the red flags in simple terms, and shows you exactly what to do.
              </p>
            </div>

            {/* 1-Click Sample Scenarios Selector */}
            <SampleSelector
              samples={samples}
              onSelectSample={handleSelectSample}
              activeSampleId={activeSampleId}
            />

            {/* Input Form Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-sm relative">
              {/* Privacy Warning Header */}
              <div className="mb-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Zero-Storage Privacy Policy: </span>
                  Never paste your real banking passwords or active OTPs. Messages are analyzed in temporary memory and strictly never persisted to our servers.
                </div>
              </div>

              {/* Message Type Selector & Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="message-type" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Message Type:
                  </label>
                  <select
                    id="message-type"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="general">General Communication</option>
                    <option value="email">Phishing Email</option>
                    <option value="sms">SMS / Text Message</option>
                    <option value="job_offer">Job Offer / Part-time Task</option>
                    <option value="payment_upi">UPI / QR Code / Bank Refund</option>
                    <option value="delivery">Courier / Parcel Delivery</option>
                    <option value="lottery">Lottery / Cash Prize</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {message && (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                  rows={5}
                  placeholder="Paste the suspicious email text, SMS message, WhatsApp job offer, or delivery notification here..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-y font-sans leading-relaxed"
                />
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl + Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">⌘ + Enter</kbd> to analyze</span>
                </div>

                <button
                  onClick={() => handleAnalyze()}
                  disabled={isLoading || !message.trim()}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isLoading || !message.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white hover:opacity-95 shadow-blue-600/30 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Analyzing Security Patterns...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Analyze Message</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Analysis Results Display */}
            {analysisResult && (
              <div id="analysis-results-section" className="space-y-6 pt-2 scroll-mt-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Security Analysis Assessment
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    Generated in realtime
                  </span>
                </div>

                {/* 1. Risk Meter */}
                <RiskMeter
                  riskScore={analysisResult.risk_score}
                  riskLevel={analysisResult.risk_level}
                  scamType={analysisResult.scam_type}
                  engineUsed={analysisResult.engine_used}
                />

                {/* 2. Interactive Message Viewer with Red Flag Highlighting */}
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

      {/* Footer & Mandatory Disclaimer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">PromptShield</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Hackathon Edition</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Disclaimer: AI guidance, not a guarantee. When unsure, verify through official channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>National Cybercrime Helpline: <strong className="text-red-400">1930</strong></span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cybercrime.gov.in
            </a>
            <span className="text-slate-600">•</span>
            <span>Zero Server Message Retention</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
