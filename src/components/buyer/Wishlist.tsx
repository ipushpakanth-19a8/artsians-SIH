import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { WishlistItem } from '../../types';

export function Wishlist() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const loadWishlist = () => {
    try {
      const items = JSON.parse(localStorage.getItem('kalatech_wishlist') || '[]');
      setWishlist(items);
    } catch {}
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = (productId: string) => {
    const updated = wishlist.filter((item) => item.productId !== productId);
    setWishlist(updated);
    localStorage.setItem('kalatech_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const moveToCart = (item: WishlistItem) => {
    try {
      const cart = JSON.parse(localStorage.getItem('kalatech_cart') || '[]');
      const existing = cart.find((i: any) => i.productId === item.productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ productId: item.productId, product: item.product, quantity: 1, addedAt: new Date().toISOString() });
      }
      localStorage.setItem('kalatech_cart', JSON.stringify(cart));
      removeItem(item.productId);
    } catch {}
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <Heart className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-xl font-bold text-stone-800">{t.wishlistEmpty}</h2>
        <p className="text-xs text-stone-500">Save handcrafted items you love and visit them anytime.</p>
        <Link
          to="/buyer/browse"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          {t.products} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
          <Heart className="w-7 h-7 text-red-500 fill-red-500" />
          {t.wishlist} ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const img = item.product?.enhanced_image_url || item.product?.original_image_url;

          return (
            <div
              key={item.productId}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div
                onClick={() => navigate(`/buyer/product/${item.productId}`)}
                className="cursor-pointer"
              >
                <div className="relative aspect-square bg-stone-100">
                  <img src={img} alt={item.product?.title} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.productId);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-stone-500 hover:text-red-500 shadow-sm"
                    title={t.removeFromWishlist}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    {item.product?.category}
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm mt-0.5 line-clamp-1">
                    {item.product?.translations?.[language]?.title || item.product?.title}
                  </h3>
                  <p className="text-base font-black text-stone-900 mt-2">
                    {formatINR(item.product?.final_price || 2500)}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => moveToCart(item)}
                  className="w-full py-2.5 px-3 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {t.moveToCart}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
