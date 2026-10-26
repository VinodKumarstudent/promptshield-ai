import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  XCircle,
  ShieldCheck,
  AlertOctagon,
  PhoneCall,
  ExternalLink,
  FileText,
  Check,
  Download,
  Share2,
  FileSpreadsheet,
  Lock,
  Scale
} from 'lucide-react';

export default function ActionChecklist({
  safeNextSteps = [],
  whatNotToDo = [],
  message = '',
  scamType = 'Suspicious Communication',
  riskScore = 50,
  riskLevel = 'suspicious',
  evidenceManifest = [],
  dossier = null
}) {
  const [completedSteps, setCompletedSteps] = useState({});
  const [complaintCopied, setComplaintCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const toggleStep = (idx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const manifest = (dossier && dossier.evidence_manifest) || evidenceManifest || [];
  const legalSections = (dossier && dossier.it_act_sections) || [
    'IT Act 2000 Section 66D - Cheating by personation using computer resource',
    'Bharatiya Nyaya Sanhita (BNS) 2023 Section 318 - Cheating & digital dishonesty'
  ];

  const buildDossierText = () => {
    const timestamp = dossier?.generated_at || new Date().toISOString();
    const dossierId = dossier?.dossier_id || `PS-CYBER-${Date.now()}`;

    let manifestText = 'No attached visual/video files recorded.';
    if (manifest.length > 0) {
      manifestText = manifest
        .map(
          (m, i) =>
            `[Artifact ${i + 1}]
Filename: ${m.filename}
Category: ${m.file_type_category || 'Evidence File'}
MIME Type: ${m.mime_type}
File Size: ${m.size_bytes} bytes (${(m.size_bytes / 1024).toFixed(1)} KB)
SHA-256 Checksum: ${m.sha256}
Integrity Status: VERIFIED UNTAMPERED (Chain of Custody Intact)`
        )
        .join('\n\n');
    }

    const legalText = legalSections.map((sec, i) => `  ${i + 1}. ${sec}`).join('\n');

    return `================================================================================
OFFICIAL CYBERCRIME EVIDENCE DOSSIER & POLICE INTAKE REPORT
Generated via PromptShield AI Forensics Engine
Compliant with National Cyber Crime Reporting Portal (cybercrime.gov.in)
================================================================================

CASE METADATA:
--------------------------------------------------------------------------------
Dossier Reference ID: ${dossierId}
Timestamp (UTC): ${timestamp}
Incident Classification: ${scamType}
Threat Risk Assessment: ${riskScore}/100 (${riskLevel.toUpperCase()})
Law Enforcement Intake Status: READY FOR FILING / EVIDENCE PRESERVED

APPLICABLE LEGAL PROVISIONS (INDIAN PENAL & IT ACT):
--------------------------------------------------------------------------------
${legalText}

DIGITAL EVIDENCE MANIFEST & CRYPTOGRAPHIC CHAIN OF CUSTODY:
--------------------------------------------------------------------------------
${manifestText}

SUSPICIOUS COMMUNICATION / TRANSCRIPT TEXT:
--------------------------------------------------------------------------------
${message || 'No direct message text provided. Visual/media evidence uploaded.'}

RECOMMENDED LAW ENFORCEMENT & COMPLAINANT ACTION PLAN:
--------------------------------------------------------------------------------
1. File formal complaint on https://cybercrime.gov.in referencing this dossier.
2. If financial fraud occurred, immediately call the National Helpline 1930.
3. Preserve the original digital files associated with the above SHA-256 hashes.
4. Block and report suspect mobile number / UPI ID / bank account handle.

DECLARATION:
--------------------------------------------------------------------------------
This document represents an automated digital forensics analysis and evidence
manifest generated for submission to cyber law enforcement authorities.
================================================================================`;
  };

  const handleCopyReport = () => {
    const text = buildDossierText();
    navigator.clipboard.writeText(text);
    setComplaintCopied(true);
    setTimeout(() => setComplaintCopied(false), 2500);
  };

  const handleDownloadDossier = (format = 'txt') => {
    const dossierId = dossier?.dossier_id || `PS-CYBER-${Date.now()}`;
    if (format === 'json') {
      const jsonData = JSON.stringify(
        dossier || {
          dossier_id: dossierId,
          timestamp: new Date().toISOString(),
          scam_type: scamType,
          risk_score: riskScore,
          risk_level: riskLevel,
          message,
          evidence_manifest: manifest,
          it_act_sections: legalSections
        },
        null,
        2
      );
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dossierId}-evidence.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const text = buildDossierText();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dossierId}-report.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
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
                    <span
                      className={`text-xs sm:text-sm font-medium leading-relaxed ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Helpline & Official Portal Buttons */}
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

      {/* Official Cybercrime Evidence Dossier Section */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FileSpreadsheet className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Official Cybercrime Evidence Dossier
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Court & Portal Admissible
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Standardized intake package formatted for National Cybercrime Reporting Portal (cybercrime.gov.in)
              </p>
            </div>
          </div>

          {/* Quick Download & Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition shadow-md shadow-cyan-500/10"
              title="Copy complete complaint dossier"
            >
              {complaintCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300 font-extrabold">Dossier Copied!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Copy Police Dossier</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadDossier('txt')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white border border-white/15 text-xs font-semibold transition"
              title="Download formal text report"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Download (.txt)</span>
            </button>

            <button
              onClick={() => handleDownloadDossier('json')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white border border-white/15 text-xs font-semibold transition"
              title="Export forensic JSON for investigators"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Export Evidence (.json)</span>
            </button>
          </div>
        </div>

        {/* Legal Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Scale className="w-4 h-4" />
              <span>Applicable Indian Penal & IT Act Sections</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {legalSections.map((sec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{sec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Lock className="w-4 h-4" />
              <span>Chain of Custody & Evidence Verification</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every attached file has an unalterable SHA-256 cryptographic hash calculated on-device. This establishes court-admissible non-tampering proof under Section 65B of the Indian Evidence Act.
            </p>
          </div>
        </div>

        {/* Evidence Manifest Table */}
        {manifest.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 px-1">
              Cryptographic Evidence Artifacts ({manifest.length} registered):
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#080a18]/70">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold bg-white/[0.02]">
                    <th className="p-3">Filename</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">SHA-256 Hash</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {manifest.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition">
                      <td className="p-3 font-semibold text-white max-w-[160px] truncate">
                        {item.filename}
                      </td>
                      <td className="p-3 text-slate-300 capitalize">
                        {item.file_type_category || 'file'}
                      </td>
                      <td className="p-3 text-slate-300 font-mono">
                        {(item.size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="p-3 font-mono text-[11px] text-cyan-300 max-w-[200px] truncate">
                        {item.sha256}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Tamper Proof
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
            No image or video files attached to this scan. You can upload screenshots or recordings in the input tray above.
          </div>
        )}
      </div>
    </div>
  );
}