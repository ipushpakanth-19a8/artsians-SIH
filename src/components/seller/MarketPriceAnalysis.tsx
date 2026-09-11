import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, ShieldCheck, Volume2, ArrowRight,
  Info, CheckCircle, Calculator, FileText, PlusCircle, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';

export function MarketPriceAnalysis() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  // Inputs
  const [materialCost, setMaterialCost] = useState<number>(450);
  const [hoursSpent, setHoursSpent] = useState<number>(10);
  const [hourlyWage, setHourlyWage] = useState<number>(85); // Living wage rate
  const [packagingCost, setPackagingCost] = useState<number>(60);
  const [shippingCost, setShippingCost] = useState<number>(100);
  const [desiredMargin, setDesiredMargin] = useState<number>(35); // 35% margin
  const [category, setCategory] = useState<string>('Handloom');

  // Calculations
  const laborCost = Math.round(hoursSpent * hourlyWage);
  const totalCost = materialCost + laborCost + packagingCost + shippingCost;

  // Margin based calculation
  const calculatedBasePrice = Math.round(totalCost / (1 - (desiredMargin / 100)));
  const recommendedPrice = Math.round(calculatedBasePrice / 10) * 10 - 1; // e.g. 1249
  const minRange = Math.round((recommendedPrice * 0.92) / 50) * 50;
  const maxRange = Math.round((recommendedPrice * 1.08) / 50) * 50;
  const estimatedProfit = recommendedPrice - totalCost;
  const middlemanPrice = Math.round(totalCost * 0.75); // Traditional exploitative middleman rate

  const handleListen = () => {
    const text = language === 'hi'
      ? `आपकी कुल लागत ₹${totalCost} है, जिसमें सामग्री और आपकी मजदूरी शामिल है। हमारा AI ₹${recommendedPrice} का उचित विक्रय मूल्य सुझाता है। इससे आपको लगभग ₹${estimatedProfit} का मुनाफ़ा होगा।`
      : language === 'te'
      ? `మీ మొత్తం ఖర్చు ₹${totalCost}, ఇందులో ముడి పదార్థాలు మరియు మీ శ్రమ వేతనం ఉన్నాయి. AI సిఫార్సు చేసిన ధర ₹${recommendedPrice}. దీని ద్వారా మీకు సుమారు ₹${estimatedProfit} లాభం లభిస్తుంది.`
      : `Your total cost is ₹${totalCost}, including materials and your labor time. Our AI recommends a fair price of ₹${recommendedPrice}. This provides you an estimated profit of ₹${estimatedProfit}.`;
    speakText(text, language);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2e9] text-[#9c4124] text-xs font-black uppercase tracking-wider mb-2 border border-[#f8d7c2]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Fair Price Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#262220] font-['Rozha_One',serif] tracking-tight">
            {language === 'hi' ? 'मुझे क्या दाम लेना चाहिए?' : language === 'te' ? 'నేను ఎంత ధర నిర్ణయించాలి?' : 'What Should I Charge?'}
          </h1>
          <p className="text-sm text-stone-600 font-medium mt-1 max-w-xl">
            Enter your raw material cost, crafting hours, and expenses. Our transparent cost-plus model ensures fair living wages without middleman cuts.
          </p>
        </div>

        <button
          onClick={handleListen}
          className="artisan-listen-btn cursor-pointer py-2 px-3.5 text-xs self-start sm:self-center shadow-xs"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen in Audio 🔊</span>
        </button>
      </div>

      {/* Main 2-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cost Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfd4] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#eadfd4]">
            <h2 className="font-extrabold text-base text-[#262220] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#9c4124]" />
              <span>Your Craft Expenses</span>
            </h2>
            <span className="text-xs text-stone-500 font-semibold">100% Transparent</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Craft Category */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">Craft Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#faf7f2] px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              >
                {['Handloom', 'Pottery', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Painting', 'Embroidery', 'Bamboo/Cane'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Raw Material Cost */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700">Raw Material Cost (₹)</label>
                <span className="text-stone-500">Clay, silk yarn, dyes, wood, brass</span>
              </div>
              <input
                type="number"
                min="0"
                value={materialCost}
                onChange={(e) => setMaterialCost(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#faf7f2] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              />
            </div>

            {/* Time Spent & Hourly Wage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Time Spent (Hours)</label>
                <input
                  type="number"
                  min="1"
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#faf7f2] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">Labor Wage (₹/hr)</label>
                  <span className="text-[10px] text-emerald-700 font-bold">Living wage standard</span>
                </div>
                <input
                  type="number"
                  min="50"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#faf7f2] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
                />
              </div>
            </div>

            {/* Packaging & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Packaging Box & Wrap (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#faf7f2] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Courier & Transport (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#faf7f2] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
                />
              </div>
            </div>

            {/* Desired Profit Margin Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700">Desired Profit Margin</label>
                <span className="font-black text-[#9c4124] text-sm">{desiredMargin}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                value={desiredMargin}
                onChange={(e) => setDesiredMargin(Number(e.target.value))}
                className="w-full accent-[#9c4124] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-bold mt-0.5">
                <span>15% (Budget)</span>
                <span>35% (Fair Living Standard)</span>
                <span>60% (Masterpiece)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Suggested Selling Price & Advisory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Recommended Price Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfd4] shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                AI Suggested Price
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#262220] mt-2 font-['Rozha_One',serif]">
                ₹{recommendedPrice}
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Market Position: <strong className="text-emerald-700">Competitive & Fair</strong>
              </p>
            </div>

            {/* Price Range */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>Fair Price Range:</span>
                <span className="text-[#9c4124] font-black">₹{minRange} — ₹{maxRange}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Recommended: <strong>₹{recommendedPrice}</strong> (Avoid pricing below ₹{minRange} to protect labor value).
              </p>
            </div>

            {/* Cost vs Profit Breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#eadfd4] text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Your Total Cost:</span>
                <strong className="text-stone-900">₹{totalCost}</strong>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Suggested Selling Price:</span>
                <strong className="text-[#9c4124]">₹{recommendedPrice}</strong>
              </div>
              <div className="flex items-center justify-between text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <span>Estimated Artisan Profit:</span>
                <span className="text-sm font-black text-emerald-900">+₹{estimatedProfit}</span>
              </div>
            </div>

            {/* Plain-Language Explanation */}
            <div className="p-3.5 rounded-2xl bg-[#fdf2e9] border border-[#f8d7c2] text-xs text-[#9c4124] leading-relaxed">
              <div className="flex items-start gap-1.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  "Your suggested price is based on your material cost, estimated labour value of {hoursSpent} hours, and comparable market pricing."
                </p>
              </div>
            </div>

            {/* Middleman Comparison Reassurance */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <span className="font-bold text-stone-700 block">Middleman Contrast:</span>
              <p>
                Local middlemen typically pay merely <strong>₹{middlemanPrice}</strong>. By selling directly on ShilpSetu, you retain an extra <strong>+₹{recommendedPrice - middlemanPrice}</strong> in earnings.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate(`/seller/add?price=${recommendedPrice}&cost=${materialCost}`)}
                className="artisan-btn-primary w-full py-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply Price to New Product Listing</span>
                <PlusCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate(`/seller/create-bill?price=${recommendedPrice}`)}
                className="artisan-btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#9c4124]" />
                <span>Create Printed Bill with This Price</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
