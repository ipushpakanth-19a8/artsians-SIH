import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Package, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Product } from '../../types';
import { PageHeader, ProductCard } from './ui';

const CATEGORIES = [
  'All',
  'Handloom',
  'Pottery',
  'Woodcraft',
  'Metalcraft',
  'Jewellery',
  'Paintings',
  'Bamboo/Cane',
  'Textiles',
  'Traditional Decor',
  'Weaving',
  'Embroidery',
  'Other',
];

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
      .then(d => {
        setProducts(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.confirmDelete || 'Are you sure you want to delete this handicraft?')) return;
    try {
      await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  let filtered = products.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.artisan_name && p.artisan_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return (b.final_price || 0) - (a.final_price || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime();
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Standard Page Header */}
      <PageHeader
        eyebrow="LIVING CRAFT REPOSITORY"
        title={t.myHandicrafts || 'My Handicrafts'}
        description="Manage your verified artisan creations, inventory and market listings."
        action={
          <button
            onClick={() => navigate('/seller/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A8462D] hover:bg-[#8E3822] text-[#FFFDF8] font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addHandicraft || '+ Add Handicraft'}</span>
          </button>
        }
      />

      {/* 2. Search & Sort Controls */}
      <div className="rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E65]" />
            <input
              type="text"
              placeholder={`${t.search || 'Search crafts by title, material, or artisan'}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D9CEB8] bg-[#F7F2E8]/60 text-xs sm:text-sm text-[#29221D] font-medium focus:outline-none focus:border-[#A8462D] focus:ring-2 focus:ring-[#A8462D]/15 placeholder:text-[#9C8F84]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#7A6E65] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'price' | 'name')}
              className="py-2 px-3 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-xs font-semibold text-[#29221D] focus:outline-none focus:border-[#A8462D] cursor-pointer"
            >
              <option value="date">Newest First</option>
              <option value="price">Price: High to Low</option>
              <option value="name">Craft Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 3. Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#D9CEB8]/40">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                category === cat
                  ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                  : 'bg-[#F7F2E8] text-[#5C4A3A] hover:bg-[#E8DFC9] border border-[#D9CEB8]'
              }`}
            >
              {cat}
              {cat === 'All' && ` (${products.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] p-4 h-72 animate-pulse flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-[#E8DFC9]/40 rounded-xl" />
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-[#E8DFC9]/50 rounded w-3/4" />
                <div className="h-3 bg-[#E8DFC9]/40 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDF8] rounded-2xl border border-dashed border-[#D9CEB8] p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#A8462D]/10 text-[#A8462D] flex items-center justify-center mx-auto mb-4 border border-[#A8462D]/20">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-serif text-[#29221D]">No Handicrafts Found</h3>
          <p className="text-xs sm:text-sm text-[#7A6E65] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No craft matched your search query "${searchQuery}". Try a different keyword.`
              : 'You have not added any handicrafts to this category yet.'}
          </p>
          <button
            onClick={() => navigate('/seller/add')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#A8462D] hover:bg-[#8E3822] text-[#FFFDF8] font-bold text-xs shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Handicraft</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onEdit={p => navigate(`/seller/add?edit=${p.id}`)}
              onView={p => navigate(`/product/${p.id}`)}
              onDelete={id => handleDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
