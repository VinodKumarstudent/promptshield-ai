import React, { useState } from 'react';
import { CheckCircle2, Circle, XCircle, ShieldCheck, AlertOctagon, PhoneCall, ExternalLink, FileText, Check } from 'lucide-react';

export default function ActionChecklist({ safeNextSteps = [], whatNotToDo = [], message, scamType, riskScore }) {
  const [completedSteps, setCompletedSteps] = useState({});
  const [complaintCopied, setComplaintCopied] = useState(false);

  const toggleStep = (idx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const generateComplaintReport = () => {
    const text = `CYBER FRAUD INCIDENT REPORT (Generated via PromptShield AI)
=============================================================
Timestamp: ${new Date().toLocaleString()}
Classification: ${scamType || 'Suspicious Communication'}
Risk Index: ${riskScore}/100

EVIDENCE / SUSPICIOUS MESSAGE:
-------------------------------------------------------------
${message}

ACTIONS LOG:
- Immediate reporting to National Cybercrime Helpline 1930
- Formal complaint portal: https://cybercrime.gov.in
- Suspicious handle/sender blocked on device

ADVISORY:
AI security assessment for law enforcement intake.`;

    navigator.clipboard.writeText(text);
    setComplaintCopied(true);
    setTimeout(() => setComplaintCopied(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Safe Action Protocol */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-500" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400">
                Recommended Defensive Steps
              </h3>
              <p className="text-xs text-slate-400">Containment & verification procedure</p>
            </div>
          </div>

          <div className="space-y-2">
            {safeNextSteps.map((step, idx) => {
              const isDone = completedSteps[idx];
              return (
                <div
                  key={`step-${idx}-${step.slice(0, 15)}`}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer border ${
                    isDone
                      ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-200'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-emerald-400">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <span className={`text-xs sm:text-sm font-normal leading-relaxed ${isDone ? 'line-through text-slate-500' : ''}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: 1930 & Portal Complaint */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-600/50 text-xs font-mono font-semibold transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-medium transition"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <button
            onClick={generateComplaintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 text-xs font-mono font-semibold transition"
            title="Copy pre-formatted complaint text ready for police portal"
          >
            {complaintCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Report Copied!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Incident Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Critical Hazards (What NOT To Do) */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 border border-rose-500/30 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 to-red-600" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-rose-400">
                Critical Hazards (What NOT To Do)
              </h3>
              <p className="text-xs text-slate-400">Actions that lead to irreversible compromise</p>
            </div>
          </div>

          <div className="space-y-2">
            {whatNotToDo.map((warning, idx) => (
              <div
                key={`warning-${idx}-${warning.slice(0, 15)}`}
                className="flex items-start gap-3 p-3 rounded-xl border bg-rose-950/20 border-rose-900/40 text-rose-200"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-normal leading-relaxed">
                  {warning}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-amber-300 flex items-center gap-2 font-mono">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>If credentials or OTP were entered, immediately freeze cards/UPI via your official banking app.</span>
        </div>
      </div>
    </div>
  );
}
