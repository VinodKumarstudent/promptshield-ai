import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Terminal, Flame, Zap } from 'lucide-react';

export default function AppleQuickPresets({ samples, onSelectSample, activeSampleId }) {
  const getPresetStyles = (id, type, isSafe, isSelected) => {
    if (isSelected) {
      return {
        bg: 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-white border-cyan-400 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400',
        badge: 'bg-cyan-400 text-black font-extrabold',
      };
    }

    if (isSafe) {
      return {
        bg: 'bg-emerald-950/30 text-emerald-200 border-emerald-500/30 hover:bg-emerald-900/40 hover:border-emerald-400/60 shadow-sm',
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold',
      };
    }

    if (id === 'digital_arrest' || id === 'electricity_bill_scam') {
      return {
        bg: 'bg-amber-950/30 text-amber-200 border-amber-500/30 hover:bg-amber-900/40 hover:border-amber-400/60 shadow-sm',
        badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold',
      };
    }

    if (id === 'ibomma_piracy_malware' || id === 'sextortion_blackmail') {
      return {
        bg: 'bg-rose-950/30 text-rose-200 border-rose-500/30 hover:bg-rose-900/40 hover:border-rose-400/60 shadow-sm',
        badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold',
      };
    }

    return {
      bg: 'bg-slate-900/60 text-slate-200 border-slate-700/60 hover:bg-slate-850 hover:border-cyan-500/40 shadow-sm',
      badge: 'bg-rose-500/15 text-rose-300 border border-rose-500/25 font-bold',
    };
  };

  const getPresetIcon = (id, type, isSafe) => {
    if (isSafe) return '✓';
    if (id === 'digital_arrest') return '⚖️';
    if (id === 'electricity_bill_scam') return '⚡️';
    if (id === 'ibomma_piracy_malware') return '🎬';
    if (id === 'sextortion_blackmail') return '🔞';
    if (type === 'payment_upi') return '💳';
    if (type === 'lottery') return '🎁';
    if (type === 'delivery') return '📦';
    if (type === 'job_offer') return '💼';
    return '⚠️';
  };

  const getShortTitle = (id) => {
    switch (id) {
      case 'phishing_email': return 'Bank KYC Phishing';
      case 'digital_arrest': return 'Digital Arrest Scam';
      case 'electricity_bill_scam': return 'Power Disconnect Scam';
      case 'fake_job_offer': return 'Telegram Task Job';
      case 'upi_otp_sms': return 'UPI Refund QR Trap';
      case 'lottery_scam': return 'KBC WhatsApp Lottery';
      case 'delivery_fee_scam': return 'India Post Redelivery';
      case 'ibomma_piracy_malware': return 'iBomma Piracy / APK';
      case 'sextortion_blackmail': return 'Adult Webcam Blackmail';
      case 'genuine_order_confirmation': return 'Amazon Order (Safe)';
      case 'genuine_bank_otp': return 'HDFC Official OTP (Safe)';
      case 'genuine_personal_chat': return 'Personal Chat (Safe)';
      default: return 'Sample Scenario';
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive Threat Test Bench
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            — One-tap scenario simulations
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          {samples.length} Scenarios Available
        </span>
      </div>

      {/* Horizontal Scroll Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {samples.map((sample) => {
          const isSafe = sample.expected_risk === 'safe';
          const isSelected = activeSampleId === sample.id;
          const styles = getPresetStyles(sample.id, sample.type, isSafe, isSelected);
          const icon = getPresetIcon(sample.id, sample.type, isSafe);
          const shortTitle = getShortTitle(sample.id);

          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border backdrop-blur-md cursor-pointer ${styles.bg}`}
            >
              <span className="text-xs shrink-0">{icon}</span>
              <span className="tracking-tight whitespace-nowrap font-medium text-slate-100">{shortTitle}</span>
              <span
                className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-md ${styles.badge}`}
              >
                {isSafe ? 'Safe' : 'Threat'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
