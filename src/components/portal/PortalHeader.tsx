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
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#D9CEB8] text-[#29221D] shadow-[0_1px_16px_rgba(41,34,29,0.06)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Heritage Star Emblem */}
            <div className="w-9 h-9 rounded-lg bg-[#A8462D]/10 border border-[#A8462D]/25 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L17 10.5H26L19 15.5L21.5 24L14 19L6.5 24L9 15.5L2 10.5H11L14 2Z" fill="#A8462D" />
                <path d="M14 5L16.2 11.8H23.5L17.7 15.7L19.9 22.5L14 18.6L8.1 22.5L10.3 15.7L4.5 11.8H11.8L14 5Z" fill="#C88732" opacity="0.6" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-[#29221D] tracking-tight font-['Playfair_Display',serif] leading-none">
                  ShilpSetu
                </span>
                <span className="text-[#A8462D] text-xs font-semibold hidden sm:inline font-['Noto_Sans_Devanagari',sans-serif]">
                  {language === 'te' ? 'శిల్పసేతు' : 'शिल्पसेतु'}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/25 rounded tracking-wider uppercase">
                  SIH 2026
                </span>
              </div>
              <span className="text-[10px] text-[#7A6E65] font-medium tracking-wider uppercase truncate max-w-[200px] sm:max-w-md mt-0.5">
                Heritage · Craft · Story
              </span>
            </div>
          </div>

          {/* Actions & Navigation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* State & Language Indicator Pill */}
            <button
              id="portal-header-state-lang-btn"
              onClick={() => openLanguageModal('state')}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-full bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] text-xs font-semibold text-[#29221D] transition-colors shadow-xs cursor-pointer active:scale-95"
              title="Change State or Language"
            >
              <MapPin className="w-3.5 h-3.5 text-[#A8462D]" />
              <span className="font-semibold text-[#A8462D] hidden xs:inline">{selectedState}</span>
              <span className="text-[#BFB09A] hidden xs:inline">•</span>
              <Globe className="w-3.5 h-3.5 text-[#4A7A52]" />
              <span className="text-[#29221D]">{selectedLanguageName}</span>
            </button>

            {/* Quick Language Switcher */}
            <div className="hidden lg:inline-flex items-center h-9 bg-[#F7F2E8] px-1.5 rounded-full border border-[#D9CEB8] gap-0.5 shadow-xs">
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
                    className={`h-7 px-2.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                        : 'text-[#7A6E65] hover:text-[#29221D] hover:bg-[#E8DFC9]/40'
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
                className="h-7 px-2 text-[11px] font-semibold text-[#A8462D] hover:underline cursor-pointer"
                title="All Indian Languages"
              >
                More
              </button>
            </div>

            {/* Voice Audio Prompt Button */}
            {onTriggerVoice && (
              <button
                onClick={onTriggerVoice}
                className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-full border transition-all text-xs font-semibold cursor-pointer active:scale-95 ${
                  isSpeaking
                    ? 'bg-[#A8462D] text-[#FFFDF8] border-[#A8462D] shadow-sm animate-pulse'
                    : 'bg-[#FFFDF8] text-[#A8462D] border-[#A8462D]/40 hover:bg-[#A8462D]/10'
                }`}
                title={t.voiceListen}
                aria-label={t.voiceListen}
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-[#FFFDF8]' : 'text-[#A8462D]'}`} />
                <span className="hidden md:inline">{t.voiceListen}</span>
              </button>
            )}

            {/* 1-Min Story Demo Trigger */}
            <button
              onClick={() => setShowStoryModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#FFFDF8] border border-[#D9CEB8] hover:border-[#A8462D] text-[#A8462D] text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              title="View 1-minute SIH connected journey demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C88732]" />
              <span>1-Min Story</span>
            </button>

            {/* Artisan Journey Game Tutorial Trigger */}
            <button
              onClick={() => openWelcomeModal()}
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#F7F2E8] hover:bg-[#E8DFC9] border border-[#D9CEB8] text-[#29221D] text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Start the interactive Artisan Journey game tutorial"
            >
              <span>🌱</span>
              <span className="text-[#A8462D]">Journey</span>
              <span className="bg-[#A8462D] text-[#FFFDF8] text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                9 Lvl
              </span>
            </button>

            {/* Sign In Dropdown */}
            {(onOpenBuyerSignIn || onOpenSellerSignIn) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSignInDropdown(!showSignInDropdown)}
                  className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-[#A8462D] hover:bg-[#C5614A] text-[#FFFDF8] text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Sign In with Voice Assistance"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#FFFDF8]" />
                  <span>{language === 'hi' ? 'लॉगिन' : language === 'te' ? 'లాగిన్' : 'Sign In'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#FFFDF8]/80" />
                </button>

                {showSignInDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#FFFDF8] rounded-xl shadow-xl border border-[#D9CEB8] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {onOpenSellerSignIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSignInDropdown(false);
                          onOpenSellerSignIn();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#29221D] hover:bg-[#F7F2E8] hover:text-[#A8462D] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 flex items-center justify-center text-xs shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-bold">{language === 'hi' ? 'कारीगर लॉगिन' : 'Artisan Sign In'}</span>
                          <span className="block text-[10px] text-[#7A6E65] font-normal">Voice Assist Enabled</span>
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
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#29221D] hover:bg-[#F7F2E8] hover:text-[#273B59] flex items-center gap-2.5 transition-colors cursor-pointer border-t border-[#D9CEB8]/50"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#273B59]/10 text-[#273B59] border border-[#273B59]/20 flex items-center justify-center text-xs shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-bold">{language === 'hi' ? 'खरीदार लॉगिन' : 'Buyer Sign In'}</span>
                          <span className="block text-[10px] text-[#7A6E65] font-normal">Browse & Checkout</span>
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
