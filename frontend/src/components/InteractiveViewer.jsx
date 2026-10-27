import React, { useState } from 'react';
import { Flag, ShieldAlert, Sparkles, Lock, Copy, Check, Info, ShieldCheck } from 'lucide-react';

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
      return <p className="text-slate-200 leading-relaxed text-sm sm:text-base font-normal">{message}</p>;
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
      return <p className="text-slate-200 leading-relaxed text-sm sm:text-base font-normal">{message}</p>;
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
      <div className="text-slate-200 leading-relaxed text-sm sm:text-base font-normal break-words whitespace-pre-wrap">
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
              className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-rose-500/30 text-white border-rose-400 ring-2 ring-rose-400/60'
                  : 'bg-rose-500/20 text-rose-200 border-rose-500/40 hover:bg-rose-500/30'
              }`}
              title="Click to inspect deceptive element reasoning"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="font-semibold underline decoration-rose-400 underline-offset-4">{seg.text}</span>
              {isUrl && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 text-[10px] bg-black/80 text-rose-300 rounded font-mono ml-1 border border-rose-500/40 font-bold">
                  <Lock className="w-2.5 h-2.5" /> Disarmed Link
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
      {/* Forensic Intelligence Explanation Box */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-7 border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-600" />

        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-1.5 flex-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
              Forensic Intelligence Assessment
            </span>
            <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Disarmed Message Inspection Console */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-7 border border-slate-800">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs sm:text-sm font-mono font-bold tracking-wide text-white uppercase">
              Message Inspector & Link Neutralization
            </h3>
          </div>
          <button
            onClick={handleCopyMessage}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>

        {/* Message Container */}
        <div className="p-5 rounded-xl bg-[#030611] border border-slate-800/80">
          {renderHighlightedMessage()}
        </div>

        {/* Active Link Shield Notice */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Active Link Shield: All extracted URLs are defanged and disarmed to prevent drive-by execution.</span>
        </div>
      </div>

      {/* Red Flags List Breakdown */}
      {redFlags && redFlags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" />
              <span>Deceptive Threat Indicators ({redFlags.length})</span>
            </h4>
            <span className="text-xs text-slate-400">Click any indicator to inspect reasoning</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {redFlags.map((flag, idx) => {
              const isSelected = selectedFlagIndex === idx;
              return (
                <div
                  key={`flag-${idx}-${flag.quote?.slice(0, 15) || ''}`}
                  onClick={() => setSelectedFlagIndex(isSelected ? null : idx)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50 ring-1 ring-rose-400'
                      : 'cyber-panel hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      VEC-0{idx + 1}
                    </span>
                    <div className="space-y-1 flex-1">
                      <div className="font-mono text-xs font-semibold text-rose-200 bg-rose-950/40 px-2.5 py-0.5 rounded border border-rose-900/60 inline-block">
                        "{flag.quote}"
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-normal">
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
