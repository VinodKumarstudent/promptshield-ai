import React from 'react';
import { X, Trash2, Shield, Clock, ExternalLink, Download, AlertCircle, Sparkles } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history = [], onSelectHistoryItem, onClearHistory, onDeleteItem }) {
  if (!isOpen) return null;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptshield-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-[#0d0d12]/95 border-l border-white/[0.08] backdrop-blur-3xl flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Inspection History</h2>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Private Local Storage Only
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Guarantee */}
          <div className="bg-white/[0.02] p-3.5 mx-5 mt-4 rounded-2xl border border-white/[0.06] text-xs text-slate-400 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Your messages are processed purely in ephemeral memory and are <span className="text-white font-medium">never stored on our servers</span>.
            </p>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Clock className="w-10 h-10 mb-2 stroke-[1.2] opacity-30" />
                <p className="text-sm font-medium text-slate-400">No past analyses recorded</p>
                <p className="text-xs mt-1 text-slate-500">Analyze any message to see your local audit trail.</p>
              </div>
            ) : (
              history.map((item) => {
                const isLikelyScam = item.risk_level === 'likely_scam';
                const isSuspicious = item.risk_level === 'suspicious';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col justify-between gap-2.5 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          isLikelyScam
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : isSuspicious
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.risk_level?.replace('_', ' ')} • {item.risk_score}/100
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.scam_type || 'Message Evaluation'}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          onSelectHistoryItem(item);
                          onClose();
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1"
                      >
                        <span>Re-inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          {history.length > 0 && (
            <div className="p-5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/[0.1] bg-white/[0.04] text-slate-300 hover:text-white text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
