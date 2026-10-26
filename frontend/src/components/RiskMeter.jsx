import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function RiskMeter({ riskScore, riskLevel, scamType, engineUsed }) {
  const score = Math.max(0, Math.min(100, Number(riskScore) || 0));

  const getRiskDetails = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'safe':
        return {
          title: 'VERIFIED SAFE',
          subtitle: 'Zero malicious triggers or credential traps identified.',
          color: 'text-emerald-300',
          badgeBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-sm shadow-emerald-500/20',
          barGradient: 'from-emerald-400 via-teal-400 to-cyan-400',
          ringColor: '#10b981',
          ringGlow: '#059669',
          icon: ShieldCheck,
          haloGlow: 'rgba(16, 185, 129, 0.35)',
        };
      case 'suspicious':
        return {
          title: 'CAUTION ADVISED',
          subtitle: 'Ambiguous or unverified elements detected. Exercise vigilance.',
          color: 'text-amber-300',
          badgeBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-sm shadow-amber-500/20',
          barGradient: 'from-amber-400 via-orange-400 to-yellow-300',
          ringColor: '#f59e0b',
          ringGlow: '#d97706',
          icon: AlertTriangle,
          haloGlow: 'rgba(245, 158, 11, 0.35)',
        };
      case 'likely_scam':
      default:
        return {
          title: 'CRITICAL SCAM THREAT',
          subtitle: 'Severe deceptive patterns, spoofed links, or credential theft triggers.',
          color: 'text-rose-300',
          badgeBg: 'bg-gradient-to-r from-rose-500/25 to-pink-500/25 border-rose-400/40 text-rose-200 shadow-md shadow-rose-500/20',
          barGradient: 'from-rose-500 via-pink-500 to-amber-400',
          ringColor: '#f43f5e',
          ringGlow: '#be123c',
          icon: ShieldAlert,
          haloGlow: 'rgba(244, 63, 94, 0.4)',
        };
    }
  };

  const details = getRiskDetails();
  const IconComponent = details.icon;

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative rounded-3xl apple-glass-card p-6 sm:p-8 overflow-hidden transition-all duration-500 border border-white/15">
      {/* Radiant ambient glow in background */}
      <div
        className="absolute -right-12 -top-12 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-60"
        style={{ backgroundColor: details.haloGlow }}
      />
      <div
        className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: details.ringColor }}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left: Luminous Ring Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-white/10"
                strokeWidth="11"
                fill="none"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={details.ringColor}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 10px ${details.ringColor}) drop-shadow(0 0 4px ${details.ringGlow})`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-black tracking-tight ${details.color} drop-shadow`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 mt-0.5">
                Risk Index
              </span>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${details.badgeBg}`}>
                <IconComponent className="w-3.5 h-3.5" />
                {details.title}
              </span>
              <span className="text-xs text-cyan-300 font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/25">
                {score >= 70 ? 'Extreme Hazard' : score >= 35 ? 'Moderate Caution' : 'Secure Message'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {scamType || 'Security Evaluation'}
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {details.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Threat Spectrum & Engine Status */}
        <div className="w-full lg:w-72 space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-8">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
              <span>Threat Spectrum</span>
              <span className={`font-mono font-extrabold text-sm ${details.color}`}>{score}/100</span>
            </div>
            {/* Luminous Track */}
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/15 shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${details.barGradient} transition-all duration-1000 ease-out shadow-lg`}
                style={{ width: `${Math.max(score, 6)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold tracking-wide">
              <span className="text-emerald-400">0 Safe</span>
              <span className="text-amber-400">35 Caution</span>
              <span className="text-rose-400">70+ Scam</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-xs shadow-inner">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold">Neural Engine:</span>
            </div>
            <span className="font-mono text-[11px] text-cyan-200 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
              {engineUsed || 'Hybrid AI Forensics'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
