import React, { useState, useEffect } from 'react';
import { Package, Search, Trash2, Eye, ShieldCheck, Tag } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Product } from '../../types';
import { formatINR } from '../../lib/billingService';

export function AdminProducts() {
  const { language } = useLanguage();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this listing from the catalog?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artisan_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
            <Package className="w-7 h-7 text-red-600" />
            {t.products} Catalog Moderation ({products.length})
          </h1>
          <p className="text-sm text-stone-600">Review, verify and govern active craft listings</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search craft title, artisan..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <th className="p-4">Handicraft Product</th>
                  <th className="p-4">Artisan Maker</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Direct Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.enhanced_image_url || p.original_image_url}
                          alt={p.title}
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                        />
                        <div>
                          <p className="font-bold text-stone-900 text-xs line-clamp-1">{p.title}</p>
                          <span className="text-[10px] text-stone-400 font-mono">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-stone-800">{p.artisan_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-black text-stone-900">{formatINR(p.final_price || 2500)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Published
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
