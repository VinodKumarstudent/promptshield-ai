import React from 'react';
import { X, Trash2, Shield, Clock, ExternalLink, Download, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-base font-bold text-white">Analysis History</h2>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Stored locally in your browser only
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-950/80 p-3 mx-4 mt-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Your submitted messages are <span className="text-slate-200 font-semibold">never stored on any backend database</span>. This history exists strictly in your local device storage.
            </p>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Clock className="w-10 h-10 mb-2 stroke-[1.5] opacity-40" />
                <p className="text-sm font-medium">No past analyses recorded yet.</p>
                <p className="text-xs mt-1">Analyze a message or load a sample scenario to begin.</p>
              </div>
            ) : (
              history.map((item) => {
                const isLikelyScam = item.risk_level === 'likely_scam';
                const isSuspicious = item.risk_level === 'suspicious';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition flex flex-col justify-between gap-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          isLikelyScam
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : isSuspicious
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {item.risk_level?.replace('_', ' ')} • {item.risk_score}/100
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.scam_type || 'Message Evaluation'}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 font-sans">
                        {item.message}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          onSelectHistoryItem(item);
                          onClose();
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1"
                      >
                        <span>Re-inspect Analysis</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Delete from local history"
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
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-xs font-medium transition"
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
