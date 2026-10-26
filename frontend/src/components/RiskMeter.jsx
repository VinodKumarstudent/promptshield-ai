import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function RiskMeter({ riskScore, riskLevel, scamType, engineUsed }) {
  const score = Math.max(0, Math.min(100, Number(riskScore) || 0));

  const getRiskDetails = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'safe':
        return {
          title: 'VERIFIED SAFE',
          subtitle: 'No malicious triggers or credential traps identified.',
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          barGradient: 'from-emerald-500 to-teal-400',
          ringColor: '#10b981',
          icon: ShieldCheck,
          haloGlow: 'rgba(16, 185, 129, 0.25)',
        };
      case 'suspicious':
        return {
          title: 'CAUTION ADVISED',
          subtitle: 'Ambiguous or unverified elements detected. Exercise vigilance.',
          color: 'text-amber-400',
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          barGradient: 'from-amber-500 to-yellow-400',
          ringColor: '#f59e0b',
          icon: AlertTriangle,
          haloGlow: 'rgba(245, 158, 11, 0.25)',
        };
      case 'likely_scam':
      default:
        return {
          title: 'LIKELY SCAM',
          subtitle: 'Critical deceptive patterns, spoofed links, or theft triggers detected.',
          color: 'text-rose-400',
          badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          barGradient: 'from-rose-500 via-pink-500 to-amber-500',
          ringColor: '#f43f5e',
          icon: ShieldAlert,
          haloGlow: 'rgba(244, 63, 94, 0.28)',
        };
    }
  };

  const details = getRiskDetails();
  const IconComponent = details.icon;

  // Arc calculation for Apple Watch Activity Ring style gauge
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative rounded-3xl apple-glass-card p-6 sm:p-8 overflow-hidden transition-all duration-500">
      {/* Radiant ambient glow in background */}
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: details.haloGlow }}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left: Apple Activity Ring / Precision Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Outer Track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-white/[0.08]"
                strokeWidth="11"
                fill="none"
              />
              {/* Glowing Dynamic Ring */}
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
                  filter: `drop-shadow(0 0 8px ${details.ringColor}66)`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-extrabold tracking-tighter ${details.color}`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
                Risk Index
              </span>
            </div>
          </div>

          <div className="space-y-1.5 max-w-md">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${details.badgeBg}`}>
                <IconComponent className="w-3.5 h-3.5" />
                {details.title}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {score >= 70 ? 'High Threat' : score >= 35 ? 'Moderate Risk' : 'Minimal Risk'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {scamType || 'Security Evaluation'}
            </h2>
            <p className="text-sm text-slate-300 font-normal leading-relaxed">
              {details.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Apple Spectrum Bar & Engine Status */}
        <div className="w-full lg:w-72 space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-white/[0.08] lg:pl-8">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
              <span>Threat Spectrum</span>
              <span className={`font-mono font-bold ${details.color}`}>{score}/100</span>
            </div>
            {/* Apple-style smooth pill progress track */}
            <div className="w-full h-2.5 bg-white/[0.08] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${details.barGradient} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max(score, 6)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium tracking-wide">
              <span className="text-emerald-400">0 Safe</span>
              <span className="text-amber-400">35 Caution</span>
              <span className="text-rose-400">70+ Scam</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium">Engine:</span>
            </div>
            <span className="font-mono text-[11px] text-slate-300 font-medium px-2 py-0.5 rounded-full bg-white/[0.06]">
              {engineUsed || 'Hybrid Neural Engine'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
