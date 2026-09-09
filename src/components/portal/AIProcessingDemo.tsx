import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RotateCw, Play, Volume2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';

interface AIProcessingDemoProps {
  language: LanguageCode;
  onSpeak?: (text: string) => void;
}

export const AIProcessingDemo: React.FC<AIProcessingDemoProps> = ({ language, onSpeak }) => {
  const t = PORTAL_TRANSLATIONS[language];

  const [activeStage, setActiveStage] = useState<0 | 1 | 2 | 3>(3); // 0: craft, 1: price, 2: story, 3: completed
  const [isRunning, setIsRunning] = useState(false);

  const stages = [
    { label: t.aiStep1Status, icon: '📸', desc: 'Analyzing weave count, natural dyes & heritage motifs' },
    { label: t.aiStep2Status, icon: '📊', desc: 'Fetching e-commerce benchmarks & labor wage index' },
    { label: t.aiStep3Status, icon: '✍️', desc: 'Writing story in English, हिन्दी & తెలుగు' },
  ];

  const runDemo = () => {
    setIsRunning(true);
    setActiveStage(0);

    setTimeout(() => {
      setActiveStage(1);
    }, 1200);

    setTimeout(() => {
      setActiveStage(2);
    }, 2400);

    setTimeout(() => {
      setActiveStage(3);
      setIsRunning(false);
      if (onSpeak) {
        onSpeak(t.aiCompleteStatus + '. ' + t.aiSampleTitle + '. ' + t.aiSamplePrice);
      }
    }, 3600);
  };

  return (
    <div className="w-full bg-gradient-to-br from-amber-950/40 via-stone-900 to-indigo-950/40 rounded-3xl p-5 sm:p-7 border-2 border-amber-500/30 text-stone-100 shadow-xl relative overflow-hidden">
      {/* Friendly AI Assistant Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 border border-amber-300/40">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-amber-200 font-['Rozha_One',serif]">
                {t.aiSectionTitle}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                Ethical AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300/80">
              {t.aiSectionSub}
            </p>
          </div>
        </div>

        <button
          onClick={runDemo}
          disabled={isRunning}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
            isRunning
              ? 'bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-700'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 active:scale-95'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Processing AI...' : t.aiDemoButton}</span>
        </button>
      </div>

      {/* Progress States */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-5">
        {stages.map((st, i) => {
          const isDone = activeStage > i || activeStage === 3;
          const isCurrent = activeStage === i && isRunning;
          return (
            <div
              key={i}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-500/30'
                  : isDone
                  ? 'bg-stone-800/80 border-emerald-500/40 text-stone-200'
                  : 'bg-stone-900/40 border-stone-800 text-stone-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{st.icon}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-[10px] text-stone-400">Wait</span>
                )}
              </div>
              <p className={`text-xs font-bold ${isCurrent ? 'text-amber-200' : 'text-stone-200'}`}>
                {st.label}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live Sample Result Showcase */}
      <div className="bg-stone-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-inner">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                {t.aiCompleteStatus}
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-stone-100">
                {t.aiSampleTitle}
              </h4>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black">
            {t.aiSamplePrice}
          </span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed font-normal">
          {t.aiSampleStory}
        </p>

        <div className="mt-3 pt-2.5 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400">
          <span className="flex items-center gap-1 text-amber-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Verified GI Tag: GI-AP-01
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> 100% Direct Artisan Payout
          </span>
        </div>
      </div>
    </div>
  );
};
