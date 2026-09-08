import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, PackageCheck, FileText, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Order, Bill } from '../../types';
import { formatINR } from '../../lib/billingService';

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

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'paid');
  const avgOrderVal = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  // Middleman comparison gain (e.g. +45% average fair trade retention)
  const estimatedFairGain = Math.round(totalRevenue * 0.45);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-amber-600" />
          {t.salesHistory}
        </h1>
        <p className="text-sm text-stone-600">Analytics and direct earning records</p>
      </div>

      {/* Analytics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Gross Sales</span>
          <p className="text-2xl font-black text-stone-900 mt-1">{formatINR(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Direct artisan earnings
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Completed Orders</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{completedOrders.length}</p>
          <span className="text-[11px] text-stone-500 mt-1 block">of {orders.length} total orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Avg. Order Value</span>
          <p className="text-2xl font-black text-stone-900 mt-1">{formatINR(avgOrderVal)}</p>
          <span className="text-[11px] text-stone-500 mt-1 block">Per direct order</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Saved vs Middlemen</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">+{formatINR(estimatedFairGain)}</p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Fair Trade premium retention</span>
        </div>
      </div>

      {/* Recent Finalized Bills & Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Generated Invoices & Sales
          </h2>
          <span className="text-xs text-stone-500 font-semibold">{bills.length} Invoices</span>
        </div>

        {bills.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            No bills generated yet. Create a bill from the "Create Bill" menu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Qty</th>
                  <th className="p-3.5">Total Cost</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Profit</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="p-3.5 font-mono font-bold text-amber-800">{b.billNumber}</td>
                    <td className="p-3.5 font-semibold text-stone-900">{b.productName}</td>
                    <td className="p-3.5">{b.quantity}</td>
                    <td className="p-3.5 text-stone-500">{formatINR(b.totalCost)}</td>
                    <td className="p-3.5 font-bold text-stone-900">{formatINR(b.finalPrice * b.quantity)}</td>
                    <td className="p-3.5 font-bold text-emerald-600">+{formatINR(b.profit)} ({b.profitPercentage}%)</td>
                    <td className="p-3.5 text-stone-400">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
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
