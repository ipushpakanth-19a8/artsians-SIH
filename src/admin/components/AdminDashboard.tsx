import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Clock,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { formatINR } from '../../lib/billingService';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export function AdminDashboard({ onNavigateTab }: AdminDashboardProps) {
  const { fetchAdmin } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, billsRes] = await Promise.all([
        fetchAdmin('/api/admin/analytics'),
        fetchAdmin('/api/admin/orders'),
        fetchAdmin('/api/admin/bills'),
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
      if (ordersRes.ok) {
        const ords = await ordersRes.json();
        setRecentOrders(Array.isArray(ords) ? ords.slice(0, 5) : []);
      }
      if (billsRes.ok) {
        const bls = await billsRes.json();
        setRecentBills(Array.isArray(bls) ? bls.slice(0, 5) : []);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSellers = stats?.users?.totalSellers ?? 8;
  const activeSellers = stats?.users?.activeSellers ?? 8;
  const totalBuyers = stats?.users?.totalBuyers ?? 16;
  const totalProducts = stats?.products?.totalProducts ?? 0;
  const totalOrders = stats?.sales?.totalOrders ?? 0;
  const totalSales = stats?.sales?.totalSales ?? 0;
  const totalBills = stats?.platform?.totalBills ?? 0;
  const avgMargin = stats?.platform?.averageProfitMargin ?? 28;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/60">
              Live Governance
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Shared Backend Synchronized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Rozha_One',serif]">
            Platform Overview & KPI Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time oversight of rural artisan onboarding, fair trade marketplace transactions, and pricing algorithms.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('sellers')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Sellers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalSellers}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-emerald-400 font-bold">{activeSellers} Active Masters</span>
            <span className="text-slate-500 group-hover:text-amber-400 transition-colors">Manage →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('buyers')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Buyers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalBuyers}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-emerald-400 font-bold">Verified Patrons</span>
            <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">Manage →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('handicrafts')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Handicraft Listings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalProducts}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-blue-400 font-bold">Catalog Moderated</span>
            <span className="text-slate-500 group-hover:text-blue-400 transition-colors">Moderate →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Volume</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{formatINR(totalSales)}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-purple-400 font-bold">{totalOrders} Direct Orders</span>
            <span className="text-slate-500 group-hover:text-purple-400 transition-colors">Orders →</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Live Controls & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('market-prices')}
          className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/40 p-6 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Market Price Intelligence</h3>
              <p className="text-xs text-indigo-300">Live Seller Cost Benchmark Control</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Changes made here instantly update the seller's cost-plus recommendation algorithm across India.
          </p>
          <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open Market Benchmark Controller →
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('bills')}
          className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-900/40 p-6 rounded-2xl cursor-pointer hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Seller Invoices & Audit</h3>
              <p className="text-xs text-amber-300">{totalBills} Finalized Bills</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Audit-protected breakdown of production, labor, transport, and profit margins. Average artisan profit: <span className="font-bold text-emerald-400">{avgMargin}%</span>.
          </p>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Inspect Financial Audit Ledger →
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('customer-care')}
          className="bg-gradient-to-br from-slate-900 to-teal-950/30 border border-teal-900/40 p-6 rounded-2xl cursor-pointer hover:border-teal-500 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AI Customer Care Logs</h3>
              <p className="text-xs text-teal-300">142 Inquiries Analyzed</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Monitor multilingual AI query resolution across English, Hindi, and Telugu without privacy compromise.
          </p>
          <div className="text-xs font-bold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View AI Query Analytics →
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-400" />
              Recent Marketplace Orders
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-purple-400 hover:underline font-bold"
            >
              View All ({totalOrders})
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No orders recorded yet.</p>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-1">{ord.product_title}</p>
                    <p className="text-[11px] text-slate-400">
                      Buyer: <span className="text-slate-300">{ord.buyer_name}</span> • Artisan: <span className="text-slate-300">{ord.artisan_name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-emerald-400">{formatINR(ord.total_amount)}</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Finalized Bills */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Recent Finalized Bills
            </h3>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              View All ({totalBills})
            </button>
          </div>

          <div className="space-y-3">
            {recentBills.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No bills finalized yet.</p>
            ) : (
              recentBills.map((bill) => (
                <div key={bill.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-1">{bill.productName}</p>
                    <p className="text-[11px] text-slate-400">
                      {bill.billNumber} • Seller: <span className="text-slate-300">{bill.sellerName}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-amber-400">{formatINR(bill.finalPrice)}</p>
                    <span className="text-[10px] font-bold text-emerald-400">
                      +{bill.profitPercentage}% margin
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
