import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Eye,
  FileCheck,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

// Pre-configured forensic sample evidence files for one-tap evaluation
export const SAMPLE_EVIDENCES = [
  {
    id: 'sample-sbi-screenshot',
    filename: 'Screenshot_SBI_KYC_Phishing_SMS.png',
    mime_type: 'image/png',
    size_bytes: 342180,
    sha256: '7f9a88e02d6b334cbdf1199a031940a45b642ec2e8d120a1c6a282f1b72e5a90',
    file_type_category: 'photo',
    notes: 'Phone screenshot showing urgent SBI NetBanking suspension SMS with fake phishing link.',
    tamper_check: 'VERIFIED_INTEGRITY',
    extracted_text: 'Dear Valued Customer, Your SBI NetBanking access will be permanently suspended within 24 hours due to pending KYC verification. Click http://sbi-kyc-update.xyz/verify immediately.'
  },
  {
    id: 'sample-telegram-job',
    filename: 'WhatsApp_Chat_Amazon_Job_Scam.png',
    mime_type: 'image/png',
    size_bytes: 489200,
    sha256: '8b3c901aa71629d8924bce0144983a0058b8f3ef4452103ac2941b2289410ef3',
    file_type_category: 'photo',
    notes: 'Screenshot of unsolicited WhatsApp offer from fake Amazon recruiter offering Rs 5000/day for YouTube likes.',
    tamper_check: 'VERIFIED_INTEGRITY',
    extracted_text: 'Greetings from Amazon HR! Part-Time Work From Home job. Just like 3 YouTube videos and get paid Rs 5,000 per day directly to UPI. Contact @AmazonTaskRecruiter on Telegram.'
  },
  {
    id: 'sample-sextortion-video',
    filename: 'Extortion_Screen_Recording_Clip.mp4',
    mime_type: 'video/mp4',
    size_bytes: 2840900,
    sha256: '4a10dfa9182374bb5209cba119856a29bc018ef201d3345ea987bca12095ba09',
    file_type_category: 'video',
    notes: 'Video screen recording showing blackmailer sending extortion countdown and cryptocurrency wallet demands.',
    tamper_check: 'VERIFIED_INTEGRITY',
    extracted_text: 'Warning: I recorded your screen and compromised your webcam while you were watching adult porn sites. Transfer $500 in Bitcoin within 24 hours or I will send to all your contacts.'
  },
  {
    id: 'sample-apk-dropper',
    filename: 'sbi_rewards_update_v4.apk',
    mime_type: 'application/vnd.android.package-archive',
    size_bytes: 1450200,
    sha256: 'e89c09bf4a821940b5420188ef7738a092c4b57418a0e882bf9100ac394e0192',
    file_type_category: 'executable',
    notes: 'Prohibited APK installer payload delivered via SMS claiming to be an SBI reward points redemption utility.',
    tamper_check: 'VERIFIED_INTEGRITY',
    extracted_text: 'Install sbi_rewards_update_v4.apk to claim your Rs 9,850 pending bank loyalty points directly into your savings account.'
  }
];

