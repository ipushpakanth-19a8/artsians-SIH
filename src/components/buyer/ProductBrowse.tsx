import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Heart, ShoppingCart, ShieldCheck, MapPin, X } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const categories = [
    'All',
    'Handloom',
    'Pottery',
    'Woodcraft',
    'Metalcraft',
    'Jewellery',
    'Paintings',
    'Bamboo/Cane',
    'Textiles',
    'Weaving',
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

  const addToCart = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem('kalatech_cart') || '[]');
      const existing = cart.find((item: any) => item.productId === prod.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ productId: prod.id, product: prod, quantity: 1, addedAt: new Date().toISOString() });
      }
      localStorage.setItem('kalatech_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {}
  };

  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.artisan_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.final_price || 0) - (b.final_price || 0);
      if (sortBy === 'price-desc') return (b.final_price || 0) - (a.final_price || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handcrafted sarees, terracotta pots, brass statues..."
              className="w-full pl-9 pr-8 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 whitespace-nowrap">{t.sort}:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-700"
            >
              <option value="featured">Featured Artisans</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-16 text-center text-stone-500">Loading catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-stone-200">
          <Filter className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No handicraft products match your search</h3>
          <p className="text-xs text-stone-500 mt-1">Try selecting another category or clearing your search term.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-stone-500 mb-4">
            Showing {filteredProducts.length} authentic handicraft listings
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const inWishlist = wishlistIds.includes(prod.id);
              const img = prod.enhanced_image_url || prod.original_image_url;

              return (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/buyer/product/${prod.id}`)}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-square bg-stone-100 overflow-hidden">
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
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all ${
                        inWishlist
                          ? 'bg-red-50 text-red-600 shadow-md'
                          : 'bg-white/80 text-stone-600 hover:text-red-500 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
                    </button>

                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Fair Trade
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span className="font-semibold text-amber-800">{prod.category}</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-stone-400" /> {prod.artisan_district || prod.artisan_state || 'India'}
                        </span>
                      </div>

                      <h3 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {prod.translations?.[language]?.title || prod.title}
                      </h3>

                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {prod.translations?.[language]?.description || prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold">Artisan Price</span>
                        <p className="text-base font-black text-stone-900">
                          {formatINR(prod.final_price || 2500)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => addToCart(e, prod)}
                        className="p-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-xl transition-colors shadow-xs"
                        title={t.addToCart}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
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
