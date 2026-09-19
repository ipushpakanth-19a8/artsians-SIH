import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, Filter, Heart, ShoppingCart, ShieldCheck, MapPin,
  X, Sparkles, CheckCircle2, ArrowUpDown
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Product } from '../../types';
import { formatINR } from '../../lib/billingService';

export function ProductBrowse() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const categories = [
    'All', 'Handloom', 'Pottery', 'Woodcraft', 'Metalcraft',
    'Jewellery', 'Paintings', 'Bamboo/Cane', 'Textiles', 'Weaving'
  ];

  const naturalQueries = [
    { label: '🎁 Handmade gifts under ₹1500', query: 'gifts under 1500', maxP: 1500 },
    { label: '🏺 Natural Terracotta Pottery', query: 'pottery', cat: 'Pottery' },
    { label: '🧵 Pure Silk & Cotton Handloom', query: 'saree handloom', cat: 'Handloom' },
    { label: '🪵 Non-Toxic Wooden Toys', query: 'woodcraft toy', cat: 'Woodcraft' },
  ];

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    try {
      const wish = JSON.parse(localStorage.getItem('ShilpSetu_wishlist') || '[]');
      setWishlistIds(wish.map((w: any) => w.productId));
    } catch {}
  }, []);

  const toggleWishlist = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    try {
      let wish = JSON.parse(localStorage.getItem('ShilpSetu_wishlist') || '[]');
      if (wishlistIds.includes(prod.id)) {
        wish = wish.filter((w: any) => w.productId !== prod.id);
        setWishlistIds(wishlistIds.filter((id) => id !== prod.id));
      } else {
        wish.push({ productId: prod.id, product: prod, addedAt: new Date().toISOString() });
        setWishlistIds([...wishlistIds, prod.id]);
      }
      localStorage.setItem('ShilpSetu_wishlist', JSON.stringify(wish));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {}
  };

  const handleNaturalSearch = (item: typeof naturalQueries[0]) => {
    if (item.cat) setSelectedCategory(item.cat);
    if (item.maxP) setMaxPrice(item.maxP);
    setSearchQuery(item.query);
  };

  const filteredProducts = products
    .filter((p) => {
      const price = p.final_price || 0;
      if (price > maxPrice) return false;

      const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchState = selectedState === 'All' || (p.artisan_state && p.artisan_state.toLowerCase() === selectedState.toLowerCase());

      // Parse natural language keywords
      const q = searchQuery.toLowerCase().replace(/under\s*\d+/g, '').replace(/gifts/g, '').trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.artisan_name?.toLowerCase().includes(q);

      return matchCat && matchState && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.final_price || 0) - (b.final_price || 0);
      if (sortBy === 'price-desc') return (b.final_price || 0) - (a.final_price || 0);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner & Natural Language Bar */}
      <div className="artisan-card p-6 sm:p-7 rounded-3xl border border-[#D9CEB8] shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A8462D]/10 text-[#A8462D] text-xs font-black uppercase tracking-wider mb-2 border border-[#A8462D]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Artisan Crafts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#29221D] font-serif">
            Discover Living Indian Craft Heritage
          </h1>
          <p className="text-xs text-[#6B5E55] mt-0.5">
            Handcrafted with patience and cultural reverence. 100% direct artisan payments.
          </p>
        </div>

        {/* Natural Language Prompt Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-[#6B5E55]">Popular queries:</span>
          {naturalQueries.map((nq, i) => (
            <button
              key={i}
              onClick={() => handleNaturalSearch(nq)}
              className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] hover:border-[#A8462D] text-xs font-bold text-[#29221D] hover:text-[#A8462D] transition-all cursor-pointer shadow-2xs"
            >
              {nq.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8C827A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search crafts or type natural requests e.g. "handmade gifts under 1500"...'
              className="w-full pl-10 pr-8 py-2.5 bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-xs sm:text-sm font-medium text-[#29221D] placeholder-[#8C827A] focus:ring-2 focus:ring-[#A8462D] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setMaxPrice(10000); }}
                className="absolute right-3 top-3 text-[#8C827A] hover:text-[#29221D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B5E55] whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-[#D9CEB8] rounded-xl text-xs font-bold bg-[#FFFDF8] text-[#29221D] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Artisans</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-[#D9CEB8]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#A8462D] text-white shadow-xs'
                  : 'bg-[#FFFDF8] text-[#6B5E55] hover:bg-[#F7F2E8] border border-[#D9CEB8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-16 text-center text-[#6B5E55]">
          <div className="w-8 h-8 border-2 border-[#D9CEB8] border-t-[#A8462D] rounded-full animate-spin mx-auto mb-2" />
          <span>Loading verified artisan collection...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-[#FFFDF8] rounded-3xl border border-[#D9CEB8] space-y-3">
          <Filter className="w-12 h-12 text-[#8C827A] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#29221D] font-serif">No handicraft products found</h3>
          <p className="text-xs text-[#6B5E55] max-w-sm mx-auto">
            Try adjusting your search keywords or resetting your price filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxPrice(10000);
            }}
            className="artisan-btn-primary py-2 px-4 text-xs cursor-pointer inline-block"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6B5E55] font-semibold px-1">
            <span>Showing {filteredProducts.length} authentic handicraft listings</span>
            <span>Zero middleman markups</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const inWishlist = wishlistIds.includes(prod.id);
              const img = prod.enhanced_image_url || prod.original_image_url;

              return (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/buyer/product/${prod.id}`)}
                  className="artisan-card rounded-2xl border border-[#D9CEB8] overflow-hidden shadow-xs hover:border-[#A8462D] hover:shadow-md hover:-translate-y-1 transition-all flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-square bg-[#F7F2E8] overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C827A]">
                        📦 Handicraft
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleWishlist(e, prod)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                        inWishlist
                          ? 'bg-rose-50 text-rose-600 shadow-md'
                          : 'bg-[#FFFDF8]/90 text-[#6B5E55] hover:text-rose-600 hover:bg-[#FFFDF8]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
                    </button>

                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-[#273B59]/90 backdrop-blur text-[10px] font-bold text-[#F3E5AB] flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      100% Handmade
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#A8462D] uppercase tracking-wider mb-1">
                        <span>{prod.category}</span>
                        <span>•</span>
                        <span className="text-[#6B5E55] flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-[#8C827A]" />
                          {prod.artisan_district || 'India'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-[#29221D] leading-snug line-clamp-2 group-hover:text-[#A8462D] transition-colors">
                        {prod.title}
                      </h3>

                      {/* Artisan Attribution */}
                      <p className="text-[11px] text-[#6B5E55] mt-1 flex items-center gap-1">
                        <span>By</span>
                        <strong className="text-[#29221D] font-semibold">{prod.artisan_name || 'Village Master Artisan'}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D9CEB8] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6B5E55] font-semibold uppercase tracking-wider block">Direct Price</span>
                        <span className="text-base font-black text-[#29221D] font-mono">
                          {formatINR(prod.final_price || 1850)}
                        </span>
                      </div>

                      <span className="text-xs font-extrabold text-[#A8462D] group-hover:underline">
                        View Craft →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
