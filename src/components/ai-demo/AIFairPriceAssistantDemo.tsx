import React, { useState } from 'react';
import { Sparkles, Sliders, TrendingUp, ShieldCheck, RefreshCw, ShoppingBag, ExternalLink } from 'lucide-react';
import { LanguageCode, PriceRecommendation } from '../../types';
import { DEMO_PRESET_CRAFTS } from '../../data/seedData';

export const AIFairPriceAssistantDemo: React.FC<{ language?: LanguageCode }> = ({ language = 'en' }) => {
  const [selectedCraft, setSelectedCraft] = useState(DEMO_PRESET_CRAFTS[0]);
  const [materialCost, setMaterialCost] = useState(selectedCraft.cost.material_cost);
  const [laborHours, setLaborHours] = useState(selectedCraft.cost.labor_hours);
  const [hourlyRate, setHourlyRate] = useState(selectedCraft.cost.hourly_rate);
  const [loading, setLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<PriceRecommendation | null>(null);

  const calculatePrice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${selectedCraft.id}/price-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_cost: materialCost,
          labor_hours: laborHours,
          hourly_rate: hourlyRate,
          other_cost: 100,
        }),
      });
      const data = await res.json();
      setPricingResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 max-w-4xl mx-auto my-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <div>
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
            AI Assistant Showcase
          </span>
          <h2 className="text-2xl font-black font-['Rozha_One',serif] text-stone-900 mt-1">
            Dynamic ML & Multi-Market Fair Price Engine
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">
            Combines Gemini Vision craft complexity analysis with live comps from Amazon Karigar, Etsy, and GeM.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase text-stone-600 mb-2">Select Craft Sample:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_PRESET_CRAFTS.map((craft) => (
            <button
              key={craft.id}
              onClick={() => {
                setSelectedCraft(craft);
                setMaterialCost(craft.cost.material_cost);
                setLaborHours(craft.cost.labor_hours);
                setHourlyRate(craft.cost.hourly_rate);
                setPricingResult(null);
              }}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                selectedCraft.id === craft.id
                  ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <img src={craft.image_url} alt={craft.name} className="w-12 h-12 object-cover rounded-xl shrink-0" />
              <div className="truncate">
                <span className="block text-xs font-bold text-stone-900 truncate">{craft.name}</span>
                <span className="text-[11px] text-amber-800 font-semibold">{craft.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Controls */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
          <h3 className="text-xs font-black uppercase text-stone-700 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Artisan Cost & Wage Inputs</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Raw Material Cost (₹):</label>
            <input
              type="number"
              value={materialCost}
              onChange={(e) => setMaterialCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
              <span>Labor Hours:</span>
              <span className="font-mono text-amber-700">{laborHours} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={laborHours}
              onChange={(e) => setLaborHours(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Artisan Living Hourly Rate (₹/hr):</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold"
            />
          </div>

          <button
            onClick={calculatePrice}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Vision & Market Comps...' : 'Calculate Fair Market Price'}</span>
          </button>
        </div>

        {/* Dynamic Pricing Engine Result */}
        <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">
                {pricingResult?.pricing_engine || 'Gemini Vision + Market Comps'}
              </span>
              <span className="text-xs text-stone-400">
                Tier: <strong className="text-amber-300">{pricingResult?.quality_tier || 'Fine Mastercraft'}</strong>
              </span>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-400">Recommended Fair Direct Price:</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  Floor: ₹{pricingResult?.fair_wage_floor || Math.round((materialCost + laborHours * hourlyRate) * 1.25)}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                ₹{pricingResult?.target_recommended?.toLocaleString() || '2,400'}
              </div>
              <span className="text-[11px] text-stone-400">
                Range: ₹{pricingResult?.suggested_min?.toLocaleString() || '1,800'} - ₹{pricingResult?.suggested_max?.toLocaleString() || '2,900'}
              </span>
            </div>

            {/* Live Comps Preview */}
            {pricingResult?.market_comparables && (
              <div className="bg-stone-800/40 p-2.5 rounded-xl border border-stone-700/60 mb-3 text-xs">
                <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                  Active Market Comps:
                </span>
                <div className="space-y-1">
                  {pricingResult.market_comparables.slice(0, 3).map((comp, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-stone-300">
                      <span className="truncate pr-2">{comp.platform}: {comp.title}</span>
                      <strong className="font-mono text-white">₹{comp.price}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-stone-300 italic bg-stone-800/50 p-2.5 rounded-lg border border-stone-700/50 leading-relaxed">
              "{pricingResult?.rationale || 'Protects the artisan fair-wage floor while calibrating against multi-market benchmarks.'}"
            </p>
          </div>

          <div className="pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between mt-3">
            <span>Anti-Exploitation Floor: Protected</span>
            <span className="text-emerald-400 font-bold">0% Intermediary Fee</span>
          </div>
        </div>
      </div>
    </div>
  );
};
