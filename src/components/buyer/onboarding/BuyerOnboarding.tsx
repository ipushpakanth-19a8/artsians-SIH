import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Volume2, VolumeX, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useLanguage } from '../../../lib/LanguageContext';
import { LanguageCode } from '../../../types';
import { VoiceGuide } from './VoiceGuide';
import { TutorialStep, OnboardingPhase } from './TutorialStep';

interface StepConfig {
  phase: OnboardingPhase;
  stepIndex: number;
  titleEn: string;
  titleHi: string;
  titleTe: string;
  voiceEn: string;
  voiceHi: string;
  voiceTe: string;
  durationMs: number;
}

const ONBOARDING_STEPS: StepConfig[] = [
  {
    phase: 'welcome',
    stepIndex: 0,
    titleEn: 'Welcome to ShilpSetu KALAtech',
    titleHi: 'शिल्पसेतु KALAtech में आपका स्वागत है',
    titleTe: 'శిల్పసేతు KALAtech కు స్వాగతం',
    voiceEn:
      'Welcome to KALAtech. Connect directly with authentic heritage craftspeople across India.',
    voiceHi:
      'KALAtech में आपका स्वागत है। यह मंच आपको सीधे पूरे भारत के वास्तविक पारंपरिक शिल्पकारों से जोड़ता है।',
    voiceTe:
      'KALAtech కు స్వాగతం. ఈ వేదిక మిమ్మల్ని భారతదేశంలోని నిజమైన సాంప్రదాయ కళాకారులతో నేరుగా కలుపుతుంది.',
    durationMs: 5500,
  },
  {
    phase: 'step1',
    stepIndex: 1,
    titleEn: '100% Certified Authentic Crafts',
    titleHi: '100% प्रमाणित पारंपरिक हस्तशिल्प',
    titleTe: '100% ధృవీకరించబడిన ప్రామాణిక చేతిపనులు',
    voiceEn:
      'Every product is handcrafted by verified artisans, preserving generations of cultural heritage.',
    voiceHi:
      'प्रत्येक उत्पाद सत्यापित कारीगरों द्वारा हस्तनिर्मित है, जो पीढ़ियों की सांस्कृतिक धरोहर को संजोता है।',
    voiceTe:
      'ప్రతి ఉత్పత్తి ధృవీకరించబడిన కళాకారులచే చేతితో తయారు చేయబడింది, తరతరాల సాంస్కృతిక వారసత్వాన్ని కాపాడుతుంది.',
    durationMs: 5000,
  },
  {
    phase: 'step2',
    stepIndex: 2,
    titleEn: 'Explore Heritage Crafts',
    titleHi: 'हस्तशिल्प और कलाकृतियां खोजें',
    titleTe: 'చేతిపనులను అన్వేషించండి',
    voiceEn:
      'You can explore handmade products by category, search by craft type, or discover master artisans.',
    voiceHi:
      'आप श्रेणियों के आधार पर हस्तनिर्मित उत्पादों को देख सकते हैं, शिल्प प्रकार से खोज सकते हैं, या कारीगरों को खोज सकते हैं।',
    voiceTe:
      'మీరు వర్గం వారీగా చేతితో తయారు చేసిన ఉత్పత్తులను చూడవచ్చు, శిల్ప రకం ద్వారా శోధించవచ్చు లేదా కళాకారులను కనుగొనవచ్చు.',
    durationMs: 5500,
  },
  {
    phase: 'step3',
    stepIndex: 3,
    titleEn: 'Transparent Artisan Stories & Pricing',
    titleHi: 'कारीगर की कहानी और उचित मूल्य',
    titleTe: 'కళాకారుడి కథ మరియు సరసమైన ధర',
    voiceEn:
      'Open any product to see the artisan background, materials used, fair price breakdown, and authentic GI tags.',
    voiceHi:
      'किसी भी उत्पाद को खोलकर कारीगर की पृष्ठभूमि, उपयोग की गई सामग्री, उचित मूल्य विवरण और प्रामाणिक जीआई टैग देखें।',
    voiceTe:
      'కళాకారుడి నేపథ్యం, ఉపయోగించిన పదార్థాలు, సరసమైన ధర వివరాలు మరియు జిఐ ట్యాగ్‌లను చూడటానికి ఏదైనా ఉత్పత్తిని తెరవండి.',
    durationMs: 6000,
  },
  {
    phase: 'step4',
    stepIndex: 4,
    titleEn: 'Direct Support & Easy Purchase',
    titleHi: 'सीधी खरीदारी और कारीगर सहायता',
    titleTe: 'నేరుగా కొనుగోలు మరియు సహాయం',
    voiceEn:
      'When you find a craft you love, add it to your cart and checkout with secure payments supporting artisans directly.',
    voiceHi:
      'जब आपको अपनी पसंद का शिल्प मिले, तो उसे कार्ट में जोड़ें और सुरक्षित भुगतान के साथ सीधे कारीगरों का समर्थन करें।',
    voiceTe:
      'మీకు నచ్చిన చేతిపని దొరికినప్పుడు, దానిని కార్ట్‌కు జోడించి, నేరుగా కళాకారులకు మద్దతు ఇచ్చే సురక్షిత చెల్లింపులతో కొనుగోలు చేయండి.',
    durationMs: 6000,
  },
  {
    phase: 'step5',
    stepIndex: 5,
    titleEn: 'Track Delivery to Your Doorstep',
    titleHi: 'ऑर्डर और डिलीवरी ट्रैक करें',
    titleTe: 'ఆర్డర్ మరియు డెలివరీ ట్రాక్ చేయండి',
    voiceEn:
      'Track your handcrafted order step by step from the artisan village workshop directly to your home.',
    voiceHi:
      'कारीगर के गांव की कार्यशाला से सीधे आपके घर तक अपने हस्तनिर्मित ऑर्डर को चरण-दर-चरण ट्रैक करें।',
    voiceTe:
      'కళాకారుడి గ్రామం నుండి నేరుగా మీ ఇంటికి వచ్చే మీ ఆర్డర్‌ను దశలవారీగా ట్రాక్ చేయండి.',
    durationMs: 5500,
  },
  {
    phase: 'voice_assistant',
    stepIndex: 6,
    titleEn: 'Voice Search & Navigation',
    titleHi: 'आवाज़ से खोज और नेविगेशन',
    titleTe: 'వాయిస్ శోధన మరియు నావిగేషన్',
    voiceEn:
      'You can also control the app with your voice. Try saying, show me blue pottery or Pochampally silk sarees.',
    voiceHi:
      'आप अपनी आवाज़ से भी ऐप को नियंत्रित कर सकते हैं। कहें, मुझे ब्लू पॉटरी या पोचमपल्ली सिल्क साड़ियां दिखाएं।',
    voiceTe:
      'మీరు మీ వాయిస్‌తో కూడా యాప్‌ని నియంత్రించవచ్చు. బ్లూ పాట్టీ లేదా పోచంపల్లి పట్టు చీరలు చూపించమని చెప్పండి.',
    durationMs: 6000,
  },
  {
    phase: 'ready',
    stepIndex: 7,
    titleEn: "You're All Set!",
    titleHi: 'आप पूरी तरह तैयार हैं!',
    titleTe: 'మీరు సిద్ధంగా ఉన్నారు!',
    voiceEn:
      "You're all set. Enjoy exploring genuine Indian handicrafts and supporting rural artisans.",
    voiceHi:
      'आप पूरी तरह तैयार हैं। वास्तविक भारतीय हस्तशिल्प की खोज और ग्रामीण कारीगरों का समर्थन करने का आनंद लें।',
    voiceTe:
      'మీరు సిద్ధంగా ఉన్నారు. నిజమైన భారతీయ చేతిపనులను అన్వేషించండి మరియు కళాకారులకు మద్దతు ఇవ్వండి.',
    durationMs: 3500,
  },
];

