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

  const addToCart = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem('ShilpSetu_cart') || '[]');
      const existing = cart.find((item: any) => item.productId === prod.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ productId: prod.id, product: prod, quantity: 1, addedAt: new Date().toISOString() });
      }
      localStorage.setItem('ShilpSetu_cart', JSON.stringify(cart));
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
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#A8462D] via-[#8D3823] to-[#29221D] text-white shadow-lg border border-[#D9CEB8] p-8 sm:p-12 lg:p-14">
        {/* Decorative background craft glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C88732]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[#F3E5AB] text-xs font-extrabold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#C88732]" />
            <span>Direct Artisan Crafts • 0% Middleman Cuts</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif leading-tight text-white">
            {language === 'hi'
              ? 'सीधे भारतीय कारीगरों से खरीदें, विरासत को सहेजें'
              : language === 'te'
              ? 'భారతీయ కళాకారుల నుండి నేరుగా కొనుగోలు చేయండి'
              : 'Authentic Indian Crafts, Straight From The Artisan’s Hands'}
          </h1>

          <p className="text-[#F7F2E8]/90 text-sm sm:text-base leading-relaxed font-medium">
            {language === 'hi'
              ? 'बिचौलियों के बिना उचित मूल्य पर प्रामाणिक हथकरघा, मिट्टी के बर्तन, धातु शिल्प और पारंपरिक कला की खोज करें।'
              : language === 'te'
              ? 'మధ్యవర్తులు లేకుండా సరసమైన ధరకు ప్రామాణికమైన చేనేత, కుండలు మరియు సాంప్రదాయ కళలను కనుగొనండి.'
              : 'Support generational Indian craftspeople. Every purchase guarantees fair remuneration and verified cultural provenance.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/buyer/browse"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#A8462D] font-extrabold rounded-2xl shadow-md transition-all text-sm border border-[#D9CEB8]"
            >
              <span>Explore Artisan Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/buyer/orders"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-[#FFFDF8] font-bold rounded-2xl border border-white/20 transition-all text-sm"
            >
              {t.orderTracking}
            </Link>
          </div>
        </div>
      </section>

      {/* Craft Categories */}
      <section className="space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#29221D] font-serif">
              {t.categories}
            </h2>
            <p className="text-xs text-[#6B5E55]">Explore traditional craft traditions across India</p>
          </div>
          <Link to="/buyer/browse" className="text-xs font-bold text-[#A8462D] hover:underline flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/buyer/browse?category=${encodeURIComponent(cat.name)}`)}
              className="artisan-card p-4 rounded-2xl border border-[#D9CEB8] hover:border-[#A8462D] hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center group shadow-2xs"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</div>
              <h3 className="text-xs font-bold text-[#29221D] group-hover:text-[#A8462D] transition-colors">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Handicrafts Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#29221D] font-serif">
              {t.popularProducts}
            </h2>
            <p className="text-xs text-[#6B5E55]">Curated handcrafted masterpieces available for direct purchase</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6B5E55]">
            <div className="w-8 h-8 border-2 border-[#D9CEB8] border-t-[#A8462D] rounded-full animate-spin mx-auto mb-2" />
            <span>Loading authentic handicrafts...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((prod) => {
              const inWishlist = wishlistIds.includes(prod.id);
              const img = prod.enhanced_image_url || prod.original_image_url;

              return (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/buyer/product/${prod.id}`)}
                  className="artisan-card rounded-2xl border border-[#D9CEB8] overflow-hidden shadow-xs hover:shadow-[0_12px_28px_-6px_rgba(168,70,45,0.18)] hover:border-[#A8462D] hover:-translate-y-1 transition-all duration-200 flex flex-col group cursor-pointer"
                >
                  {/* Image container */}
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

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(e, prod)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all active:scale-90 ${
                        inWishlist
                          ? 'bg-rose-50 text-rose-600 shadow-md'
                          : 'bg-[#FFFDF8]/90 text-[#6B5E55] hover:text-rose-600 hover:bg-[#FFFDF8]'
                      }`}
                      title={inWishlist ? t.removeFromWishlist : t.addToWishlist}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
                    </button>

                    {/* Fair-Trade Badge */}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-[#273B59]/90 backdrop-blur text-[10px] font-bold text-[#F3E5AB] flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Fair Trade
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#6B5E55] mb-1">
                        <span className="font-bold text-[#A8462D] uppercase tracking-wider">{prod.category}</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-[#8C827A]" /> {prod.artisan_district || prod.artisan_state || 'India'}
                        </span>
                      </div>

                      <h3 className="font-bold text-[#29221D] text-sm line-clamp-1 group-hover:text-[#A8462D] transition-colors">
                        {prod.translations?.[language]?.title || prod.title}
                      </h3>

                      <p className="text-xs text-[#574D45] mt-1 line-clamp-2 leading-relaxed">
                        {prod.translations?.[language]?.description || prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#D9CEB8] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6B5E55] uppercase font-bold tracking-wider">Artisan Price</span>
                        <p className="text-base font-black text-[#29221D] font-mono">
                          {formatINR(prod.final_price || 2500)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => addToCart(e, prod)}
                        className="p-2.5 bg-[#A8462D] hover:bg-[#8D3823] text-white rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
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
      <section className="bg-[#FFFDF8] rounded-3xl p-8 sm:p-10 border border-[#D9CEB8] shadow-xs">
        <h2 className="text-xl font-black text-[#29221D] font-serif text-center mb-8">
          The ShilpSetu (ShilpSetu) Fair-Trade Guarantee
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#F7F2E8] p-6 rounded-2xl border border-[#D9CEB8] shadow-2xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#C88732]/20 text-[#A8462D] flex items-center justify-center mb-4 border border-[#C88732]/30">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#29221D] text-sm mb-1 font-serif">100% Direct Artisan Remuneration</h3>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              No predatory middlemen markups. Over 90% of your funds go directly into the hands of the artisan families.
            </p>
          </div>

          <div className="bg-[#F7F2E8] p-6 rounded-2xl border border-[#D9CEB8] shadow-2xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#29221D] text-sm mb-1 font-serif">Verified Craft Provenance</h3>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              Every item has an auditable provenance certificate tracing back to the master artisan's cluster in India.
            </p>
          </div>

          <div className="bg-[#F7F2E8] p-6 rounded-2xl border border-[#D9CEB8] shadow-2xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#273B59]/10 text-[#273B59] flex items-center justify-center mb-4 border border-[#273B59]/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#29221D] text-sm mb-1 font-serif">Fair & Transparent Billing</h3>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              Transparent cost breakdowns showing materials, labor hours, and artisan margin for complete peace of mind.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

