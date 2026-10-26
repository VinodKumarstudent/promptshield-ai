import React from 'react';
import { Shield, Sparkles, BookOpen, Search, History, PhoneCall, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, historyCount, onOpenHistory }) {
  return (
    <header className="sticky top-0 z-50 w-full pt-3 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto h-14 rounded-full apple-glass px-4 sm:px-6 flex items-center justify-between pointer-events-auto transition-all shadow-2xl">
        {/* Apple Squircle Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base tracking-tight text-white">
              PromptShield
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              Intelligence
            </span>
          </div>
        </div>

        {/* Apple Segmented Switcher */}
        <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/[0.08] shadow-inner">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              activeTab === 'analyzer'
                ? 'bg-white/15 text-white shadow-md shadow-white/5 border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
          <button
            onClick={() => setActiveTab('awareness')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              activeTab === 'awareness'
                ? 'bg-white/15 text-white shadow-md shadow-white/5 border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Security Library</span>
          </button>
        </div>

        {/* Right Actions: History & Emergency SOS */}
        <div className="flex items-center gap-2">
          {/* History Pill */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition text-xs font-medium"
            title="Stored locally on this device"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500/80 text-white text-[9px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Emergency SOS Helpline 1930 */}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition text-xs font-semibold"
            title="National Cybercrime Emergency Helpline 1930 / cybercrime.gov.in"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <PhoneCall className="w-3 h-3 text-rose-400" />
            <span>1930</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 hidden md:inline" />
          </a>
        </div>
      </div>
    </header>
  );
}
