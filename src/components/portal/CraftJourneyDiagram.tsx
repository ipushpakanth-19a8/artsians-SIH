import React from 'react';
import { Camera, Sparkles, Tag, DollarSign, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../../types';

interface CraftJourneyDiagramProps {
  language: LanguageCode;
}

export const CraftJourneyDiagram: React.FC<CraftJourneyDiagramProps> = ({ language }) => {
  const steps = [
    {
      id: 'photo',
      stepNum: '1',
      titleEn: 'Photo',
      titleHi: 'फ़ोटो',
      titleTe: 'ఫోటో',
      descEn: 'Take phone photo of your craft',
      descHi: 'फ़ोन से शिल्प की सामान्य फ़ोटो लें',
      descTe: 'ఫోన్ కెమెరాతో ఫోటో తీయండి',
      icon: Camera,
      badgeEn: 'Phone Camera',
      badgeHi: 'मोबाइल कैमरा',
      badgeTe: 'ఫోన్ కెమెరా',
      color: 'bg-amber-50 text-amber-900 border-amber-200',
      iconColor: 'text-amber-700 bg-amber-100',
    },
    {
      id: 'enhance',
      stepNum: '2',
      titleEn: 'AI Enhance',
      titleHi: 'AI सुधार',
      titleTe: 'AI మెరుగుదల',
      descEn: 'Cleans background & lighting',
      descHi: 'पृष्ठभूमि व रोशनी अपने-आप साफ़',
      descTe: 'లైటింగ్ & బ్యాక్‌గ్రౌండ్ సరిచేస్తుంది',
      icon: Sparkles,
      badgeEn: 'Studio Finish',
      badgeHi: 'स्टूडियो फ़िनिश',
      badgeTe: 'స్టూడియో ఫినిష్',
      color: 'bg-orange-50 text-orange-950 border-orange-200 ring-2 ring-orange-400/40',
      iconColor: 'text-orange-700 bg-orange-100',
      highlight: true,
    },
    {
      id: 'listing',
      stepNum: '3',
      titleEn: 'Product Listing',
      titleHi: 'उत्पाद सूची',
      titleTe: 'ఉత్పత్తి జాబితా',
      descEn: 'AI writes craft story & details',
      descHi: 'विरासत कथा व विवरण तैयार',
      descTe: 'కళా కథనం & వివరాలు సిద్ధం',
      icon: Tag,
      badgeEn: 'Multilingual',
      badgeHi: 'बहुभाषी',
      badgeTe: 'బహుభాషా',
      color: 'bg-stone-50 text-stone-900 border-stone-200',
      iconColor: 'text-stone-700 bg-stone-100',
    },
    {
      id: 'price',
      stepNum: '4',
      titleEn: 'Fair Price',
      titleHi: 'उचित मूल्य',
      titleTe: 'సరసమైన ధర',
      descEn: 'Living wage + material cost',
      descHi: 'मेहनत व लागत का सच्चा हिसाब',
      descTe: 'సరసమైన శ్రమ వేతనం & వ్యయం',
      icon: DollarSign,
      badgeEn: 'Cost-Plus AI',
      badgeHi: 'लागत-जोड़ AI',
      badgeTe: 'కాస్ట్-ప్లస్ AI',
      color: 'bg-emerald-50 text-emerald-950 border-emerald-200',
      iconColor: 'text-emerald-700 bg-emerald-100',
    },
    {
      id: 'customer',
      stepNum: '5',
      titleEn: 'Customer',
      titleHi: 'सीधा ग्राहक',
      titleTe: 'కొనుగోలుదారు',
      descEn: 'Direct order, zero middleman',
      descHi: 'सीधा ऑर्डर, 0% कमीशन',
      descTe: 'నేరుగా ఆర్డర్, దళారులు లేరు',
      icon: ShoppingBag,
      badgeEn: 'Direct Sales',
      badgeHi: 'सीधी बिक्री',
      badgeTe: 'నేరుగా అమ్మకాలు',
      color: 'bg-stone-50 text-stone-900 border-stone-200',
      iconColor: 'text-stone-800 bg-stone-100',
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

  const getBadge = (s: (typeof steps)[0]) => {
    if (language === 'hi') return s.badgeHi;
    if (language === 'te') return s.badgeTe;
    return s.badgeEn;
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-[#eadfd4] shadow-sm relative overflow-hidden text-left">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#eadfd4]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c85a32] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#9c4124]">
            {language === 'hi'
              ? 'आसान डिजिटल यात्रा • 5 कदम'
              : language === 'te'
              ? 'సులభమైన డిజిటల్ ప్రయాణం • 5 దశలు'
              : 'Simple 5-Step Artisan Journey'}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-stone-600 font-semibold bg-[#faf7f2] px-3 py-1 rounded-full border border-[#eadfd4]">
          <span>Photo</span>
          <span className="text-stone-400">→</span>
          <span className="text-[#9c4124] font-bold">AI Enhancement</span>
          <span className="text-stone-400">→</span>
          <span>Listing</span>
          <span className="text-stone-400">→</span>
          <span className="text-emerald-700 font-bold">Price</span>
          <span className="text-stone-400">→</span>
          <span>Customer</span>
        </div>
      </div>

      {/* 5 Step Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 relative">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${step.color} ${
              step.highlight ? 'shadow-md shadow-orange-900/5' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${step.iconColor}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-stone-200/80 text-stone-700">
                  {getBadge(step)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-extrabold text-[#9c4124]">{step.stepNum}.</span>
                <h4 className="font-extrabold text-sm sm:text-base text-stone-900 leading-snug">
                  {getTitle(step)}
                </h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {getDesc(step)}
              </p>
            </div>

            {/* Desktop Connective indicator */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white text-stone-400 border border-[#eadfd4] items-center justify-center text-[10px] font-bold shadow-xs">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reassurance Footer */}
      <div className="mt-5 pt-3.5 border-t border-[#eadfd4] flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
        <span className="font-medium flex items-center gap-1.5 text-stone-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {language === 'hi'
            ? 'बिना किसी तकनीकी ज्ञान के 2 मिनट में अपनी दुकान शुरू करें'
            : language === 'te'
            ? 'ఎటువంటి సాంకేతిక పరిజ్ఞానం లేకుండా 2 నిమిషాల్లో ప్రారంభించండి'
            : 'Start selling in less than 2 minutes without technical complexity'}
        </span>
        <span className="text-[11px] text-stone-500 font-semibold bg-[#faf7f2] px-2.5 py-1 rounded-lg border border-[#eadfd4]">
          Zero Commission • 100% Direct UPI Settlement
        </span>
      </div>
    </div>
  );
};
