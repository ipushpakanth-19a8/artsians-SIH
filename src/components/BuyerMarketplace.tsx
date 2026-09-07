import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MapPin, Eye, ShoppingBag, Sparkles,
  ArrowUpDown, CheckCircle2, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import { LanguageCode, Product } from '../types';
import { translations } from '../lib/i18n';
import { ProductDetailModal } from './ProductDetailModal';

interface BuyerMarketplaceProps {
  language: LanguageCode;
  onEnquirySubmitted?: () => void;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({
  language,
  onEnquirySubmitted
}) => {
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high'>('recommended');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    'All',
    'Weaving',
    'Pottery',
    'Metalcraft',
    'Woodwork',
    'Folk Painting',
    'Embroidery'
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/v1/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.final_price || a.pricing?.target_recommended || 0;
    const priceB = b.final_price || b.pricing?.target_recommended || 0;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    return (b.views_count || 0) - (a.views_count || 0);
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fair Trade • Zero Middleman Cut</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-['Rozha_One',serif] leading-tight text-white mb-2">
            Direct Artisan Heritage Marketplace
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Connect directly with verified Indian master craftspeople. Every purchase transfers 100% of the artisan's fair asking price without intermediate trader cuts.
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            id="buyer-search-input"
            type="text"
            placeholder={t.searchCrafts}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span className="text-xs text-stone-500 font-semibold">{t.sortBy}:</span>
          <select
            id="buyer-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="recommended">{t.recommended}</option>
            <option value="price-low">{t.priceLowHigh}</option>
            <option value="price-high">{t.priceHighLow}</option>
          </select>
        </div>

      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="p-16 text-center text-stone-400 bg-white rounded-3xl border border-stone-200">
          Loading verified artisan creations...
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-base mb-1">No Crafts Found</h3>
          <p className="text-xs text-stone-500">
            Try adjusting your search query or selecting a different craft tradition.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            // Localized display based on current language
            const trans = product.translations[language] || product.translations.en || {
              title: product.title,
              description: product.description
            };

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                {/* Photo & Category Tag */}
                <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img
                    src={product.enhanced_image_url || product.original_image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
                    {product.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-amber-600 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-md font-mono">
                    ₹{product.final_price?.toLocaleString()}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    {/* Artisan Metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold text-stone-700">{product.artisan_district}, {product.artisan_state}</span>
                      <span>•</span>
                      <span className="text-stone-500 truncate">{product.artisan_name}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-bold text-stone-900 text-base leading-snug hover:text-amber-700 transition-colors line-clamp-2 cursor-pointer mb-2"
                    >
                      {trans.title}
                    </h3>

                    {/* Description snippet */}
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                      {trans.description}
                    </p>
                  </div>

                  {/* Card Footer: Material & CTA */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-stone-500 truncate">
                      {product.material}
                    </span>

                    <button
                      id={`view-craft-btn-${product.id}`}
                      onClick={() => setSelectedProduct(product)}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                    >
                      <span>{t.directEnquiry}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          language={language}
          onClose={() => setSelectedProduct(null)}
          onEnquirySubmitted={() => {
            if (onEnquirySubmitted) onEnquirySubmitted();
          }}
        />
      )}

    </div>
  );
};
