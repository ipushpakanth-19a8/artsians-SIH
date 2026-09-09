import React from 'react';
import { Camera, Bot, IndianRupee, ArrowRight, ArrowLeft, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';

interface InstructionWizardProps {
  language: LanguageCode;
  currentStep: number; // 0, 1, 2
  onStepChange: (step: number) => void;
  onFinish: () => void;
  onSpeakInstruction: (text: string) => void;
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
                <p className="text-xs font-bold text-stone-900">KALA Mitra AI</p>
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

  const current = steps[currentStep];

  return (
    <section aria-labelledby="simple-tutorial-heading" className="w-full max-w-2xl mx-auto">
      {/* Container Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-amber-200/80 shadow-xl shadow-amber-950/5 relative">
        {/* Header with Step Badge & Voice Listen Trigger */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-wider uppercase border border-amber-300">
              {current.badge}
            </span>
            <span className="text-xs text-stone-500 font-semibold">
              {currentStep + 1} of 3
            </span>
          </div>

          {/* Voice Instruction Button */}
          <button
            onClick={() => onSpeakInstruction(current.speech)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isSpeaking
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md animate-pulse'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
            title="Listen to this step aloud"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>{t.voiceListen} 🔊</span>
          </button>
        </div>

        {/* Big Step Title & Visual Description */}
        <div className="text-center mb-6">
          <h2 id="simple-tutorial-heading" className="text-2xl sm:text-3xl font-black text-stone-900 mb-2 leading-tight flex items-center justify-center gap-2">
            <span>{current.title}</span>
          </h2>
          <p className="text-lg sm:text-xl font-bold text-stone-700 max-w-lg mx-auto leading-snug">
            "{current.desc}"
          </p>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-md mx-auto">
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
                  ? 'w-7 h-2.5 bg-gradient-to-r from-amber-600 to-orange-600 shadow-xs'
                  : 'w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Go to Step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Controls: Prev, Next or Finish */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.prevStep}</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => onStepChange(currentStep + 1)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl font-black text-base text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-98"
            >
              <span>{t.nextStep}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="min-h-[48px] px-6 py-2.5 rounded-xl font-black text-base text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-98"
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
