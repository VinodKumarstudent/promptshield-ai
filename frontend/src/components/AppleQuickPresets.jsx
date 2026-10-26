import React from 'react';
import { Sparkles, ShieldCheck, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function AppleQuickPresets({ samples, onSelectSample, activeSampleId }) {
  const getPresetStyles = (id, type, isSafe, isSelected) => {
    if (isSelected) {
      return {
        bg: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-white/50 shadow-lg shadow-purple-500/30 ring-2 ring-white/40 scale-[1.03]',
        badge: 'bg-white/20 text-white font-extrabold',
      };
    }

    if (isSafe) {
      if (id.includes('otp')) {
        return {
          bg: 'bg-teal-500/15 text-teal-200 border-teal-400/40 hover:bg-teal-500/25 hover:border-teal-300 shadow-sm shadow-teal-500/15',
          badge: 'bg-teal-400/25 text-teal-200 border border-teal-400/30',
        };
      }
      return {
        bg: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/25 hover:border-emerald-300 shadow-sm shadow-emerald-500/15',
        badge: 'bg-emerald-400/25 text-emerald-200 border border-emerald-400/30',
      };
    }

    switch (type) {
      case 'email':
        return {
          bg: 'bg-blue-500/15 text-blue-200 border-blue-400/40 hover:bg-blue-500/25 hover:border-blue-300 shadow-sm shadow-blue-500/15',
          badge: 'bg-blue-400/25 text-blue-200 border border-blue-400/30',
        };
      case 'job_offer':
        return {
          bg: 'bg-purple-500/15 text-purple-200 border-purple-400/40 hover:bg-purple-500/25 hover:border-purple-300 shadow-sm shadow-purple-500/15',
          badge: 'bg-purple-400/25 text-purple-200 border border-purple-400/30',
        };
      case 'payment_upi':
        return {
          bg: 'bg-amber-500/15 text-amber-200 border-amber-400/40 hover:bg-amber-500/25 hover:border-amber-300 shadow-sm shadow-amber-500/15',
          badge: 'bg-amber-400/25 text-amber-200 border border-amber-400/30',
        };
      case 'lottery':
        return {
          bg: 'bg-rose-500/15 text-rose-200 border-rose-400/40 hover:bg-rose-500/25 hover:border-rose-300 shadow-sm shadow-rose-500/15',
          badge: 'bg-rose-400/25 text-rose-200 border border-rose-400/30',
        };
      case 'delivery':
        return {
          bg: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40 hover:bg-cyan-500/25 hover:border-cyan-300 shadow-sm shadow-cyan-500/15',
          badge: 'bg-cyan-400/25 text-cyan-200 border border-cyan-400/30',
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-200 border-slate-400/40 hover:bg-slate-500/25',
          badge: 'bg-slate-400/20 text-slate-200',
        };
    }
  };

  const getPresetEmoji = (id, type, isSafe) => {
    if (isSafe) return id.includes('otp') ? '🔑' : '🛍️';
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
      case 'fake_job_offer': return 'Amazon Task Job';
      case 'upi_otp_sms': return 'UPI Refund QR Trap';
      case 'lottery_scam': return 'KBC WhatsApp Lottery';
      case 'delivery_fee_scam': return 'India Post Redelivery';
      case 'genuine_order_confirmation': return 'Amazon Order Verified';
      case 'genuine_bank_otp': return 'HDFC Official OTP';
      default: return 'Sample Scenario';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent">
            One-Tap Presets
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            — Select a live scenario to test
          </span>
        </div>
      </div>

      {/* Radiant colorful horizontal scrolling pill strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 pt-1 no-scrollbar scroll-smooth">
        {samples.map((sample) => {
          const isSafe = sample.expected_risk === 'safe';
          const isSelected = activeSampleId === sample.id;
          const styles = getPresetStyles(sample.id, sample.type, isSafe, isSelected);
          const emoji = getPresetEmoji(sample.id, sample.type, isSafe);
          const shortTitle = getShortTitle(sample.id);

          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border backdrop-blur-xl ${styles.bg}`}
            >
              <span className="text-sm shrink-0 drop-shadow">{emoji}</span>
              <span className="tracking-tight whitespace-nowrap">{shortTitle}</span>
              <span
                className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${styles.badge}`}
              >
                {isSafe ? 'Genuine' : 'Scam'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
