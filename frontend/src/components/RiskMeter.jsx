import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Activity, Zap } from 'lucide-react';

export default function RiskMeter({ riskScore, riskLevel, scamType, engineUsed }) {
  const score = Math.max(0, Math.min(100, Number(riskScore) || 0));

  const getRiskDetails = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'safe':
        return {
          title: 'VERIFIED SAFE',
          subtitle: 'Zero malicious indicators, credential harvesters, or deceptive patterns identified.',
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          barGradient: 'from-emerald-500 via-teal-400 to-cyan-400',
          ringColor: '#10b981',
          ringGlow: 'rgba(16, 185, 129, 0.4)',
          icon: ShieldCheck,
          accentBorder: 'border-emerald-500/30',
        };
      case 'suspicious':
        return {
          title: 'CAUTION ADVISED',
          subtitle: 'Ambiguous or unverified links/demands detected. Exercise defensive skepticism.',
          color: 'text-amber-400',
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          barGradient: 'from-amber-500 via-orange-400 to-yellow-300',
          ringColor: '#f59e0b',
          ringGlow: 'rgba(245, 158, 11, 0.4)',
          icon: AlertTriangle,
          accentBorder: 'border-amber-500/30',
        };
      case 'likely_scam':
      default:
        return {
          title: 'HIGH CRITICAL THREAT',
          subtitle: 'Severe deceptive triggers, spoofed redirect domains, or credential harvesting traps.',
          color: 'text-rose-400',
          badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          barGradient: 'from-rose-500 via-red-500 to-amber-500',
          ringColor: '#f43f5e',
          ringGlow: 'rgba(244, 63, 94, 0.4)',
          icon: ShieldAlert,
          accentBorder: 'border-rose-500/30',
        };
    }
  };

  const details = getRiskDetails();
  const IconComponent = details.icon;

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`cyber-panel p-6 sm:p-8 rounded-2xl border ${details.accentBorder} relative overflow-hidden transition-all duration-300`}>
      {/* Subtle top indicator bar */}
      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${details.barGradient}`} />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left: Gauge & Threat Diagnosis */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Dial Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={details.ringColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${details.ringGlow})`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-mono font-black tracking-tight ${details.color}`}>
                {score}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                Risk Index
              </span>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${details.badgeBg}`}>
                <IconComponent className="w-3.5 h-3.5" />
                {details.title}
              </span>
              <span className="text-xs text-cyan-300 font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-800/40">
                {score >= 70 ? 'Hazard Level 3 (Critical)' : score >= 35 ? 'Hazard Level 2 (Elevated)' : 'Hazard Level 0 (Safe)'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {scamType || 'Security Evaluation'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {details.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Threat Bar & Engine Status */}
        <div className="w-full lg:w-72 space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-slate-800 lg:pl-8">
          <div>
            <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Threat Severity
              </span>
              <span className={`font-mono font-extrabold ${details.color}`}>{score}/100</span>
            </div>
            {/* Meter Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700 shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${details.barGradient} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max(score, 6)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 font-semibold">
              <span className="text-emerald-400">0 Safe</span>
              <span className="text-amber-400">35 Caution</span>
              <span className="text-rose-400">70+ Scam</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-mono text-slate-400">Engine:</span>
            </div>
            <span className="font-mono text-[11px] text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              {engineUsed || 'Hybrid Rule-LLM'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
