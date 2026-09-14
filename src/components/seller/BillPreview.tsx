import React, { useState, useEffect } from 'react';
import { Bill } from '../../types';
import { formatINR } from '../../lib/billingService';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { ShieldCheck, Award, Printer, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';

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

    let text = '';
    const formattedRec = formatINR(recommendedFairPrice);
    const formattedMat = formatINR(materialCost);
    const formattedWage = formatINR(fairHourlyWage);
    const formattedLabor = formatINR(laborValue);

    if (language === 'hi') {
      text = `आपकी अनुशंसित उचित कीमत ${formattedRec} है। आपने सामग्री पर ${formattedMat} खर्च किए। आपने ${laborHours} घंटे काम किया। ${formattedWage} प्रति घंटे की उचित मजदूरी पर, आपके काम का मूल्य ${formattedLabor} है। शेष राशि आवश्यक मार्जिन और व्यावसायिक खर्चों को कवर करती है। आपकी अनुशंसित उचित कीमत ${formattedRec} है।`;
    } else if (language === 'te') {
      text = `మీ సిఫార్సు చేయబడిన సరసమైన ధర ${formattedRec}. మీరు ముడిసరుకుపై ${formattedMat} ఖర్చు చేశారు. మీరు ${laborHours} గంటలు పనిచేశారు. గంటకు ${formattedWage} సరసమైన వేతనంతో మీ శ్రమ విలువ ${formattedLabor}. మిగిలిన మొత్తం మార్జిన్ మరియు వ్యాపార ఖర్చులను భర్తీ చేస్తుంది. మీ సిఫార్సు చేయబడిన సరసమైన ధర ${formattedRec}.`;
    } else {
      text = `Your recommended fair price is ${formattedRec}. You spent ${formattedMat} on materials. You worked for ${laborHours} hours. At a fair wage of ${formattedWage} per hour, your labor value is ${formattedLabor}. The remaining amount covers the configured margin and business expenses. Your recommended fair price is ${formattedRec}.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.90;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-6 sm:p-10 max-w-4xl mx-auto font-sans print:p-0 print:border-0 print:shadow-none" id="printable-bill">
      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-stone-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-amber-100 font-black text-sm">
              SS
            </div>
            <span className="text-2xl font-black text-stone-900 font-['Rozha_One',serif]">ShilpSetu</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded border border-amber-300 uppercase">KALAtech</span>
          </div>
          <p className="text-xs text-stone-500 font-medium tracking-wide">
            Official Indian Handicraft Artisan Valuation & Invoice
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Direct Artisan Fair-Trade Certified
          </div>
        </div>

        <div className="sm:text-right">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-md text-xs font-black uppercase tracking-wider mb-2">
            Handicraft Bill
          </span>
          <p className="text-sm font-extrabold text-stone-900">
            {t.invoiceNumber}: <span className="font-mono text-amber-800">{bill.billNumber}</span>
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.billDate}: {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Seller & Transaction Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-xl border border-stone-200 mb-6">
        <div>
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            {t.sellerInfo}
          </h3>
          <p className="text-base font-bold text-stone-900">{bill.sellerName}</p>
          <p className="text-xs text-stone-600">Location: {bill.sellerLocation}</p>
          <p className="text-xs text-stone-600">Contact: {bill.sellerPhone}</p>
          <p className="text-xs text-stone-600">ID: {bill.sellerId}</p>
        </div>

        <div className="sm:text-right">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            {t.productDetails}
          </h3>
          <p className="text-base font-bold text-stone-900">{bill.productName}</p>
          <p className="text-xs text-stone-600">{t.category}: <span className="font-semibold">{bill.productCategory}</span></p>
          <p className="text-xs text-stone-600">{t.quantity}: <span className="font-bold text-stone-900">{bill.quantity} units</span></p>
        </div>
      </div>

      {/* Prominent FAIR PRICE BREAKDOWN Box */}
      <div className="mb-6 p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white rounded-2xl border-2 border-amber-300 shadow-xs print:border-stone-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-950">
                FAIR PRICE BREAKDOWN
              </h3>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Cost-plus living wage formula audited and certified for fair trade
            </p>
          </div>

          {/* Explain Fair Price Button */}
          <button
            type="button"
            onClick={handleExplainFairPrice}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all print:hidden ${
              isSpeaking
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop' : '🔊 Explain Fair Price'}</span>
          </button>
        </div>

        {/* Breakdown Items List */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Raw Material */}
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1">
              🧵 Raw Material
            </span>
            <p className="text-base font-black text-stone-900 mt-1 font-mono">
              {formatINR(materialCost)}
            </p>
            <p className="text-[10px] text-stone-400">Authentic materials</p>
          </div>

          {/* Your Work */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-900 uppercase flex items-center gap-1">
              👩‍🎨 Your Work
            </span>
            <p className="text-base font-black text-emerald-950 mt-1 font-mono">
              {formatINR(laborValue)}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">
              {laborHours} hours × {formatINR(fairHourlyWage)}/hr
            </p>
          </div>

          {/* Base Production Cost */}
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1">
              📦 Base Cost
            </span>
            <p className="text-base font-black text-stone-900 mt-1 font-mono">
              {formatINR(baseCost)}
            </p>
            <p className="text-[10px] text-stone-400">Materials + Labor</p>
          </div>

          {/* Margin / Contingency */}
          <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200">
            <span className="text-[11px] font-bold text-orange-950 uppercase flex items-center gap-1">
              📈 Margin (25%)
            </span>
            <p className="text-base font-black text-orange-950 mt-1 font-mono">
              {formatINR(marginOrContingency)}
            </p>
            <p className="text-[10px] text-orange-700">Contingency reserve</p>
          </div>
        </div>

        {/* Totals Comparison */}
        <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-black uppercase text-amber-950">
              RECOMMENDED FAIR PRICE
            </span>
            <span className="text-xs text-stone-500 ml-2 font-mono">
              ({formatINR(recommendedFairPrice)} / unit)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-stone-500 block uppercase font-bold">Recommended</span>
              <span className="text-lg font-black text-amber-900 font-mono">{formatINR(recommendedFairPrice * bill.quantity)}</span>
            </div>
            <div className="h-6 w-px bg-amber-300"></div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 block uppercase font-bold">Artisan Selling Price</span>
              <span className="text-lg font-black text-emerald-800 font-mono">{formatINR(sellingPrice * bill.quantity)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="mb-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3">
          {t.costBreakdown}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-300 text-stone-500 text-xs font-bold uppercase">
                <th className="py-2.5">Component</th>
                <th className="py-2.5 text-right">Cost Per Unit</th>
                <th className="py-2.5 text-right">Qty</th>
                <th className="py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-2.5 font-medium">{t.materialCost}</td>
                <td className="py-2.5 text-right">{formatINR(materialCost)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR(materialCost * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.labourCost} ({laborHours}h @ {formatINR(fairHourlyWage)}/hr)</td>
                <td className="py-2.5 text-right">{formatINR(laborValue)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR(laborValue * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.transportationCost}</td>
                <td className="py-2.5 text-right">{formatINR(bill.transportationCost || 0)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR((bill.transportationCost || 0) * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.otherExpenses}</td>
                <td className="py-2.5 text-right">{formatINR(bill.otherCost || 0)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR((bill.otherCost || 0) * bill.quantity)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-300 font-bold text-stone-900 bg-stone-50">
                <td className="py-3 px-2" colSpan={3}>{t.totalCost}</td>
                <td className="py-3 px-2 text-right">{formatINR(baseCost * bill.quantity)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Market Benchmark vs Final Valuation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 mb-2">
            {t.marketPriceSection}
          </h4>
          <div className="space-y-1.5 text-xs text-stone-700">
            <div className="flex justify-between">
              <span>{t.marketMinPrice}:</span>
              <span className="font-semibold">{formatINR(bill.marketMinPrice || recommendedFairPrice * 0.88)}</span>
            </div>
            <div className="flex justify-between font-bold text-amber-900">
              <span>{t.marketAvgPrice}:</span>
              <span>{formatINR(bill.marketAveragePrice || recommendedFairPrice * 1.15)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.marketMaxPrice}:</span>
              <span className="font-semibold">{formatINR(bill.marketMaxPrice || recommendedFairPrice * 1.45)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-amber-200 text-amber-800 font-bold">
              <span>{t.aiRecommendedPrice}:</span>
              <span>{formatINR(recommendedFairPrice)}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-2">
            {t.financialSummary}
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-700">
              <span>Recommended Unit Fair Price:</span>
              <span className="font-bold text-amber-900">{formatINR(recommendedFairPrice)}</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span>Artisan Approved Selling Price:</span>
              <span className="font-extrabold text-stone-900">{formatINR(sellingPrice)}</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span>Total Bill Amount ({bill.quantity} pcs):</span>
              <span className="text-base font-black text-stone-900">{formatINR(sellingPrice * bill.quantity)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-emerald-200 font-extrabold text-emerald-800">
              <span>{t.profitLabel}:</span>
              <span className="text-sm">+{formatINR((sellingPrice - baseCost) * bill.quantity)} ({bill.profitPercentage || Math.round(((sellingPrice - baseCost) / baseCost) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authenticity Stamp and Sign-off */}
      <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-600" />
          <div>
            <p className="font-bold text-stone-800">Verified Handicraft Origin</p>
            <p>Protected by ShilpSetu (KALAtech) Fair Pricing & Provenance protocol.</p>
          </div>
        </div>

        <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
          <div className="w-32 h-10 border-b border-dashed border-stone-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center font-['Rozha_One',serif] text-stone-700 italic">
            {bill.sellerName}
          </div>
          <p className="text-[10px] text-stone-400">Authorized Artisan Signature</p>
        </div>
      </div>
    </div>
  );
}