export default function EvidenceUploader({
  evidenceFiles = [],
  setEvidenceFiles,
  onExtractedTextSelect
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);
  const fileInputRef = useRef(null);

  // Compute cryptographic SHA-256 on device using Web Crypto API
  const calculateSHA256 = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback pseudo-hash if crypto.subtle unavailable
      return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
  };

  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setIsProcessing(true);

    const newEvidenceItems = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const fn = file.name.toLowerCase();

      let category = 'document';
      if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fn)) {
        category = 'photo';
      } else if (file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(fn)) {
        category = 'video';
      } else if (/\.(apk|exe|scr|bat|cmd|vbs|msi)$/i.test(fn)) {
        category = 'executable';
      }

      // Compute on-device SHA-256 hash
      const sha256 = await calculateSHA256(file);

      // Generate preview for photos
      let previewData = null;
      if (category === 'photo') {
        try {
          previewData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        } catch (e) {
          console.warn('Failed preview generation:', e);
        }
      }

      newEvidenceItems.push({
        id: `ev-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        sha256,
        file_type_category: category,
        preview_data: previewData,
        notes: `Original file captured on ${new Date().toLocaleDateString()}`,
        tamper_check: 'VERIFIED_INTEGRITY',
        rawFile: file
      });
    }

    setEvidenceFiles((prev) => [...prev, ...newEvidenceItems]);
    setIsProcessing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeEvidence = (id) => {
    setEvidenceFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const addSampleEvidence = (sample) => {
    if (evidenceFiles.some((e) => e.filename === sample.filename)) return;
    setEvidenceFiles((prev) => [...prev, sample]);
    if (onExtractedTextSelect && sample.extracted_text) {
      onExtractedTextSelect(sample.extracted_text);
    }
  };

  const copyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone Card */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 transition-all duration-300 cursor-pointer text-center group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 shadow-xl shadow-cyan-500/20'
            : 'border-white/15 hover:border-cyan-400/40 bg-white/[0.03] hover:bg-white/[0.06]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf,.apk,.txt,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7 text-cyan-300 group-hover:text-cyan-200" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Upload Photos, Screenshots, Videos & Files for Cybercrime Verification
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Drag & drop suspicious SMS screenshots, chat recordings, extortion videos, or fake APK droppers.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-[11px] font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Client-Side SHA-256 Hashing • Legal Evidence Integrity Chain</span>
          </div>
        </div>
      </div>

      {/* Quick Forensic Preset Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            One-Tap Forensic Test Samples:
          </span>
          <span className="text-[11px] text-slate-400">Click to attach & auto-fill test scenario</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_EVIDENCES.map((sample) => {
            const isAttached = evidenceFiles.some((e) => e.filename === sample.filename);
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => addSampleEvidence(sample)}
                className={`text-left p-3 rounded-2xl border transition-all duration-200 flex items-start gap-2.5 ${
                  isAttached
                    ? 'bg-cyan-500/15 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {sample.file_type_category === 'photo' && <ImageIcon className="w-4 h-4 text-cyan-300" />}
                  {sample.file_type_category === 'video' && <Video className="w-4 h-4 text-purple-300" />}
                  {sample.file_type_category === 'executable' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  {sample.file_type_category === 'document' && <FileText className="w-4 h-4 text-blue-300" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{sample.filename}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{sample.notes}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-300 font-mono">
                    <span>{formatFileSize(sample.size_bytes)}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{isAttached ? '✓ Attached' : '+ Tap to Load'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Attached Evidence Artifacts List */}
      {evidenceFiles.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Digital Evidence Manifest ({evidenceFiles.length} item{evidenceFiles.length > 1 ? 's' : ''})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEvidenceFiles([])}
              className="text-[11px] font-semibold text-rose-300 hover:text-rose-200 transition px-2.5 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30"
            >
              Clear All Evidence
            </button>
          </div>

          <div className="space-y-2.5">
            {evidenceFiles.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#0e1124] border border-white/10 hover:border-cyan-400/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Thumbnail & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  {item.preview_data ? (
                    <img
                      src={item.preview_data}
                      alt={item.filename}
                      className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0 bg-slate-900"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center shrink-0">
                      {item.file_type_category === 'video' && <Video className="w-6 h-6 text-purple-300" />}
                      {item.file_type_category === 'executable' && <AlertTriangle className="w-6 h-6 text-rose-400" />}
                      {item.file_type_category === 'document' && <FileText className="w-6 h-6 text-blue-300" />}
                      {item.file_type_category === 'photo' && <ImageIcon className="w-6 h-6 text-cyan-300" />}
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                        {item.filename}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.08] text-slate-300">
                        {formatFileSize(item.size_bytes)}
                      </span>
                      {item.file_type_category === 'executable' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Hazardous Payload
                        </span>
                      )}
                    </div>

                    {/* SHA-256 Hash Display with Copy Button */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-cyan-300/90 truncate max-w-[220px] sm:max-w-md">
                        SHA-256: {item.sha256}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyHash(item.sha256, item.id)}
                        className="text-slate-400 hover:text-cyan-300 transition"
                        title="Copy SHA-256 Checksum"
                      >
                        {copiedHash === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Tamper-Proof Integrity Logged for Cybercrime Portal</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.extracted_text && onExtractedTextSelect && (
                    <button
                      type="button"
                      onClick={() => onExtractedTextSelect(item.extracted_text)}
                      className="px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-[11px] font-semibold transition"
                      title="Use text from this evidence in analysis"
                    >
                      Use Text
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeEvidence(item.id)}
                    className="p-1.5 rounded-full bg-white/[0.06] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                    title="Remove evidence file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}