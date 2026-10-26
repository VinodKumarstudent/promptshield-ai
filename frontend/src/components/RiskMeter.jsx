import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Award } from 'lucide-react';

export default function RiskMeter({ riskScore, riskLevel, scamType, engineUsed }) {
  // Normalize score between 0 and 100
  const score = Math.max(0, Math.min(100, Number(riskScore) || 0));

  const getRiskDetails = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'safe':
        return {
          title: 'SAFE',
          subtitle: 'No malicious triggers or credential traps identified',
          color: 'text-emerald-400',
          bgBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          barColor: 'from-emerald-500 to-teal-400',
          ringColor: '#10b981',
          icon: ShieldCheck,
          gradientCard: 'from-emerald-950/20 via-slate-900 to-slate-950',
          borderCard: 'border-emerald-500/30',
        };
      case 'suspicious':
        return {
          title: 'SUSPICIOUS',
          subtitle: 'Dubious elements detected - exercise caution before engaging',
          color: 'text-amber-400',
          bgBadge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          barColor: 'from-amber-500 to-yellow-400',
          ringColor: '#f59e0b',
          icon: AlertTriangle,
          gradientCard: 'from-amber-950/20 via-slate-900 to-slate-950',
          borderCard: 'border-amber-500/30',
        };
      case 'likely_scam':
      default:
        return {
          title: 'LIKELY SCAM',
          subtitle: 'Severe deceptive patterns, spoofed links, or theft triggers found',
          color: 'text-rose-400',
          bgBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          barColor: 'from-rose-500 via-red-500 to-amber-500',
          ringColor: '#f43f5e',
          icon: ShieldAlert,
          gradientCard: 'from-rose-950/30 via-slate-900 to-slate-950',
          borderCard: 'border-rose-500/40',
        };
    }
  };

  const details = getRiskDetails();
  const IconComponent = details.icon;

  // Arc calculation for SVG gauge
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // Use semi-circle or 75% gauge
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75);

  return (
    <div className={`p-6 rounded-2xl border ${details.borderCard} bg-gradient-to-br ${details.gradientCard} backdrop-blur-md relative overflow-hidden transition-all duration-300`}>
      {/* Background glow spot */}
      <div
        className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: details.ringColor }}
      />

      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Left: Score Gauge */}
        <div className="flex items-center gap-5">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={details.ringColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold tracking-tight ${details.color}`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                / 100 Risk
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${details.bgBadge}`}>
                <IconComponent className="w-3.5 h-3.5" />
                {details.title}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {scamType || 'Communication Threat Assessment'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md leading-relaxed">
              {details.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Engine & Visual Gauge Bar */}
        <div className="w-full md:w-64 flex flex-col gap-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>Risk Severity Spectrum</span>
              <span className={details.color}>{score}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${details.barColor} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max(score, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span className="text-emerald-400">Safe (0-30)</span>
              <span className="text-amber-400">Suspicious (31-69)</span>
              <span className="text-rose-400">Scam (70-100)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1 text-[11px]">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Model Engine:</span>
            </span>
            <span className="font-mono text-[11px] text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700/50">
              {engineUsed || 'Hybrid AI Model'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
