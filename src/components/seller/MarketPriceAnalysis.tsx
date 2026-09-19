import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2, ArrowRight, Info, CheckCircle, Calculator, FileText,
  PlusCircle, Sparkles, TrendingUp, ShieldCheck, DollarSign
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { formatINR } from '../../lib/billingService';
import { LanguageCode } from '../../types';
import { translations } from '../../i18n';
import { getCraftExpensesI18n } from '../../i18n/craftExpenses.i18n';
import { useVoiceForm } from '../../lib/useVoiceForm';
import { parseQuantityTranscript } from '../../lib/voiceParsingService';
import { PageHeader } from './ui/PageHeader';
import { VoiceTypeButton, VoiceState } from './ui/VoiceTypeButton';

export function MarketPriceAnalysis() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const lang = (language as LanguageCode) || 'en';
  const expI18n = getCraftExpensesI18n(lang);
  const t = translations[lang];

  // Inputs
  const [materialCost, setMaterialCost] = useState<number>(450);
  const [hoursSpent, setHoursSpent] = useState<number>(10);
  const [hourlyWage, setHourlyWage] = useState<number>(85); // Living wage rate
  const [packagingCost, setPackagingCost] = useState<number>(60);
  const [shippingCost, setShippingCost] = useState<number>(100);
  const [desiredMargin, setDesiredMargin] = useState<number>(35); // 35% margin
  const [category, setCategory] = useState<string>('Handloom');

  // Calculations (Exact preservation of formula)
  const laborCost = Math.round(hoursSpent * hourlyWage);
  const totalCost = materialCost + laborCost + packagingCost + shippingCost;
  const calculatedBasePrice = Math.round(totalCost / (1 - desiredMargin / 100));
  const recommendedPrice = Math.round(calculatedBasePrice / 10) * 10 - 1; // e.g. 1249
  const minRange = Math.round((recommendedPrice * 0.92) / 50) * 50;
  const maxRange = Math.round((recommendedPrice * 1.08) / 50) * 50;
  const estimatedProfit = recommendedPrice - totalCost;
  const middlemanPrice = Math.round(totalCost * 0.75); // Traditional middleman rate

  // Voice Form Hook & Mic state (strictly on-demand, NO auto-announcements)
  const { speak, listen, stopAll } = useVoiceForm(lang);
  const [fieldStates, setFieldStates] = useState<Record<string, VoiceState>>({});
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  // Helper to parse spoken numbers
  const extractSpokenNumber = (spokenText: string): number | null => {
    const parsed = parseQuantityTranscript(spokenText);
    if (parsed !== null && parsed >= 0) return parsed;
    const digitMatch = spokenText.replace(/[^\d]/g, '');
    if (digitMatch) {
      const num = parseInt(digitMatch, 10);
      if (!isNaN(num) && num >= 0) return num;
    }
    return null;
  };

  // Mic handler activated ONLY on button press
  const handleExpenseMic = useCallback(
    (fieldKey: string, setter: (val: number) => void) => {
      if (activeVoiceField === fieldKey) {
        stopAll();
        setActiveVoiceField(null);
        setFieldStates(prev => ({ ...prev, [fieldKey]: 'idle' }));
        return;
      }

      stopAll();
      setActiveVoiceField(fieldKey);
      setFieldStates(prev => ({ ...prev, [fieldKey]: 'listening' }));

      listen((spokenText: string) => {
        const num = extractSpokenNumber(spokenText);
        if (num !== null) {
          setter(num);
          setFieldStates(prev => ({ ...prev, [fieldKey]: 'added' }));
        } else {
          setFieldStates(prev => ({ ...prev, [fieldKey]: 'idle' }));
        }
        setActiveVoiceField(null);
        setTimeout(() => {
          setFieldStates(prev => ({ ...prev, [fieldKey]: 'idle' }));
        }, 2000);
      });
    },
    [activeVoiceField, stopAll, listen]
  );

  const handleListenExplanation = () => {
    if (expI18n.audioSummary) {
      speak(expI18n.audioSummary(totalCost, recommendedPrice, estimatedProfit));
    } else {
      const speechText =
        language === 'hi'
          ? `आपकी कुल लागत ₹${totalCost} है, जिसमें सामग्री ₹${materialCost}, श्रम ₹${laborCost}, और पैकेजिंग व परिवहन ₹${packagingCost + shippingCost} शामिल हैं। 35% लाभ के साथ आपका उचित मूल्य ₹${recommendedPrice} है। बाज़ार मूल्य ₹${minRange} से ₹${maxRange} के बीच है।`
          : language === 'te'
          ? `మీ మొత్తం ఖర్చు ₹${totalCost}, ఇందులో మెటీరియల్ ₹${materialCost}, శ్రమ ₹${laborCost}. 35% లాభంతో మీ సరసమైన ధర ₹${recommendedPrice}. మార్కెట్ పరిధి ₹${minRange} నుండి ₹${maxRange}.`
          : `Your total craft cost is ₹${totalCost}, including materials of ₹${materialCost}, labor of ₹${laborCost}, and transport. With a 35% artisan profit margin, your recommended fair price is ₹${recommendedPrice}, giving you ₹${estimatedProfit} direct earnings.`;
      speak(speechText);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow={t.fairPrice || expI18n.pageBadge || "FAIR CRAFT PRICING"}
        title={t.marketPriceAnalysis || expI18n.pageTitle || "Market Price Analysis"}
        description={expI18n.pageSubtitle || t.heroSub || "Transparent living wage pricing engine. Calculate fair retail rates that honor your handcrafted hours and materials."}
        action={
          <button
            onClick={handleListenExplanation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] text-[#A8462D] text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>{expI18n.listenInAudio || t.explainFairPrice || "Listen Explanation"}</span>
          </button>
        }
      />

      {/* 2. Main Two-Column Hero: Expenses vs Fair Price Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================== */}
        {/* LEFT: YOUR CRAFT EXPENSES                          */}
        {/* ================================================== */}
        <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-[#D9CEB8]/60 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#29221D] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#A8462D]" />
              <span>{expI18n.sectionTitle || "YOUR CRAFT EXPENSES"}</span>
            </h3>
            <span className="text-[11px] font-bold text-[#7A6E65]">
              {expI18n.totalCostLabel || t.totalCost || "Total Cost"}: <span className="font-mono text-[#29221D]">₹{totalCost}</span>
            </span>
          </div>

          {/* Material Cost */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#29221D]">
                {expI18n.materialCostLabel || t.materialCost} ({expI18n.materialCostSub})
              </label>
              <VoiceTypeButton
                state={fieldStates['material']}
                onClick={() => handleExpenseMic('material', setMaterialCost)}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={materialCost}
                onChange={e => setMaterialCost(Number(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
              />
            </div>
          </div>

          {/* Labor: Hours + Hourly Wage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D]">
                  {expI18n.timeSpentLabel || t.laborHours}
                </label>
                <VoiceTypeButton
                  state={fieldStates['hours']}
                  onClick={() => handleExpenseMic('hours', setHoursSpent)}
                />
              </div>
              <input
                type="number"
                min="1"
                value={hoursSpent}
                onChange={e => setHoursSpent(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D]">
                  {expI18n.hourlyWageLabel || t.fairHourlyWage}
                </label>
                <span className="text-[10px] text-[#4A7A52] font-semibold">{expI18n.hourlyWageSub || "Living Wage"}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  value={hourlyWage}
                  onChange={e => setHourlyWage(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
                />
              </div>
            </div>
          </div>

          {/* Packaging & Transport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D]">
                  {expI18n.packagingCostLabel || "Packaging"} ({expI18n.packagingCostSub})
                </label>
                <VoiceTypeButton
                  state={fieldStates['packaging']}
                  onClick={() => handleExpenseMic('packaging', setPackagingCost)}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={packagingCost}
                  onChange={e => setPackagingCost(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D]">
                  {expI18n.shippingCostLabel || t.transportationCost || "Transport / Courier"} ({expI18n.shippingCostSub})
                </label>
                <VoiceTypeButton
                  state={fieldStates['shipping']}
                  onClick={() => handleExpenseMic('shipping', setShippingCost)}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={e => setShippingCost(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
                />
              </div>
            </div>
          </div>

          {/* Margin Slider */}
          <div className="space-y-1.5 pt-2 border-t border-[#D9CEB8]/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#29221D]">
                {expI18n.desiredMarginLabel || "Desired Artisan Margin"}
              </label>
              <span className="text-xs font-mono font-bold text-[#A8462D]">
                {desiredMargin}%
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={desiredMargin}
              onChange={e => setDesiredMargin(Number(e.target.value))}
              className="w-full accent-[#A8462D] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#7A6E65]">
              <span>{expI18n.budgetMargin || "15% (Wholesale)"}</span>
              <span>{expI18n.standardMargin || "35% (Recommended)"}</span>
              <span>{expI18n.masterpieceMargin || "60% (Collector Grade)"}</span>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* RIGHT: FAIR PRICE SUMMARY                          */}
        {/* ================================================== */}
        <div className="lg:col-span-5 bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-[#D9CEB8]/60 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#29221D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C88732]" />
              <span>{t.fairPriceBreakdown || expI18n.aiSuggestedBadge || "FAIR PRICE SUMMARY"}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#4A7A52] border border-emerald-200">
              {expI18n.transparentBadge || "Living Wage Verified"}
            </span>
          </div>

          {/* Big Editorial Price Display */}
          <div className="bg-[#FDF6F0] rounded-2xl p-5 border border-[#D9CEB8] text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A8462D] block">
              {expI18n.suggestedSellingPriceLabel || t.recommendedFairPrice || "Recommended Fair Retail Price"}
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-serif text-[#A8462D] tracking-tight">
              {formatINR(recommendedPrice)}
            </div>
            <p className="text-xs text-[#7A6E65] font-medium pt-1">
              {language === 'hi'
                ? 'सीधे कारीगर को • 0% प्लेटफ़ॉर्म कमीशन'
                : language === 'te'
                ? 'నేరుగా కళాకారుడికి • 0% ప్లాట్‌ఫారమ్ కమీషన్'
                : 'Direct to Artisan • 0% Platform Commission'}
            </p>
          </div>

          {/* Market Range */}
          <div className="rounded-xl border border-[#D9CEB8] p-4 space-y-2 bg-[#FFFDF8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#29221D]">
                {t.marketPriceSection || expI18n.fairPriceRange || "Market Range"}
              </span>
              <span className="text-xs font-mono font-bold text-[#29221D]">
                {formatINR(minRange)} – {formatINR(maxRange)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#F7F2E8] border border-[#D9CEB8] overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#C88732] to-[#A8462D] rounded-full"
                style={{ width: '65%' }}
              />
            </div>
            <p className="text-[11px] text-[#7A6E65]">
              {expI18n.recommendedPriceNote
                ? expI18n.recommendedPriceNote(recommendedPrice, minRange)
                : 'Artisan creations of this tier typically retail within this verified band across Indian craft fairs and boutiques.'}
            </p>
          </div>

          {/* Direct Profit vs Middleman Rate */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-[#4A7A52] uppercase block">
                {expI18n.estimatedArtisanProfitLabel || t.profitLabel || "Artisan Profit Retained"}
              </span>
              <span className="text-lg font-mono font-bold text-[#4A7A52]">
                +{formatINR(estimatedProfit)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">
                {expI18n.middlemanContrastTitle || "Middleman Exploitative Cut"}
              </span>
              <span className="text-lg font-mono font-bold text-stone-600 line-through">
                {formatINR(middlemanPrice)}
              </span>
            </div>
          </div>

          {/* Action to Create Bill with this Price */}
          <button
            onClick={() => navigate(`/seller/create-bill?price=${recommendedPrice}&mat=${materialCost}&labor=${laborCost}`)}
            className="w-full py-3 rounded-full bg-[#A8462D] hover:bg-[#8E3822] text-[#FFFDF8] font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>{expI18n.btnCreateBill || t.finalizeBill || "Generate Official Bill with this Price →"}</span>
          </button>
        </div>
      </div>

      {/* 3. Below: Cost Breakdown & Price Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h4 className="font-serif font-bold text-base text-[#29221D] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#A8462D]" />
            <span>{t.costBreakdown || "Cost Breakdown"}</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#D9CEB8]/40">
              <span className="text-[#7A6E65]">{t.materialCost || "Raw Materials"}:</span>
              <span className="font-mono font-bold text-[#29221D]">{formatINR(materialCost)} ({Math.round((materialCost / totalCost) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#D9CEB8]/40">
              <span className="text-[#7A6E65]">{t.labourCost || "Artisan Labor"} ({hoursSpent} hrs × ₹{hourlyWage}):</span>
              <span className="font-mono font-bold text-[#4A7A52]">{formatINR(laborCost)} ({Math.round((laborCost / totalCost) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#D9CEB8]/40">
              <span className="text-[#7A6E65]">{t.transportationCost || "Packaging & Transport"}:</span>
              <span className="font-mono font-bold text-[#29221D]">{formatINR(packagingCost + shippingCost)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 pt-2 font-bold text-[#29221D]">
              <span>{t.totalCost || "Net Cost of Production"}:</span>
              <span className="font-mono text-sm text-[#A8462D]">{formatINR(totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Price Explanation */}
        <div className="bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h4 className="font-serif font-bold text-base text-[#29221D] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4A7A52]" />
            <span>{t.pricingRationale || "Price Explanation & Ethics"}</span>
          </h4>

          <div className="p-4 rounded-xl bg-[#FDF6F0] border border-[#D9CEB8] text-xs text-[#5C4A3A] space-y-2 leading-relaxed">
            <p>
              {expI18n.plainLanguageExplanation
                ? expI18n.plainLanguageExplanation(hoursSpent)
                : `Under our Cost-Plus formula, your craftsmanship is compensated at ₹${hourlyWage}/hr, exceeding regional minimum daily craft wages.`}
            </p>
            <p>
              {expI18n.middlemanContrastDesc
                ? expI18n.middlemanContrastDesc(middlemanPrice, estimatedProfit)
                : `Direct buyers value authentic provenance and ethical transparency. Never discount below your ₹${totalCost} break-even floor.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
