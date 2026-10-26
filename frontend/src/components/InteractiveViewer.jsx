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
      return <p className="text-slate-200 leading-relaxed text-base font-normal">{message}</p>;
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
      return <p className="text-slate-200 leading-relaxed text-base font-normal">{message}</p>;
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
              className={`inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-rose-500/35 text-white ring-2 ring-rose-400 shadow-lg shadow-rose-500/20'
                  : 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
              }`}
              title="Click to view explainable analysis"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span className="font-medium underline decoration-rose-400/60 underline-offset-4">{seg.text}</span>
              {isUrl && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] bg-black/60 text-rose-300 rounded font-mono ml-1 border border-rose-500/30">
                  <Lock className="w-2.5 h-2.5" /> Blocked
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
      {/* Apple Intelligence Plain-Language Explanation */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-black/60 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div className="space-y-1.5 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              AI Security Intelligence
            </span>
            <p className="text-slate-100 text-base sm:text-lg leading-relaxed font-normal">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Message Analysis Inspector */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-white uppercase">
              Message Forensics & Red Flag Highlights
            </h3>
          </div>
          <button
            onClick={handleCopyMessage}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>

        {/* Message Container */}
        <div className="p-5 sm:p-6 rounded-2xl bg-black/50 border border-white/[0.06] shadow-inner">
          {renderHighlightedMessage()}
        </div>

        {/* Apple Zero-Click URL Protection Notice */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Active Link Shield: Deceptive hyperlinks are deactivated to prevent zero-click drive-by attacks.</span>
        </div>
      </div>

      {/* Red Flags List */}
      {redFlags && redFlags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" />
              <span>Extracted Red Flags ({redFlags.length})</span>
            </h4>
            <span className="text-xs text-slate-500">Click any card to cross-reference</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {redFlags.map((flag, idx) => {
              const isSelected = selectedFlagIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFlagIndex(isSelected ? null : idx)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'apple-glass-card border-rose-500/50 shadow-lg shadow-rose-500/10 scale-[1.01]'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1 flex-1">
                      <div className="font-mono text-xs sm:text-sm text-rose-300 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-900/40 inline-block">
                        "{flag.quote}"
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed pt-1">
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
