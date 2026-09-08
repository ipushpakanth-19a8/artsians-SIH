import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { getMarketPrice, getPricePosition, generatePriceRecommendationText } from '../../lib/marketPriceService';
import { formatINR } from '../../lib/billingService';
import { MarketPriceResult, Product } from '../../types';

const CATEGORIES = ['Weaving', 'Handloom', 'Pottery', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Paintings', 'Bamboo/Cane', 'Textiles', 'Traditional Decor', 'Embroidery'];

export function MarketPriceAnalysis() {
  const { language } = useLanguage();
  const t = translations[language];
  const [category, setCategory] = useState('Weaving');
  const [proposedPrice, setProposedPrice] = useState(2500);
  const [marketData, setMarketData] = useState<MarketPriceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMarketData = async () => {
    setLoading(true);
    const data = await getMarketPrice(category, proposedPrice);
    setMarketData(data);
    setLoading(false);
  };

  useEffect(() => { fetchMarketData(); }, [category]);

  const position = marketData ? getPricePosition(proposedPrice, marketData) : 'at';
  const recommendation = marketData ? generatePriceRecommendationText(proposedPrice, marketData, language) : '';

  const chartData = marketData ? [
    { name: t.yourCost, value: Math.round(proposedPrice * 0.6), fill: '#78716c' },
    { name: t.yourProposedPrice, value: proposedPrice, fill: '#d97706' },
    { name: t.marketMinPrice, value: marketData.minPrice, fill: '#94a3b8' },
    { name: t.marketAvgPrice, value: marketData.averagePrice, fill: '#3b82f6' },
    { name: t.marketMaxPrice, value: marketData.maxPrice, fill: '#10b981' },
    { name: t.aiRecommendedPrice, value: marketData.recommendedPrice, fill: '#8b5cf6' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-stone-900 mb-2">{t.marketPriceAnalysis}</h1>
      <p className="text-stone-500 text-sm mb-6">{t.competitiveAnalysis}</p>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-stone-700 mb-1">{t.productCategory}</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-stone-700 mb-1">{t.proposedPrice} (₹)</label>
          <input type="number" min="0" value={proposedPrice} onChange={e => setProposedPrice(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
        </div>
        <div className="flex items-end">
          <button onClick={fetchMarketData} className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-md text-sm hover:opacity-90">
            {t.search}
          </button>
        </div>
      </div>

      {/* Demo Data Notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">{t.demoDataNotice}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-stone-300 border-t-amber-500 rounded-full animate-spin" /></div>
      ) : marketData ? (
        <>
          {/* Price Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: t.yourProposedPrice, value: formatINR(proposedPrice), color: 'border-amber-300 bg-amber-50' },
              { label: t.marketMinPrice, value: formatINR(marketData.minPrice), color: 'border-stone-200 bg-stone-50' },
              { label: t.marketAvgPrice, value: formatINR(marketData.averagePrice), color: 'border-blue-200 bg-blue-50' },
              { label: t.marketMaxPrice, value: formatINR(marketData.maxPrice), color: 'border-emerald-200 bg-emerald-50' },
              { label: t.aiRecommendedPrice, value: formatINR(marketData.recommendedPrice), color: 'border-purple-200 bg-purple-50' },
              { label: t.status, value: position === 'below' ? t.belowMarket : position === 'above' ? t.aboveMarket : t.atMarket,
                color: position === 'below' ? 'border-red-200 bg-red-50' : position === 'above' ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50' },
            ].map((card, i) => (
              <div key={i} className={`rounded-xl border ${card.color} p-3`}>
                <p className="text-[10px] font-semibold text-stone-500 uppercase">{card.label}</p>
                <p className="text-sm font-extrabold text-stone-900 mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
            <h3 className="font-bold text-stone-900 mb-4">{t.marketComparison}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 10, fill: '#78716c' }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendation */}
          <div className={`rounded-xl border p-5 ${position === 'below' ? 'border-red-200 bg-red-50' : position === 'above' ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {position === 'below' ? <TrendingDown className="w-5 h-5 text-red-600" /> : position === 'above' ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <Minus className="w-5 h-5 text-blue-600" />}
              <h3 className="font-bold text-stone-900">{t.priceRecommendation}</h3>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{recommendation}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
