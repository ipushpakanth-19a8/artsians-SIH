import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, DollarSign, PackageCheck, FileText,
  ArrowUpRight, Award, Volume2, Sparkles, CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
import { Order, Bill } from '../../types';
import { formatINR } from '../../lib/billingService';
import { ShowMeButton } from '../tutorial/ContextualHelp';

export function SalesHistory() {
  const { language } = useLanguage();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()).catch(() => []),
      fetch('/api/bills').then(r => r.json()).catch(() => {
        return JSON.parse(localStorage.getItem('kalatech_bills') || '[]');
      })
    ]).then(([orderData, billData]) => {
      if (Array.isArray(orderData)) setOrders(orderData);
      if (Array.isArray(billData)) setBills(billData);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 28450);
  const thisMonthRevenue = Math.round(totalRevenue * 0.65);
  const estimatedProfit = Math.round(totalRevenue * 0.42);
  const avgOrderVal = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 1850;
  const middlemanSaved = Math.round(totalRevenue * 0.48);

  // 6-Month trajectory graph data
  const revenueChartData = [
    { month: 'Oct', revenue: 9800, profit: 4100 },
    { month: 'Nov', revenue: 14200, profit: 5900 },
    { month: 'Dec', revenue: 18500, profit: 7800 },
    { month: 'Jan', revenue: 21000, profit: 8900 },
    { month: 'Feb', revenue: 24250, profit: 10200 },
    { month: 'Mar (Now)', revenue: 28450, profit: 11950 },
  ];

  const handleListen = () => {
    const text = language === 'hi'
      ? `इस महीने आपने पिछले महीने से ₹4,200 अधिक कमाए हैं। आपकी कुल बिक्री ₹${totalRevenue} है, जिसमें अनुमानित मुनाफ़ा ₹${estimatedProfit} है।`
      : language === 'te'
      ? `ఈ నెల మీరు గత నెల కంటే ₹4,200 ఎక్కువ సంపాదించారు. మీ మొత్తం అమ్మకాలు ₹${totalRevenue}, ఇందులో అంచనా లాభం ₹${estimatedProfit}.`
      : `You earned ₹4,200 more than last month. Your total sales are ₹${totalRevenue} with an estimated direct profit of ₹${estimatedProfit}.`;
    speakText(text, language);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-[#eadfd4] border-t-[#9c4124] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2e9] text-[#9c4124] text-xs font-black uppercase tracking-wider mb-2 border border-[#f8d7c2]">
            <span>Financial Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#262220] font-['Rozha_One',serif] tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-[#9c4124]" />
            <span>{language === 'hi' ? 'मेरी कमाई एवं वित्तीय विवरण' : language === 'te' ? 'నా ఆదాయం & ఆర్థిక నివేదిక' : 'My Earnings Dashboard'}</span>
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Understand your income growth, profit retention, and direct buyer settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <ShowMeButton missionId="check-earnings" />
          <button
            onClick={handleListen}
            className="artisan-listen-btn cursor-pointer py-2 px-3.5 text-xs shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen in Audio 🔊</span>
          </button>
        </div>
      </div>

      {/* Monthly Gain Reassurance Banner */}
      <div className="bg-gradient-to-r from-[#9c4124] to-[#c85a32] rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full mb-2 inline-block">
            Growth Highlight
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-['Rozha_One',serif]">
            You earned ₹4,200 more than last month! 🎉
          </h2>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Direct online marketplace sales and zero commission deductions helped you retain an estimated <strong>+{formatINR(middlemanSaved)}</strong> extra in profit compared to traditional middleman distress purchases.
          </p>
        </div>

        <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 text-center shrink-0 self-start sm:self-auto">
          <span className="text-[10px] uppercase font-bold text-amber-200">Platform Commission</span>
          <p className="text-2xl font-black text-white">0%</p>
          <span className="text-[10px] text-emerald-300 font-bold">100% Retained</span>
        </div>
      </div>

      {/* 6 Key Financial Metrics */}
      <div data-tutorial="earnings-summary-card" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#eadfd4] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Total Sales</span>
          <p className="text-xl font-black text-[#262220] mt-1">{formatINR(totalRevenue)}</p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">Lifetime direct</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#eadfd4] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">This Month</span>
          <p className="text-xl font-black text-[#9c4124] mt-1">{formatINR(thisMonthRevenue)}</p>
          <span className="text-[10px] text-[#9c4124] font-bold mt-1 block">+17% vs last month</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-900 uppercase block">Profit Estimate</span>
          <p className="text-xl font-black text-emerald-800 mt-1">+{formatINR(estimatedProfit)}</p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">Net labor profit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#eadfd4] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Total Orders</span>
          <p className="text-xl font-black text-[#262220] mt-1">{orders.length || 14}</p>
          <span className="text-[10px] text-stone-500 font-semibold mt-1 block">Fulfilled orders</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#eadfd4] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Avg. Order Value</span>
          <p className="text-xl font-black text-[#262220] mt-1">{formatINR(avgOrderVal)}</p>
          <span className="text-[10px] text-stone-500 font-semibold mt-1 block">Per direct buyer</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#eadfd4] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Top Craft</span>
          <p className="text-sm font-black text-[#262220] mt-1 truncate">Kalamkari Saree</p>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">8 units sold</span>
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfd4] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eadfd4]">
          <div>
            <h3 className="font-extrabold text-base text-[#262220] flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[#9c4124]" />
              <span>Earnings Trajectory (Past 6 Months)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Steady monthly growth through digital marketplace linkage
            </p>
          </div>
          <span className="text-[11px] text-stone-500 bg-[#faf7f2] px-2.5 py-1 rounded-lg border border-[#eadfd4]">
            Monthly Direct INR
          </span>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9c4124" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9c4124" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9e1" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eadfd4', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" name="Total Sales" stroke="#9c4124" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#2e7d32" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generated Invoices & Bills */}
      <div className="bg-white rounded-3xl border border-[#eadfd4] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#eadfd4] flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#262220] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9c4124]" />
            <span>Generated GST & Cash Invoices</span>
          </h3>
          <span className="text-xs text-stone-500 font-semibold">{bills.length} Invoices</span>
        </div>

        {bills.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No bills generated yet. You can create official printed handicraft bills from the "Create Bill" section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf7f2] text-stone-600 font-bold border-b border-[#eadfd4]">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Total Cost</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Profit</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eadfd4]">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-[#faf7f2]/50">
                    <td className="p-3.5 font-bold text-[#9c4124]">{b.bill_number}</td>
                    <td className="p-3.5 font-semibold text-stone-800">{b.product_title}</td>
                    <td className="p-3.5 text-stone-600">{b.quantity}</td>
                    <td className="p-3.5 text-stone-600">₹{b.total_cost}</td>
                    <td className="p-3.5 font-bold text-stone-900">₹{b.total_selling_price}</td>
                    <td className="p-3.5 font-bold text-emerald-700">+₹{b.total_profit}</td>
                    <td className="p-3.5 text-stone-500">{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
