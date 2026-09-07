import React from 'react';
import { Volume2, VolumeX, Smartphone, Monitor, ShieldCheck, Sparkles, ShoppingBag, Hammer } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations, speakText, stopSpeaking } from '../lib/i18n';

interface HeaderProps {
  currentRole: 'artisan' | 'buyer' | 'audit';
  setRole: (role: 'artisan' | 'buyer' | 'audit') => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (val: boolean) => void;
  onOpenEvaluatorTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setRole,
  language,
  setLanguage,
  isMobileFrame,
  setIsMobileFrame,
  isSpeaking,
  setIsSpeaking,
  onOpenEvaluatorTour
}) => {
  const t = translations[language];

  const handleAudioGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const speech = currentRole === 'artisan'
        ? `${t.appName}. ${t.welcomeTitle}. ${t.welcomeSub}`
        : currentRole === 'buyer'
        ? `${t.browseCatalog}. ${t.searchCrafts}`
        : `${t.evaluatorDefense}. AI audit trail and pricing benchmarks.`;
      speakText(speech, language);
      setTimeout(() => setIsSpeaking(false), 8000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-950/40 text-amber-100 font-black text-xl border border-amber-500/30">
                AG
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-lg text-white font-['Rozha_One',serif]">
                    Antigravity
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Artisan Market Linkage
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-medium">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Action Buttons: Judge 5-Min Tour & Audio Guide */}
            <div className="flex items-center gap-2">
              <button
                id="header-evaluator-tour-btn"
                onClick={onOpenEvaluatorTour}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-950/40 border border-amber-400 transition-transform active:scale-95"
                title="Interactive 5-Minute Hackathon Demo Script (Section 15)"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                <span className="tracking-tight">Judge 5-Min Tour</span>
              </button>

              {/* Quick Audio Guide Button */}
              <button
                id="header-audio-guide-btn"
                onClick={handleAudioGuide}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                  isSpeaking
                    ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                    : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
                title={isSpeaking ? t.stopAudio : t.listenToGuide}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span className="hidden sm:inline">{isSpeaking ? t.stopAudio : t.audioGuide}</span>
              </button>
            </div>
          </div>

          {/* Center: Main View Navigation */}
          <nav className="flex items-center gap-1 p-1 bg-stone-950/70 border border-stone-800 rounded-xl w-full sm:w-auto justify-center">
            <button
              id="nav-artisan-btn"
              onClick={() => setRole('artisan')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'artisan'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>{t.forArtisans}</span>
            </button>

            <button
              id="nav-buyer-btn"
              onClick={() => setRole('buyer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'buyer'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.forBuyers}</span>
            </button>

            <button
              id="nav-audit-btn"
              onClick={() => setRole('audit')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'audit'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.evaluatorDefense}</span>
              <span className="sm:hidden">AI Audit</span>
            </button>
          </nav>

          {/* Right: Language Switcher & Device Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Language Switch */}
            <div className="flex items-center bg-stone-950/70 border border-stone-800 rounded-xl p-0.5 text-xs">
              <button
                id="lang-en-btn"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === 'en' ? 'bg-stone-800 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                EN
              </button>
              <button
                id="lang-hi-btn"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === 'hi' ? 'bg-stone-800 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                हिन्दी
              </button>
              <button
                id="lang-te-btn"
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === 'te' ? 'bg-stone-800 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Device View Frame Toggle */}
            <button
              id="device-frame-toggle-btn"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`p-1.5 rounded-xl border transition-colors ${
                isMobileFrame
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
              }`}
              title={isMobileFrame ? "Switch to Full Layout" : "Simulate Artisan Mobile Screen"}
            >
              {isMobileFrame ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
