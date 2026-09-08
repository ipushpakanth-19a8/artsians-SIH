import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Package, ShoppingCart, FileText, TrendingUp, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { Order, Bill, Product } from '../../types';

export function AdminDashboard() {
  const { language } = useLanguage();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then((r) => r.json()).catch(() => []),
      fetch('/api/products').then((r) => r.json()).catch(() => []),
      fetch('/api/bills').then((r) => r.json()).catch(() => {
        return JSON.parse(localStorage.getItem('kalatech_bills') || '[]');
      }),
    ]).then(([orderData, prodData, billData]) => {
      if (Array.isArray(orderData)) setOrders(orderData);
      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(billData)) setBills(billData);
      setLoading(false);
    });
  }, []);

  const totalVolume = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalArtisans = 8; // Platform default registered cluster masters
  const totalBuyers = Math.max(14, orders.length * 2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-red-600" />
          {t.adminDashboard}
        </h1>
        <p className="text-sm text-stone-600">{t.adminPortal} — Platform-wide artisan metrics & governance</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase">{t.sellers}</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{totalArtisans}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Verified GI Master Artisans
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase">{t.products}</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{products.length}</p>
          <span className="text-[11px] text-stone-500 mt-1 block">Live Catalog Listings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase">{t.orders}</span>
            <ShoppingCart className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{orders.length}</p>
          <span className="text-[11px] text-stone-500 mt-1 block">Direct Buyer Transactions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase">{t.totalSales}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{formatINR(totalVolume)}</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">100% Direct Fair Payout</span>
        </div>
      </div>

      {/* Platform Governance and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              Recent Marketplace Orders
            </h2>
            <span className="text-xs font-semibold text-stone-400">{orders.length} total</span>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-stone-900">{o.product_title}</p>
                    <p className="text-stone-500">Artisan: {o.artisan_name} • Buyer: {o.buyer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-stone-900">{formatINR(o.total_amount)}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Finalized Bills */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Generated Handicraft Bills
            </h2>
            <span className="text-xs font-semibold text-stone-400">{bills.length} generated</span>
          </div>

          {bills.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No bills generated yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {bills.slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-amber-800">{b.billNumber}</span>
                    <p className="font-bold text-stone-900 mt-0.5">{b.productName}</p>
                    <p className="text-stone-500">Seller: {b.sellerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-stone-900">{formatINR(b.finalPrice * b.quantity)}</p>
                    <span className="text-[10px] font-bold text-emerald-600">
                      +{formatINR(b.profit)} ({b.profitPercentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
