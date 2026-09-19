import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, ArrowRight, Check, Sparkles, AlertCircle, RefreshCw, Printer, Mic, Volume2, MicOff } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { calculateBill, generateBillNumber, validateBill, formatINR } from '../../lib/billingService';
import { getMarketPriceAnalysis, getMarketRecommendationText } from '../../lib/marketPriceService';
import { Bill, Product, FairPricingResponse, LanguageCode } from '../../types';
import { BillPreview } from './BillPreview';
import { FairPriceBreakdownCard } from '../common/FairPriceBreakdownCard';
import { useVoiceForm } from '../../lib/useVoiceForm';
import { VOICE_QUESTIONS } from '../../lib/voiceQuestionsI18n';
import { getCraftExpensesI18n } from '../../i18n/craftExpenses.i18n';
import { parseQuantityTranscript } from '../../lib/voiceParsingService';

export function CreateBill() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isCustomProduct, setIsCustomProduct] = useState(false);

  // Form State
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Handloom');
  const [quantity, setQuantity] = useState(1);
  const [materialCost, setMaterialCost] = useState(800);
  const [laborHours, setLaborHours] = useState(12);
  const [fairHourlyWage, setFairHourlyWage] = useState(100);
  const [labourCost, setLabourCost] = useState(1200);
  const [transportationCost, setTransportationCost] = useState(150);
  const [otherCost, setOtherCost] = useState(50);
  const [proposedPrice, setProposedPrice] = useState(3200);
  const [finalPrice, setFinalPrice] = useState(3200);

  // Fair pricing & Voice Explanation state
  const [fairPricing, setFairPricing] = useState<FairPricingResponse | null>(null);
  const [isCalculatingFairPrice, setIsCalculatingFairPrice] = useState(false);

  // Market comparison state
  const [marketMin, setMarketMin] = useState(2800);
  const [marketAvg, setMarketAvg] = useState(3600);
  const [marketMax, setMarketMax] = useState(4800);
  const [aiRecPrice, setAiRecPrice] = useState(3400);
  const [aiRationale, setAiRationale] = useState('');

  // Finalized Bill
  const [finalizedBill, setFinalizedBill] = useState<Bill | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ── Voice Typing for Billing Fields ──
  const lang = (language as LanguageCode) || 'en';
  const expI18n = getCraftExpensesI18n(lang);
  const vq = VOICE_QUESTIONS[lang] || VOICE_QUESTIONS.en;
  const { speak, listen, stopAll, isSpeaking, isListening, micPermissionDenied } = useVoiceForm(lang);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [lastVoiceResult, setLastVoiceResult] = useState<string>('');

  const handleBillingMic = useCallback((fieldKey: string, prompt: string, setter: (v: number) => void) => {
    if (activeVoiceField === fieldKey) {
      stopAll();
      setActiveVoiceField(null);
      return;
    }
    stopAll();
    setActiveVoiceField(fieldKey);
    setLastVoiceResult('');
    speak(prompt, () => {
      listen((spokenText: string) => {
        const parsed = parseQuantityTranscript(spokenText);
        if (parsed !== null && parsed >= 0) {
          setter(parsed);
          setLastVoiceResult(`${spokenText} → ${parsed}`);
        } else {
          const num = parseInt(spokenText.replace(/[^\d]/g, ''), 10);
          if (!isNaN(num) && num >= 0) {
            setter(num);
            setLastVoiceResult(`${spokenText} → ${num}`);
          } else if (spokenText.trim()) {
            setLastVoiceResult(spokenText);
          }
        }
        setActiveVoiceField(null);
      });
    });
  }, [activeVoiceField, stopAll, speak, listen]);

  // Load seller's products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          // Set first as default
          const p = data[0];
          setSelectedProductId(p.id);
          setProductName(p.title);
          setProductCategory(p.category);
          if (p.cost) {
            setMaterialCost(p.cost.material_cost || 800);
            const hrs = p.laborHours || p.cost.labor_hours || 12;
            const wage = p.fairHourlyWage || p.cost.hourly_rate || 100;
            setLaborHours(hrs);
            setFairHourlyWage(wage);
            setLabourCost(hrs * wage);
            setOtherCost(p.cost.other_cost || 50);
          }
          if (p.recommendedFairPrice) {
            setAiRecPrice(p.recommendedFairPrice);
          }
          if (p.final_price) {
            setProposedPrice(p.final_price);
            setFinalPrice(p.final_price);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Update form when selecting a product
  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    if (pId === 'custom') {
      setIsCustomProduct(true);
      setProductName('');
      return;
    }
    setIsCustomProduct(false);
    const p = products.find(x => x.id === pId);
    if (p) {
      setProductName(p.title);
      setProductCategory(p.category);
      if (p.cost) {
        setMaterialCost(p.cost.material_cost || 0);
        const hrs = p.laborHours || p.cost.labor_hours || 10;
        const wage = p.fairHourlyWage || p.cost.hourly_rate || 100;
        setLaborHours(hrs);
        setFairHourlyWage(wage);
        setLabourCost(hrs * wage);
        setOtherCost(p.cost.other_cost || 0);
      }
      if (p.recommendedFairPrice) {
        setAiRecPrice(p.recommendedFairPrice);
      }
      if (p.final_price) {
        setProposedPrice(p.final_price);
        setFinalPrice(p.final_price);
      }
    }
  };

  // Perform calculations
  const calc = calculateBill({
    materialCost,
    labourCost,
    transportationCost,
    otherCost,
    finalPrice,
    quantity,
  });

  // Fetch market analysis and deterministic backend fair pricing on stepping to Step 3
  const handleGoToStep3 = async () => {
    const totalUnitCost = materialCost + labourCost + transportationCost + otherCost;
    setIsCalculatingFairPrice(true);

    try {
      const fairRes = await fetch('/api/v1/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName || 'Handicraft Item',
          craftType: productCategory,
          material: 'Natural Artisan Material',
          materialCost,
          laborHours,
          fairHourlyWage,
          otherCost: transportationCost + otherCost,
          quantity,
          language,
        }),
      });

      if (fairRes.ok) {
        const fairData: FairPricingResponse = await fairRes.json();
        setFairPricing(fairData);
        if (fairData.recommendedFairPrice) {
          setAiRecPrice(fairData.recommendedFairPrice);
          setFinalPrice(proposedPrice || fairData.recommendedFairPrice);
        }
      }
    } catch (err) {
      console.warn('Fair pricing calculate failed:', err);
    } finally {
      setIsCalculatingFairPrice(false);
    }

    try {
      const res = await getMarketPriceAnalysis({
        category: productCategory,
        material: 'Silk/Cotton/Clay/Wood',
        currentCost: totalUnitCost,
        proposedPrice: proposedPrice,
      });
      setMarketMin(res.minPrice);
      setMarketAvg(res.averagePrice);
      setMarketMax(res.maxPrice);
      if (!fairPricing) {
        setAiRecPrice(res.recommendedPrice);
        setFinalPrice(proposedPrice || res.recommendedPrice);
      }

      const text = getMarketRecommendationText(
        proposedPrice || res.recommendedPrice,
        res.averagePrice,
        language
      );
      setAiRationale(text);
    } catch {
      // Defaults
      setMarketMin(Math.round(totalUnitCost * 1.3));
      setMarketAvg(Math.round(totalUnitCost * 1.6));
      setMarketMax(Math.round(totalUnitCost * 2.1));
      if (!fairPricing) {
        setAiRecPrice(Math.round(totalUnitCost * 1.5));
        setFinalPrice(proposedPrice);
      }
    }
    setStep(3);
  };

  // Finalize bill handler
  const handleFinalize = async () => {
    const billData: Bill = {
      id: 'bill-' + Date.now(),
      billNumber: generateBillNumber(),
      sellerId: user?.artisan?.id || 'art-01',
      sellerName: user?.artisan?.name || user?.name || 'Artisan Seller',
      sellerPhone: user?.artisan?.phone || '+91 98480 12345',
      sellerLocation: `${user?.artisan?.district || 'Pochampally'}, ${user?.artisan?.state || 'Telangana'}`,
      productId: selectedProductId || 'custom',
      productName: productName || 'Handicraft Item',
      productCategory,
      quantity,
      materialCost,
      laborHours,
      fairHourlyWage,
      laborValue: fairPricing?.breakdown.laborValue ?? (laborHours * fairHourlyWage),
      baseCost: fairPricing?.breakdown.baseCost ?? (materialCost + (laborHours * fairHourlyWage) + transportationCost + otherCost),
      marginAmount: fairPricing?.breakdown.marginAmount ?? Math.round((materialCost + (laborHours * fairHourlyWage) + transportationCost + otherCost) * 0.25),
      recommendedFairPrice: fairPricing?.recommendedFairPrice ?? aiRecPrice,
      artisanApprovedPrice: finalPrice,
      pricingFormulaVersion: fairPricing?.pricingFormulaVersion ?? 'v1.0-fair-wage',
      pricingCalculatedAt: fairPricing?.calculatedAt ?? new Date().toISOString(),
      labourCost,
      transportationCost,
      otherCost,
      totalCost: calc.totalCost,
      proposedPrice,
      marketMinPrice: marketMin,
      marketAveragePrice: marketAvg,
      marketMaxPrice: marketMax,
      recommendedPrice: fairPricing?.recommendedFairPrice ?? aiRecPrice,
      finalPrice: finalPrice,
      profit: calc.profit,
      profitPercentage: calc.profitPercentage,
      status: 'finalized',
      createdAt: new Date().toISOString(),
      finalizedAt: new Date().toISOString(),
    };

    const errors = validateBill(billData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    // Save bill via API or localStorage fallback
    try {
      await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
    } catch {
      // Local fallback
      const existing = JSON.parse(localStorage.getItem('ShilpSetu_bills') || '[]');
      existing.unshift(billData);
      localStorage.setItem('ShilpSetu_bills', JSON.stringify(existing));
    }

    setFinalizedBill(billData);
    setStep(4);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <button
            onClick={() => navigate('/seller')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6B5D] hover:text-[#A8462D] mb-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#29221D] font-['Playfair_Display',serif] flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#A8462D]" />
            {t.createBill}
          </h1>
          <p className="text-sm text-[#7A6B5D] font-medium">{t.billTitle}</p>
        </div>

        {/* Wizard Step Tracker */}
        <div className="flex items-center gap-2 bg-[#FFFDF8] px-3.5 py-2 rounded-full border border-[#D9CEB8] shadow-xs text-xs font-bold">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1 ? 'bg-[#A8462D] text-[#FFFDF8]' : 'bg-[#F7F2E8] text-[#7A6B5D]'}`}>1</span>
          <span className="text-[#D9CEB8]">→</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2 ? 'bg-[#A8462D] text-[#FFFDF8]' : 'bg-[#F7F2E8] text-[#7A6B5D]'}`}>2</span>
          <span className="text-[#D9CEB8]">→</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 3 ? 'bg-[#A8462D] text-[#FFFDF8]' : 'bg-[#F7F2E8] text-[#7A6B5D]'}`}>3</span>
          <span className="text-[#D9CEB8]">→</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 4 ? 'bg-emerald-600 text-[#FFFDF8]' : 'bg-[#F7F2E8] text-[#7A6B5D]'}`}>✓</span>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <span className="font-bold">Please correct the following:</span>
            <ul className="list-disc ml-5 mt-1 text-xs">
              {validationErrors.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* STEP 1: Select Handicraft */}
      {step === 1 && (
        <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#D9CEB8] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#29221D] font-['Playfair_Display',serif] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#A8462D]/10 text-[#A8462D] text-xs font-bold flex items-center justify-center">1</span>
            {t.selectHandicraft}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#7A6B5D] uppercase tracking-wider mb-3">
                Choose from Existing Inventory or Custom Item
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleProductSelect(prod.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedProductId === prod.id && !isCustomProduct
                        ? 'border-[#A8462D] bg-[#FDF6F0] shadow-xs'
                        : 'border-[#D9CEB8] hover:border-[#A8462D]/60 bg-[#FFFDF8] hover:bg-[#F7F2E8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {prod.enhanced_image_url || prod.original_image_url ? (
                        <img
                          src={prod.enhanced_image_url || prod.original_image_url}
                          alt={prod.title}
                          className="w-12 h-12 object-cover rounded-lg border border-[#D9CEB8] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#F7F2E8] rounded-lg flex items-center justify-center text-lg shrink-0">
                          🏺
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#29221D] text-xs line-clamp-1">{prod.title}</h3>
                        <p className="text-[10px] text-[#7A6B5D]">{prod.category}</p>
                        <p className="text-xs font-bold text-[#A8462D] font-mono mt-0.5">₹{prod.final_price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom Option */}
                <div
                  onClick={() => handleProductSelect('custom')}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer ${
                    isCustomProduct
                      ? 'border-[#A8462D] bg-[#FDF6F0] shadow-xs'
                      : 'border-dashed border-[#D9CEB8] hover:border-[#A8462D]/60 bg-[#F7F2E8]'
                  }`}
                >
                  <div className="w-12 h-12 bg-[#A8462D]/10 text-[#A8462D] rounded-lg flex items-center justify-center font-bold text-xl shrink-0">
                    +
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#29221D] text-xs">Custom / New Handicraft</h3>
                    <p className="text-[10px] text-[#7A6B5D] truncate">Item not yet cataloged</p>
                  </div>
                </div>
              </div>
            </div>

            {isCustomProduct && (
              <div className="pt-4 border-t border-[#D9CEB8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.productTitle} *</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Handmade Terracotta Water Vessel"
                    className="w-full px-3.5 py-2.5 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.category}</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-medium"
                  >
                    {['Handloom', 'Pottery', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Paintings', 'Bamboo/Cane', 'Textiles', 'Traditional Decor', 'Weaving', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.quantity} *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-36 px-3.5 py-2.5 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                if (!productName.trim()) {
                  setValidationErrors(['Please enter or select a product']);
                  return;
                }
                setValidationErrors([]);
                setStep(2);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#A8462D] to-[#8C3822] hover:opacity-95 text-[#FFFDF8] rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              {t.next} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Enter Cost Details */}
      {step === 2 && (
        <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#D9CEB8] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D9CEB8]">
            <h2 className="text-lg font-bold text-[#29221D] font-['Playfair_Display',serif] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#A8462D]/10 text-[#A8462D] text-xs font-bold flex items-center justify-center">2</span>
              {t.enterCostDetails}
            </h2>
            <span className="text-xs text-[#A8462D] font-bold bg-[#A8462D]/10 px-3 py-1 rounded-full border border-[#A8462D]/20 self-start sm:self-auto">
              🎙️ {expI18n.voiceTypingHint}
            </span>
          </div>

          {/* Active Voice Toast */}
          {activeVoiceField && (
            <div className="flex items-center gap-2 p-3.5 bg-[#C88732]/10 border border-[#C88732]/30 rounded-2xl text-xs font-bold text-[#A8462D] animate-pulse shadow-sm">
              <Mic className="w-4 h-4 text-[#A8462D] animate-bounce" />
              <span>{isSpeaking ? expI18n.speaking : expI18n.listening}</span>
              <button
                type="button"
                onClick={() => {
                  stopAll();
                  setActiveVoiceField(null);
                }}
                className="ml-auto px-2.5 py-1 bg-[#FFFDF8] hover:bg-white border border-[#D9CEB8] rounded-lg text-[11px] text-[#29221D]"
              >
                Cancel
              </button>
            </div>
          )}

          {lastVoiceResult && !activeVoiceField && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Recognized: &quot;{lastVoiceResult}&quot;</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Material Cost */}
              <div>
                <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.materialCost} (₹ per unit)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 pr-12 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-bold font-mono text-[#29221D]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleBillingMic('materialCost', vq.askMaterialCost || expI18n.materialCostPrompt, setMaterialCost)
                    }
                    title="Voice Type Material Cost"
                    className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                      activeVoiceField === 'materialCost'
                        ? 'bg-[#A8462D] text-white animate-pulse'
                        : 'bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#7A6B5D] hover:text-[#A8462D] border border-[#D9CEB8]'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-[#7A6B5D] mt-1">{expI18n.materialCostSub}</p>
              </div>

              {/* Labor Hours & Fair Wage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#29221D] mb-1.5">👩‍🎨 {t.laborHours || 'Labor Hours'} (hrs)</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={laborHours}
                      onChange={(e) => {
                        const hrs = Math.max(1, parseInt(e.target.value) || 1);
                        setLaborHours(hrs);
                        setLabourCost(hrs * fairHourlyWage);
                      }}
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-bold font-mono text-[#29221D]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleBillingMic('laborHours', vq.askLaborHours || expI18n.timeSpentPrompt, (hrs) => {
                          const validHrs = Math.max(1, hrs);
                          setLaborHours(validHrs);
                          setLabourCost(validHrs * fairHourlyWage);
                        })
                      }
                      title="Voice Type Labor Hours"
                      className={`absolute right-1.5 p-1.5 rounded-lg transition-all ${
                        activeVoiceField === 'laborHours'
                          ? 'bg-[#A8462D] text-white animate-pulse'
                          : 'bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#7A6B5D] hover:text-[#A8462D] border border-[#D9CEB8]'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#7A6B5D] mt-1">{expI18n.timeSpentSub}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29221D] mb-1.5">⚖️ {t.fairHourlyWage || 'Fair Wage (₹/hr)'}</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="50"
                      value={fairHourlyWage}
                      onChange={(e) => {
                        const wage = Math.max(50, parseInt(e.target.value) || 100);
                        setFairHourlyWage(wage);
                        setLabourCost(laborHours * wage);
                      }}
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-bold font-mono text-[#29221D]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleBillingMic('fairHourlyWage', vq.askFairHourlyWage || expI18n.hourlyWagePrompt, (wage) => {
                          const validWage = Math.max(50, wage);
                          setFairHourlyWage(validWage);
                          setLabourCost(laborHours * validWage);
                        })
                      }
                      title="Voice Type Hourly Wage"
                      className={`absolute right-1.5 p-1.5 rounded-lg transition-all ${
                        activeVoiceField === 'fairHourlyWage'
                          ? 'bg-[#A8462D] text-white animate-pulse'
                          : 'bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#7A6B5D] hover:text-[#A8462D] border border-[#D9CEB8]'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">{expI18n.hourlyWageSub}</p>
                </div>
              </div>

              {/* Labour Cost (calculated) */}
              <div>
                <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.labourCost} (₹ calculated)</label>
                <input
                  type="number"
                  min="0"
                  value={labourCost}
                  onChange={(e) => setLabourCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-bold font-mono text-[#29221D]"
                />
                <p className="text-[11px] text-[#7A6B5D] mt-1">{laborHours} hrs × ₹{fairHourlyWage}/hr = ₹{labourCost}</p>
              </div>

              {/* Transportation Cost */}
              <div>
                <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.transportationCost} (₹ per unit)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    value={transportationCost}
                    onChange={(e) => setTransportationCost(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 pr-12 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-bold font-mono text-[#29221D]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleBillingMic('transportationCost', expI18n.shippingCostPrompt, setTransportationCost)
                    }
                    title="Voice Type Transportation Cost"
                    className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                      activeVoiceField === 'transportationCost'
                        ? 'bg-[#A8462D] text-white animate-pulse'
                        : 'bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#7A6B5D] hover:text-[#A8462D] border border-[#D9CEB8]'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-[#7A6B5D] mt-1">{expI18n.shippingCostSub}</p>
              </div>

              {/* Other Expenses */}
              <div>
                <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.otherExpenses} (₹ per unit)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 pr-12 bg-[#F7F2E8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-sm font-bold font-mono text-[#29221D]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleBillingMic('otherCost', expI18n.packagingCostPrompt, setOtherCost)
                    }
                    title="Voice Type Other Expenses"
                    className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                      activeVoiceField === 'otherCost'
                        ? 'bg-[#A8462D] text-white animate-pulse'
                        : 'bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#7A6B5D] hover:text-[#A8462D] border border-[#D9CEB8]'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-[#7A6B5D] mt-1">Tools wear, finishing polish, overheads</p>
              </div>
            </div>

            {/* Live Cost Summary Box */}
            <div className="bg-[#F7F2E8] p-6 rounded-2xl border border-[#D9CEB8] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6B5D] mb-3 font-['Playfair_Display',serif]">Unit Cost Breakdown</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-[#D9CEB8]">
                    <span className="text-[#7A6B5D]">{t.materialCost}</span>
                    <span className="font-bold font-mono text-[#29221D]">{formatINR(materialCost)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D9CEB8]">
                    <span className="text-[#7A6B5D]">{t.labourCost}</span>
                    <span className="font-bold font-mono text-[#29221D]">{formatINR(labourCost)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D9CEB8]">
                    <span className="text-[#7A6B5D]">{t.transportationCost}</span>
                    <span className="font-bold font-mono text-[#29221D]">{formatINR(transportationCost)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D9CEB8]">
                    <span className="text-[#7A6B5D]">{t.otherExpenses}</span>
                    <span className="font-bold font-mono text-[#29221D]">{formatINR(otherCost)}</span>
                  </div>
                  <div className="flex justify-between pt-2.5 text-base font-bold text-[#29221D]">
                    <span>Base Unit Cost</span>
                    <span className="text-[#A8462D] font-mono">{formatINR(materialCost + labourCost + transportationCost + otherCost)}</span>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-xs text-[#29221D] space-y-1">
                  <p className="font-bold">Quantity: <span className="font-mono">{quantity}</span> unit(s)</p>
                  <p>Total Production Cost: <strong className="text-[#A8462D] font-mono">{formatINR(calc.totalCost)}</strong></p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D9CEB8] flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-[#D9CEB8] bg-[#FFFDF8] rounded-xl text-xs font-semibold text-[#7A6B5D] hover:bg-[#F7F2E8] cursor-pointer"
                >
                  {t.back}
                </button>
                <button
                  onClick={handleGoToStep3}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A8462D] to-[#8C3822] hover:opacity-95 text-[#FFFDF8] rounded-xl font-bold text-sm shadow-sm cursor-pointer"
                >
                  {t.next} ({t.marketPriceAnalysis}) <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Market Analysis & Final Price Confirmation */}
      {step === 3 && (
        <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#D9CEB8] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#29221D] font-['Playfair_Display',serif] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#A8462D]/10 text-[#A8462D] text-xs font-bold flex items-center justify-center">3</span>
            {t.reviewRecommendation}
          </h2>

          {/* Deterministic Fair Living Price Breakdown Card with Voice Explanation */}
          {fairPricing ? (
            <FairPriceBreakdownCard
              pricing={fairPricing}
              selectedLanguage={language}
              onApprovePrice={(approved) => setFinalPrice(approved)}
              autoExplain={true}
            />
          ) : isCalculatingFairPrice ? (
            <div className="p-6 bg-[#C88732]/10 border border-[#C88732]/30 rounded-2xl flex items-center justify-center gap-3 text-[#A8462D] font-bold text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-[#A8462D]" />
              <span>Calculating Fair Wage & Cost Breakdown...</span>
            </div>
          ) : null}

          {/* AI Market Recommendation Card */}
          <div className="bg-gradient-to-br from-[#A8462D]/5 via-[#C88732]/5 to-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C88732]" />
                <h3 className="font-bold text-[#29221D] text-base font-['Playfair_Display',serif]">{t.aiRecommendedPrice}</h3>
              </div>
              <span className="px-3 py-1 bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 text-xs font-bold rounded-full uppercase">
                AI Powered
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-[#FFFDF8] p-3.5 rounded-xl border border-[#D9CEB8] text-center">
                <span className="text-[11px] font-bold text-[#7A6B5D] uppercase">{t.yourCost}</span>
                <p className="text-lg font-bold text-[#29221D] font-mono mt-1">{formatINR(materialCost + labourCost + transportationCost + otherCost)}</p>
              </div>
              <div className="bg-[#FFFDF8] p-3.5 rounded-xl border border-[#D9CEB8] text-center">
                <span className="text-[11px] font-bold text-[#7A6B5D] uppercase">{t.marketMinPrice}</span>
                <p className="text-lg font-bold text-[#7A6B5D] font-mono mt-1">{formatINR(marketMin)}</p>
              </div>
              <div className="bg-[#FFFDF8] p-3.5 rounded-xl border border-[#C88732]/50 text-center shadow-xs">
                <span className="text-[11px] font-bold text-[#A8462D] uppercase">{t.marketAvgPrice}</span>
                <p className="text-lg font-bold text-[#A8462D] font-mono mt-1">{formatINR(marketAvg)}</p>
              </div>
              <div className="bg-[#FFFDF8] p-3.5 rounded-xl border border-[#D9CEB8] text-center">
                <span className="text-[11px] font-bold text-[#7A6B5D] uppercase">{t.marketMaxPrice}</span>
                <p className="text-lg font-bold text-[#7A6B5D] font-mono mt-1">{formatINR(marketMax)}</p>
              </div>
            </div>

            {aiRationale && (
              <div className="p-3.5 bg-[#FFFDF8] rounded-xl border border-[#D9CEB8] text-xs text-[#29221D] leading-relaxed">
                💡 <span className="font-medium">{aiRationale}</span>
              </div>
            )}
          </div>

          {/* Enter Final Price and Margin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F7F2E8] p-6 rounded-2xl border border-[#D9CEB8]">
            <div>
              <label className="block text-xs font-bold text-[#29221D] mb-1.5">{t.finalSellingPrice} (₹ per unit) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#7A6B5D] font-bold font-mono">₹</span>
                <input
                  type="number"
                  min="1"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl focus:ring-2 focus:ring-[#A8462D] focus:outline-none text-base font-bold font-mono text-[#29221D]"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setFinalPrice(aiRecPrice)}
                  className="text-xs text-[#A8462D] hover:underline font-bold cursor-pointer"
                >
                  Use AI Recommended ({formatINR(aiRecPrice)})
                </button>
                <span className="text-[#D9CEB8]">|</span>
                <button
                  type="button"
                  onClick={() => setFinalPrice(marketAvg)}
                  className="text-xs text-[#7A6B5D] hover:text-[#29221D] hover:underline cursor-pointer"
                >
                  Use Market Avg ({formatINR(marketAvg)})
                </button>
              </div>
            </div>

            {/* Calculated Profit Indicator */}
            <div className="flex flex-col justify-center space-y-1.5">
              <span className="text-xs font-bold text-[#7A6B5D] uppercase">{t.financialSummary}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-800 font-mono">
                  {formatINR(calc.profit)}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {calc.profitPercentage}% {t.profitLabel}
                </span>
              </div>
              <p className="text-xs text-[#7A6B5D]">
                Total Revenue for {quantity} unit(s): <strong className="text-[#29221D] font-mono">{formatINR(calc.totalSellingPrice)}</strong>
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#D9CEB8]">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-[#D9CEB8] bg-[#FFFDF8] rounded-xl text-xs font-semibold text-[#7A6B5D] hover:bg-[#F7F2E8] cursor-pointer"
            >
              {t.back}
            </button>
            <button
              onClick={handleFinalize}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:opacity-95 text-white rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" /> {t.finalizeBill} & {t.previewBill}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Finalized Bill Preview & Printing */}
      {step === 4 && finalizedBill && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 font-['Playfair_Display',serif] text-base">{t.billFinalized}!</h3>
                <p className="text-xs text-emerald-800">Invoice #{finalizedBill.billNumber} created successfully.</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#29221D] hover:bg-[#3D332A] text-[#FFFDF8] rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#C88732]" /> {t.printBill}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setFinalizedBill(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#D9CEB8] bg-[#FFFDF8] hover:bg-[#F7F2E8] rounded-xl text-xs font-semibold text-[#29221D] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#A8462D]" /> Create Another
              </button>
            </div>
          </div>

          <BillPreview bill={finalizedBill} />
        </div>
      )}
    </div>
  );
}
