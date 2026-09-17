import React, { useState } from 'react';
import { Volume2, Sparkles, LogIn, ChevronDown, User, Store, MapPin, Globe } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';
import { SihStoryDemoModal } from '../common/SihStoryDemoModal';
import { useTutorial } from '../tutorial/TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';

interface PortalHeaderProps {
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onTriggerVoice?: () => void;
  isSpeaking?: boolean;
  onOpenBuyerSignIn?: () => void;
  onOpenSellerSignIn?: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  language,
  onSelectLanguage,
  onTriggerVoice,
  isSpeaking = false,
  onOpenBuyerSignIn,
  onOpenSellerSignIn,
}) => {
  const { selectedState, selectedLanguageName, openLanguageModal } = useLanguage();
  const t = PORTAL_TRANSLATIONS[language];
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  const { openWelcomeModal } = useTutorial();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#eadfd4] text-[#262220] shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#9c4124] flex items-center justify-center text-white font-black text-lg shadow-xs shrink-0">
              <span className="font-['Rozha_One',serif] tracking-tighter">SS</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#262220] tracking-tight font-['Rozha_One',serif] leading-none">
                  ShilpSetu
                </span>
                <span className="text-[#9c4124] text-xs font-bold hidden sm:inline font-['Noto_Sans_Devanagari',sans-serif]">
                  {language === 'te' ? 'శిల్పసేతు' : 'शिल्पसेतु'}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-[#fdf2e9] text-[#9c4124] border border-[#f8d7c2] rounded tracking-wider uppercase">
                  ShilpSetu
                </span>
              </div>
              <span className="text-[11px] text-[#78716c] font-medium truncate max-w-[200px] sm:max-w-md mt-0.5">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Actions & Navigation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* State & Language Indicator Pill */}
            <button
              id="portal-header-state-lang-btn"
              onClick={() => openLanguageModal('state')}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl bg-white hover:bg-[#faf7f2] border border-[#eadfd4] hover:border-[#c85a32] text-xs font-semibold text-[#262220] transition-colors shadow-2xs cursor-pointer"
              title="Change State or Language"
            >
              <MapPin className="w-3.5 h-3.5 text-[#9c4124]" />
              <span className="font-bold text-[#9c4124] hidden xs:inline">{selectedState}</span>
              <span className="text-stone-300 hidden xs:inline">•</span>
              <Globe className="w-3.5 h-3.5 text-[#78716c]" />
              <span className="text-[#262220]">{selectedLanguageName}</span>
            </button>

            {/* Quick Language Switcher */}
            <div className="hidden lg:inline-flex items-center h-9 bg-white px-1.5 rounded-xl border border-[#eadfd4] gap-0.5 shadow-2xs">
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
                    className={`h-7 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#9c4124] text-white shadow-xs'
                        : 'text-[#57534e] hover:text-[#262220] hover:bg-[#faf7f2]'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className="xs:hidden">{langItem.short}</span>
                    <span className="hidden xs:inline">{langItem.label}</span>
                  </button>
                );
              })}
              <button
                id="portal-lang-more-btn"
                onClick={() => openLanguageModal('language')}
                className="h-7 px-1.5 text-[11px] font-bold text-[#9c4124] hover:underline cursor-pointer"
                title="All Indian Languages"
              >
                More
              </button>
            </div>

            {/* Voice Audio Prompt Button */}
            {onTriggerVoice && (
              <button
                onClick={onTriggerVoice}
                className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                  isSpeaking
                    ? 'bg-[#9c4124] text-white border-[#83341b] shadow-xs animate-pulse'
                    : 'bg-[#fff7ed] text-[#9c4124] border-[#fed7aa] hover:bg-[#ffedd5]'
                }`}
                title={t.voiceListen}
                aria-label={t.voiceListen}
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : 'text-[#9c4124]'}`} />
                <span className="hidden md:inline">{t.voiceListen}</span>
              </button>
            )}

            {/* 1-Min Story Demo Trigger */}
            <button
              onClick={() => setShowStoryModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white border border-[#eadfd4] hover:border-[#9c4124] text-[#9c4124] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="View 1-minute SIH connected journey demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
              <span>1-Min Story</span>
            </button>

            {/* Artisan Journey Game Tutorial Trigger */}
            <button
              onClick={() => openWelcomeModal()}
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#9c4124] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Start the interactive Artisan Journey game tutorial"
            >
              <span>🌱</span>
              <span>Artisan Journey</span>
              <span className="bg-[#9c4124] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                9
              </span>
            </button>

            {/* Sign In Dropdown */}
            {(onOpenBuyerSignIn || onOpenSellerSignIn) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSignInDropdown(!showSignInDropdown)}
                  className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-[#9c4124] hover:bg-[#83341b] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                  title="Sign In with Voice Assistance"
                >
                  <LogIn className="w-3.5 h-3.5 text-white" />
                  <span>{language === 'hi' ? 'लॉगिन' : language === 'te' ? 'లాగిన్' : 'Sign In'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </button>

                {showSignInDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#eadfd4] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {onOpenSellerSignIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSignInDropdown(false);
                          onOpenSellerSignIn();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#262220] hover:bg-[#fff7ed] hover:text-[#9c4124] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#fff7ed] text-[#9c4124] border border-[#fed7aa] flex items-center justify-center text-xs shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-black">{language === 'hi' ? 'कारीगर लॉगिन' : 'Artisan Sign In'}</span>
                          <span className="block text-[10px] text-[#78716c] font-medium">Voice Assist Enabled</span>
                        </div>
                      </button>
                    )}
                    {onOpenBuyerSignIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSignInDropdown(false);
                          onOpenBuyerSignIn();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#262220] hover:bg-[#f0fdf4] hover:text-[#15803d] flex items-center gap-2.5 transition-colors cursor-pointer border-t border-[#eadfd4]"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] flex items-center justify-center text-xs shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-black">{language === 'hi' ? 'खरीदार लॉगिन' : 'Buyer Sign In'}</span>
                          <span className="block text-[10px] text-[#78716c] font-medium">Browse & Checkout</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
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
