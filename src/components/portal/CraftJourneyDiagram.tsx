import React from 'react';
import { User, Sparkles, ShoppingBag, ArrowRight, Flame, Scissors, Trees, Palette, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../../types';

interface CraftJourneyDiagramProps {
  language: LanguageCode;
}

export const CraftJourneyDiagram: React.FC<CraftJourneyDiagramProps> = ({ language }) => {
  const steps = [
    {
      id: 'artisan',
      titleEn: '1. Rural Artisan',
      titleHi: '१. ग्रामीण कारीगर',
      titleTe: '1. చేతివృత్తి కళాకారుడు',
      descEn: 'Master of heritage craft traditions',
      descHi: 'पुश्तैनी शिल्पकला के विशेषज्ञ',
      descTe: 'సాంప్రదాయ కళా నైపుణ్యం',
      icon: User,
      bgColor: 'bg-amber-900/40 text-amber-300 border-amber-500/40',
      badge: 'Loom & Clay',
    },
    {
      id: 'craft',
      titleEn: '2. Authentic Craft',
      titleHi: '२. प्रामाणिक हस्तशिल्प',
      titleTe: '2. ప్రామాణిక కళాఖండం',
      descEn: 'Handloom, terracotta, woodcraft',
      descHi: 'हथकरघा, टेराकोटा, काष्ठ शिल्प',
      descTe: 'చేనేత, మట్టిపాత్రలు, చెక్కబొమ్మలు',
      icon: Flame,
      bgColor: 'bg-orange-950/40 text-orange-300 border-orange-500/40',
      badge: '100% Handmade',
    },
    {
      id: 'ai',
      titleEn: '3. KALAtech AI',
      titleHi: '३. KALAtech AI',
      titleTe: '3. KALAtech AI',
      descEn: 'Smart pricing & multilingual story',
      descHi: 'सही मूल्य निर्धारण एवं बहुभाषी कथा',
      descTe: 'సరసమైన ధర & బహుభాషా కథనం',
      icon: Sparkles,
      bgColor: 'bg-indigo-950/50 text-amber-300 border-amber-400/50 ring-2 ring-amber-500/30',
      badge: 'Cost-Plus Fair AI',
      highlight: true,
    },
    {
      id: 'buyer',
      titleEn: '4. Direct Buyer',
      titleHi: '४. सीधा खरीदार',
      titleTe: '4. ప్రత్యక్ష కొనుగోలుదారు',
      descEn: 'Zero middleman commissions',
      descHi: 'बिचौलियों के बिना सीधी बिक्री',
      descTe: 'దళారులు లేని ప్రత్యక్ష విక్రయం',
      icon: ShoppingBag,
      bgColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
      badge: 'Fair Trade',
    },
  ];

  const getTitle = (s: (typeof steps)[0]) => {
    if (language === 'hi') return s.titleHi;
    if (language === 'te') return s.titleTe;
    return s.titleEn;
  };

  const getDesc = (s: (typeof steps)[0]) => {
    if (language === 'hi') return s.descHi;
    if (language === 'te') return s.descTe;
    return s.descEn;
  };

  return (
    <div className="w-full bg-stone-900/80 rounded-3xl p-4 sm:p-6 border border-amber-900/40 shadow-xl backdrop-blur-xs relative overflow-hidden">
      {/* Subtle traditional Indian geometric pattern watermark */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#d97706 1px, #1c1917 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Top Heritage Badge */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
            Heritage Craft Flow • शिल्प विकास यात्रा
          </span>
        </div>
        <span className="text-[11px] font-semibold text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700/60">
          Artisan → Handicraft → AI → Buyer
        </span>
      </div>

      {/* 4-Step Diagram Flow */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`relative rounded-2xl p-3.5 sm:p-4 border transition-all flex flex-col justify-between ${
              step.bgColor
            } ${step.highlight ? 'shadow-lg shadow-amber-500/10' : ''}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900/80 border border-white/10 flex items-center justify-center">
                  <step.icon className={`w-5 h-5 ${step.highlight ? 'text-amber-400 animate-pulse' : ''}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900/60 border border-white/10 text-stone-300">
                  {step.badge}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base text-stone-100 mb-1 leading-snug">
                {getTitle(step)}
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-300/80 leading-relaxed">
                {getDesc(step)}
              </p>
            </div>

            {/* Connective arrow on desktop between columns */}
            {idx < steps.length - 1 && (
              <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-amber-500 text-stone-950 items-center justify-center text-xs font-black shadow-md">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Craft Types Micro-Badges */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-center sm:justify-between gap-2 text-xs text-stone-400">
        <span className="text-[11px] text-amber-200/80 font-medium">
          Supported Traditional Indian Clusters:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[11px] border border-stone-700/60 flex items-center gap-1">
            <Scissors className="w-3 h-3 text-amber-400" /> Handloom Weaving
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[11px] border border-stone-700/60 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" /> Terracotta Pottery
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[11px] border border-stone-700/60 flex items-center gap-1">
            <Trees className="w-3 h-3 text-emerald-400" /> Woodcraft
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[11px] border border-stone-700/60 flex items-center gap-1">
            <Palette className="w-3 h-3 text-indigo-400" /> Tribal Folk Art
          </span>
        </div>
      </div>
    </div>
  );
};
