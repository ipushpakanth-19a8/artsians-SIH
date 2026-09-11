import React from 'react';
import { useTutorial, TUTORIAL_MISSIONS } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Play, Pause, X, Trophy, Sparkles } from 'lucide-react';

export const GameHUD: React.FC = () => {
  const {
    isActive,
    isPaused,
    currentLevel,
    currentMission,
    journeyPoints,
    pauseJourney,
    resumeJourney,
    skipJourney,
  } = useTutorial();

  const { language } = useLanguage();

  if (!isActive && !isPaused) return null;

  const totalLevels = TUTORIAL_MISSIONS.length;
  const progressPct = Math.round(((currentLevel - 1) / totalLevels) * 100);

  const missionTitle =
    language === 'hi' ? currentMission.titleHi : language === 'te' ? currentMission.titleTe : currentMission.titleEn;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9995] max-w-[95vw] w-auto">
      <div className="bg-slate-950/90 backdrop-blur-md text-white border border-amber-500/40 rounded-full px-4 py-2 shadow-2xl flex items-center gap-3 sm:gap-4 ring-2 ring-amber-500/20">
        {/* Left: Journey Badge */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm">
            🌱
          </span>
          <div className="hidden sm:block">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block leading-none">
              {language === 'hi' ? 'शिल्प यात्रा' : language === 'te' ? 'శిల్ప యాత్ర' : 'Artisan Journey'}
            </span>
            <span className="text-xs font-bold text-slate-200 block truncate max-w-[140px]">
              {missionTitle}
            </span>
          </div>
        </div>

        {/* Center: Step Dots / Progress Bar */}
        <div className="flex flex-col gap-1 min-w-[100px] sm:min-w-[160px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span>
              {language === 'hi' ? 'लेवल' : language === 'te' ? 'లెవల్' : 'Level'} {currentLevel}/{totalLevels}
            </span>
            <span className="text-amber-400 font-mono text-[10px]">{progressPct}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(10, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Right: Journey Points */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-black text-amber-300 font-mono">{journeyPoints}</span>
          <span className="text-[10px] text-amber-400/80 font-bold uppercase hidden sm:inline">Pts</span>
        </div>

        {/* Controls: Pause / Play / Skip */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          {isPaused ? (
            <button
              onClick={resumeJourney}
              className="p-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              title="Resume Journey"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          ) : (
            <button
              onClick={pauseJourney}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Pause Journey"
            >
              <Pause className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={skipJourney}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Exit Journey"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
