import React, { useState } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';
import { SihStoryDemoModal } from '../common/SihStoryDemoModal';

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
  const [showStoryModal, setShowStoryModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#eadfd4] text-[#262220] shadow-xs">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#9c4124] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xs shrink-0">
              <span className="font-['Rozha_One',serif] tracking-tighter">SS</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-[#262220] tracking-tight font-['Rozha_One',serif]">
                  ShilpSetu
                </span>
                <span className="text-[#9c4124] text-xs font-bold hidden xs:inline font-['Noto_Sans_Devanagari',sans-serif]">
                  {language === 'te' ? 'శిల్పసేతు' : 'शिल्पसेतु'}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-[#fdf2e9] text-[#9c4124] border border-[#f8d7c2] rounded-md tracking-wide uppercase">
                  KALAtech
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium truncate max-w-[200px] sm:max-w-md">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Actions & Language Selector */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 1-Min Connected Story Demo Trigger */}
            <button
              onClick={() => setShowStoryModal(true)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#eadfd4] hover:border-[#9c4124] text-[#9c4124] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="View 1-minute SIH connected journey demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c85a32]" />
              <span>1-Min Story Demo</span>
            </button>

            {onTriggerVoice && (
              <button
                onClick={onTriggerVoice}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                  isSpeaking
                    ? 'bg-[#9c4124] text-white border-[#83341b] shadow-sm animate-pulse'
                    : 'bg-white text-[#9c4124] border-[#eadfd4] hover:bg-[#fdf2e9]'
                }`}
                title={t.voiceListen}
                aria-label={t.voiceListen}
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : 'text-[#9c4124]'}`} />
                <span className="hidden sm:inline">{t.voiceListen}</span>
              </button>
            )}

            {/* Simple Language Switcher */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-[#eadfd4]">
              {(
                [
                  { code: 'en' as const, label: 'English', short: 'EN' },
                  { code: 'hi' as const, label: 'हिन्दी', short: 'हिं' },
                  { code: 'te' as const, label: 'తెలుగు', short: 'తె' },
                ]
              ).map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    onClick={() => onSelectLanguage(langItem.code)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#9c4124] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-[#f5efeb]'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className="xs:hidden">{langItem.short}</span>
                    <span className="hidden xs:inline">{langItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* 1-Minute Story Demo Modal */}
      {showStoryModal && (
        <SihStoryDemoModal
          isOpen={showStoryModal}
          onClose={() => setShowStoryModal(false)}
        />
      )}
    </>
  );
};
