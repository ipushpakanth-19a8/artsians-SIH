import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2, Sparkles, ChevronDown, CheckCircle2, ShieldCheck, Heart, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { LanguageCode } from '../types';
import { PORTAL_TRANSLATIONS } from '../lib/portalI18n';
import { useVoiceAssistant } from '../lib/useVoiceAssistant';

// Modular Portal Components
import { PortalHeader } from './portal/PortalHeader';
import { VoiceFloatingBar } from './portal/VoiceFloatingBar';
import { CraftJourneyDiagram } from './portal/CraftJourneyDiagram';
import { InstructionWizard } from './portal/InstructionWizard';
import { AIProcessingDemo } from './portal/AIProcessingDemo';
import { RoleSelector } from './portal/RoleSelector';
import { ArtisanOnboardingModal } from './portal/ArtisanOnboardingModal';
import { BuyerAuthModal } from './auth/BuyerAuthModal';
import { SellerAuthModal } from './auth/SellerAuthModal';
import { LanguageSelectionModal } from './common/LanguageSelectionModal';
import { LocationLanguageModal } from './common/LocationLanguageModal';
import { useTutorial } from './tutorial/TutorialContext';

export function LandingPage() {
  const {
    language,
    setLanguage,
    isLanguageModalOpen,
    openLanguageModal,
    closeLanguageModal,
    initialModalStep,
  } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { startJourney, startDemoJourney, openWelcomeModal } = useTutorial();
  const t = PORTAL_TRANSLATIONS[language];

  // Voice Assistant Hook
  const voice = useVoiceAssistant(language);

  // Active step in the 3-step tutorial
  const [instructionStep, setInstructionStep] = useState(0);

  // Modal State
  const [artisanModalOpen, setArtisanModalOpen] = useState(false);
  const [buyerModalOpen, setBuyerModalOpen] = useState(false);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);

  // Section references for smooth navigation
  const tutorialRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  // Auto-transition to artisan login when state & language are selected
  const handleLanguageSetupComplete = (stateName: string, stateCode: string, langCode: LanguageCode) => {
    closeLanguageModal();
    // Immediately open voice-first artisan seller login
    setTimeout(() => {
      setArtisanModalOpen(true);
    }, 400);
  };

  // Change voice language when user changes interface language
  const handleSelectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    if (voice.isPlaying) {
      voice.stop();
    }
  };

  // Start guided voice tutorial that advances to NEXT automatically
  const handleStartTutorial = () => {
    tutorialRef.current?.scrollIntoView({ behavior: 'smooth' });
    setInstructionStep(0);
    voice.speak(t.step1Speech, language, () => {
      // Advance to step 2 automatically
      setInstructionStep(1);
      voice.speak(t.step2Speech, language, () => {
        // Advance to step 3 automatically
        setInstructionStep(2);
        voice.speak(t.step3Speech, language, () => {
          handleFinishInstructions();
        });
      });
    });
  };

  const handleListenWelcome = () => {
    voice.speak(t.welcomeAudioSpeech, language);
  };

  const handleSpeakInstruction = (text: string, onEnd?: () => void) => {
    voice.speak(text, language, onEnd);
  };

  const handleFinishInstructions = () => {
    roleRef.current?.scrollIntoView({ behavior: 'smooth' });
    voice.speak(t.roleArtisanTitle + '. ' + t.roleArtisanDesc, language);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#262220] selection:bg-[#c85a32] selection:text-white font-sans pb-24 sm:pb-12">
      {/* 1. Header with ShilpSetu (ShilpSetu) branding and language switcher */}
      <PortalHeader
        language={language}
        onSelectLanguage={handleSelectLanguage}
        onTriggerVoice={handleListenWelcome}
        isSpeaking={voice.isPlaying}
        onOpenBuyerSignIn={() => setBuyerModalOpen(true)}
        onOpenSellerSignIn={() => setSellerModalOpen(true)}
      />

      {/* 2. Floating Voice Controller with Audio Waveform */}
      <VoiceFloatingBar
        language={language}
        isPlaying={voice.isPlaying}
        isPaused={voice.isPaused}
        onPlay={voice.resume}
        onPause={voice.pause}
        onReplay={voice.replay}
        onStop={voice.stop}
        currentLabel={voice.currentText ? voice.currentText.slice(0, 48) + '...' : undefined}
      />

      {/* ================================================== */}
      {/* 1. ASYMMETRIC CRAFT HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#faf7f2] via-[#f5efeb]/40 to-[#faf7f2] pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-[#eadfd4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 text-left space-y-5 animate-fade-in-up">
              {/* Subtle Heritage Craft Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[#9c4124] text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>{t.heroBadge}</span>
              </div>

              {/* Large Display Heading in Rozha One */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-[#262220] tracking-tight leading-[1.12] font-['Rozha_One',serif]">
                {t.heroHeading}
              </h1>

              {/* Empathetic Craft Narrative */}
              <p className="text-base sm:text-lg text-[#57534e] font-normal leading-relaxed max-w-xl">
                {t.heroSub}
              </p>

              {/* Dual Primary Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  onClick={() => setArtisanModalOpen(true)}
                  className="h-13 px-8 rounded-xl font-bold text-base text-white bg-[#9c4124] hover:bg-[#83341b] shadow-md shadow-[#9c4124]/20 transition-all duration-200 inline-flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
                >
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={handleStartTutorial}
                  className="h-13 px-6 rounded-xl font-bold text-base text-[#9c4124] bg-white hover:bg-[#fff7ed] border border-[#fed7aa] hover:border-[#9c4124] shadow-2xs transition-all duration-200 inline-flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <Volume2 className="w-4.5 h-4.5 text-[#9c4124] animate-pulse" />
                  <span>{t.voiceTourButton}</span>
                </button>
              </div>

              {/* Artisan Journey & Fast-Track Evaluator Pill */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => openWelcomeModal()}
                  className="h-8 inline-flex items-center gap-2 px-3 rounded-lg bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#9c4124] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <span>🌱</span>
                  <span>{t.startArtisanJourney}</span>
                  <span className="bg-[#9c4124] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    9 Levels
                  </span>
                </button>

                <button
                  onClick={() => startDemoJourney()}
                  className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg bg-white hover:bg-[#faf7f2] border border-[#eadfd4] hover:border-[#9c4124] text-[#78716c] hover:text-[#9c4124] text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="Fast-track to Level 3 for SIH judges & evaluators"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>⚡ 2-Min Demo (Judges)</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Craft Spotlight Card */}
            <div className="lg:col-span-5 animate-scale-in">
              <div className="artisan-card p-5 sm:p-6 rounded-2xl relative overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#eadfd4]">
                {/* Visual Craft Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-[#9c4124] flex items-center justify-center font-bold text-sm shrink-0">
                      🏺
                    </span>
                    <div>
                      <span className="text-xs font-black text-[#262220] block leading-tight">Terracotta Water Pot</span>
                      <span className="text-[10px] text-[#78716c] font-semibold">Gorakhpur Clay Heritage</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] text-[10px] font-extrabold uppercase tracking-wide">
                    GI Certified
                  </span>
                </div>

                {/* Craft Image Simulation */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#f5efeb] mb-4 border border-[#eadfd4] group">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
                    alt="Artisan Terracotta Craft"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Before / After AI Studio Badge */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#262220]/85 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3 h-3 text-[#fbbf24]" />
                    <span>AI Studio Enhanced (4K)</span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[#9c4124] text-[10px] font-black shadow-2xs">
                    0% Commission
                  </div>
                </div>

                {/* Fair-Price Metric Pill */}
                <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#eadfd4] flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-[#78716c] font-bold uppercase block tracking-wider">Verified Fair Wage</span>
                    <span className="text-sm font-black text-[#262220]">₹1,250 <span className="text-[10px] font-bold text-[#15803d] ml-1">✓ Cost-Plus Floor</span></span>
                  </div>
                  <button
                    onClick={handleListenWelcome}
                    className="h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 bg-white border border-[#fed7aa] text-[#9c4124] hover:bg-[#fff7ed] transition-colors cursor-pointer shadow-2xs active:scale-95"
                    title="Listen to welcome audio"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#9c4124]" />
                    <span>Listen</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#78716c] text-center font-medium">
                  Direct artisan payout via instant UPI on every order. Zero middlemen.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. THE 5-STEP CRAFT JOURNEY (Transparent & Simple) */}
      {/* ================================================== */}
      <section
        ref={tutorialRef}
        id="tutorial-section"
        className="py-14 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto"
      >
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff7ed] text-[#9c4124] text-xs font-black uppercase tracking-wider mb-2 border border-[#fed7aa] shadow-2xs">
            <span>Transparent 5-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#262220] mb-2 font-['Rozha_One',serif]">
            {t.instructionSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#57534e] font-medium max-w-xl mx-auto leading-relaxed">
            {t.instructionSectionSub}
          </p>
        </div>

        {/* The 5-Step Interactive Diagram */}
        <CraftJourneyDiagram language={language} />
      </section>

      {/* ================================================== */}
      {/* 3. DEDICATED ARTISAN ONBOARDING GATEWAY           */}
      {/* ================================================== */}
      <section
        ref={roleRef}
        id="role-section"
        className="py-14 sm:py-20 px-4 sm:px-6 bg-[#f7f2ec] border-t border-[#eadfd4]"
      >
        <RoleSelector
          language={language}
          onSelectArtisan={() => setArtisanModalOpen(true)}
          onSpeak={handleSpeakInstruction}
          isSpeaking={voice.isPlaying}
        />
      </section>

      {/* ================================================== */}
      {/* 4. ETHICAL COMMITMENT & TRUST ASSURANCE           */}
      {/* ================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#15803d]" />
            <h3 className="text-base sm:text-lg font-black text-[#262220] font-['Rozha_One',serif]">
              {t.ethicalCommitmentTitle}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed max-w-2xl mx-auto mb-5 font-normal">
            {t.ethicalCommitmentDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold">
            <span className="h-8 inline-flex items-center px-3.5 bg-[#fff7ed] border border-[#fed7aa] text-[#9c4124] rounded-lg shadow-2xs">
              ✓ 0% Platform Commission on Craft Sales
            </span>
            <span className="h-8 inline-flex items-center px-3.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] rounded-lg shadow-2xs">
              ✓ 100% Direct UPI & Bank Settlement
            </span>
            <span className="h-8 inline-flex items-center px-3.5 bg-white border border-[#eadfd4] text-[#262220] rounded-lg shadow-2xs">
              ✓ 12 Regional Indian Languages Supported
            </span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}
      <footer className="bg-white text-stone-600 py-12 px-4 border-t border-[#eadfd4] text-center text-xs">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#9c4124] flex items-center justify-center text-white font-black text-sm shadow-xs">
              SS
            </div>
            <span className="font-extrabold text-[#262220] text-base font-['Rozha_One',serif]">
              ShilpSetu
            </span>
            <span className="text-[#9c4124] text-xs font-bold font-['Noto_Sans_Devanagari',sans-serif]">शिल्पसेतु</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#fdf2e9] text-[#9c4124] border border-[#f8d7c2] rounded uppercase">ShilpSetu</span>
          </div>
          <p className="text-[#57534e] font-medium max-w-lg mx-auto">
            {t.tagline}
          </p>
          <p className="text-[11px] text-[#78716c]">
            {t.footerAccessibility}
          </p>
          <p className="text-[11px] text-[#a8a29e] pt-3 border-t border-stone-100">
            Smart India Hackathon • Made with reverence for India's living cultural craft heritage.
          </p>
        </div>
      </footer>

      {/* ================================================== */}
      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      {/* ================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#eadfd4] px-4 py-2.5 sm:hidden flex items-center justify-between gap-2.5 shadow-lg">
        <button
          onClick={handleListenWelcome}
          className="h-11 px-4 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-[#9c4124] font-bold text-xs inline-flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Volume2 className="w-4 h-4 text-[#9c4124]" />
          <span>{t.voiceListen}</span>
        </button>

        <button
          onClick={() => setArtisanModalOpen(true)}
          className="h-11 flex-1 px-4 rounded-xl font-bold text-sm text-white bg-[#9c4124] hover:bg-[#83341b] shadow-sm inline-flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>{t.primaryCta} →</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* AUTO DETECT LOCATION + RECOMMEND LANGUAGE MODAL */}
      {/* ================================================== */}
      {isLanguageModalOpen && (
        <LocationLanguageModal
          isOpen={isLanguageModalOpen}
          initialMode={initialModalStep === 'language' ? 'language-only' : 'auto'}
          onClose={closeLanguageModal}
          onComplete={handleLanguageSetupComplete}
        />
      )}

      {/* ================================================== */}
      {/* ARTISAN ONBOARDING MODAL */}
      {/* ================================================== */}
      {artisanModalOpen && (
        <ArtisanOnboardingModal
          language={language}
          isOpen={artisanModalOpen}
          onClose={() => setArtisanModalOpen(false)}
          onSpeak={handleSpeakInstruction}
        />
      )}

      {/* ================================================== */}
      {/* BUYER AUTH MODAL (WITH VOICE ASSIST) */}
      {/* ================================================== */}
      {buyerModalOpen && (
        <BuyerAuthModal
          isOpen={buyerModalOpen}
          onClose={() => setBuyerModalOpen(false)}
          defaultTab="signin"
        />
      )}

      {/* ================================================== */}
      {/* SELLER AUTH MODAL (WITH VOICE ASSIST) */}
      {/* ================================================== */}
      {sellerModalOpen && (
        <SellerAuthModal
          isOpen={sellerModalOpen}
          onClose={() => setSellerModalOpen(false)}
          defaultTab="signin"
        />
      )}
    </div>
  );
}
