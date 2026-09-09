import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2, Sparkles, ChevronDown, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
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

export function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 selection:bg-amber-500 selection:text-stone-950 font-sans pb-24 sm:pb-12">
      {/* 1. Header with KALAtech branding, tagline, and prominent language switcher */}
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

      {/* User already signed in shortcut banner */}
      {user && (
        <div className="bg-amber-100/90 border-b border-amber-300 px-4 py-2 text-center text-xs font-bold text-amber-950 flex items-center justify-center gap-2">
          <span>Active Session: {user.name} ({role === 'seller' ? 'Artisan' : 'Buyer'})</span>
          <button
            onClick={() => navigate(role === 'seller' ? '/seller' : '/buyer')}
            className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-all ml-1 shadow-xs"
          >
            Go to {role === 'seller' ? 'Artisan Studio' : 'Marketplace'} →
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. LANDING / WELCOME SCREEN HERO */}
      {/* ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/90 text-stone-100 pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-amber-900/40">
        {/* Subtle decorative Indian craft motifs */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'0.5\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* SIH / National Innovation Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black mb-6 tracking-wide shadow-lg shadow-amber-950/50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Smart India Hackathon • Indian Artisan Ecosystem</span>
          </div>

          {/* Large Hero Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-amber-50 mb-4 tracking-tight leading-[1.15] font-['Rozha_One',serif] max-w-4xl mx-auto">
            {t.heroHeading}
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-amber-100/90 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.heroSub}
          </p>

          {/* Primary CTA & Secondary Voice CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-12">
            <button
              onClick={handleStartTutorial}
              className="w-full sm:w-auto min-h-[54px] px-8 py-4 rounded-2xl font-black text-lg text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-3 active:scale-98"
            >
              <span>{t.primaryCta}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleListenWelcome}
              className="w-full sm:w-auto min-h-[54px] px-6 py-4 rounded-2xl font-bold text-base text-amber-200 bg-stone-800/90 hover:bg-stone-800 border-2 border-amber-500/40 hover:border-amber-400 shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-98"
            >
              <Volume2 className="w-5 h-5 text-amber-400" />
              <span>{t.secondaryCta}</span>
            </button>
          </div>

          {/* Hero Visual: Subtle Artisan → Handicraft → AI → Buyer Illustration */}
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
        className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider mb-2 border border-amber-200">
            <span>Visual Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mb-2 font-['Rozha_One',serif]">
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
      {/* 4. ROLE SELECTION (ARTISAN VS BUYER ONLY — ZERO ADMIN) */}
      {/* ================================================== */}
      <section
        ref={roleRef}
        id="role-section"
        className="py-14 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-stone-100/70 via-amber-50/40 to-stone-50 border-t border-stone-200"
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="text-base font-black text-stone-900">
              National Artisan Welfare & Fair Market Promise
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto mb-4">
            KALAtech is designed to protect traditional Indian artisans from predatory middleman cuts. All price suggestions follow ethical labor compensation and verifiable Geographical Indication (GI) heritage standards.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-stone-700">
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">✓ 0% Platform Commission on Craft Direct Sales</span>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">✓ Direct UPI & Bank Settlement</span>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full">✓ Multilingual Audio Voice Support</span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-4 border-t border-stone-800 text-center text-xs">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center text-white font-black text-sm">
              KT
            </div>
            <span className="font-extrabold text-white text-base font-['Rozha_One',serif]">
              KALAtech
            </span>
            <span className="text-amber-400 text-xs">कलाTech</span>
          </div>
          <p className="text-stone-300 font-medium">
            {t.tagline}
          </p>
          <p className="text-[11px] text-stone-500">
            Engineered for low-digital-literacy artisans • Web Speech API Audio Enabled • English • हिन्दी • తెలుగు
          </p>
          <p className="text-[11px] text-stone-600 pt-2 border-t border-stone-800/80">
            Smart India Hackathon • Made with reverence for India's living cultural craft heritage.
          </p>
        </div>
      </footer>

      {/* ================================================== */}
      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      {/* ================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-stone-900/95 backdrop-blur-md border-t border-amber-500/30 p-2.5 sm:hidden flex items-center justify-between gap-2 shadow-2xl">
        <button
          onClick={handleListenWelcome}
          className="min-h-[46px] px-3.5 rounded-xl bg-stone-800 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 shrink-0"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>{t.voiceListen}</span>
        </button>

        <button
          onClick={() => {
            roleRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="min-h-[46px] flex-1 py-2 px-4 rounded-xl font-black text-sm text-stone-950 bg-gradient-to-r from-amber-400 to-orange-500 shadow-md flex items-center justify-center gap-2"
        >
          <span>Choose Role →</span>
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
