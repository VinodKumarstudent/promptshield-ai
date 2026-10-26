import React from 'react';
import { Shield, ShieldAlert, PhoneCall, History, BookOpen, Search, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, historyCount, onOpenHistory }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white">PromptShield</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                GenAI Safety
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Explainable AI for Scam Detection & Digital Safety</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analyzer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Analyzer</span>
          </button>
          <button
            onClick={() => setActiveTab('awareness')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'awareness'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Scam Awareness</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* History button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition text-xs sm:text-sm font-medium relative"
            title="Local Analysis History"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Cybercrime 1930 Helpline */}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition text-xs sm:text-sm font-medium"
            title="Official National Cybercrime Reporting Portal"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span className="font-semibold">1930</span>
            <span className="hidden lg:inline text-xs opacity-80">(cybercrime.gov.in)</span>
            <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
          </a>
        </div>
      </div>
    </header>
  );
}
