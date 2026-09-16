import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, Edit2, Trash2, Package } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { Product } from '../../types';

const CATEGORIES = ['All', 'Handloom', 'Pottery', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Paintings', 'Bamboo/Cane', 'Textiles', 'Traditional Decor', 'Weaving', 'Embroidery', 'Other'];

export function HandicraftManagement() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/v1/products')
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  let filtered = products.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.material.toLowerCase().includes(q) || p.artisan_name.toLowerCase().includes(q);
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return (b.final_price || 0) - (a.final_price || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-black text-[#262220] font-['Rozha_One',serif]">{t.myHandicrafts}</h1>
        <button onClick={() => navigate('/seller/add')} className="flex items-center gap-2 px-4 py-2.5 bg-[#9c4124] hover:bg-[#83341b] text-white font-bold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-sm cursor-pointer artisan-btn-glow">
          <Plus className="w-4 h-4" />{t.addHandicraft}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder={t.search + '...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#eadfd4] bg-white text-sm text-[#262220] focus:outline-none focus:ring-2 focus:ring-[#9c4124]/20 focus:border-[#9c4124] shadow-2xs" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2.5 rounded-xl border border-[#eadfd4] bg-white text-sm text-[#262220] focus:outline-none focus:ring-2 focus:ring-[#9c4124]/20 shadow-2xs cursor-pointer">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? t.allCategories : c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-2.5 rounded-xl border border-[#eadfd4] bg-white text-sm text-[#262220] focus:outline-none focus:ring-2 focus:ring-[#9c4124]/20 shadow-2xs cursor-pointer">
          <option value="date">{t.sort}: {t.date}</option>
          <option value="price">{t.sort}: {t.price}</option>
          <option value="name">{t.sort}: {t.productName}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-3 border-[#eadfd4] border-t-[#9c4124] rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eadfd4] p-12 text-center shadow-xs">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-[#57534e] font-medium">{t.noResults}</p>
          <button onClick={() => navigate('/seller/add')} className="mt-4 px-5 py-2.5 bg-[#9c4124] hover:bg-[#83341b] text-white rounded-xl text-sm font-bold shadow-xs active:scale-95 cursor-pointer">{t.addHandicraft}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-[#eadfd4] shadow-xs hover:shadow-[0_8px_24px_-4px_rgba(156,65,36,0.12)] hover:border-[#c85a32] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
              <div className="aspect-[4/3] bg-[#faf7f2] relative overflow-hidden">
                <img src={product.enhanced_image_url || product.original_image_url} alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-2xs ${product.status === 'published' ? 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]' : 'bg-[#fff7ed] text-[#9c4124] border-[#fed7aa]'}`}>
                  {product.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#262220] text-sm line-clamp-1 group-hover:text-[#9c4124] transition-colors">{product.title}</h3>
                <p className="text-xs text-[#78716c] mt-0.5">{product.category} • {product.artisan_district}</p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#eadfd4]">
                  <span className="font-black text-[#262220] text-base">{formatINR(product.final_price || 0)}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => navigate(`/seller/handicrafts`)} className="p-1.5 rounded-lg bg-[#faf7f2] hover:bg-[#fff7ed] text-[#57534e] hover:text-[#9c4124] border border-[#eadfd4] transition-all active:scale-95 cursor-pointer" title="View"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => navigate(`/seller/add?edit=${product.id}`)} className="p-1.5 rounded-lg bg-[#faf7f2] hover:bg-blue-50 text-[#57534e] hover:text-blue-700 border border-[#eadfd4] transition-all active:scale-95 cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg bg-[#faf7f2] hover:bg-rose-50 text-[#57534e] hover:text-rose-700 border border-[#eadfd4] transition-all active:scale-95 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
