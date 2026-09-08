import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { formatINR } from '../../lib/billingService';

export function AdminMarketPrices() {
  const { fetchAdmin } = useAdminAuth();
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    craft_type: '',
    region: 'National Benchmark',
    price_low: '',
    average_price: '',
    price_high: '',
    target_recommended: '',
    source: 'Curated Artisan Economic Intelligence Hub',
  });

  const loadBenchmarks = async () => {
    setLoading(true);
    try {
      const res = await fetchAdmin('/api/admin/market-prices');
      if (res.ok) {
        const data = await res.json();
        setBenchmarks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load benchmarks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenchmarks();
  }, []);

  const handleEditClick = (bm: any) => {
    setEditingBenchmark(bm);
    setFormData({
      category: bm.category,
      craft_type: bm.craft_type || bm.craft_name || bm.category,
      region: bm.region || 'National Benchmark',
      price_low: String(bm.price_low || ''),
      average_price: String(bm.average_price || ''),
      price_high: String(bm.price_high || ''),
      target_recommended: String(bm.target_recommended || bm.average_price || ''),
      source: bm.source || 'Admin Market Intelligence Hub',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.average_price) return;

    try {
      if (editingBenchmark) {
        // Update existing benchmark
        const res = await fetchAdmin(`/api/admin/market-prices/${editingBenchmark.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            category: formData.category,
            region: formData.region,
            price_low: Number(formData.price_low),
            average_price: Number(formData.average_price),
            price_high: Number(formData.price_high),
            target_recommended: Number(formData.target_recommended),
            source: formData.source,
          }),
        });

        if (res.ok) {
          setActionMessage(
            `Market Benchmark for "${formData.category}" updated! Real-time effect: Sellers opening "Create Bill" or "Market Analysis" now see ₹${formData.target_recommended} as the AI recommended price.`
          );
          setTimeout(() => setActionMessage(null), 6000);
          setEditingBenchmark(null);
          loadBenchmarks();
        }
      } else {
        // Create new benchmark
        const res = await fetchAdmin('/api/admin/market-prices', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setActionMessage(
            `New benchmark for "${formData.category}" created! Real-time effect: Rural artisans in this discipline now receive live pricing intelligence.`
          );
          setTimeout(() => setActionMessage(null), 6000);
          setShowAddModal(false);
          loadBenchmarks();
        }
      }
    } catch (err) {
      console.error('Failed to save benchmark:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              Pricing Intelligence Core
            </span>
            <span className="text-xs text-slate-400">Total Benchmarks: {benchmarks.length}</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rozha_One',serif]">
            Market Price Control & Benchmark Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control the live market price ranges and target recommended prices consumed by the Seller application.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBenchmark(null);
            setFormData({
              category: '',
              craft_type: '',
              region: 'National Benchmark',
              price_low: '',
              average_price: '',
              price_high: '',
              target_recommended: '',
              source: 'Admin Market Intelligence Hub',
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-950/40 transition-all self-start sm:self-center active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Market Benchmark
        </button>
      </div>

      {/* Real-time Architecture Notice */}
      <div className="p-4 bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-800/60 rounded-2xl text-xs text-indigo-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Live Shared Backend Synchronization:</span>
          <span>
            When you adjust the <span className="text-amber-300 font-bold">Target Recommended Price</span> or range below, the database is updated instantly. When an artisan opens their Seller Portal to create a bill, their cost-plus formula immediately receives these updated figures.
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-800 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Table of Benchmarks */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Category & Discipline</th>
                <th className="py-3.5 px-4">Region / Cluster</th>
                <th className="py-3.5 px-4">Market Minimum</th>
                <th className="py-3.5 px-4">Market Average</th>
                <th className="py-3.5 px-4">Market Maximum</th>
                <th className="py-3.5 px-4">Target Recommended</th>
                <th className="py-3.5 px-4">Intelligence Source</th>
                <th className="py-3.5 px-4 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading pricing benchmarks...
                  </td>
                </tr>
              ) : benchmarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No market benchmarks found.
                  </td>
                </tr>
              ) : (
                benchmarks.map((bm) => (
                  <tr key={bm.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-white text-xs">{bm.category}</p>
                        <p className="text-[11px] text-slate-500">{bm.craft_name || bm.craft_type || bm.category}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="flex items-center gap-1 text-[11px] text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {bm.region || 'National'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-semibold">{formatINR(bm.price_low)}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-200 font-bold">{formatINR(bm.average_price)}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-semibold">{formatINR(bm.price_high)}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-xs">
                        {formatINR(bm.target_recommended || bm.average_price)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[160px]">
                        {bm.source || 'Curated'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleEditClick(bm)}
                        className="px-3 py-1 bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Benchmark Modal */}
      {(showAddModal || editingBenchmark) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                {editingBenchmark ? `Edit Benchmark: ${editingBenchmark.category}` : 'Create New Market Price Benchmark'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingBenchmark(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Handloom Silk"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Region / Cluster</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g. Telangana / Pochampally"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price_low}
                    onChange={(e) => setFormData({ ...formData, price_low: e.target.value })}
                    placeholder="e.g. 7000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Avg Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.average_price}
                    onChange={(e) => setFormData({ ...formData, average_price: e.target.value })}
                    placeholder="e.g. 8500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price_high}
                    onChange={(e) => setFormData({ ...formData, price_high: e.target.value })}
                    placeholder="e.g. 11000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  Target Recommended Price (₹) — Directly fed into Seller Bills *
                </label>
                <input
                  type="number"
                  required
                  value={formData.target_recommended}
                  onChange={(e) => setFormData({ ...formData, target_recommended: e.target.value })}
                  placeholder="e.g. 8900"
                  className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Intelligence Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g. Ministry of Textiles / Curated Guild Audit"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                >
                  {editingBenchmark ? 'Update Benchmark & Broadcast to Sellers' : 'Save Benchmark'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingBenchmark(null); }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