interface BuyerOnboardingProps {
  onComplete?: () => void;
}

export const BuyerOnboarding: React.FC<BuyerOnboardingProps> = ({ onComplete }) => {
  const { user, updateBuyerOnboarding } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  const getTitle = (s: StepConfig) =>
    language === 'hi' ? s.titleHi : language === 'te' ? s.titleTe : s.titleEn;

  const getVoiceText = (s: StepConfig) =>
    language === 'hi' ? s.voiceHi : language === 'te' ? s.voiceTe : s.voiceEn;

  // Complete and persist to database
  const handleFinish = useCallback(async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);

    try {
      await updateBuyerOnboarding(true);
    } catch (err) {
      console.error('Error saving onboarding state:', err);
    }

    setIsVisible(false);
    onComplete?.();
  }, [isFinishing, updateBuyerOnboarding, onComplete]);

  // Handle Skip
  const handleSkip = useCallback(() => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    handleFinish();
  }, [handleFinish]);

  // Handle Next
  const handleNext = useCallback(() => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStepIndex, handleFinish]);

  // Handle Prev
  const handlePrev = useCallback(() => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // When voice finishes speaking, automatically advance after a tiny breather
  const handleSpeechEnd = useCallback(() => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    stepTimerRef.current = setTimeout(() => {
      handleNext();
    }, 600);
  }, [handleNext]);

  // Fallback progression timer in case voice is muted or blocked
  useEffect(() => {
    if (!isVisible || isFinishing) return;

    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
    }

    stepTimerRef.current = setTimeout(() => {
      handleNext();
    }, currentStep.durationMs + 1500);

    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, [currentStepIndex, currentStep.durationMs, isVisible, isFinishing, handleNext]);

  // Keyboard accessibility: Escape to skip, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip, handleNext, handlePrev]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Buyer Voice Onboarding Tutorial"
      ref={modalRef}
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-900 to-black text-white rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center">
        {/* Top bar with branding, language pills, & Skip button */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white font-black text-xs">
              SS
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                {language === 'hi' ? 'खरीदार गाइड' : language === 'te' ? 'కొనుగోలుదారు టూర్' : 'Buyer Voice Tour'}
              </span>
              <span className="text-[10px] text-stone-400">
                {currentStepIndex + 1} / {ONBOARDING_STEPS.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    language === l ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
            </div>

            <button
              onClick={handleSkip}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Skip onboarding tutorial"
            >
              <span>{language === 'hi' ? 'छोड़ें' : language === 'te' ? 'వదిలివేయండి' : 'Skip'}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="w-full flex items-center justify-center gap-1.5 py-2">
          {ONBOARDING_STEPS.map((step, idx) => (
            <button
              key={step.phase}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-7 bg-amber-400'
                  : idx < currentStepIndex
                  ? 'w-2 bg-amber-600/70'
                  : 'w-2 bg-white/20'
              }`}
              title={`Step ${idx + 1}: ${getTitle(step)}`}
            />
          ))}
        </div>

        {/* Current Tutorial Step Presentation */}
        <div className="w-full py-2">
          <TutorialStep
            phase={currentStep.phase}
            stepIndex={currentStep.stepIndex}
            title={getTitle(currentStep)}
            voiceText={getVoiceText(currentStep)}
            durationMs={currentStep.durationMs}
          />
        </div>

        {/* Automatic Voice Narration Engine */}
        <div className="w-full pt-2 flex flex-col items-center">
          <VoiceGuide
            spokenText={getVoiceText(currentStep)}
            language={language}
            onSpeechEnd={handleSpeechEnd}
          />
        </div>

        {/* Step Navigation Controls */}
        <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 transition-colors ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-stone-500'
                : 'text-stone-300 hover:text-white hover:bg-white/10 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पिछला' : language === 'te' ? 'మునుపటి' : 'Previous'}</span>
          </button>

          <div className="text-[11px] text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>
              {currentStepIndex === ONBOARDING_STEPS.length - 1
                ? (language === 'hi' ? 'ऐप में प्रवेश...' : 'Entering buyer portal...')
                : (language === 'hi' ? 'स्वतः आगे बढ़ रहा है...' : 'Auto-advancing with voice...')}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all cursor-pointer"
          >
            <span>
              {currentStepIndex === ONBOARDING_STEPS.length - 1
                ? (language === 'hi' ? 'आरंभ करें' : 'Get Started')
                : (language === 'hi' ? 'अगला' : 'Next')}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
