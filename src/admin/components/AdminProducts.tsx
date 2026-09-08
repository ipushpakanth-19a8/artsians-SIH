import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, CheckCircle, AlertCircle, Eye, Check, XCircle, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { formatINR } from '../../lib/billingService';

export function AdminProducts() {
  const { fetchAdmin } = useAdminAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchAdmin('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStatusChange = async (productId: string, newStatus: 'published' | 'disabled' | 'rejected') => {
    try {
      const res = await fetchAdmin(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(
          newStatus === 'disabled'
            ? 'Product listing disabled. Real-time effect: Item is now removed from public buyer browsing.'
            : `Product status updated to "${newStatus}". Real-time effect: Marketplace updated.`
        );
        setTimeout(() => setActionMessage(null), 4500);
        loadProducts();
      }
    } catch (e) {
      console.error('Failed to update product status:', e);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (p.title || '').toLowerCase().includes(q) ||
      (p.artisan_name || '').toLowerCase().includes(q) ||
      (p.material || '').toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800/60">
              Catalog Moderation
            </span>
            <span className="text-xs text-slate-400">Total Listings: {products.length}</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rozha_One',serif]">
            Handicrafts & Catalog Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit handcrafted provenance, verify fair pricing benchmarks, and enforce catalog authenticity.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crafts by title, artisan name, material..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published (Live)</option>
          <option value="disabled">Disabled (Hidden)</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Craft Piece</th>
                <th className="py-3.5 px-4">Master Artisan</th>
                <th className="py-3.5 px-4">Category / Origin</th>
                <th className="py-3.5 px-4">Final Price</th>
                <th className="py-3.5 px-4">Listing Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading platform handicraft inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching handicrafts found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const price = prod.final_price || prod.pricing?.target_recommended || 1500;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.enhanced_image_url || prod.original_image_url}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white text-xs line-clamp-1">{prod.title}</p>
                            <p className="text-[11px] text-slate-500">
                              Material: {prod.material || 'Artisanal Fibers'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-200 text-xs">{prod.artisan_name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {prod.artisan_district || 'Pochampally'}, {prod.artisan_state || 'Telangana'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-slate-800 text-blue-300 rounded-lg text-[11px] font-semibold">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-amber-400 text-xs">
                          {formatINR(price)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            prod.status === 'published'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : prod.status === 'disabled'
                              ? 'bg-red-950 text-red-400 border border-red-800/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.status === 'published' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {prod.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(prod)}
                            title="Inspect Details"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {prod.status !== 'published' ? (
                            <button
                              onClick={() => handleStatusChange(prod.id, 'published')}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(prod.id, 'disabled')}
                              className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-bold transition-colors"
                              title="Disable product so it won't appear in buyer marketplace"
                            >
                              Disable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                Craft Detail: {selectedProduct.title}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 items-start">
              <img
                src={selectedProduct.enhanced_image_url || selectedProduct.original_image_url}
                alt={selectedProduct.title}
                className="w-28 h-28 rounded-2xl object-cover border border-slate-800 flex-shrink-0"
              />
              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-bold text-white text-sm">{selectedProduct.title}</p>
                <p className="text-slate-400">By {selectedProduct.artisan_name}</p>
                <p className="text-amber-400 font-extrabold text-sm">
                  {formatINR(selectedProduct.final_price || 1500)}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Category: <span className="text-white">{selectedProduct.category}</span>
                </p>
                <p className="text-slate-400 text-[11px]">
                  Material: <span className="text-white">{selectedProduct.material}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 p-3 bg-slate-950/60 rounded-xl border border-slate-800 leading-relaxed">
              {selectedProduct.description}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleStatusChange(
                    selectedProduct.id,
                    selectedProduct.status === 'published' ? 'disabled' : 'published'
                  );
                  setSelectedProduct(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${
                  selectedProduct.status === 'published'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {selectedProduct.status === 'published' ? 'Disable Listing (Hide from Buyers)' : 'Approve & Publish Listing'}
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
