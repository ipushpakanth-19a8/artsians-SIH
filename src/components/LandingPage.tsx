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
import { BuyerOnboardingModal } from './portal/BuyerOnboardingModal';
import { useTutorial } from './tutorial/TutorialContext';

export function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { startJourney, startDemoJourney, openWelcomeModal } = useTutorial();
  const t = PORTAL_TRANSLATIONS[language];

  // Voice Assistant Hook
  const voice = useVoiceAssistant(language);

  // Active step in the 3-step tutorial
  const [instructionStep, setInstructionStep] = useState(0);

  // Modal States
  const [artisanModalOpen, setArtisanModalOpen] = useState(false);
  const [buyerModalOpen, setBuyerModalOpen] = useState(false);

  // Section references for smooth navigation
  const tutorialRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  // Change voice language when user changes interface language
  const handleSelectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    if (voice.isPlaying) {
      voice.stop();
    }
  };

  const handleStartTutorial = () => {
    tutorialRef.current?.scrollIntoView({ behavior: 'smooth' });
    voice.speak(t.step1Speech, language);
  };

  const handleListenWelcome = () => {
    voice.speak(t.welcomeAudioSpeech, language);
  };

  const handleSpeakInstruction = (text: string) => {
    voice.speak(text, language);
  };

  const handleFinishInstructions = () => {
    roleRef.current?.scrollIntoView({ behavior: 'smooth' });
    voice.speak(t.roleSelectionSpeech, language);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#262220] selection:bg-[#c85a32] selection:text-white font-sans pb-24 sm:pb-12">
      {/* 1. Header with ShilpSetu (KALAtech) branding and language switcher */}
      <PortalHeader
        language={language}
        onSelectLanguage={handleSelectLanguage}
        onTriggerVoice={handleListenWelcome}
        isSpeaking={voice.isPlaying}
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
      {/* 1. WARM HERO SECTION */}
      {/* ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#faf7f2] via-[#f7f1ea] to-[#faf7f2] pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-[#eadfd4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Subtle Craft Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdf2e9] border border-[#f8d7c2] text-[#9c4124] text-xs font-extrabold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c85a32]" />
            <span>Digital Business Assistant for Indian Artisans</span>
          </div>

          {/* Large Hero Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#262220] mb-4 tracking-tight leading-[1.15] font-['Rozha_One',serif] max-w-4xl mx-auto">
            {t.heroHeading}
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-stone-600 font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
            {t.heroSub}
          </p>

          {/* Artisan Journey Interactive Game Banner */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl mx-auto mb-7">
            <button
              onClick={() => openWelcomeModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 border border-amber-300 text-amber-950 text-xs sm:text-sm font-black transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <span className="text-base">🌱</span>
              <span>Start Artisan Journey Game</span>
              <span className="bg-[#9c4124] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                9 Levels
              </span>
            </button>
            <button
              onClick={() => startDemoJourney()}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-amber-300 text-[#9c4124] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
              title="Fast-track to Level 3 for SIH judges & evaluators"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9c4124]" />
              <span>⚡ Try 2-Min Demo (Judges)</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto mb-10">
            <button
              onClick={() => setArtisanModalOpen(true)}
              className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 rounded-2xl font-black text-base text-white bg-[#9c4124] hover:bg-[#83341b] shadow-md shadow-[#9c4124]/20 transition-all flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
            >
              <span>{t.primaryCta}</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => navigate('/buyer')}
              className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl font-bold text-base text-[#262220] bg-white hover:bg-[#f5efeb] border border-[#eadfd4] shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-[#9c4124]" />
              <span>{t.secondaryCta}</span>
            </button>

            <button
              onClick={handleListenWelcome}
              className="w-full sm:w-auto min-h-[52px] px-4 py-3.5 rounded-2xl font-bold text-xs text-[#9c4124] bg-[#fdf2e9] hover:bg-[#fae5d3] border border-[#f8d7c2] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Listen to Instructions in Audio"
            >
              <Volume2 className="w-4 h-4 text-[#9c4124]" />
              <span>{t.voiceListen} 🔊</span>
            </button>
          </div>

          {/* Visual 5-Step Demonstration */}
          <div className="w-full max-w-4xl mx-auto">
            <CraftJourneyDiagram language={language} />
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. SIMPLE 3-STEP INSTRUCTION SECTION */}
      {/* ================================================== */}
      <section
        ref={tutorialRef}
        id="tutorial-section"
        className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2e9] text-[#9c4124] text-xs font-black uppercase tracking-wider mb-2 border border-[#f8d7c2]">
            <span>Visual Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#262220] mb-2 font-['Rozha_One',serif]">
            {t.instructionSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-medium max-w-md mx-auto">
            {t.instructionSectionSub}
          </p>
        </div>

        {/* 3-Step Wizard Component */}
        <InstructionWizard
          language={language}
          currentStep={instructionStep}
          onStepChange={setInstructionStep}
          onFinish={handleFinishInstructions}
          onSpeakInstruction={handleSpeakInstruction}
          isSpeaking={voice.isPlaying}
        />
      </section>

      {/* ================================================== */}
      {/* 3. AI CRAFT ASSISTANT DEMONSTRATION (KALA MITRA) */}
      {/* ================================================== */}
      <section ref={aiRef} className="py-10 sm:py-14 px-4 sm:px-6 max-w-4xl mx-auto">
        <AIProcessingDemo language={language} onSpeak={handleSpeakInstruction} />
      </section>

      {/* ================================================== */}
      {/* 4. ROLE SELECTION (ARTISAN VS BUYER ONLY) */}
      {/* ================================================== */}
      <section
        ref={roleRef}
        id="role-section"
        className="py-14 sm:py-20 px-4 sm:px-6 bg-[#f7f2ec] border-t border-[#eadfd4]"
      >
        <RoleSelector
          language={language}
          onSelectArtisan={() => setArtisanModalOpen(true)}
          onSelectBuyer={() => setBuyerModalOpen(true)}
          onSpeak={handleSpeakInstruction}
          isSpeaking={voice.isPlaying}
        />
      </section>

      {/* ================================================== */}
      {/* 5. ETHICAL COMMITMENT & TRUST ASSURANCE */}
      {/* ================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <span className="text-base font-black text-[#262220]">
              National Artisan Welfare & Fair Market Promise
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto mb-4">
            ShilpSetu (powered by KALAtech) is designed to protect traditional Indian artisans from predatory middleman cuts. All price suggestions follow ethical labor compensation and verifiable Geographical Indication (GI) heritage standards.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-stone-700">
            <span className="px-3 py-1 bg-[#fdf2e9] border border-[#f8d7c2] text-[#9c4124] rounded-full">✓ 0% Platform Commission on Craft Direct Sales</span>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full">✓ Direct UPI & Bank Settlement</span>
            <span className="px-3 py-1 bg-stone-100 border border-stone-200 text-stone-700 rounded-full">✓ Multilingual Audio Voice Support</span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}
      <footer className="bg-white text-stone-600 py-10 px-4 border-t border-[#eadfd4] text-center text-xs">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#9c4124] flex items-center justify-center text-white font-black text-sm">
              SS
            </div>
            <span className="font-extrabold text-[#262220] text-base font-['Rozha_One',serif]">
              ShilpSetu
            </span>
            <span className="text-[#9c4124] text-xs">शिल्पसेतु</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#fdf2e9] text-[#9c4124] border border-[#f8d7c2] rounded uppercase">KALAtech</span>
          </div>
          <p className="text-stone-700 font-medium">
            {t.tagline}
          </p>
          <p className="text-[11px] text-stone-500">
            Engineered for low-digital-literacy artisans • Web Speech API Audio Enabled • English • हिन्दी • తెలుగు
          </p>
          <p className="text-[11px] text-stone-400 pt-2 border-t border-stone-100">
            Smart India Hackathon • Made with reverence for India's living cultural craft heritage.
          </p>
        </div>
      </footer>

      {/* ================================================== */}
      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      {/* ================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#eadfd4] p-2.5 sm:hidden flex items-center justify-between gap-2 shadow-lg">
        <button
          onClick={handleListenWelcome}
          className="min-h-[46px] px-3.5 rounded-xl bg-[#fdf2e9] border border-[#f8d7c2] text-[#9c4124] font-bold text-xs flex items-center gap-1.5 shrink-0"
        >
          <Volume2 className="w-4 h-4 text-[#9c4124]" />
          <span>{t.voiceListen}</span>
        </button>

        <button
          onClick={() => setArtisanModalOpen(true)}
          className="min-h-[46px] flex-1 py-2 px-4 rounded-xl font-black text-sm text-white bg-[#9c4124] shadow-sm flex items-center justify-center gap-2"
        >
          <span>{t.primaryCta} →</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* ONBOARDING MODALS */}
      {/* ================================================== */}
      {artisanModalOpen && (
        <ArtisanOnboardingModal
          language={language}
          isOpen={artisanModalOpen}
          onClose={() => setArtisanModalOpen(false)}
          onSpeak={handleSpeakInstruction}
        />
      )}

      {buyerModalOpen && (
        <BuyerOnboardingModal
          language={language}
          isOpen={buyerModalOpen}
          onClose={() => setBuyerModalOpen(false)}
          onSpeak={handleSpeakInstruction}
        />
      )}
    </div>
  );
}
