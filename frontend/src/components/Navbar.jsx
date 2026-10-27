import React from 'react';
import { Shield, BookOpen, Search, History, PhoneCall, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, historyCount, onOpenHistory }) {
  return (
    <header className="sticky top-0 z-50 w-full pt-3 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto h-16 rounded-2xl cyber-glass-nav px-4 sm:px-6 flex items-center justify-between pointer-events-auto transition-all relative">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('analyzer')}>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/20 bg-[#060919] p-0.5 transition-all duration-300 group-hover:border-cyan-300 group-hover:scale-105">
              <img
                src="/logo.jpg"
                alt="PromptShield AI"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                PromptShield <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Active Forensics
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 tracking-tight hidden md:inline">
              Detect Scams • Understand Risks • Stay Safe
            </span>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'analyzer'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-300/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
          <button
            onClick={() => setActiveTab('awareness')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'awareness'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-300/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Threat Library</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition text-xs font-medium"
            title="Local audit history"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[10px] font-black flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Emergency 1930 Dial Badge */}
          <a
            href="tel:1930"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 transition text-xs font-bold shadow-sm"
            title="Call National Cybercrime Helpline 1930 immediately"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>1930</span>
            <span className="hidden lg:inline text-[10px] text-rose-300/80 font-normal">SOS</span>
          </a>
        </div>
      </div>
    </header>
  );
}
