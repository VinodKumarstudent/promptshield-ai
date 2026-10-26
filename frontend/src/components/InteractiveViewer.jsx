import React, { useState } from 'react';
import { Flag, ShieldAlert, Info, Lock, Copy, Check, ExternalLink } from 'lucide-react';

export default function InteractiveViewer({ message, redFlags = [], explanation }) {
  const [copied, setCopied] = useState(false);
  const [selectedFlagIndex, setSelectedFlagIndex] = useState(null);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build segmented text with highlights
  const renderHighlightedMessage = () => {
    if (!redFlags || redFlags.length === 0) {
      return <p className="text-slate-300 leading-relaxed font-sans">{message}</p>;
    }

    // Find occurrences of all quotes in message
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
      return <p className="text-slate-300 leading-relaxed font-sans">{message}</p>;
    }

    // Sort matches by start position and remove overlaps
    matches.sort((a, b) => a.start - b.start);
    const nonOverlapping = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        nonOverlapping.push(m);
        lastEnd = m.end;
      }
    }

    // Slice string into segments
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
      <div className="text-slate-200 leading-relaxed text-sm sm:text-base font-sans break-words whitespace-pre-wrap">
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
              className={`inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-lg cursor-pointer transition-all border font-medium ${
                isSelected
                  ? 'bg-rose-500/30 text-rose-200 border-rose-400 ring-2 ring-rose-500/50'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
              }`}
              title="Click to view explanation for this red flag"
            >
              <Flag className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{seg.text}</span>
              {isUrl && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 text-[9px] bg-red-950/80 text-red-300 border border-red-700/60 rounded font-mono ml-0.5">
                  <Lock className="w-2.5 h-2.5" /> Link Blocked
                </span>
              )}
            </mark>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Explanation Box */}
      <div className="bg-slate-900/90 border border-blue-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              Plain-Language Explanation
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Message Analysis Box */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
              Message Analysis with Red Flag Highlighting
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Click any highlighted phrase for details
            </span>
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded bg-slate-800 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Message Content Container */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
          {renderHighlightedMessage()}
        </div>

        {/* Privacy Note: Auto-open links disabled */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Active safety protection: External hyperlinks in suspicious messages are strictly disabled to prevent zero-click exploits.</span>
        </div>
      </div>

      {/* Red Flags List Breakdown */}
      {redFlags && redFlags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" />
              <span>Identified Red Flags ({redFlags.length})</span>
            </h4>
            <span className="text-xs text-slate-500">Specific deceptive indicators extracted</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {redFlags.map((flag, idx) => {
              const isSelected = selectedFlagIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFlagIndex(isSelected ? null : idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      FLAG #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-mono text-xs sm:text-sm font-medium text-rose-200 bg-rose-950/40 px-2 py-1 rounded border border-rose-900/40 mb-1.5 inline-block">
                        "{flag.quote}"
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
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
