import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AppleQuickPresets({ samples, onSelectSample, activeSampleId }) {
  const getPresetEmoji = (id, type, isSafe) => {
    if (isSafe) return id.includes('otp') ? '🔑' : '📦';
    switch (type) {
      case 'email': return '⚡️';
      case 'job_offer': return '💼';
      case 'payment_upi': return '💳';
      case 'lottery': return '🎁';
      case 'delivery': return '📬';
      default: return '⚠️';
    }
  };

  const getShortTitle = (id) => {
    switch (id) {
      case 'phishing_email': return 'Bank KYC Phishing';
      case 'fake_job_offer': return 'Amazon Task Job Scam';
      case 'upi_otp_sms': return 'UPI Refund QR Trap';
      case 'lottery_scam': return 'KBC WhatsApp Lottery';
      case 'delivery_fee_scam': return 'India Post Redelivery Fee';
      case 'genuine_order_confirmation': return 'Genuine Order Notice';
      case 'genuine_bank_otp': return 'Official Bank OTP Alert';
      default: return 'Sample Scenario';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Quick Presets
        </span>
        <span className="text-[11px] text-slate-500 font-normal">
          — Click to test common scenarios
        </span>
      </div>

      {/* Sleek horizontal scrolling frosted pill strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {samples.map((sample) => {
          const isSafe = sample.expected_risk === 'safe';
          const isSelected = activeSampleId === sample.id;
          const emoji = getPresetEmoji(sample.id, sample.type, isSafe);
          const shortTitle = getShortTitle(sample.id);

          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-white/15 text-white border-white/40 shadow-lg shadow-blue-500/10 ring-1 ring-white/30 scale-[1.02]'
                  : isSafe
                  ? 'bg-white/[0.03] text-emerald-300 border-white/[0.08] hover:bg-emerald-500/10 hover:border-emerald-500/30'
                  : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="text-sm shrink-0">{emoji}</span>
              <span className="tracking-tight">{shortTitle}</span>
              <span
                className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full ${
                  isSafe
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isSafe ? 'Safe' : 'Scam'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
