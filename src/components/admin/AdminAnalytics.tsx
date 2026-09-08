import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, Award, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';

export function AdminAnalytics() {
  const { language } = useLanguage();
  const t = translations[language];

  // Monthly GMV trend data
  const monthlyData = [
    { month: 'Oct', volume: 184000, fairMargin: 125000 },
    { month: 'Nov', volume: 245000, fairMargin: 168000 },
    { month: 'Dec', volume: 380000, fairMargin: 260000 },
    { month: 'Jan', volume: 310000, fairMargin: 215000 },
    { month: 'Feb', volume: 420000, fairMargin: 295000 },
    { month: 'Mar', volume: 540000, fairMargin: 380000 },
  ];

  // Category sales share
  const categoryData = [
    { name: 'Handloom', sales: 420000, color: '#d97706' },
    { name: 'Pottery', sales: 210000, color: '#ea580c' },
    { name: 'Metalcraft', sales: 185000, color: '#ca8a04' },
    { name: 'Woodcraft', sales: 140000, color: '#78716c' },
    { name: 'Jewellery', sales: 320000, color: '#e11d48' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-red-600" />
          Platform Analytics & Fair-Trade Impact
        </h1>
        <p className="text-sm text-stone-600">Macroeconomic evaluation of artisan direct market linkage</p>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Platform GMV */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Gross Merchandise Value (GMV) Trend</h2>
              <p className="text-xs text-stone-400">Monthly direct buyer transactions (INR)</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              +28% MoM Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={11} />
                <YAxis
                  stroke="#888"
                  fontSize={11}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'GMV']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVol)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Contribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Revenue by Craft Category</h2>
              <p className="text-xs text-stone-400">Total volume across traditional sectors</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  stroke="#888"
                  fontSize={11}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} width={80} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Sales']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Bar dataKey="sales" radius={[0, 6, 6, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fair Trade Impact Callout Card */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-3xl p-8 border border-stone-800 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Social Impact Metric
          </div>
          <h3 className="text-2xl font-black font-['Rozha_One',serif]">
            ₹14.4 Lakhs Saved from Middleman Exploitation
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            By enabling transparent production-cost billing, AI market benchmark comparisons, and direct artisan-to-buyer transactions, KALAtech has retained an estimated 65% additional revenue directly for heritage artisan families in FY 2025-26.
          </p>
        </div>
      </div>
    </div>
  );
}
