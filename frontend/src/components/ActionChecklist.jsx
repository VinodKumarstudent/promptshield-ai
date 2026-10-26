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
      {/* What to do next (Apple Reminders Style) */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Safe Action Protocol
              </h3>
              <p className="text-xs text-slate-400">Recommended defensive actions</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {safeNextSteps.map((step, idx) => {
              const isDone = completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-200'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-emerald-400">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <span className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'line-through text-slate-500' : ''}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: 1930 & Portal Complaint */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={generateComplaintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] text-xs font-medium transition"
            title="Copy pre-formatted complaint text ready for police portal"
          >
            {complaintCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Report Copied</span>
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

      {/* What NOT to do (Critical Warnings) */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                Critical Hazards (What NOT To Do)
              </h3>
              <p className="text-xs text-slate-400">Avoid these irreversible actions</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {whatNotToDo.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl border bg-rose-950/20 border-rose-900/40 text-rose-200"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  {warning}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] text-[11px] text-slate-400 flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>If you entered payment PINs or shared OTPs, immediately contact your bank to freeze netbanking.</span>
        </div>
      </div>
    </div>
  );
}
