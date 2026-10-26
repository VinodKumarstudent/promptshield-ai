import React, { useState } from 'react';
import { Flag, ShieldAlert, Sparkles, Lock, Copy, Check, Info } from 'lucide-react';

export default function InteractiveViewer({ message, redFlags = [], explanation }) {
  const [copied, setCopied] = useState(false);
  const [selectedFlagIndex, setSelectedFlagIndex] = useState(null);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedMessage = () => {
    if (!redFlags || redFlags.length === 0) {
      return <p className="text-slate-100 leading-relaxed text-base font-normal">{message}</p>;
    }

    const matches = [];
    redFlags.forEach((flag, flagIdx) => {
      const quote = flag.quote?.trim();
      if (!quote) return;

      const lowerMessage = message.toLowerCase();
      const lowerQuote = quote.toLowerCase();
      let startIndex = 0;

      while (startIndex < message.length) {
        const foundIndex = lowerMessage.indexOf(lowerQuote, startIndex);
        if (foundIndex === -1) break;

        matches.push({
          start: foundIndex,
          end: foundIndex + quote.length,
          quote: message.substring(foundIndex, foundIndex + quote.length),
          flagIndex: flagIdx,
          reason: flag.reason,
        });

        startIndex = foundIndex + quote.length;
      }
    });

    if (matches.length === 0) {
      return <p className="text-slate-100 leading-relaxed text-base font-normal">{message}</p>;
    }

    matches.sort((a, b) => a.start - b.start);
    const nonOverlapping = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        nonOverlapping.push(m);
        lastEnd = m.end;
      }
    }

    const segments = [];
    let cursor = 0;

    nonOverlapping.forEach((m, idx) => {
      if (m.start > cursor) {
        segments.push({
          type: 'plain',
          text: message.substring(cursor, m.start),
          key: `plain-${cursor}`,
        });
      }

      segments.push({
        type: 'highlight',
        text: m.quote,
        flagIndex: m.flagIndex,
        reason: m.reason,
        key: `highlight-${m.start}-${idx}`,
      });

      cursor = m.end;
    });

    if (cursor < message.length) {
      segments.push({
        type: 'plain',
        text: message.substring(cursor),
        key: `plain-${cursor}`,
      });
    }

    return (
      <div className="text-slate-100 leading-relaxed text-base sm:text-lg font-normal break-words whitespace-pre-wrap">
        {segments.map((seg) => {
          if (seg.type === 'plain') {
            return <span key={seg.key}>{seg.text}</span>;
          }

          const isSelected = selectedFlagIndex === seg.flagIndex;
          const isUrl = /(https?:\/\/|www\.|\.xyz|\.top|\.com|\.club)/i.test(seg.text);

          return (
            <mark
              key={seg.key}
              onClick={() => setSelectedFlagIndex(isSelected ? null : seg.flagIndex)}
              className={`inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-lg cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-rose-500/40 text-white border-rose-400 ring-2 ring-rose-400/80 shadow-lg shadow-rose-500/30'
                  : 'bg-rose-500/25 text-rose-200 border-rose-500/40 hover:bg-rose-500/35 hover:border-rose-400'
              }`}
              title="Click to view explainable analysis"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="font-bold underline decoration-rose-300 underline-offset-4">{seg.text}</span>
              {isUrl && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-black/70 text-rose-300 rounded font-mono ml-1 border border-rose-500/40 font-bold">
                  <Lock className="w-2.5 h-2.5" /> Blocked Link
                </span>
              )}
            </mark>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Luminous Plain-Language Explanation */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7 relative overflow-hidden border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500" />

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/30 shrink-0">
            <div className="w-full h-full bg-[#0d1024] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div className="space-y-1.5 flex-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 block">
              AI Security Intelligence & Forensic Explanation
            </span>
            <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Message Analysis Inspector */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7 border border-white/15 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase">
              Forensic Highlights & Link Neutralization
            </h3>
          </div>
          <button
            onClick={handleCopyMessage}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied' : 'Copy Message'}</span>
          </button>
        </div>

        {/* Message Container */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090b1a]/90 border border-white/10 shadow-inner">
          {renderHighlightedMessage()}
        </div>

        {/* Active Link Shield Notice */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Active Link Shield: Deceptive hyperlinks are disarmed in-browser to prevent zero-click drive-by attacks.</span>
        </div>
      </div>

      {/* Red Flags List Breakdown */}
      {redFlags && redFlags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" />
              <span>Identified Deception Vectors ({redFlags.length})</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">Click any vector to examine forensic reasoning</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {redFlags.map((flag, idx) => {
              const isSelected = selectedFlagIndex === idx;
              return (
                <div
                  key={`flag-${idx}-${flag.quote?.slice(0, 15) || ''}`}
                  onClick={() => setSelectedFlagIndex(isSelected ? null : idx)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 shadow-xl shadow-rose-500/15 ring-1 ring-rose-400 scale-[1.01]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-500/25 to-pink-500/25 text-rose-200 border border-rose-400/40 text-[10px] font-mono font-extrabold shrink-0 mt-0.5">
                      FLAG 0{idx + 1}
                    </span>
                    <div className="space-y-1.5 flex-1">
                      <div className="font-mono text-xs sm:text-sm font-bold text-rose-200 bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-800/50 inline-block">
                        "{flag.quote}"
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-normal">
                        {flag.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
