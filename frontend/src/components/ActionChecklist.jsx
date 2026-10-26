import React, { useState } from 'react';
import { CheckSquare, Square, XCircle, ShieldCheck, AlertOctagon, PhoneCall, ExternalLink, FileText, Check } from 'lucide-react';

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
Date & Time: ${new Date().toLocaleString()}
Threat Classification: ${scamType || 'Suspicious Communication'}
Assessed Risk Score: ${riskScore}/100

EVIDENCE / SUSPICIOUS MESSAGE:
-------------------------------------------------------------
${message}

RECOMMENDED ACTION LOG:
- Immediate reporting to National Cybercrime Helpline 1930
- Official portal submission at: https://cybercrime.gov.in
- Suspicious sender number/handle blocked on recipient device
- Financial institutions alerted if credentials or OTP were entered

ADVISORY:
AI guidance based on linguistic heuristics and pattern matching.
Preserve screenshot evidence and SMS headers for law enforcement.`;

    navigator.clipboard.writeText(text);
    setComplaintCopied(true);
    setTimeout(() => setComplaintCopied(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* What to do next */}
      <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                What To Do Next (Safe Action Checklist)
              </h3>
              <p className="text-xs text-slate-400">Click steps to mark as completed</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {safeNextSteps.map((step, idx) => {
              const isDone = completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <button className="mt-0.5 text-emerald-400 shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <span className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Reporting Quick Links */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/30 transition"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={generateComplaintReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium hover:bg-slate-750 hover:text-white transition"
            title="Copies formatted incident report to paste into the police or cybercrime portal"
          >
            {complaintCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Report Copied!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Portal Complaint Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* What NOT to do */}
      <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                What NOT To Do (Critical Warning Checklist)
              </h3>
              <p className="text-xs text-slate-400">Avoid these actions to prevent financial loss</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {whatNotToDo.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl border bg-rose-950/20 border-rose-900/40 text-rose-200"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  {warning}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>If you entered banking details or UPI PINs, contact your bank immediately to block internet banking and freeze cards.</span>
        </div>
      </div>
    </div>
  );
}
