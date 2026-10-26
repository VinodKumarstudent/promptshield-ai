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
      {/* Safe Action Protocol (Luminous Emerald) */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7 flex flex-col justify-between space-y-6 border border-emerald-500/30 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                Defensive Action Protocol
              </h3>
              <p className="text-xs text-slate-300">Step-by-step containment checklist</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {safeNextSteps.map((step, idx) => {
              const isDone = completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
                    isDone
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-100'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-emerald-400">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/30" />
                    ) : (
                      <Circle className="w-4 h-4 text-emerald-400/60" />
                    )}
                  </button>
                  <span className={`text-xs sm:text-sm font-medium leading-relaxed ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: 1930 & Portal Complaint */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-200 border border-emerald-400/50 text-xs font-bold hover:from-emerald-500/40 hover:to-teal-500/40 transition shadow-md shadow-emerald-500/20"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white border border-white/15 text-xs font-semibold transition"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={generateComplaintReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition shadow-md shadow-cyan-500/10"
            title="Copy pre-formatted complaint text ready for police portal"
          >
            {complaintCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-300 font-extrabold">Report Copied!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-cyan-300" />
                <span>Copy Incident Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Critical Hazards (Luminous Rose / Crimson) */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7 flex flex-col justify-between space-y-6 border border-rose-500/30 shadow-xl shadow-rose-500/10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/25 border border-rose-400/50 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertOctagon className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-rose-300">
                Critical Hazards (What NOT To Do)
              </h3>
              <p className="text-xs text-slate-300">Irreversible compromise risks to avoid</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {whatNotToDo.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl border bg-rose-950/30 border-rose-800/60 text-rose-100 shadow-sm"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 drop-shadow" />
                <span className="text-xs sm:text-sm font-medium leading-relaxed">
                  {warning}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-xs text-amber-200/90 flex items-center gap-2 font-medium">
          <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>If you submitted bank credentials or PINs, freeze your account immediately with your branch.</span>
        </div>
      </div>
    </div>
  );
}
