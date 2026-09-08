import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, ShieldCheck, Phone, CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Order } from '../../types';
import { formatINR } from '../../lib/billingService';

export function AdminOrders() {
  const { language } = useLanguage();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch =
      o.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.artisan_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-red-600" />
            Platform {t.orders} ({orders.length})
          </h1>
          <p className="text-sm text-stone-600">Cross-artisan transaction settlement and fulfillment monitoring</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'created', 'paid', 'shipped', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400">No orders match the filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Artisan Seller</th>
                  <th className="p-4">Buyer Details</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-stone-500">{o.id}</td>
                    <td className="p-4 font-bold text-stone-900">{o.product_title}</td>
                    <td className="p-4 font-semibold text-stone-800">{o.artisan_name}</td>
                    <td className="p-4">
                      <p className="font-semibold text-stone-900">{o.buyer_name}</p>
                      <p className="text-[10px] text-stone-400">{o.buyer_contact}</p>
                    </td>
                    <td className="p-4 font-black text-stone-900">{formatINR(o.total_amount)}</td>
                    <td className="p-4 capitalize text-stone-600">{o.payment_method?.replace(/_/g, ' ')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800 capitalize">
                        {o.status}
                      </span>
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
