import React from 'react';
import { Mail, Briefcase, QrCode, Award, Truck, CheckCircle, Sparkles } from 'lucide-react';

export default function SampleSelector({ samples, onSelectSample, activeSampleId }) {
  const getIcon = (type, isSafe) => {
    if (isSafe) return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    switch (type) {
      case 'email': return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'job_offer': return <Briefcase className="w-3.5 h-3.5 text-purple-400" />;
      case 'payment_upi': return <QrCode className="w-3.5 h-3.5 text-amber-400" />;
      case 'lottery': return <Award className="w-3.5 h-3.5 text-pink-400" />;
      case 'delivery': return <Truck className="w-3.5 h-3.5 text-orange-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
            Hackathon Test Scenarios (1-Click Load)
          </h3>
        </div>
        <span className="text-xs text-slate-500">Click to instantly populate and test</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {samples.map((sample) => {
          const isSafe = sample.expected_risk === 'safe';
          const isSelected = activeSampleId === sample.id;

          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/20 ring-1 ring-blue-500'
                  : isSafe
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/30 hover:border-emerald-700/60'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5 w-full">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  {getIcon(sample.type, isSafe)}
                  <span className="truncate">{sample.title}</span>
                </span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    isSafe
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isSafe ? 'Genuine' : 'Scam'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
