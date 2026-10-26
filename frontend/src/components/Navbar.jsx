import React from 'react';
import { Shield, Sparkles, BookOpen, Search, History, PhoneCall, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, historyCount, onOpenHistory }) {
  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto h-16 rounded-full apple-glass px-5 sm:px-7 flex items-center justify-between pointer-events-auto transition-all shadow-2xl relative overflow-hidden">
        {/* Subtle luminous top border sheen */}
        <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* Brand with Glowing Jewel Squircle */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#121633] to-[#1e1e40] p-0.5 border border-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              PromptShield
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/10">
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              AI Guardian
            </span>
          </div>
        </div>

        {/* Apple Segmented Switcher with Vibrant Active Gradient */}
        <div className="flex items-center p-1 rounded-full bg-black/50 border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === 'analyzer'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30 border border-white/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
          <button
            onClick={() => setActiveTab('awareness')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === 'awareness'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30 border border-white/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Security Library</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* History Pill */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white transition text-xs font-semibold shadow-sm"
            title="Local audit history"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow">
                {historyCount}
              </span>
            )}
          </button>

          {/* Emergency 1930 SOS Jewel Pill */}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 to-red-500/20 hover:from-rose-500/30 hover:to-red-500/30 border border-rose-500/40 text-rose-200 transition text-xs font-bold shadow-md shadow-rose-500/20"
            title="National Cybercrime Emergency Helpline 1930"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <PhoneCall className="w-3 h-3 text-rose-300" />
            <span>1930</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70 hidden md:inline" />
          </a>
        </div>
      </div>
    </header>
  );
}
