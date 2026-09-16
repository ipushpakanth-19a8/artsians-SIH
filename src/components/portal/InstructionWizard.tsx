import React, { useState, useEffect, useRef } from 'react';
import { Camera, Bot, IndianRupee, ArrowRight, ArrowLeft, Volume2, Sparkles, CheckCircle2, Play, Pause, FastForward } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';

interface InstructionWizardProps {
  language: LanguageCode;
  currentStep: number; // 0, 1, 2
  onStepChange: (step: number) => void;
  onFinish: () => void;
  onSpeakInstruction: (text: string, onEnd?: () => void) => void;
  isSpeaking?: boolean;
}

export const InstructionWizard: React.FC<InstructionWizardProps> = ({
  language,
  currentStep,
  onStepChange,
  onFinish,
  onSpeakInstruction,
  isSpeaking = false,
}) => {
  const t = PORTAL_TRANSLATIONS[language];

  const steps = [
    {
      stepNumber: 1,
      badge: t.step1Badge,
      title: t.step1Title,
      desc: t.step1Desc,
      detail: t.step1Detail,
      speech: t.step1Speech,
      icon: Camera,
      iconBg: 'from-amber-500 to-orange-600',
      illustration: (
        <div className="relative w-full max-w-sm mx-auto h-48 sm:h-56 bg-gradient-to-b from-amber-100 to-orange-50 rounded-2xl border-2 border-amber-300/80 p-4 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          {/* Subtle phone camera preview mockup */}
          <div className="w-40 sm:w-44 h-36 bg-white rounded-xl shadow-md border-2 border-amber-400 p-2 flex flex-col items-center justify-between relative">
            <div className="w-full flex justify-between items-center text-[10px] text-stone-500 font-bold px-1">
              <span>PHOTO MODE</span>
              <span className="text-amber-600 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> AUTO-FOCUS
              </span>
            </div>
            {/* Clay pot / handloom preview */}
            <div className="w-20 h-20 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shadow-xs">
              🏺
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md -mb-4 border-2 border-white">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs font-black text-amber-950 bg-amber-200/90 px-3 py-1 rounded-full border border-amber-300">
              📸 Point & Snap with any phone
            </span>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 2,
      badge: t.step2Badge,
      title: t.step2Title,
      desc: t.step2Desc,
      detail: t.step2Detail,
      speech: t.step2Speech,
      icon: Bot,
      iconBg: 'from-indigo-600 to-purple-700',
      illustration: (
        <div className="relative w-full max-w-sm mx-auto h-48 sm:h-56 bg-gradient-to-b from-indigo-50 to-amber-50/50 rounded-2xl border-2 border-indigo-200 p-4 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          <div className="w-full max-w-[280px] bg-white rounded-xl shadow-md border border-indigo-200 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-900">ShilpSetu AI</p>
                <p className="text-[10px] text-indigo-700 font-semibold">Writing Craft Story & GI Origin...</p>
              </div>
            </div>
            <div className="bg-stone-50 rounded-lg p-2 border border-stone-200 text-[11px] text-stone-700 font-medium">
              ✨ <span className="font-bold text-stone-900">100% Handspun Silk</span> • Natural Indigo Dye • 18 Labor Hours
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-600 pt-1 border-t border-stone-100 font-bold">
              <span>English • हिन्दी • తెలుగు</span>
              <span className="text-emerald-700 font-extrabold">✓ Ready to Sell</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 3,
      badge: t.step3Badge,
      title: t.step3Title,
      desc: t.step3Desc,
      detail: t.step3Detail,
      speech: t.step3Speech,
      icon: IndianRupee,
      iconBg: 'from-emerald-600 to-teal-700',
      illustration: (
        <div className="relative w-full max-w-sm mx-auto h-48 sm:h-56 bg-gradient-to-b from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-4 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          <div className="w-full max-w-[280px] bg-white rounded-xl shadow-md border border-emerald-200 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800">Fair Price Calculator</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                +60% Artisan Gain
              </span>
            </div>
            <div className="flex items-baseline justify-between bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
              <div>
                <p className="text-[10px] text-stone-500 font-semibold">Your Fair Price</p>
                <p className="text-lg font-black text-emerald-800">₹1,850</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-stone-400 line-through">Middleman ₹900</p>
                <p className="text-[11px] font-bold text-stone-800">Direct to Buyer</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-stone-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant WhatsApp & printed receipt ready</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop auto play when unmounting
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, []);

  const playStepWithAutoAdvance = (stepIdx: number) => {
    const stepData = steps[stepIdx];
    if (!stepData) return;

    onSpeakInstruction(stepData.speech, () => {
      // When voice ends, wait a brief pause then automatically advance
      autoPlayTimerRef.current = setTimeout(() => {
        if (stepIdx < steps.length - 1) {
          onStepChange(stepIdx + 1);
          playStepWithAutoAdvance(stepIdx + 1);
        } else {
          setIsAutoPlaying(false);
          onFinish();
        }
      }, 900);
    });
  };

  const handleStartAutoPlay = () => {
    setIsAutoPlaying(true);
    playStepWithAutoAdvance(currentStep);
  };

  const handleStopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
  };

  const current = steps[currentStep];

  return (
    <section aria-labelledby="simple-tutorial-heading" className="w-full max-w-2xl mx-auto">
      {/* Container Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#eadfd4] shadow-[0_4px_20px_-4px_rgba(38,34,32,0.06)] relative animate-fade-in-up">
        {/* Header with Step Badge, Auto-Play Tour Trigger & Voice Listen */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#eadfd4]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#fff7ed] text-[#9c4124] text-xs font-black tracking-wider uppercase border border-[#fed7aa] shadow-2xs">
              {current.badge}
            </span>
            <span className="text-xs text-[#78716c] font-semibold">
              {currentStep + 1} of 3
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Automatic Voice Guided Tour Button */}
            <button
              onClick={isAutoPlaying ? handleStopAutoPlay : handleStartAutoPlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isAutoPlaying
                  ? 'bg-[#9c4124] text-white border-[#7c2d12] animate-pulse'
                  : 'bg-[#faf7f2] hover:bg-white text-[#9c4124] border-[#fed7aa] hover:border-[#9c4124]'
              }`}
              title="Sit back: tutorial will speak and advance automatically"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Tour</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Auto-Tour (Voice)</span>
                </>
              )}
            </button>

            {/* Manual Voice Instruction Button */}
            <button
              onClick={() => {
                // If clicked, speak and auto-advance to next step when finished
                onSpeakInstruction(current.speech, () => {
                  if (currentStep < steps.length - 1) {
                    onStepChange(currentStep + 1);
                  } else {
                    onFinish();
                  }
                });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-[#fff7ed] text-[#9c4124] border-[#fed7aa] shadow-2xs animate-pulse'
                  : 'bg-white text-[#9c4124] border-[#eadfd4] hover:bg-[#faf7f2] hover:border-[#c85a32]'
              }`}
              title="Listen to this step with voice guidance"
            >
              <Volume2 className="w-4 h-4 text-[#9c4124]" />
              <span>{t.voiceListen}</span>
            </button>
          </div>
        </div>

        {/* Status banner when auto-playing */}
        {isAutoPlaying && (
          <div className="mb-4 py-1.5 px-3 bg-[#fff7ed] border border-[#fed7aa] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#9c4124] animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5 text-[#d97706] animate-spin" />
            <span>Voice tutorial active • Steps advance to next automatically</span>
          </div>
        )}

        {/* Big Step Title & Visual Description */}
        <div className="text-center mb-6">
          <h2 id="simple-tutorial-heading" className="text-2xl sm:text-3xl font-black text-[#262220] mb-2 leading-tight flex items-center justify-center gap-2 font-['Rozha_One',serif]">
            <span>{current.title}</span>
          </h2>
          <p className="text-lg sm:text-xl font-bold text-[#3d3835] max-w-lg mx-auto leading-snug">
            "{current.desc}"
          </p>
          <p className="text-xs sm:text-sm text-[#78716c] mt-1.5 max-w-md mx-auto">
            {current.detail}
          </p>
        </div>

        {/* Large Illustration / Visual Preview */}
        <div className="mb-6">{current.illustration}</div>

        {/* Progress Indicator Dots ● ○ ○ */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onStepChange(idx)}
              className={`transition-all rounded-full ${
                currentStep === idx
                  ? 'w-7 h-2.5 bg-[#9c4124] shadow-2xs'
                  : 'w-2.5 h-2.5 bg-[#eadfd4] hover:bg-[#dccbc0]'
              }`}
              aria-label={`Go to Step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Controls: Prev, Next or Finish */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#eadfd4]">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-[#57534e] hover:bg-[#faf7f2] border border-[#eadfd4]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.prevStep}</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => onStepChange(currentStep + 1)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl font-bold text-base text-white bg-[#9c4124] hover:bg-[#83341b] shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>{t.nextStep}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="min-h-[48px] px-6 py-2.5 rounded-xl font-bold text-base text-white bg-[#15803d] hover:bg-[#166534] shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>{t.finishInstructions}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
