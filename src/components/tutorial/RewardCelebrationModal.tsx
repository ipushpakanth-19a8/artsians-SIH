import React, { useEffect } from 'react';
import { useTutorial } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { CheckCircle2, Sparkles, Award, ArrowRight } from 'lucide-react';

export const RewardCelebrationModal: React.FC = () => {
  const { showRewardModal, closeRewardModal } = useTutorial();
  const { language } = useLanguage();

  useEffect(() => {
    // Auto-dismiss or can be closed manually
    if (showRewardModal) {
      const timer = setTimeout(() => {
        // give user 5s or let them click
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showRewardModal]);

  if (!showRewardModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-amber-300 shadow-2xl relative text-center overflow-hidden transform scale-100 transition-all">
        {/* Subtle decorative sparkles in background */}
        <div className="absolute top-2 left-4 text-amber-400 opacity-40 animate-pulse text-xl">✦</div>
        <div className="absolute top-4 right-6 text-orange-400 opacity-40 animate-pulse text-lg delay-150">✧</div>
        <div className="absolute bottom-4 left-6 text-amber-500 opacity-30 animate-pulse text-sm">✦</div>

        {/* Top Celebration Icon */}
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-3xl shadow-lg ring-4 ring-amber-100">
            {showRewardModal.badge ? showRewardModal.badge.icon : '✨'}
          </div>
        </div>

        {/* Status Tag */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-black text-xs px-3 py-1 rounded-full border border-emerald-200 mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'मिशन पूरा हुआ ✓' : language === 'te' ? 'మిషన్ పూర్తయింది ✓' : 'Mission Complete ✓'}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
          {showRewardModal.title}
        </h3>

        {/* XP Points Awarded */}
        <div className="my-4 py-2 px-4 rounded-2xl bg-amber-50 border border-amber-200/80 inline-flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span className="text-xl font-black text-amber-900 font-mono">+{showRewardModal.points}</span>
          <span className="text-xs font-bold text-amber-700 uppercase">
            {language === 'hi' ? 'यात्रा अंक अर्जित' : language === 'te' ? 'పాయింట్లు వచ్చాయి' : 'Journey Points'}
          </span>
        </div>

        {/* Optional Badge Unlocked Section */}
        {showRewardModal.badge && (
          <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-amber-200 shrink-0">
              {showRewardModal.badge.icon}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-700" />
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                  {language === 'hi' ? 'नया बैज खुला!' : language === 'te' ? 'కొత్త బ్యాడ్జ్!' : 'New Badge Unlocked!'}
                </span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">
                {language === 'hi'
                  ? showRewardModal.badge.titleHi
                  : language === 'te'
                  ? showRewardModal.badge.titleTe
                  : showRewardModal.badge.titleEn}
              </h5>
              <p className="text-[11px] text-slate-500 line-clamp-1">{showRewardModal.badge.desc}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={closeRewardModal}
          className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <span>{language === 'hi' ? 'अगला मिशन जारी रखें' : language === 'te' ? 'తరువాతి మిషన్' : 'Continue Journey'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
