import React, { useState, useEffect } from 'react';
import { Bill } from '../../types';
import { formatINR } from '../../lib/billingService';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { ShieldCheck, Award, Printer, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSpeechLocale } from '../../config/languages';
import { getVoicePrompts } from '../../config/voicePrompts';

interface BillPreviewProps {
  bill: Bill;
}

export function BillPreview({ bill }: BillPreviewProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Compute or read fair pricing parameters
  const materialCost = bill.materialCost || 800;
  const laborHours = bill.laborHours || Math.round((bill.labourCost || 1500) / (bill.fairHourlyWage || 100)) || 15;
  const fairHourlyWage = bill.fairHourlyWage || 100;
  const laborValue = bill.laborValue || bill.labourCost || (laborHours * fairHourlyWage);
  const baseCost = bill.baseCost || (materialCost + laborValue + (bill.otherCost || 0) + (bill.transportationCost || 0));
  const marginOrContingency = bill.marginAmount || Math.round(baseCost * 0.25);
  const recommendedFairPrice = bill.recommendedFairPrice || bill.recommendedPrice || (baseCost + marginOrContingency);
  const sellingPrice = bill.finalPrice || recommendedFairPrice;

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleExplainFairPrice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const formattedRec = formatINR(recommendedFairPrice);
    const formattedMat = formatINR(materialCost);
    const formattedWage = formatINR(fairHourlyWage);
    const formattedLabor = formatINR(laborValue);

    const prompts = getVoicePrompts(language);
    const text = prompts.explainFairPrice(
      formattedRec,
      formattedMat,
      laborHours,
      formattedWage
    );

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLocale(language);

    if ('getVoices' in window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase() === utterance.lang.toLowerCase() ||
          v.lang.toLowerCase().replace('_', '-').startsWith(language)
      );
      if (match) utterance.voice = match;
    }

    utterance.rate = 0.90;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-[#FFFDF8] rounded-3xl border border-[#D9CEB8] shadow-sm p-6 sm:p-10 max-w-4xl mx-auto font-sans print:p-0 print:border-0 print:shadow-none relative overflow-hidden" id="printable-bill">
      {/* Decorative top heritage stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#A8462D] via-[#C88732] to-[#273B59]" />

      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-[#D9CEB8] pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A8462D] to-[#8C3822] flex items-center justify-center text-[#FFFDF8] font-bold text-xs shadow-xs">
              ✦
            </div>
            <span className="text-2xl font-bold text-[#29221D] font-['Playfair_Display',serif]">ShilpSetu</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#A8462D]/10 text-[#A8462D] rounded-full border border-[#A8462D]/20 uppercase">Fair Trade</span>
          </div>
          <p className="text-xs text-[#7A6B5D] font-medium tracking-wide">
            Official Indian Handicraft Artisan Valuation & Invoice
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Direct Artisan Fair-Trade Certified
          </div>
        </div>

        <div className="sm:text-right">
          <span className="inline-block px-3 py-1 bg-[#F7F2E8] text-[#A8462D] border border-[#D9CEB8] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Handicraft Bill
          </span>
          <p className="text-sm font-bold text-[#29221D]">
            {t.invoiceNumber}: <span className="font-mono text-[#A8462D] font-bold">{bill.billNumber}</span>
          </p>
          <p className="text-xs text-[#7A6B5D] mt-0.5">
            {t.billDate}: {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Seller & Transaction Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-[#F7F2E8] rounded-2xl border border-[#D9CEB8] mb-6">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7A6B5D] mb-1.5">
            {t.sellerInfo}
          </h3>
          <p className="text-base font-bold text-[#29221D] font-['Playfair_Display',serif]">{bill.sellerName}</p>
          <p className="text-xs text-[#7A6B5D] mt-1">Location: {bill.sellerLocation}</p>
          <p className="text-xs text-[#7A6B5D]">Contact: {bill.sellerPhone}</p>
          <p className="text-xs text-[#7A6B5D] font-mono">ID: {bill.sellerId}</p>
        </div>

        <div className="sm:text-right">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7A6B5D] mb-1.5">
            {t.productDetails}
          </h3>
          <p className="text-base font-bold text-[#29221D] font-['Playfair_Display',serif]">{bill.productName}</p>
          <p className="text-xs text-[#7A6B5D] mt-1">{t.category}: <span className="font-semibold text-[#29221D]">{bill.productCategory}</span></p>
          <p className="text-xs text-[#7A6B5D]">{t.quantity}: <span className="font-bold text-[#29221D] font-mono">{bill.quantity} units</span></p>
        </div>
      </div>

      {/* Prominent FAIR PRICE BREAKDOWN Box */}
      <div className="mb-6 p-5 sm:p-6 bg-gradient-to-br from-[#A8462D]/5 via-[#C88732]/5 to-[#FFFDF8] rounded-2xl border border-[#D9CEB8] shadow-xs print:border-stone-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9CEB8]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C88732]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#29221D] font-['Playfair_Display',serif]">
                FAIR PRICE BREAKDOWN
              </h3>
            </div>
            <p className="text-[11px] text-[#7A6B5D] mt-0.5">
              Cost-plus living wage formula audited and certified for fair trade
            </p>
          </div>

          {/* Explain Fair Price Button */}
          <button
            type="button"
            onClick={handleExplainFairPrice}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all print:hidden cursor-pointer ${
              isSpeaking
                ? 'bg-[#A8462D] text-white animate-pulse'
                : 'bg-gradient-to-r from-[#A8462D] to-[#8C3822] text-white shadow-xs hover:opacity-95'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop' : '🔊 Explain Fair Price'}</span>
          </button>
        </div>

        {/* Breakdown Items List */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Raw Material */}
          <div className="p-3.5 bg-[#FFFDF8] rounded-xl border border-[#D9CEB8]">
            <span className="text-[11px] font-bold text-[#7A6B5D] uppercase flex items-center gap-1">
              🧵 Raw Material
            </span>
            <p className="text-base font-bold text-[#29221D] mt-1 font-mono">
              {formatINR(materialCost)}
            </p>
            <p className="text-[10px] text-[#7A6B5D]">Authentic materials</p>
          </div>

          {/* Your Work */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-900 uppercase flex items-center gap-1">
              👩‍🎨 Your Work
            </span>
            <p className="text-base font-bold text-emerald-950 mt-1 font-mono">
              {formatINR(laborValue)}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">
              {laborHours} hours × {formatINR(fairHourlyWage)}/hr
            </p>
          </div>

          {/* Base Production Cost */}
          <div className="p-3.5 bg-[#FFFDF8] rounded-xl border border-[#D9CEB8]">
            <span className="text-[11px] font-bold text-[#7A6B5D] uppercase flex items-center gap-1">
              📦 Base Cost
            </span>
            <p className="text-base font-bold text-[#29221D] mt-1 font-mono">
              {formatINR(baseCost)}
            </p>
            <p className="text-[10px] text-[#7A6B5D]">Materials + Labor</p>
          </div>

          {/* Margin / Contingency */}
          <div className="p-3.5 bg-[#C88732]/10 rounded-xl border border-[#C88732]/30">
            <span className="text-[11px] font-bold text-[#A8462D] uppercase flex items-center gap-1">
              📈 Margin (25%)
            </span>
            <p className="text-base font-bold text-[#A8462D] mt-1 font-mono">
              {formatINR(marginOrContingency)}
            </p>
            <p className="text-[10px] text-[#7A6B5D]">Contingency reserve</p>
          </div>
        </div>

        {/* Totals Comparison */}
        <div className="mt-4 pt-3.5 border-t border-[#D9CEB8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-bold uppercase text-[#29221D]">
              RECOMMENDED FAIR PRICE
            </span>
            <span className="text-xs text-[#7A6B5D] ml-2 font-mono">
              ({formatINR(recommendedFairPrice)} / unit)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-[#7A6B5D] block uppercase font-bold">Recommended</span>
              <span className="text-lg font-bold text-[#A8462D] font-mono">{formatINR(recommendedFairPrice * bill.quantity)}</span>
            </div>
            <div className="h-6 w-px bg-[#D9CEB8]"></div>
            <div className="text-right">
              <span className="text-[10px] text-[#7A6B5D] block uppercase font-bold">Artisan Selling Price</span>
              <span className="text-lg font-bold text-emerald-800 font-mono">{formatINR(sellingPrice * bill.quantity)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6B5D] mb-3">
          {t.costBreakdown}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#D9CEB8] text-[#7A6B5D] text-xs font-bold uppercase">
                <th className="py-2.5">Component</th>
                <th className="py-2.5 text-right">Cost Per Unit</th>
                <th className="py-2.5 text-right">Qty</th>
                <th className="py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D5] text-[#29221D]">
              <tr>
                <td className="py-2.5 font-medium">{t.materialCost}</td>
                <td className="py-2.5 text-right font-mono">{formatINR(materialCost)}</td>
                <td className="py-2.5 text-right font-mono">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium font-mono">{formatINR(materialCost * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.labourCost} ({laborHours}h @ {formatINR(fairHourlyWage)}/hr)</td>
                <td className="py-2.5 text-right font-mono">{formatINR(laborValue)}</td>
                <td className="py-2.5 text-right font-mono">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium font-mono">{formatINR(laborValue * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.transportationCost}</td>
                <td className="py-2.5 text-right font-mono">{formatINR(bill.transportationCost || 0)}</td>
                <td className="py-2.5 text-right font-mono">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium font-mono">{formatINR((bill.transportationCost || 0) * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.otherExpenses}</td>
                <td className="py-2.5 text-right font-mono">{formatINR(bill.otherCost || 0)}</td>
                <td className="py-2.5 text-right font-mono">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium font-mono">{formatINR((bill.otherCost || 0) * bill.quantity)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#D9CEB8] font-bold text-[#29221D] bg-[#F7F2E8]">
                <td className="py-3 px-3" colSpan={3}>{t.totalCost}</td>
                <td className="py-3 px-3 text-right font-mono">{formatINR(baseCost * bill.quantity)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Market Benchmark vs Final Valuation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-[#F7F2E8] border border-[#D9CEB8] rounded-2xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8462D] mb-2 font-['Playfair_Display',serif]">
            {t.marketPriceSection}
          </h4>
          <div className="space-y-1.5 text-xs text-[#7A6B5D]">
            <div className="flex justify-between">
              <span>{t.marketMinPrice}:</span>
              <span className="font-semibold font-mono text-[#29221D]">{formatINR(bill.marketMinPrice || recommendedFairPrice * 0.88)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#A8462D]">
              <span>{t.marketAvgPrice}:</span>
              <span className="font-mono">{formatINR(bill.marketAveragePrice || recommendedFairPrice * 1.15)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.marketMaxPrice}:</span>
              <span className="font-semibold font-mono text-[#29221D]">{formatINR(bill.marketMaxPrice || recommendedFairPrice * 1.45)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-[#D9CEB8] text-[#A8462D] font-bold">
              <span>{t.aiRecommendedPrice}:</span>
              <span className="font-mono">{formatINR(recommendedFairPrice)}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 font-['Playfair_Display',serif]">
            {t.financialSummary}
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[#7A6B5D]">
              <span>Recommended Unit Fair Price:</span>
              <span className="font-bold text-[#A8462D] font-mono">{formatINR(recommendedFairPrice)}</span>
            </div>
            <div className="flex justify-between text-[#7A6B5D]">
              <span>Artisan Approved Selling Price:</span>
              <span className="font-bold text-[#29221D] font-mono">{formatINR(sellingPrice)}</span>
            </div>
            <div className="flex justify-between text-[#7A6B5D]">
              <span>Total Bill Amount ({bill.quantity} pcs):</span>
              <span className="text-base font-bold text-[#29221D] font-mono">{formatINR(sellingPrice * bill.quantity)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-emerald-200 font-bold text-emerald-800">
              <span>{t.profitLabel}:</span>
              <span className="text-sm font-mono">+{formatINR((sellingPrice - baseCost) * bill.quantity)} ({bill.profitPercentage || Math.round(((sellingPrice - baseCost) / baseCost) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authenticity Stamp and Sign-off */}
      <div className="pt-6 border-t border-[#D9CEB8] flex flex-col sm:flex-row justify-between items-center text-xs text-[#7A6B5D] gap-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-[#C88732]" />
          <div>
            <p className="font-bold text-[#29221D]">Verified Handicraft Origin</p>
            <p>Protected by ShilpSetu Fair Pricing & Provenance protocol.</p>
          </div>
        </div>

        <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
          <div className="w-36 h-10 border-b border-dashed border-[#A8462D]/40 mx-auto sm:ml-auto mb-1 flex items-end justify-center font-['Playfair_Display',serif] text-[#29221D] italic font-semibold">
            {bill.sellerName}
          </div>
          <p className="text-[10px] text-[#7A6B5D]">Authorized Artisan Signature</p>
        </div>
      </div>
    </div>
  );
}
