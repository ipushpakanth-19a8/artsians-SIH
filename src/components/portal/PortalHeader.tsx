import React from 'react';
import { Globe, Volume2, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';

interface PortalHeaderProps {
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onTriggerVoice?: () => void;
  isSpeaking?: boolean;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  language,
  onSelectLanguage,
  onTriggerVoice,
  isSpeaking = false,
}) => {
  const t = PORTAL_TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-amber-950/40 text-stone-100 shadow-md">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 flex items-center justify-center text-amber-50 font-black text-lg sm:text-xl shadow-md shadow-orange-950/40 border border-amber-400/40 shrink-0">
            <span className="font-['Rozha_One',serif] tracking-tighter">KT</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-amber-100 tracking-tight font-['Rozha_One',serif]">
                KALAtech
              </span>
              <span className="text-amber-400 text-xs font-semibold hidden xs:inline font-['Noto_Sans_Devanagari',sans-serif]">
                कलाTech
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-amber-200/80 font-medium truncate max-w-[200px] sm:max-w-md">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Language Selector & Voice Quick Button */}
        <div className="flex items-center gap-2 shrink-0">
          {onTriggerVoice && (
            <button
              onClick={onTriggerVoice}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                isSpeaking
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
                  : 'bg-stone-800/90 text-amber-300 border-amber-500/30 hover:bg-stone-700 hover:text-amber-200'
              }`}
              title={t.voiceListen}
              aria-label={t.voiceListen}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{t.voiceListen}</span>
            </button>
          )}

          {/* Prominent Language Switcher */}
          <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700/60 shadow-inner">
            <div className="hidden md:flex items-center gap-1 px-1.5 text-stone-400 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.languageLabel}:</span>
            </div>
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
              title="English"
            >
              English
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'hi'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
              title="हिन्दी (Hindi)"
            >
              हिन्दी
            </button>
            <button
              onClick={() => onSelectLanguage('te')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'te'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
              title="తెలుగు (Telugu)"
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
