import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Heart, ShoppingCart, Star, MapPin, Award } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Product } from '../../types';
import { formatINR } from '../../lib/billingService';

export function BuyerHome() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
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

  const categories = [
    { name: 'Handloom', emoji: '🧵', count: '12+ items' },
    { name: 'Pottery', emoji: '🏺', count: '8+ items' },
    { name: 'Woodcraft', emoji: '🪵', count: '6+ items' },
    { name: 'Metalcraft', emoji: '🔔', count: '9+ items' },
    { name: 'Jewellery', emoji: '💍', count: '15+ items' },
    { name: 'Paintings', emoji: '🎨', count: '10+ items' },
    { name: 'Bamboo/Cane', emoji: '🎋', count: '5+ items' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Banner with Rich Warm Indian Handicraft Aesthetic */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#9c4124] via-[#853218] to-[#6d2511] text-white shadow-lg border border-[#eadfd4] p-8 sm:p-12 lg:p-14">
        {/* Decorative background craft pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-amber-200 text-xs font-extrabold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Direct Artisan Marketplace • 0% Middleman Cuts</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-['Rozha_One',serif] leading-tight text-white">
            {language === 'hi'
              ? 'सीधे भारतीय कारीगरों से खरीदें, विरासत को सहेजें'
              : language === 'te'
              ? 'భారతీయ కళాకారుల నుండి నేరుగా కొనుగోలు చేయండి'
              : 'Authentic Indian Crafts, Straight From The Artisan’s Hands'}
          </h1>

          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed font-medium">
            {language === 'hi'
              ? 'बिचौलियों के बिना उचित मूल्य पर प्रामाणिक हथकरघा, मिट्टी के बर्तन, धातु शिल्प और पारंपरिक कला की खोज करें।'
              : language === 'te'
              ? 'మధ్యవర్తులు లేకుండా సరసమైన ధరకు ప్రామాణికమైన చేనేత, కుండలు మరియు సాంప్రదాయ కళలను కనుగొనండి.'
              : 'Support generational Indian craftspeople. Every purchase guarantees fair remuneration and verified cultural provenance.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/buyer/browse"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#faf7f2] text-[#9c4124] font-extrabold rounded-2xl shadow-md transition-all text-sm"
            >
              <span>Explore Artisan Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/buyer/orders"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm"
            >
              {t.orderTracking}
            </Link>
          </div>
        </div>
      </section>

      {/* Craft Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-['Rozha_One',serif]">
              {t.categories}
            </h2>
            <p className="text-xs text-stone-500">Explore traditional craft traditions across India</p>
          </div>
          <Link to="/buyer/browse" className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/buyer/browse?category=${encodeURIComponent(cat.name)}`)}
              className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer text-center group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</div>
              <h3 className="text-xs font-bold text-stone-800 group-hover:text-amber-700">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Handicrafts Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-['Rozha_One',serif]">
              {t.popularProducts}
            </h2>
            <p className="text-xs text-stone-500">Curated handcrafted masterpieces available for direct purchase</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-stone-500">Loading authentic handicrafts...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((prod) => {
              const inWishlist = wishlistIds.includes(prod.id);
              const img = prod.enhanced_image_url || prod.original_image_url;

              return (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/buyer/product/${prod.id}`)}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group cursor-pointer"
                >
                  {/* Image container */}
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

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(e, prod)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all ${
                        inWishlist
                          ? 'bg-red-50 text-red-600 shadow-md'
                          : 'bg-white/80 text-stone-600 hover:text-red-500 hover:bg-white'
                      }`}
                      title={inWishlist ? t.removeFromWishlist : t.addToWishlist}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
                    </button>

                    {/* Fair-Trade Badge */}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Fair Trade
                    </span>
                  </div>

                  {/* Body Content */}
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
        )}
      </section>

      {/* Trust & Heritage Pillars */}
      <section className="bg-stone-100 rounded-3xl p-8 sm:p-10 border border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 font-['Rozha_One',serif] text-center mb-8">
          The ShilpSetu (KALAtech) Fair-Trade Guarantee
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">100% Direct Artisan Remuneration</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              No predatory middlemen markups. Over 90% of your funds go directly into the hands of the artisan families.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">Verified Craft Provenance</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every item has an auditable provenance certificate tracing back to the master artisan's cluster in India.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">Fair & Transparent Billing</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Transparent cost breakdowns showing materials, labor hours, and artisan margin for complete peace of mind.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
