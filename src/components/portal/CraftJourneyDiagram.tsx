import React, { useState } from 'react';
import { Camera, Sparkles, Tag, DollarSign, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { LanguageCode } from '../../types';

interface CraftJourneyDiagramProps {
  language: LanguageCode;
}

export const CraftJourneyDiagram: React.FC<CraftJourneyDiagramProps> = ({ language }) => {
  const [activeStepId, setActiveStepId] = useState<string>('enhance');

  const steps = [
    {
      id: 'photo',
      stepNum: '1',
      titleEn: 'Photo Capture',
      titleHi: 'फ़ोटो लें',
      titleTe: 'ఫోటో తీయండి',
      descEn: 'Point & snap a simple photo of your handcrafted item with any phone camera.',
      descHi: 'फ़ोन से शिल्प की सामान्य फ़ोटो लें, किसी विशेष कैमरे की आवश्यकता नहीं।',
      descTe: 'సాధారణ ఫోన్ కెమెరాతో మీ చేతివృత్తి వస్తువును ఫోటో తీయండి.',
      icon: Camera,
      badgeEn: 'Any Phone Camera',
      badgeHi: 'मोबाइल कैमरा',
      badgeTe: 'ఫోన్ కెమెరా',
      previewTip: 'Natural sunlight • 3 angles supported',
    },
    {
      id: 'enhance',
      stepNum: '2',
      titleEn: 'AI Studio Polish',
      titleHi: 'AI स्टूडियो सुधार',
      titleTe: 'AI స్టూడియో మెరుగుదల',
      descEn: 'Sharp AI instantly cleans dark backgrounds and balances shadows for a marketplace look.',
      descHi: 'पृष्ठभूमि व रोशनी अपने-आप साफ़ होकर स्टूडियो गुणवत्ता की फ़ोटो तैयार होती है।',
      descTe: 'లైటింగ్ మరియు బ్యాక్‌గ్రౌండ్ సరిచేసి ప్రొఫెషనల్ లుక్ ఇస్తుంది.',
      icon: Sparkles,
      badgeEn: 'Studio Finish',
      badgeHi: 'स्टूडियो फ़िनिश',
      badgeTe: 'స్టూడియో ఫినిష్',
      previewTip: 'Automated 4K clarity • 0 editing needed',
      highlight: true,
    },
    {
      id: 'listing',
      stepNum: '3',
      titleEn: 'Multilingual Story',
      titleHi: 'बहुभाषी विवरण',
      titleTe: 'బహుభాషా కథనం',
      descEn: 'Speak in your native dialect. Gemini AI writes a heritage story in Hindi, Telugu, and English.',
      descHi: 'अपनी मातृभाषा में बोलें, AI आपकी विरासत कथा और विवरण स्वतः तैयार करेगा।',
      descTe: 'మీ సొంత భాషలో మాట్లాడండి, AI కథనం మరియు వివరాలను రికార్డ్ చేస్తుంది.',
      icon: Tag,
      badgeEn: '12 Languages',
      badgeHi: '12 भाषाएं',
      badgeTe: '12 భాషలు',
      previewTip: 'Voice-to-text • Cultural story generated',
    },
    {
      id: 'price',
      stepNum: '4',
      titleEn: 'Fair Price Guarantee',
      titleHi: 'सच्चा उचित मूल्य',
      titleTe: 'సరసమైన ధర గ్యారెంటీ',
      descEn: 'Cost-plus formula guarantees fair living hourly wages + materials with full transparent reasoning.',
      descHi: 'सामग्री की लागत और आपके पूरे श्रम घंटों का सही पारिश्रमिक सुनिश्चित होता है।',
      descTe: 'ముడిసరుకు ఖర్చు మరియు న్యాయమైన శ్రమ వేతనం లెక్కిస్తుంది.',
      icon: DollarSign,
      badgeEn: 'Cost-Plus Living Wage',
      badgeHi: 'लागत-जोड़ AI',
      badgeTe: 'కాస్ట్-ప్లస్ AI',
      previewTip: 'Zero distress selling • Certified floor',
    },
    {
      id: 'customer',
      stepNum: '5',
      titleEn: 'Direct Customer Orders',
      titleHi: 'सीधे खरीदार',
      titleTe: 'నేరుగా కొనుగోలుదారులు',
      descEn: 'Sell directly to nationwide buyers with 0% platform commission and instant direct UPI payouts.',
      descHi: 'बिचौलियों के बिना सीधा ऑर्डर पाएं, पूरा पैसा सीधे आपके बैंक खाते में।',
      descTe: 'దళారులు లేకుండా నేరుగా ఆర్డర్లు మరియు పూర్తి UPI చెల్లింపులు పొందండి.',
      icon: ShoppingBag,
      badgeEn: '0% Commission UPI',
      badgeHi: 'सीधी बिक्री',
      badgeTe: 'నేరుగా అమ్మకాలు',
      previewTip: 'Instant SMS alert • 100% your money',
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

  const activeStep = steps.find(s => s.id === activeStepId) || steps[1];

  return (
    <div className="w-full bg-[#FFFDF8] rounded-2xl p-6 sm:p-8 border border-[#D9CEB8] shadow-sm relative overflow-hidden text-left animate-fade-in-up">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#D9CEB8]/70">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A8462D]" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A8462D]">
            {language === 'hi'
              ? 'आसान डिजिटल यात्रा • 5 कदम'
              : language === 'te'
              ? 'సులభమైన డిజిటల్ ప్రయాణం • 5 దశలు'
              : 'TRANSPARENT 5-STEP ARTISAN PIPELINE'}
          </span>
        </div>
        <div className="h-8 inline-flex items-center gap-1.5 text-xs text-[#7A6E65] font-mono bg-[#F7F2E8] px-3.5 rounded-full border border-[#D9CEB8] self-start sm:self-auto">
          <span className="font-semibold text-[#A8462D]">Tap any step to inspect workflow</span>
        </div>
      </div>

      {/* 5 Step Interactive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative mb-6">
        {steps.map((step) => {
          const isSelected = activeStepId === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStepId(step.id)}
              className={`text-left rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between min-h-[176px] cursor-pointer relative group active:scale-[0.98] ${
                isSelected
                  ? 'bg-[#FFFDF8] border-[#A8462D] shadow-md ring-1 ring-[#A8462D] -translate-y-0.5'
                  : 'bg-[#F7F2E8]/60 hover:bg-[#F7F2E8] border-[#D9CEB8] hover:border-[#BFB09A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#A8462D] text-[#FFFDF8] shadow-sm'
                        : 'bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20'
                    }`}
                  >
                    <step.icon className="w-4.5 h-4.5" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      isSelected
                        ? 'bg-[#A8462D]/10 text-[#A8462D] border-[#A8462D]/30'
                        : 'bg-[#FFFDF8] text-[#7A6E65] border-[#D9CEB8]'
                    }`}
                  >
                    0{step.stepNum}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[#29221D] leading-snug mb-1">
                  {getTitle(step)}
                </h4>
                <p className="text-xs text-[#7A6E65] line-clamp-2 leading-relaxed">
                  {getDesc(step)}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#D9CEB8]/60 flex items-center justify-between text-[11px] font-bold text-[#A8462D]">
                <span className="truncate pr-1">{getBadge(step)}</span>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-[#A8462D]' : 'text-[#BFB09A]'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Highlight Drawer */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F7F2E8] border border-[#D9CEB8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#A8462D] text-[#FFFDF8] flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
            <activeStep.icon className="w-6 h-6 text-[#FFFDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono font-bold uppercase text-[#A8462D] tracking-wide">
                PHASE 0{activeStep.stepNum} • {getBadge(activeStep)}
              </span>
            </div>
            <h5 className="text-base sm:text-lg font-bold text-[#29221D] font-['Playfair_Display',serif] leading-tight">
              {getTitle(activeStep)}
            </h5>
            <p className="text-xs sm:text-sm text-[#7A6E65] mt-1 leading-relaxed max-w-xl">
              {getDesc(activeStep)}
            </p>
          </div>
        </div>

        <div className="h-9 inline-flex items-center gap-2 px-3.5 rounded-full bg-[#FFFDF8] border border-[#D9CEB8] text-xs font-semibold text-[#A8462D] shadow-xs self-stretch sm:self-auto justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#C88732]" />
          <span>{activeStep.previewTip}</span>
        </div>
      </div>

      {/* Reassurance Footer */}
      <div className="mt-5 pt-3.5 border-t border-[#D9CEB8]/70 flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A6E65]">
        <span className="font-medium flex items-center gap-2 text-[#29221D]">
          <CheckCircle2 className="w-4 h-4 text-[#4A7A52]" />
          {language === 'hi'
            ? 'बिना किसी तकनीकी ज्ञान के 2 मिनट में अपनी दुकान शुरू करें'
            : language === 'te'
            ? 'ఎటువంటి సాంకేతిక పరిజ్ఞానం లేకుండా 2 నిమిషాల్లో ప్రారంభించండి'
            : 'Start selling in under 2 minutes with zero typing required'}
        </span>
        <span className="h-7 inline-flex items-center text-[11px] text-[#4A7A52] font-mono font-bold bg-[#FFFDF8] px-3 rounded-full border border-[#4A7A52]/30">
          0% Commission • Instant Direct Jan Dhan UPI
        </span>
      </div>
    </div>
  );
};
