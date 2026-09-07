import React, { useState } from 'react';
import {
  X, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Volume2, VolumeX,
  ShieldCheck, HelpCircle, Smartphone, Camera, DollarSign, Layers,
  ShoppingBag, Cpu, ExternalLink
} from 'lucide-react';
import { LanguageCode } from '../types';
import { speakText, stopSpeaking } from '../lib/i18n';

interface EvaluatorTourModalProps {
  language: LanguageCode;
  onClose: () => void;
  onJumpToStep: (stepNumber: number) => void;
}

export const EvaluatorTourModal: React.FC<EvaluatorTourModalProps> = ({
  language,
  onClose,
  onJumpToStep
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const steps = [
    {
      num: 1,
      time: '30s',
      title: 'Low-Literacy Onboarding & Trilingual Switch',
      tag: 'Section 4.1 & 9',
      wow: 'Accessibility & Zero-Friction Entry',
      desc: 'Marginalized craftspeople cannot fill out complex English business forms. Antigravity introduces an icon-first, voice-assisted trilingual onboarding flow (English, Hindi, Telugu) with instant demo phone OTP authorization.',
      actionLabel: 'Open Artisan Onboarding Screen',
      actionCode: 1,
      evaluatorNotes: 'Evaluator Focus: Notice how every action button features large tap targets, audio narration prompts, and zero required English literacy.'
    },
    {
      num: 2,
      time: '60s',
      title: 'Multimodal Photo Capture & Studio Lighting Enhancement',
      tag: 'Section 4.2 & T07',
      wow: 'Before / After Visual Transformation',
      desc: 'Artisans work in dimly lit rural pit-looms and home workshops. The AI image enhancement pipeline automatically balances brightness, normalizes textile contrast curves, and highlights fiber textures with an interactive Before/After toggle.',
      actionLabel: 'Launch Product Creation & Enhancement',
      actionCode: 2,
      evaluatorNotes: 'Evaluator Focus: Tap the Before/After toggle on the enhanced photo. Shows immediate tangible value without requiring photographic equipment.'
    },
    {
      num: 3,
      time: '60s',
      title: 'Multimodal Vision: Image → Structured Catalog JSON',
      tag: 'Section 5 & T08',
      wow: 'Zero Manual Typing Cataloging',
      desc: 'Gemini Multimodal Vision inspects the craft photo to automatically deduce product title, heritage motif description, authentic material composition (e.g. Mulberry Silk, Bell Metal), and dimensions. Voice dictation is enabled for artisans to add spoken stories in their native dialect.',
      actionLabel: 'Inspect AI Catalog Generation',
      actionCode: 3,
      evaluatorNotes: 'Evaluator Focus: Strict Human-in-the-Loop design ("AI assists, human controls"). The artisan reviews and can edit every single field before publication.'
    },
    {
      num: 4,
      time: '45s',
      title: 'Fair Pricing Engine: Cost-Plus Floor + Curated Benchmarks',
      tag: 'Section 5 & 10',
      wow: 'Targeting the Core Economic Pain Point',
      desc: 'Artisans enter 2 simple numbers: Material Cost + Labor Hours. The system calculates a living-wage cost-plus floor, compares against our 40-row curated Indian handicraft market dataset, and provides an AI-explained price range showing the extra profit retained vs middleman exploitation.',
      actionLabel: 'View Smart Pricing Recommendation',
      actionCode: 4,
      evaluatorNotes: 'Evaluator Focus: Evaluators probe where pricing data originates. We provide a transparent curated benchmark dataset (TRIFED, Dastkar, APCO) instead of ungrounded numbers.'
    },
    {
      num: 5,
      time: '30s',
      title: 'Market Linkage Matching Engine',
      tag: 'Section 4.5 & T12',
      wow: 'Surfacing 3 Tailored Buyer Channels',
      desc: 'Matches the craft category, price tier, and GI-tag viability against curated buyer channels (High-end Heritage Boutiques, Export Aggregators, Govt GeM Institutional Procurement, and Direct WhatsApp Catalogs) with match percentage and custom pitch rationale.',
      actionLabel: 'View Market Linkage Channels',
      actionCode: 5,
      evaluatorNotes: 'Evaluator Focus: Solves the "Market Linkage" mandate in the SIH problem title by linking directly to curated institutional and retail routes.'
    },
    {
      num: 6,
      time: '45s',
      title: 'Trilingual Auto-Translation at Publish Time',
      tag: 'Section 9 & T09',
      wow: 'Trilingual Verified Content (EN, HI, TE)',
      desc: 'Upon publishing, the system executes trilingual translation jobs, caching localized titles, descriptions, and tags in a normalized ProductTranslation schema. Buyers across India and abroad can browse seamlessly in their preferred language.',
      actionLabel: 'Publish & Switch to Buyer View',
      actionCode: 6,
      evaluatorNotes: 'Evaluator Focus: Toggle the language switcher between English, Hindi, and Telugu. Translations are stored and served with sub-50ms latency.'
    },
    {
      num: 7,
      time: '30s',
      title: 'Buyer Direct Discovery & Fair-Trade Instant Checkout',
      tag: 'Section 4.6 & T15',
      wow: 'Zero Middleman Deduction Direct Transaction',
      desc: 'Buyers browse the authentic heritage catalog, submit direct wholesale enquiries, or initiate a direct sample checkout with Razorpay test mode. 100% of the artisan asking price is transferred without intermediate trader commissions.',
      actionLabel: 'Browse Buyer Marketplace & Checkout',
      actionCode: 7,
      evaluatorNotes: 'Evaluator Focus: Check the instant order receipt and GI certification stamp. The transaction confirms server-side locked pricing and direct settlement.'
    },
    {
      num: 8,
      time: '30s',
      title: 'Section 16 Evaluator Defense & AI Audit Trail',
      tag: 'Section 16 & AIProcessingResult',
      wow: 'Complete Engineering Transparency',
      desc: 'Dedicated panel inspecting real-time AI invocation telemetry (model names, latencies, raw inputs/responses), the complete 40-row curated market benchmark dataset, and 10 pre-engineered answers to tough evaluator questions.',
      actionLabel: 'Open AI Audit & Evaluator Defense Panel',
      actionCode: 8,
      evaluatorNotes: 'Evaluator Focus: Directly demonstrates reliability, error fallbacks, and rigorous answers to "Where does your data come from?" and "Why AI?".'
    }
  ];

  const currentStepData = steps[activeStep];

  const handleAudioNarration = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const text = `${currentStepData.title}. ${currentStepData.desc}`;
      speakText(text, language);
      setTimeout(() => setIsPlayingAudio(false), 9000);
    }
  };

  const handleStepSelect = (idx: number) => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setActiveStep(idx);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg border border-amber-400/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-['Rozha_One',serif] text-white">
                  5-Minute Hackathon Demo Script & Evaluator Guide
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-extrabold uppercase">
                  Section 15 & 16
                </span>
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                Step-by-step interactive narrative designed specifically for jury evaluation and defense.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Steps Sidebar + Right Step Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-y-auto">
          
          {/* Left Steps Navigation Column */}
          <div className="bg-stone-100 p-4 border-r border-stone-200 space-y-2 overflow-y-auto">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block mb-2 px-1">
              Demo Script Sequence (5–7 Mins)
            </span>
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleStepSelect(idx)}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-2.5 border ${
                  activeStep === idx
                    ? 'bg-amber-600 text-white border-amber-700 shadow-md font-bold'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border-stone-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                  activeStep === idx ? 'bg-white text-amber-800' : 'bg-stone-200 text-stone-600'
                }`}>
                  {s.num}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={activeStep === idx ? 'text-amber-200 font-bold' : 'text-stone-400'}>
                      {s.tag}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      activeStep === idx ? 'bg-amber-800/60 text-white' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {s.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold truncate mt-0.5">
                    {s.title}
                  </h4>
                </div>
              </button>
            ))}
          </div>

          {/* Right Detailed View for Active Step */}
          <div className="md:col-span-2 p-6 flex flex-col justify-between space-y-6 overflow-y-auto bg-stone-50/50">
            <div className="space-y-4">
              
              {/* Top Step Meta */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-black">
                    Step {currentStepData.num} of 8 • {currentStepData.time}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentStepData.wow}</span>
                  </span>
                </div>

                <button
                  onClick={handleAudioNarration}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : 'Listen'}</span>
                </button>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-black font-['Rozha_One',serif] text-stone-900 leading-tight">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {currentStepData.desc}
                </p>
              </div>

              {/* Evaluator Defense Focus Card */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Judges / Evaluators Look For:</span>
                </span>
                <p className="text-xs text-amber-950 font-medium leading-normal">
                  {currentStepData.evaluatorNotes}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Jump to Step + Next/Prev Buttons */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <button
                onClick={() => {
                  onJumpToStep(currentStepData.actionCode);
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-900/15 flex items-center justify-center gap-2 text-sm transition-all"
              >
                <span>{currentStepData.actionLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-xs">
                <button
                  disabled={activeStep === 0}
                  onClick={() => handleStepSelect(activeStep - 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-300 font-bold text-stone-700 disabled:opacity-40 hover:bg-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="text-stone-400 font-semibold text-xs">
                  {activeStep + 1} / {steps.length}
                </span>

                <button
                  disabled={activeStep === steps.length - 1}
                  onClick={() => handleStepSelect(activeStep + 1)}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 font-bold text-white disabled:opacity-40 flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
