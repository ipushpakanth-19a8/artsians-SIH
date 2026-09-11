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
      const wish = JSON.parse(localStorage.getItem('kalatech_wishlist') || '[]');
      setWishlistIds(wish.map((w: any) => w.productId));
    } catch {}
  }, []);

  const toggleWishlist = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    try {
      let wish = JSON.parse(localStorage.getItem('kalatech_wishlist') || '[]');
      if (wishlistIds.includes(prod.id)) {
        wish = wish.filter((w: any) => w.productId !== prod.id);
        setWishlistIds(wishlistIds.filter((id) => id !== prod.id));
      } else {
        wish.push({ productId: prod.id, product: prod, addedAt: new Date().toISOString() });
        setWishlistIds([...wishlistIds, prod.id]);
      }
      localStorage.setItem('kalatech_wishlist', JSON.stringify(wish));
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
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#eadfd4] shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2e9] text-[#9c4124] text-xs font-black uppercase tracking-wider mb-2 border border-[#f8d7c2]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Artisan Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#262220] font-['Rozha_One',serif]">
            Discover Living Indian Craft Heritage
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Handcrafted with patience and cultural reverence. 100% direct artisan payments.
          </p>
        </div>

        {/* Natural Language Prompt Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-stone-500">Popular queries:</span>
          {naturalQueries.map((nq, i) => (
            <button
              key={i}
              onClick={() => handleNaturalSearch(nq)}
              className="px-3 py-1.5 rounded-xl bg-[#faf7f2] hover:bg-[#fdf2e9] border border-[#eadfd4] hover:border-[#9c4124] text-xs font-bold text-stone-700 hover:text-[#9c4124] transition-all cursor-pointer"
            >
              {nq.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search crafts or type natural requests e.g. "handmade gifts under 1500"...'
              className="w-full pl-10 pr-8 py-2.5 bg-[#faf7f2] border border-[#eadfd4] rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#9c4124] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setMaxPrice(10000); }}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-[#eadfd4] rounded-xl text-xs font-bold bg-[#faf7f2] text-stone-800 focus:outline-none"
            >
              <option value="featured">Featured Artisans</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-[#eadfd4]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#9c4124] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-stone-600 hover:bg-[#f5efeb] border border-[#eadfd4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-16 text-center text-stone-500">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-[#9c4124] rounded-full animate-spin mx-auto mb-2" />
          <span>Loading verified artisan collection...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#eadfd4] space-y-3">
          <Filter className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-stone-800">No handicraft products found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
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
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
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
                  className="bg-white rounded-3xl border border-[#eadfd4] overflow-hidden shadow-xs hover:border-[#c85a32] hover:shadow-md transition-all flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-square bg-[#faf7f2] overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        📦 Handicraft
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleWishlist(e, prod)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                        inWishlist
                          ? 'bg-red-50 text-red-600 shadow-md'
                          : 'bg-white/80 text-stone-600 hover:text-red-500 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
                    </button>

                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      100% Handmade
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#9c4124] uppercase mb-1">
                        <span>{prod.category}</span>
                        <span>•</span>
                        <span className="text-stone-500 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {prod.artisan_district || 'India'}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-[#262220] leading-snug line-clamp-2 group-hover:text-[#9c4124] transition-colors">
                        {prod.title}
                      </h3>

                      {/* Artisan Attribution */}
                      <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                        <span>By</span>
                        <strong className="text-stone-800 font-semibold">{prod.artisan_name || 'Village Master Artisan'}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#eadfd4] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 font-semibold uppercase block">Direct Price</span>
                        <span className="text-base font-black text-[#262220]">
                          {formatINR(prod.final_price || 1850)}
                        </span>
                      </div>

                      <span className="text-xs font-extrabold text-[#9c4124] group-hover:underline">
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
