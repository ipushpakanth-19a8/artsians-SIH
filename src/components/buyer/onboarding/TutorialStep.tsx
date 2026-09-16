import React from 'react';
import { 
  Sparkles, 
  Search, 
  Layers, 
  ShoppingBag, 
  ShoppingCart, 
  Truck, 
  Mic, 
  CheckCircle2, 
  Compass,
  Tag,
  ShieldCheck
} from 'lucide-react';

export type OnboardingPhase =
  | 'welcome'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'voice_assistant'
  | 'ready';

interface TutorialStepProps {
  phase: OnboardingPhase;
  stepIndex: number; // 1 to 5 for main tutorial, 0 for welcome, 6 for voice, 7 for ready
  title: string;
  voiceText: string;
  durationMs: number;
}

export const TutorialStep: React.FC<TutorialStepProps> = ({
  phase,
  stepIndex,
  title,
  voiceText,
  durationMs,
}) => {
  // Render illustration / interactive mockup according to phase
  const renderVisual = () => {
    switch (phase) {
      case 'welcome':
        return (
          <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white shadow-xl mb-4 border border-amber-400/40 transform hover:scale-105 transition-transform">
              <span className="text-3xl font-black font-['Rozha_One',serif]">SS</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-widest mb-1">
              <span>Authentic</span>
              <span>•</span>
              <span>Handmade</span>
              <span>•</span>
              <span>India</span>
            </div>
            <p className="text-stone-300 text-xs text-center max-w-xs font-medium">
              Connecting heritage craftspeople directly to discerning buyers worldwide.
            </p>
          </div>
        );

      case 'step1': // Welcome to ShilpSetu
        return (
          <div className="grid grid-cols-3 gap-3 p-4 bg-stone-900/60 rounded-2xl border border-amber-500/25">
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/10 text-center">
              <span className="text-2xl mb-1">🧵</span>
              <span className="text-[11px] font-bold text-amber-200">Handloom</span>
              <span className="text-[9px] text-stone-400">Pochampally Ikat</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/10 text-center">
              <span className="text-2xl mb-1">🏺</span>
              <span className="text-[11px] font-bold text-amber-200">Blue Pottery</span>
              <span className="text-[9px] text-stone-400">Jaipur Heritage</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/10 text-center">
              <span className="text-2xl mb-1">🎨</span>
              <span className="text-[11px] font-bold text-amber-200">Madhubani</span>
              <span className="text-[9px] text-stone-400">Folk Art</span>
            </div>
          </div>
        );

      case 'step2': // Explore Handmade Products
        return (
          <div className="p-4 bg-stone-900/60 rounded-2xl border border-amber-500/25 space-y-3">
            {/* Mock search input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-white/15 text-stone-300 text-xs">
              <Search className="w-4 h-4 text-amber-400" />
              <span className="text-stone-400">Search "Silk Sarees", "Clay Terracotta"...</span>
            </div>
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['All Crafts', 'Weaving', 'Pottery', 'Paintings', 'Metalcraft'].map((cat, idx) => (
                <span
                  key={cat}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    idx === 0 ? 'bg-amber-600 text-white' : 'bg-white/5 text-stone-300 border border-white/10'
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        );

      case 'step3': // View Product Details
        return (
          <div className="p-4 bg-stone-900/60 rounded-2xl border border-amber-500/25 flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-700/50 to-orange-800/50 flex items-center justify-center text-3xl shrink-0 border border-amber-500/30">
              🏺
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  GI Certified
                </span>
                <span className="text-[10px] text-stone-400">Jaipur, Rajasthan</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">Jaipur Handcrafted Blue Pottery Vase</h4>
              <p className="text-[10px] text-stone-300 truncate">By Master Artisan Rameshwar Rao • 100% Quartz Mineral</p>
              <p className="text-xs font-black text-amber-400">₹1,450 <span className="text-[9px] text-stone-400 font-normal">Direct Fair Price</span></p>
            </div>
          </div>
        );

      case 'step4': // Add to Cart and Buy
        return (
          <div className="p-4 bg-stone-900/60 rounded-2xl border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Cart Total (Direct Artisan)</span>
              </span>
              <span className="font-bold text-white">₹1,450</span>
            </div>
            <div className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md">
              <ShieldCheck className="w-4 h-4" />
              <span>Continue to Safe Checkout</span>
            </div>
          </div>
        );

      case 'step5': // Track Your Order
        return (
          <div className="p-4 bg-stone-900/60 rounded-2xl border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-200">
              <span>Order #SS-9821</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> In Transit
              </span>
            </div>
            {/* Step progress bar */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              <div className="h-1.5 bg-emerald-500 rounded-full" />
              <div className="h-1.5 bg-emerald-500 rounded-full" />
              <div className="h-1.5 bg-emerald-500 animate-pulse rounded-full" />
              <div className="h-1.5 bg-white/20 rounded-full" />
            </div>
            <div className="flex justify-between text-[9px] text-stone-400">
              <span>Placed</span>
              <span>Packed by Artisan</span>
              <span className="text-amber-300 font-semibold">Dispatched</span>
              <span>Delivered</span>
            </div>
          </div>
        );

      case 'voice_assistant': // Voice Assistant Introduction
        return (
          <div className="p-5 bg-gradient-to-b from-amber-600/20 to-orange-700/20 rounded-2xl border border-amber-400/40 flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                <Mic className="w-7 h-7" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-amber-400/30 animate-ping pointer-events-none" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                Live Voice Navigation Feature
              </p>
              <div className="px-3 py-2 bg-stone-900/80 rounded-xl border border-amber-400/30 text-amber-100 text-xs font-mono">
                "Show me handmade pottery under one thousand rupees"
              </div>
              <p className="text-[10px] text-stone-400">
                (Visual demonstration only — no command will run now)
              </p>
            </div>
          </div>
        );

      case 'ready': // You're ready!
        return (
          <div className="p-6 bg-gradient-to-b from-emerald-600/20 to-teal-700/20 rounded-2xl border border-emerald-400/40 flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform scale-110">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-black text-white font-['Rozha_One',serif]">
              You're all set!
            </h3>
            <p className="text-xs text-emerald-200 max-w-xs font-medium">
              Entering the ShilpSetu Crafts Studio now...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Visual Progress Indicator (Step 9) for the 5 tutorial steps */}
      {stepIndex >= 1 && stepIndex <= 5 && (
        <div
          className="flex items-center gap-2"
          role="progressbar"
          aria-valuenow={stepIndex}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-label={`Tutorial step ${stepIndex} of 5`}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                i === stepIndex
                  ? 'w-6 h-2 bg-amber-400 shadow-xs'
                  : i < stepIndex
                  ? 'w-2 h-2 bg-amber-600'
                  : 'w-2 h-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Main Visual Presentation Card */}
      <div className="w-full max-w-sm">{renderVisual()}</div>

      {/* Spoken Text Prominently Displayed (Accessibility Step 10) */}
      <div className="space-y-2 max-w-md px-2">
        <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Rozha_One',serif] tracking-wide">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/10 shadow-inner">
          "{voiceText}"
        </p>
      </div>

      {/* Automatic Progress Timer Bar */}
      <div className="w-full max-w-xs bg-white/10 rounded-full h-1 overflow-hidden">
        <div
          key={`${phase}-${stepIndex}`}
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full origin-left animate-progress"
          style={{
            animationDuration: `${durationMs}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
          }}
        />
      </div>
    </div>
  );
};
