import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2, VolumeX, Sparkles, Check, Edit3, Mic, MicOff, AlertCircle,
  TrendingUp, ShieldCheck, HelpCircle, ArrowRight, RotateCcw, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { formatINR } from '../../lib/billingService';
import { FairPricingResponse, LanguageCode } from '../../types';

interface FairPriceBreakdownCardProps {
  pricing: FairPricingResponse;
  onApprovePrice?: (approvedPrice: number) => void;
  initialApprovedPrice?: number;
  readOnly?: boolean;
  className?: string;
  selectedLanguage?: LanguageCode;
  autoExplain?: boolean;
}

export const FairPriceBreakdownCard: React.FC<FairPriceBreakdownCardProps> = ({
  pricing,
  onApprovePrice,
  initialApprovedPrice,
  readOnly = false,
  className = '',
  selectedLanguage,
  autoExplain = false
}) => {
  const { language } = useLanguage();

  // Dual-price state
  const recommendedPrice = pricing.recommendedFairPrice;
  const [artisanPrice, setArtisanPrice] = useState<number>(
    initialApprovedPrice && initialApprovedPrice > 0
      ? initialApprovedPrice
      : (pricing.artisanApprovedPrice || recommendedPrice)
  );
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // Keep artisanPrice synced if pricing prop changes
  useEffect(() => {
    if (!isEditingPrice && !isApproved) {
      if (initialApprovedPrice && initialApprovedPrice > 0) {
        setArtisanPrice(initialApprovedPrice);
      } else {
        setArtisanPrice(pricing.artisanApprovedPrice || pricing.recommendedFairPrice);
      }
    }
  }, [pricing, initialApprovedPrice, isEditingPrice, isApproved]);

  // Cancel any ongoing speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-trigger voice explanation when autoExplain is true (billing page opens)
  const hasAutoExplainedRef = useRef(false);
  useEffect(() => {
    if (autoExplain && !hasAutoExplainedRef.current && pricing.recommendedFairPrice > 0) {
      hasAutoExplainedRef.current = true;
      // Small delay to ensure UI is rendered before speaking
      const timer = setTimeout(() => {
        handleExplainFairPrice();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoExplain, pricing.recommendedFairPrice]);

  // Get localized explanation text
  const getExplanationText = (lang: LanguageCode): string => {
    if (lang === 'hi' && pricing.explanation?.hindi) {
      return pricing.explanation.hindi;
    }
    if (lang === 'te' && pricing.explanation?.telugu) {
      return pricing.explanation.telugu;
    }
    if (pricing.explanation?.english) {
      return pricing.explanation.english;
    }

    // Fallback template
    const formattedFair = formatINR(pricing.recommendedFairPrice);
    const formattedMat = formatINR(pricing.materialCost);
    const formattedWage = formatINR(pricing.fairHourlyWage);
    const formattedLabor = formatINR(pricing.laborValue);

    if (lang === 'hi') {
      return `आपकी अनुशंसित उचित कीमत ${formattedFair} है। आपने सामग्री पर ${formattedMat} खर्च किए। आपने ${pricing.laborHours} घंटे काम किया। ${formattedWage} प्रति घंटे की उचित मजदूरी पर, आपके काम का मूल्य ${formattedLabor} है। शेष राशि आवश्यक मार्जिन और व्यावसायिक खर्चों को कवर करती है।`;
    }
    if (lang === 'te') {
      return `మీ సిఫార్సు చేయబడిన సరసమైన ధర ${formattedFair}. మీరు ముడిసరుకుపై ${formattedMat} ఖర్చు చేశారు. మీరు ${pricing.laborHours} గంటలు పనిచేశారు. గంటకు ${formattedWage} సరసమైన వేతనంతో మీ శ్రమ విలువ ${formattedLabor}. మిగిలిన మొత్తం మార్జిన్ మరియు వ్యాపార ఖర్చులను భర్తీ చేస్తుంది.`;
    }
    return `Your recommended fair price is ${formattedFair}. You spent ${formattedMat} on materials. You worked for ${pricing.laborHours} hours. At a fair wage of ${formattedWage} per hour, your labor value is ${formattedLabor}. The remaining amount covers the configured margin and business expenses. Your recommended fair price is ${formattedFair}.`;
  };

  // Speak explanation using Web Speech API
  const handleExplainFairPrice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(getExplanationText(language));
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = getExplanationText(language);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'te') {
      utterance.lang = 'te-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.90; // Slower cadence for rural comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle voice command recognition (Web Speech API)
  const handleToggleVoiceInteraction = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceFeedback('Voice commands not supported in this browser.');
      setTimeout(() => setVoiceFeedback(null), 3000);
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setVoiceFeedback(
          language === 'hi'
            ? 'बोलिए: "कीमत समझाओ", "कीमत स्वीकार करें", या नई कीमत बोलें'
            : language === 'te'
            ? 'మాట్లాడండి: "ధర వివరించండి", "ధరను అంగీకరించండి", లేదా కొత్త ధర చెప్పండి'
            : 'Listening: Say "Explain price", "Accept this price", or "Change price to 3000"'
        );
      };

      recognition.onresult = (event: any) => {
        const transcript = (event.results[0][0].transcript || '').toLowerCase().trim();
        handleVoiceCommand(transcript);
        setIsListeningVoice(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Voice command recognition error:', e);
        setIsListeningVoice(false);
        setVoiceFeedback(null);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition failed to start:', err);
      setIsListeningVoice(false);
    }
  };

  // Process spoken voice commands
  const handleVoiceCommand = (transcript: string) => {
    const t = transcript.toLowerCase();

    // 1. "Explain the price" / "Why is the price" / "How much for my work"
    if (
      t.includes('explain') || t.includes('why') || t.includes('how much') ||
      t.includes('समझाओ') || t.includes('क्यों') || t.includes('मजदूरी') ||
      t.includes('వివరించు') || t.includes('ఎందుకు') || t.includes('శ్రమ')
    ) {
      setVoiceFeedback(`Command recognized: "${transcript}"`);
      setTimeout(() => {
        handleExplainFairPrice();
        setVoiceFeedback(null);
      }, 500);
      return;
    }

    // 2. "Accept this price" / "Accept" / "स्वीकार" / "అంగీకరించు"
    if (
      t.includes('accept') || t.includes('ok') || t.includes('approve') ||
      t.includes('स्वीकार') || t.includes('सही है') ||
      t.includes('అంగీకరించు') || t.includes('సరే')
    ) {
      handleApprovePrice(artisanPrice);
      setVoiceFeedback(
        language === 'hi'
          ? `कीमत ₹${artisanPrice.toLocaleString('en-IN')} स्वीकृत की गई!`
          : language === 'te'
          ? `ధర ₹${artisanPrice.toLocaleString('en-IN')} ఆమోదించబడింది!`
          : `Price of ₹${artisanPrice.toLocaleString('en-IN')} accepted!`
      );
      setTimeout(() => setVoiceFeedback(null), 3000);
      return;
    }

    // 3. "Change price to X" / Spoken number
    const numberMatch = t.match(/\d+/);
    if (numberMatch && (t.includes('change') || t.includes('price') || t.includes('बदलो') || t.includes('మార్చు') || t.includes('రూపాయలు') || t.includes('रुपये'))) {
      const parsedNum = parseInt(numberMatch[0], 10);
      if (parsedNum > 0) {
        setArtisanPrice(parsedNum);
        setIsEditingPrice(false);
        handleApprovePrice(parsedNum);
        setVoiceFeedback(
          language === 'hi'
            ? `विक्रय मूल्य बदलकर ₹${parsedNum.toLocaleString('en-IN')} किया गया!`
            : language === 'te'
            ? `విక్రయ ధర ₹${parsedNum.toLocaleString('en-IN')} కు మార్చబడింది!`
            : `Selling price updated to ₹${parsedNum.toLocaleString('en-IN')}!`
        );
        setTimeout(() => setVoiceFeedback(null), 3500);
        return;
      }
    }

    setVoiceFeedback(`Heard: "${transcript}". Try saying "Explain the price" or "Accept this price".`);
    setTimeout(() => setVoiceFeedback(null), 3000);
  };

  // Artisan approves recommended or customized price
  const handleApprovePrice = (priceToApprove: number) => {
    setIsApproved(true);
    setIsEditingPrice(false);
    if (onApprovePrice) {
      onApprovePrice(priceToApprove);
    }
  };

  const handleManualPriceSave = () => {
    setIsEditingPrice(false);
    handleApprovePrice(artisanPrice);
  };

  // Localized UI Labels
  const labels = {
    en: {
      title: 'FAIR PRICE BREAKDOWN',
      subtitle: 'Transparent, living-wage calculation protectively certified by KALAtech',
      rawMaterial: 'Raw Material',
      yourWork: 'Your Work',
      perHour: '/hour',
      baseCost: 'Base Production Cost',
      margin: 'Margin / Contingency',
      contingencySub: 'Configured 25% contingency & business reserve',
      recommended: 'RECOMMENDED FAIR PRICE',
      artisanSellingPrice: 'Artisan Selling Price',
      explainBtn: isSpeaking ? 'Stop Voice Explanation' : 'Explain Fair Price',
      voiceMic: isListeningVoice ? 'Listening...' : 'Voice Assistant Commands',
      acceptBtn: 'Accept Recommended Price',
      changeBtn: 'Change Selling Price',
      approvedTag: 'Artisan Approved & Certified',
      saveCustom: 'Confirm Price',
      cancel: 'Cancel',
      laborShare: 'Direct Artisan Labor Share',
      minWageProtected: 'Living Wage Floor Guaranteed',
      priceDiff: artisanPrice !== recommendedPrice
        ? `${artisanPrice > recommendedPrice ? '+' : ''}${formatINR(artisanPrice - recommendedPrice)} compared to benchmark recommendation`
        : 'Aligned with verified benchmark fair recommendation'
    },
    hi: {
      title: 'उचित मूल्य विवरण (Fair Price Breakdown)',
      subtitle: 'पारदर्शी और उचित पारिश्रमिक गणना — शिल्पसेतु द्वारा सत्यापित',
      rawMaterial: 'कच्ची सामग्री (Raw Material)',
      yourWork: 'आपका श्रम (Your Work)',
      perHour: '/घंटा',
      baseCost: 'मूल उत्पादन लागत (Base Cost)',
      margin: 'मार्जिन / आकस्मिक व्यय (25%)',
      contingencySub: 'सुरक्षित व्यावसायिक मार्जिन एवं भंडार',
      recommended: 'अनुशंसित उचित मूल्य (Recommended)',
      artisanSellingPrice: 'कारीगर विक्रय मूल्य (Selling Price)',
      explainBtn: isSpeaking ? 'आवाज़ रोकें' : 'कीमत समझाएं (Explain)',
      voiceMic: isListeningVoice ? 'सुन रहे हैं...' : 'आवाज़ से निर्देश दें',
      acceptBtn: 'उचित मूल्य स्वीकार करें',
      changeBtn: 'विक्रय मूल्य बदलें',
      approvedTag: 'कारीगर द्वारा स्वीकृत',
      saveCustom: 'मूल्य सुरक्षित करें',
      cancel: 'रद्द करें',
      laborShare: 'सीधे कारीगर का श्रम हिस्सा',
      minWageProtected: 'न्यूनतम जीविका मजदूरी सुरक्षित',
      priceDiff: artisanPrice !== recommendedPrice
        ? `सिफारिश से ${artisanPrice > recommendedPrice ? '+' : ''}${formatINR(artisanPrice - recommendedPrice)}`
        : 'अनुशंसित उचित मूल्य के अनुरूप'
    },
    te: {
      title: 'సరసమైన ధర వివరాలు (Fair Price Breakdown)',
      subtitle: 'పారదర్శకమైన మరియు న్యాయమైన శ్రమ లెక్క — శిల్పసేతు సర్టిఫైడ్',
      rawMaterial: 'ముడిసరుకు ఖర్చు (Raw Material)',
      yourWork: 'మీ శ్రమ (Your Work)',
      perHour: '/గంటకు',
      baseCost: 'ప్రాథమిక ఉత్పత్తి ఖర్చు (Base Cost)',
      margin: 'మార్జిన్ / ఖర్చులు (25%)',
      contingencySub: 'వ్యాపార లాభం & భద్రతా నిధి',
      recommended: 'సిఫార్సు చేయబడిన సరసమైన ధర',
      artisanSellingPrice: 'చేతివృత్తికారుల అమ్మకపు ధర',
      explainBtn: isSpeaking ? 'వాయిస్ ఆపండి' : 'ధర వివరించండి (Explain)',
      voiceMic: isListeningVoice ? 'వింటున్నాం...' : 'వాయిస్ కమాండ్స్',
      acceptBtn: 'సిఫార్సు చేసిన ధరను అంగీకరించండి',
      changeBtn: 'ధరను మార్చండి',
      approvedTag: 'చేతివృత్తికారుడు ఆమోదించారు',
      saveCustom: 'ధరను నిర్ధారించండి',
      cancel: 'రద్దు చేయండి',
      laborShare: 'నేరుగా చేతివృత్తికారుల శ్రమ వాటా',
      minWageProtected: 'సరసమైన కనీస వేతనం హామీ',
      priceDiff: artisanPrice !== recommendedPrice
        ? `సిఫార్సు కంటే ${artisanPrice > recommendedPrice ? '+' : ''}${formatINR(artisanPrice - recommendedPrice)}`
        : 'సిఫార్సు చేసిన సరసమైన ధరకు అనుగుణంగా ఉంది'
    }
  };

  const l = labels[language] || labels.en;

  // Calculate direct labor share %
  const laborPct = pricing.recommendedFairPrice > 0
    ? Math.round((pricing.laborValue / pricing.recommendedFairPrice) * 100)
    : 0;

  return (
    <div className={`bg-white rounded-3xl border border-stone-200 shadow-md p-5 sm:p-7 overflow-hidden relative ${className}`}>
      
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              {l.title}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {pricing.pricingFormulaVersion || 'v1.0-living-wage'}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            {l.subtitle}
          </p>
        </div>

        {/* Action Controls: Voice Explain & Mic */}
        <div className="flex items-center gap-2">
          {/* Prominent "Explain Fair Price" button */}
          <button
            type="button"
            onClick={handleExplainFairPrice}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm ${
              isSpeaking
                ? 'bg-amber-600 text-white ring-4 ring-amber-200 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white hover:shadow-md'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
            <span>{l.explainBtn}</span>
          </button>

          {/* Voice Command Recognition Mic Button */}
          {!readOnly && (
            <button
              type="button"
              onClick={handleToggleVoiceInteraction}
              title={l.voiceMic}
              className={`p-2.5 rounded-xl border transition-all ${
                isListeningVoice
                  ? 'bg-red-500 text-white border-red-600 animate-ping ring-4 ring-red-200'
                  : 'bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-800 border-stone-200'
              }`}
            >
              {isListeningVoice ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Voice Assistant Feedback Banner */}
      {voiceFeedback && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{voiceFeedback}</span>
        </div>
      )}

      {/* Low-Literacy Visual Breakdown Representation */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* 🧵 Raw Material Card */}
        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shadow-xs">
              🧵
            </div>
            <div>
              <p className="text-xs font-bold text-stone-700">{l.rawMaterial}</p>
              <p className="text-[11px] text-stone-500">
                {pricing.quantity > 1 ? `${pricing.quantity} units total` : 'Direct craft materials'}
              </p>
            </div>
          </div>
          <p className="text-base font-black text-stone-900 font-mono">
            {formatINR(pricing.materialCost * pricing.quantity)}
          </p>
        </div>

        {/* 👩‍🎨 Your Work Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shadow-xs">
              👩‍🎨
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">{l.yourWork}</p>
              <p className="text-[11px] text-emerald-800 font-medium">
                {pricing.laborHours}h × {formatINR(pricing.fairHourlyWage)}{l.perHour}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-black text-emerald-900 font-mono">
              {formatINR(pricing.laborValue * pricing.quantity)}
            </p>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              {laborPct}% of price
            </span>
          </div>
        </div>

        {/* 📦 Base Production Cost Card */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-stone-200/70 text-stone-800 flex items-center justify-center text-xl shadow-xs">
              📦
            </div>
            <div>
              <p className="text-xs font-bold text-stone-700">{l.baseCost}</p>
              <p className="text-[11px] text-stone-500">
                Material + Labor Wages
              </p>
            </div>
          </div>
          <p className="text-base font-black text-stone-900 font-mono">
            {formatINR(pricing.baseCost * pricing.quantity)}
          </p>
        </div>

        {/* 📈 Margin / Contingency Card */}
        <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl shadow-xs">
              📈
            </div>
            <div>
              <p className="text-xs font-bold text-stone-700">{l.margin}</p>
              <p className="text-[11px] text-stone-500">
                {l.contingencySub}
              </p>
            </div>
          </div>
          <p className="text-base font-black text-stone-900 font-mono">
            {formatINR(pricing.marginOrContingency * pricing.quantity)}
          </p>
        </div>
      </div>

      {/* Recommended Fair Price Hero Banner */}
      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-stone-100 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-950">
              {l.recommended}
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5">
            {l.minWageProtected} • {l.priceDiff}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
            {formatINR(pricing.recommendedFairPrice * pricing.quantity)}
          </p>
          {pricing.quantity > 1 && (
            <p className="text-[10px] text-stone-500 font-medium">
              ({formatINR(pricing.recommendedFairPrice)} per unit)
            </p>
          )}
        </div>
      </div>

      {/* Artisan Approval & Custom Price Control Section */}
      {!readOnly && (
        <div className="mt-5 pt-5 border-t border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {l.artisanSellingPrice}
              </h4>
              <p className="text-[11px] text-stone-500">
                You maintain complete sovereign freedom to approve or modify your selling price.
              </p>
            </div>

            {/* Current Approved Price Tag */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-stone-900 font-mono">
                {formatINR(artisanPrice * pricing.quantity)}
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-extrabold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {l.approvedTag}
                </span>
              )}
            </div>
          </div>

          {/* Custom Price Adjustment Form */}
          {isEditingPrice ? (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center gap-3 animate-in fade-in">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Enter Desired Selling Price (₹ INR):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={artisanPrice}
                    onChange={(e) => setArtisanPrice(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <button
                  type="button"
                  onClick={handleManualPriceSave}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {l.saveCustom}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPrice(false)}
                  className="px-3 py-2 text-stone-500 hover:text-stone-700 text-xs font-semibold"
                >
                  {l.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {/* Accept Recommended Price */}
              <button
                type="button"
                onClick={() => {
                  setArtisanPrice(recommendedPrice);
                  handleApprovePrice(recommendedPrice);
                }}
                className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  artisanPrice === recommendedPrice && isApproved
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-sm'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{l.acceptBtn} ({formatINR(recommendedPrice * pricing.quantity)})</span>
              </button>

              {/* Edit / Change Price */}
              <button
                type="button"
                onClick={() => setIsEditingPrice(true)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                <span>{l.changeBtn}</span>
              </button>
            </div>
          )}

          {/* Dual price explanation pill */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <span>Recommended: <strong className="text-stone-800 font-mono">{formatINR(recommendedPrice)}</strong></span>
            <span>Artisan Selling: <strong className="text-amber-800 font-mono">{formatINR(artisanPrice)}</strong></span>
          </div>
        </div>
      )}

    </div>
  );
};

export default FairPriceBreakdownCard;
