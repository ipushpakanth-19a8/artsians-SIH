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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#262220]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-[#eadfd4] shadow-2xl relative text-center overflow-hidden animate-scale-in">
        {/* Subtle decorative sparkles in background */}
        <div className="absolute top-2 left-4 text-[#d97706] opacity-40 animate-pulse text-xl">✦</div>
        <div className="absolute top-4 right-6 text-[#ea580c] opacity-40 animate-pulse text-lg delay-150">✧</div>
        <div className="absolute bottom-4 left-6 text-[#d97706] opacity-30 animate-pulse text-sm">✦</div>

        {/* Top Celebration Icon */}
        <div className="relative mx-auto w-16 h-16 mb-4 animate-badge-pop">
          <div className="absolute inset-0 bg-[#d97706]/20 rounded-full animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-[#9c4124] text-white flex items-center justify-center text-3xl shadow-lg ring-4 ring-[#fff7ed]">
            {showRewardModal.badge ? showRewardModal.badge.icon : '✨'}
          </div>
        </div>

        {/* Status Tag */}
        <div className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-[#15803d] font-black text-xs px-3 py-1 rounded-full border border-[#bbf7d0] mb-2 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'मिशन पूरा हुआ ✓' : language === 'te' ? 'మిషన్ పూర్తయింది ✓' : 'Mission Complete ✓'}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-[#262220] tracking-tight mb-1 font-['Rozha_One',serif]">
          {showRewardModal.title}
        </h3>

        {/* XP Points Awarded */}
        <div className="my-4 py-2 px-4 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] inline-flex items-center gap-2 shadow-2xs">
          <Sparkles className="w-5 h-5 text-[#d97706]" />
          <span className="text-xl font-black text-[#9c4124] font-mono">+{showRewardModal.points}</span>
          <span className="text-xs font-bold text-[#b45309] uppercase">
            {language === 'hi' ? 'यात्रा अंक अर्जित' : language === 'te' ? 'పాయింట్లు వచ్చాయి' : 'Journey Points'}
          </span>
        </div>

        {/* Optional Badge Unlocked Section */}
        {showRewardModal.badge && (
          <div className="mb-5 p-3 rounded-xl bg-[#faf7f2] border border-[#eadfd4] text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-2xl border border-[#eadfd4] shrink-0">
              {showRewardModal.badge.icon}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-[#9c4124]" />
                <span className="text-[10px] font-black uppercase text-[#9c4124] tracking-wider">
                  {language === 'hi' ? 'नया बैज खुला!' : language === 'te' ? 'కొత్త బ్యాడ్జ్!' : 'New Badge Unlocked!'}
                </span>
              </div>
              <h5 className="text-xs font-bold text-[#262220]">
                {language === 'hi'
                  ? showRewardModal.badge.titleHi
                  : language === 'te'
                  ? showRewardModal.badge.titleTe
                  : showRewardModal.badge.titleEn}
              </h5>
              <p className="text-[11px] text-[#78716c] line-clamp-1">{showRewardModal.badge.desc}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={closeRewardModal}
          className="w-full py-3.5 bg-[#9c4124] hover:bg-[#83341b] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <span>{language === 'hi' ? 'अगला मिशन जारी रखें' : language === 'te' ? 'తరువాతి మిషన్' : 'Continue Journey'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
