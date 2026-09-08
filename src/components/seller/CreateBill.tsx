import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, ArrowRight, Check, Sparkles, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { calculateBill, generateBillNumber, validateBill, formatINR } from '../../lib/billingService';
import { getMarketPriceAnalysis, getMarketRecommendationText } from '../../lib/marketPriceService';
import { Bill, Product } from '../../types';
import { BillPreview } from './BillPreview';

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
  const [labourCost, setLabourCost] = useState(1200);
  const [transportationCost, setTransportationCost] = useState(150);
  const [otherCost, setOtherCost] = useState(50);
  const [proposedPrice, setProposedPrice] = useState(3200);
  const [finalPrice, setFinalPrice] = useState(3200);

  // Market comparison state
  const [marketMin, setMarketMin] = useState(2800);
  const [marketAvg, setMarketAvg] = useState(3600);
  const [marketMax, setMarketMax] = useState(4800);
  const [aiRecPrice, setAiRecPrice] = useState(3400);
  const [aiRationale, setAiRationale] = useState('');

  // Finalized Bill
  const [finalizedBill, setFinalizedBill] = useState<Bill | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
            setLabourCost((p.cost.labor_hours || 10) * (p.cost.hourly_rate || 100));
            setOtherCost(p.cost.other_cost || 50);
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
        setLabourCost((p.cost.labor_hours || 0) * (p.cost.hourly_rate || 0));
        setOtherCost(p.cost.other_cost || 0);
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

  // Fetch market analysis on stepping to Step 3
  const handleGoToStep3 = async () => {
    const totalUnitCost = materialCost + labourCost + transportationCost + otherCost;
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
      setAiRecPrice(res.recommendedPrice);
      setFinalPrice(proposedPrice || res.recommendedPrice);

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
      setAiRecPrice(Math.round(totalUnitCost * 1.5));
      setFinalPrice(proposedPrice);
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
      labourCost,
      transportationCost,
      otherCost,
      totalCost: calc.totalCost,
      proposedPrice,
      marketMinPrice: marketMin,
      marketAveragePrice: marketAvg,
      marketMaxPrice: marketMax,
      recommendedPrice: aiRecPrice,
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
      const existing = JSON.parse(localStorage.getItem('kalatech_bills') || '[]');
      existing.unshift(billData);
      localStorage.setItem('kalatech_bills', JSON.stringify(existing));
    }

    setFinalizedBill(billData);
    setStep(4);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate('/seller')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-600" />
            {t.createBill}
          </h1>
          <p className="text-sm text-stone-600">{t.billTitle}</p>
        </div>

        {/* Wizard Step Tracker */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm text-xs font-bold">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>1</span>
          <span className="text-stone-400">→</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>2</span>
          <span className="text-stone-400">→</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>3</span>
          <span className="text-stone-400">→</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>✓</span>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Please correct the following:</span>
            <ul className="list-disc ml-5 mt-1">
              {validationErrors.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* STEP 1: Select Handicraft */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">1</span>
            {t.selectHandicraft}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Choose from Existing Inventory or Custom Item
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleProductSelect(prod.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedProductId === prod.id && !isCustomProduct
                        ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {prod.enhanced_image_url || prod.original_image_url ? (
                        <img
                          src={prod.enhanced_image_url || prod.original_image_url}
                          alt={prod.title}
                          className="w-14 h-14 object-cover rounded-lg border border-stone-200"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400">
                          📦
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm line-clamp-1">{prod.title}</h3>
                        <p className="text-xs text-stone-500">{prod.category}</p>
                        <p className="text-xs font-bold text-amber-700 mt-1">₹{prod.final_price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom Option */}
                <div
                  onClick={() => handleProductSelect('custom')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    isCustomProduct
                      ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                      : 'border-dashed border-stone-300 hover:border-stone-400 bg-stone-50'
                  }`}
                >
                  <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold text-xl">
                    +
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Custom / New Handicraft</h3>
                    <p className="text-xs text-stone-500">Bill for an item not yet cataloged</p>
                  </div>
                </div>
              </div>
            </div>

            {isCustomProduct && (
              <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.productTitle} *</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Handmade Terracotta Water Vessel"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.category}</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  >
                    {['Handloom', 'Pottery', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Paintings', 'Bamboo/Cane', 'Textiles', 'Traditional Decor', 'Weaving', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.quantity} *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              {t.next} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Enter Cost Details */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">2</span>
            {t.enterCostDetails}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.materialCost} (₹ per unit)</label>
                <input
                  type="number"
                  min="0"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
                <p className="text-[11px] text-stone-500 mt-1">Raw clay, threads, natural dyes, wood, brass, etc.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.labourCost} (₹ per unit)</label>
                <input
                  type="number"
                  min="0"
                  value={labourCost}
                  onChange={(e) => setLabourCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
                <p className="text-[11px] text-stone-500 mt-1">Artisan hours × fair artisan rate</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.transportationCost} (₹ per unit)</label>
                <input
                  type="number"
                  min="0"
                  value={transportationCost}
                  onChange={(e) => setTransportationCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
                <p className="text-[11px] text-stone-500 mt-1">Local hauling, packing, freight</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.otherExpenses} (₹ per unit)</label>
                <input
                  type="number"
                  min="0"
                  value={otherCost}
                  onChange={(e) => setOtherCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
                <p className="text-[11px] text-stone-500 mt-1">Tools wear, finishing polish, overheads</p>
              </div>
            </div>

            {/* Live Cost Summary Box */}
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3">Unit Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-600">{t.materialCost}</span>
                    <span className="font-semibold text-stone-900">{formatINR(materialCost)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-600">{t.labourCost}</span>
                    <span className="font-semibold text-stone-900">{formatINR(labourCost)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-600">{t.transportationCost}</span>
                    <span className="font-semibold text-stone-900">{formatINR(transportationCost)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-600">{t.otherExpenses}</span>
                    <span className="font-semibold text-stone-900">{formatINR(otherCost)}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-base font-bold text-stone-900">
                    <span>Base Unit Cost</span>
                    <span className="text-amber-700">{formatINR(materialCost + labourCost + transportationCost + otherCost)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <p className="font-bold">Quantity: {quantity} unit(s)</p>
                  <p>Total Production Cost: <strong>{formatINR(calc.totalCost)}</strong></p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  {t.back}
                </button>
                <button
                  onClick={handleGoToStep3}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md"
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
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">3</span>
            {t.reviewRecommendation}
          </h2>

          {/* AI Market Recommendation Card */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-base">{t.aiRecommendedPrice}</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 text-xs font-black rounded-full uppercase">
                AI Powered
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] font-bold text-stone-500 uppercase">{t.yourCost}</span>
                <p className="text-lg font-extrabold text-stone-900">{formatINR(materialCost + labourCost + transportationCost + otherCost)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] font-bold text-stone-500 uppercase">{t.marketMinPrice}</span>
                <p className="text-lg font-extrabold text-stone-700">{formatINR(marketMin)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-300 text-center shadow-xs">
                <span className="text-[11px] font-bold text-amber-700 uppercase">{t.marketAvgPrice}</span>
                <p className="text-lg font-extrabold text-amber-700">{formatINR(marketAvg)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] font-bold text-stone-500 uppercase">{t.marketMaxPrice}</span>
                <p className="text-lg font-extrabold text-stone-700">{formatINR(marketMax)}</p>
              </div>
            </div>

            {aiRationale && (
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-stone-700 leading-relaxed">
                💡 <span className="font-semibold">{aiRationale}</span>
              </div>
            )}
          </div>

          {/* Enter Final Price and Margin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-5 rounded-xl border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.finalSellingPrice} (₹ per unit) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-base font-bold"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setFinalPrice(aiRecPrice)}
                  className="text-xs text-amber-700 hover:text-amber-800 underline font-semibold"
                >
                  Use AI Recommended ({formatINR(aiRecPrice)})
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={() => setFinalPrice(marketAvg)}
                  className="text-xs text-stone-600 hover:text-stone-800 underline"
                >
                  Use Market Avg ({formatINR(marketAvg)})
                </button>
              </div>
            </div>

            {/* Calculated Profit Indicator */}
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase">{t.financialSummary}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">
                  {formatINR(calc.profit)}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {calc.profitPercentage}% {t.profitLabel}
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Total Revenue for {quantity} unit(s): <strong className="text-stone-900">{formatINR(calc.totalSellingPrice)}</strong>
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-stone-200">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              {t.back}
            </button>
            <button
              onClick={handleFinalize}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <Check className="w-4 h-4" /> {t.finalizeBill} & {t.previewBill}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Finalized Bill Preview & Printing */}
      {step === 4 && finalizedBill && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-emerald-900">{t.billFinalized}!</h3>
                <p className="text-xs text-emerald-700">Invoice #{finalizedBill.billNumber} created successfully.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Printer className="w-4 h-4" /> {t.printBill}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setFinalizedBill(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Create Another
              </button>
            </div>
          </div>

          <BillPreview bill={finalizedBill} />
        </div>
      )}
    </div>
  );
}
