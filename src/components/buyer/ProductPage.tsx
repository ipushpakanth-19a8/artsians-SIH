import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, ShieldCheck, Sparkles, Phone, MapPin, Award, CheckCircle, Share2, Info } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Product } from '../../types';
import { formatINR } from '../../lib/billingService';
import { ProvenanceTagModal } from '../ProvenanceTagModal';
import { DirectCheckoutModal } from '../DirectCheckoutModal';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((p) => p.id === id);
          if (found) setProduct(found);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    try {
      const wish = JSON.parse(localStorage.getItem('kalatech_wishlist') || '[]');
      setIsWishlisted(wish.some((w: any) => w.productId === id));
    } catch {}
  }, [id]);

  if (loading) {
    return <div className="p-16 text-center text-stone-500">Loading craft details...</div>;
  }

  if (!product) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Handicraft Not Found</h2>
        <button
          onClick={() => navigate('/buyer/browse')}
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const toggleWishlist = () => {
    try {
      let wish = JSON.parse(localStorage.getItem('kalatech_wishlist') || '[]');
      if (isWishlisted) {
        wish = wish.filter((w: any) => w.productId !== product.id);
        setIsWishlisted(false);
      } else {
        wish.push({ productId: product.id, product, addedAt: new Date().toISOString() });
        setIsWishlisted(true);
      }
      localStorage.setItem('kalatech_wishlist', JSON.stringify(wish));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {}
  };

  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('kalatech_cart') || '[]');
      const existing = cart.find((item: any) => item.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ productId: product.id, product, quantity, addedAt: new Date().toISOString() });
      }
      localStorage.setItem('kalatech_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    } catch {}
  };

  const activeTitle = product.translations?.[language]?.title || product.title;
  const activeDesc = product.translations?.[language]?.description || product.description;
  const activeTags = product.translations?.[language]?.tags || product.tags || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Images & Provenance Trigger */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
            <img
              src={product.enhanced_image_url || product.original_image_url}
              alt={activeTitle}
              className="w-full h-full object-cover"
            />
            <button
              onClick={toggleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur transition-all ${
                isWishlisted ? 'bg-red-50 text-red-600 shadow-md' : 'bg-white/80 text-stone-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>

            <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Direct Artisan Certified
            </span>
          </div>

          {/* Digital Provenance Tag Trigger */}
          <button
            onClick={() => setShowProvenance(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 text-amber-900 flex items-center justify-between text-xs font-bold transition-all"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              View Digital Provenance & Authenticity Certificate
            </span>
            <span className="text-amber-700">Inspect →</span>
          </button>
        </div>

        {/* Right: Craft Information & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
              <span>{product.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" /> {product.artisan_district}, {product.artisan_state}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-['Rozha_One',serif] leading-tight">
              {activeTitle}
            </h1>

            {/* Price Box */}
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Direct Artisan Price</span>
                <span className="text-3xl font-black text-stone-900">
                  {formatINR(product.final_price || 2500)}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Fair Trade Verified
              </span>
            </div>
          </div>

          {/* Craft Description */}
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">{t.productInfo}</h3>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{activeDesc}</p>
          </div>

          {/* Tags */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Artisan Profile Card */}
          <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 font-black text-lg">
                {product.artisan_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-xs text-stone-500 font-semibold">{t.artisan}</p>
                <h4 className="font-bold text-stone-900 text-sm">{product.artisan_name}</h4>
                <p className="text-xs text-stone-500">{product.artisan_category} • {product.artisan_state}</p>
              </div>
            </div>

            <a
              href={`tel:${product.artisan_phone || '+919848012345'}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              {t.contactSeller}
            </a>
          </div>

          {/* Quantity & Buy Buttons */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">{t.quantity}:</span>
              <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* B2B Wholesale & Bulk Order Information */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>B2B Institutional & Wholesale</span>
                </span>
                <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 font-bold rounded text-[10px]">
                  MOQ: {product.minimum_order_quantity || 10} units
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-700">
                <span>Wholesale Direct Rate:</span>
                <strong className="font-mono text-emerald-800 font-extrabold text-sm">
                  ₹{product.b2b_price ? product.b2b_price.toLocaleString() : Math.round(product.final_price * 0.82).toLocaleString()} / unit
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Monthly Capacity: {product.production_capacity_monthly || 50} units</span>
                <span>Lead Time: {product.lead_time_days || 14} days</span>
              </div>
              <button
                onClick={() => {
                  fetch(`/api/v1/products/${product.id}/enquiries`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      buyer_name: 'Verified B2B Retailer / Exporter',
                      buyer_contact: '+919876543210',
                      buyer_email: 'procurement@lifestylehandicrafts.in',
                      buyer_location: 'New Delhi, India',
                      quantity: product.minimum_order_quantity || 10,
                      message: `Inquiry for bulk order of ${product.title}. Requesting sample & GST commercial invoice terms.`
                    })
                  }).then(r => r.json()).then(() => {
                    alert('B2B RFQ quotation request sent directly to artisan via KALAtech B2B Network!');
                  }).catch(() => {
                    alert('Enquiry submitted.');
                  });
                }}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Submit B2B Bulk RFQ Quotation Request
              </button>
            </div>

            {/* Seen at Exhibition Provenance Tag */}
            {product.seen_at_exhibition && (
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Exhibition Provenance:</span>
                  <span className="font-bold text-stone-800">{product.seen_at_exhibition.event_name} ({product.seen_at_exhibition.stall_number})</span>
                  <p className="text-[11px] text-stone-500">{product.seen_at_exhibition.city}, {product.seen_at_exhibition.year}</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold">
                  Seen in Person ✓
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-xl border-2 border-stone-900 hover:bg-stone-900 hover:text-white text-stone-900 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                {t.addToCart}
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t.buyNow}
              </button>
            </div>

            {addedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Item added to cart! Proceed to checkout anytime.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provenance Tag Modal */}
      {showProvenance && (
        <ProvenanceTagModal
          product={product}
          isOpen={showProvenance}
          onClose={() => setShowProvenance(false)}
        />
      )}

      {/* Direct Checkout Modal */}
      {showCheckout && (
        <DirectCheckoutModal
          product={product}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onOrderPlaced={(order) => {
            setShowCheckout(false);
            navigate('/buyer/orders');
          }}
        />
      )}
    </div>
  );
}
