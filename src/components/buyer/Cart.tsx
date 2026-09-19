import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { CartItem } from '../../types';

export function Cart() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('ShilpSetu_cart') || '[]');
      setCartItems(items);
    } catch {}
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    const updated = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem('ShilpSetu_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updated);
    localStorage.setItem('ShilpSetu_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.final_price || 2500) * item.quantity,
    0
  );
  const shipping = subtotal > 1500 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);

    try {
      for (const item of cartItems) {
        const orderData = {
          id: 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          product_id: item.productId,
          product_title: item.product.title,
          artisan_id: item.product.artisan_id || 'art-01',
          artisan_name: item.product.artisan_name || 'Artisan Seller',
          buyer_name: 'Priya Sharma',
          buyer_contact: '+91 98765 43210',
          buyer_email: 'buyer@example.com',
          buyer_address: 'Flat 402, Lotus Greens, Hyderabad, Telangana',
          quantity: item.quantity,
          unit_price: item.product.final_price || 2500,
          total_amount: (item.product.final_price || 2500) * item.quantity,
          status: 'paid',
          payment_method: 'upi_direct',
          fair_trade_verified: true,
          created_at: new Date().toISOString(),
        };

        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
      }

      // Clear cart
      localStorage.setItem('ShilpSetu_cart', '[]');
      window.dispatchEvent(new Event('cart-updated'));
      setCheckoutDone(true);
      setTimeout(() => {
        navigate('/buyer/orders');
      }, 1500);
    } catch {
      setCheckingOut(false);
    }
  };

  if (cartItems.length === 0 && !checkoutDone) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center artisan-card bg-[#FFFDF8] rounded-3xl border border-[#D9CEB8] shadow-sm space-y-4">
        <ShoppingCart className="w-16 h-16 text-[#8C827A] mx-auto" />
        <h2 className="text-xl font-black text-[#29221D] font-serif">{t.cartEmpty}</h2>
        <p className="text-xs text-[#6B5E55]">Explore traditional Indian crafts and support generational master artisans.</p>
        <Link
          to="/buyer/browse"
          className="artisan-btn-primary inline-flex items-center gap-2 py-2.5 px-6 text-xs font-bold"
        >
          {t.products} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-black text-[#29221D] font-serif flex items-center gap-2.5">
          <ShoppingCart className="w-7 h-7 text-[#A8462D]" />
          {t.cart} ({cartItems.reduce((s, i) => s + i.quantity, 0)})
        </h1>
        <Link to="/buyer/browse" className="text-xs font-bold text-[#A8462D] hover:underline">
          + Add more items
        </Link>
      </div>

      {checkoutDone ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3 shadow-xs">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-black text-emerald-950 font-serif">{t.orderPlaced}!</h2>
          <p className="text-xs text-emerald-800">Redirecting to your orders list...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="artisan-card bg-[#FFFDF8] p-4 rounded-2xl border border-[#D9CEB8] shadow-xs flex items-center gap-4"
              >
                <img
                  src={item.product?.enhanced_image_url || item.product?.original_image_url}
                  alt={item.product?.title}
                  className="w-20 h-20 object-cover rounded-xl border border-[#D9CEB8] bg-[#F7F2E8]"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#29221D] text-sm truncate">{item.product?.title}</h3>
                  <p className="text-xs text-[#6B5E55]">{item.product?.category} • {item.product?.artisan_state}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-black text-[#29221D] font-mono">
                      {formatINR(item.product?.final_price || 2500)}
                    </p>
                    {(item.product?.laborValue || item.product?.cost?.labor_hours) && (
                      <span className="text-[10px] bg-[#C88732]/20 text-[#A8462D] px-2 py-0.5 rounded-md font-bold">
                        👩‍🎨 ₹{item.product.laborValue || ((item.product.cost?.labor_hours || 10) * (item.product.cost?.hourly_rate || 100))} Artisan Labor
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#D9CEB8] rounded-xl overflow-hidden text-xs bg-[#FFFDF8]">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2.5 py-1 text-[#29221D] hover:bg-[#F7F2E8] font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-bold text-[#29221D] font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1 text-[#29221D] hover:bg-[#F7F2E8] font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 text-[#8C827A] hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="artisan-card bg-[#FFFDF8] p-6 rounded-3xl border border-[#D9CEB8] shadow-sm h-fit space-y-4">
            <h2 className="text-base font-black text-[#29221D] font-serif">{t.cartSummary}</h2>

            <div className="space-y-2 text-xs text-[#6B5E55] border-b border-[#D9CEB8] pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#29221D] font-mono">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Artisan Delivery</span>
                <span>{shipping === 0 ? <span className="text-emerald-700 font-bold">Free</span> : <span className="font-mono">{formatINR(shipping)}</span>}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-black text-[#29221D]">
              <span>{t.totalAmount}</span>
              <span className="text-[#A8462D] font-mono">{formatINR(total)}</span>
            </div>

            <div className="p-3 bg-[#F7F2E8] rounded-xl border border-[#D9CEB8] text-[11px] text-[#29221D] flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Direct artisan payout with fair-trade protection.</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="artisan-btn-primary w-full py-3 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{checkingOut ? 'Processing Order...' : t.proceedToCheckout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
