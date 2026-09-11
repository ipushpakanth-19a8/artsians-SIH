import React from 'react';
import { useTutorial, TUTORIAL_MISSIONS } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export const ReturningArtisanBanner: React.FC = () => {
  const { returningBanner, dismissReturningBanner, currentLevel, resumeJourney } = useTutorial();
  const { language } = useLanguage();

  if (!returningBanner) return null;

  const mission = TUTORIAL_MISSIONS.find((m) => m.level === currentLevel) || TUTORIAL_MISSIONS[0];
  const missionTitle =
    language === 'hi' ? mission.titleHi : language === 'te' ? mission.titleTe : mission.titleEn;

  const handleContinue = () => {
    dismissReturningBanner();
    resumeJourney();
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[9992] max-w-sm w-auto animate-bounce-short">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-400 ring-2 ring-amber-400/20 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
          🤝
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              {language === 'hi' ? 'स्वागत है!' : language === 'te' ? 'స్వాగతం!' : 'Welcome Back!'}
            </span>
            <button
              onClick={dismissReturningBanner}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-black text-slate-100 truncate mt-0.5">
            {language === 'hi'
              ? `आप लेवल ${currentLevel} पर हैं: ${missionTitle}`
              : language === 'te'
              ? `మీరు లెవల్ ${currentLevel} లో ఉన్నారు`
              : `You're on Level ${currentLevel}: ${missionTitle}`}
          </h4>

          <p className="text-[11px] text-slate-300 mt-0.5">
            {language === 'hi'
              ? 'अपनी शिल्प यात्रा वहीं से जारी रखें।'
              : language === 'te'
              ? 'మీ యాత్రను ఇక్కడి నుండి కొనసాగించండి.'
              : 'Continue your artisan onboarding right where you left off.'}
          </p>

          <button
            onClick={handleContinue}
            className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>{language === 'hi' ? 'यात्रा जारी रखें' : language === 'te' ? 'కొనసాగించండి' : 'Continue Journey'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
