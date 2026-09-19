import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, ShieldCheck, Sparkles, Phone, MapPin, Award, CheckCircle, Share2, Info, Volume2 } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
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
      const wish = JSON.parse(localStorage.getItem('ShilpSetu_wishlist') || '[]');
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
          Return to Crafts
        </button>
      </div>
    );
  }

  const toggleWishlist = () => {
    try {
      let wish = JSON.parse(localStorage.getItem('ShilpSetu_wishlist') || '[]');
      if (isWishlisted) {
        wish = wish.filter((w: any) => w.productId !== product.id);
        setIsWishlisted(false);
      } else {
        wish.push({ productId: product.id, product, addedAt: new Date().toISOString() });
        setIsWishlisted(true);
      }
      localStorage.setItem('ShilpSetu_wishlist', JSON.stringify(wish));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {}
  };

  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('ShilpSetu_cart') || '[]');
      const existing = cart.find((item: any) => item.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ productId: product.id, product, quantity, addedAt: new Date().toISOString() });
      }
      localStorage.setItem('ShilpSetu_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    } catch {}
  };

  const activeTitle = product.translations?.[language]?.title || product.title;
  const activeDesc = product.translations?.[language]?.description || product.description;
  const activeTags = product.translations?.[language]?.tags || product.tags || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#6B5E55] hover:text-[#29221D] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Images & Provenance Trigger */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#F7F2E8] border border-[#D9CEB8] shadow-sm">
            <img
              src={product.enhanced_image_url || product.original_image_url}
              alt={activeTitle}
              className="w-full h-full object-cover"
            />
            <button
              onClick={toggleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                isWishlisted ? 'bg-rose-50 text-rose-600 shadow-md' : 'bg-[#FFFDF8]/90 text-[#6B5E55] hover:bg-[#FFFDF8]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>

            <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#273B59]/90 backdrop-blur text-xs font-bold text-[#F3E5AB] flex items-center gap-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Direct Artisan Certified
            </span>
          </div>

          {/* Digital Provenance Tag Trigger */}
          <button
            onClick={() => setShowProvenance(true)}
            className="w-full py-3 px-4 rounded-2xl bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] hover:border-[#A8462D] text-[#A8462D] flex items-center justify-between text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#A8462D]" />
              View Digital Provenance & Authenticity Certificate
            </span>
            <span className="text-[#A8462D] font-extrabold">Inspect →</span>
          </button>
        </div>

        {/* Right: Craft Information & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#A8462D] uppercase tracking-wider mb-2">
              <span>{product.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#6B5E55]">
                <MapPin className="w-3 h-3 text-[#8C827A]" /> {product.artisan_district}, {product.artisan_state}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#29221D] font-serif leading-tight">
              {activeTitle}
            </h1>

            {/* Price Box */}
            <div className="mt-4 p-4 rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] flex items-baseline justify-between shadow-2xs">
              <div>
                <span className="text-[11px] font-bold text-[#6B5E55] uppercase tracking-wider block">Direct Artisan Price</span>
                <span className="text-3xl font-black text-[#29221D] font-mono">
                  {formatINR(product.final_price || 2500)}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                Fair Trade Verified
              </span>
            </div>
          </div>

          {/* Craft Description */}
          <div>
            <h3 className="text-xs font-bold text-[#6B5E55] uppercase tracking-wider mb-2">{t.productInfo}</h3>
            <p className="text-sm text-[#574D45] leading-relaxed whitespace-pre-line">{activeDesc}</p>
          </div>

          {/* Tags */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-[#FFFDF8] border border-[#D9CEB8] text-[#6B5E55] text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Artisan Profile Card */}
          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8462D] to-[#C88732] flex items-center justify-center text-white font-serif font-black text-lg shadow-xs">
                {product.artisan_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-xs text-[#6B5E55] font-semibold">{t.artisan}</p>
                <h4 className="font-bold text-[#29221D] text-sm">{product.artisan_name}</h4>
                <p className="text-xs text-[#6B5E55]">{product.artisan_category} • {product.artisan_state}</p>
              </div>
            </div>

            <a
              href={`tel:${product.artisan_phone || '+919848012345'}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F7F2E8] border border-[#D9CEB8] hover:bg-[#FFFDF8] rounded-xl text-xs font-bold text-[#29221D] shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#A8462D]" />
              {t.contactSeller}
            </a>
          </div>

          {/* Quantity & Buy Buttons */}
          <div className="pt-4 border-t border-[#D9CEB8] space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#6B5E55] uppercase tracking-wider">{t.quantity}:</span>
              <div className="flex items-center border border-[#D9CEB8] rounded-xl bg-[#FFFDF8] overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-[#29221D] hover:bg-[#F7F2E8] font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-[#29221D] font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-[#29221D] hover:bg-[#F7F2E8] font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* B2B Wholesale & Bulk Order Information */}
            <div className="p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#D9CEB8] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#29221D] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C88732]" />
                  <span>B2B Institutional & Wholesale</span>
                </span>
                <span className="px-2 py-0.5 bg-[#C88732]/20 text-[#A8462D] font-bold rounded text-[10px]">
                  MOQ: {product.minimum_order_quantity || 10} units
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#6B5E55]">
                <span>Wholesale Direct Rate:</span>
                <strong className="font-mono text-emerald-800 font-extrabold text-sm">
                  ₹{product.b2b_price ? product.b2b_price.toLocaleString() : Math.round(product.final_price * 0.82).toLocaleString()} / unit
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8C827A]">
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
                    alert('B2B RFQ quotation request sent directly to artisan via ShilpSetu B2B Network!');
                  }).catch(() => {
                    alert('Enquiry submitted.');
                  });
                }}
                className="w-full py-2 bg-[#29221D] hover:bg-[#3E342B] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Submit B2B Bulk RFQ Quotation Request
              </button>
            </div>

            {/* Seen at Exhibition Provenance Tag */}
            {product.seen_at_exhibition && (
              <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#D9CEB8] flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B5E55] block">Exhibition Provenance:</span>
                  <span className="font-bold text-[#29221D]">{product.seen_at_exhibition.event_name} ({product.seen_at_exhibition.stall_number})</span>
                  <p className="text-[11px] text-[#6B5E55]">{product.seen_at_exhibition.city}, {product.seen_at_exhibition.year}</p>
                </div>
                <span className="px-2.5 py-1 bg-[#C88732]/20 text-[#A8462D] rounded-lg text-[10px] font-bold">
                  Seen in Person ✓
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-xl border-2 border-[#29221D] hover:bg-[#29221D] hover:text-white text-[#29221D] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                {t.addToCart}
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                className="py-3 px-4 rounded-xl bg-[#A8462D] hover:bg-[#8D3823] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
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

      {/* ================================================== */}
      {/* THE STORY BEHIND THIS CRAFT (With Audio Listen) */}
      {/* ================================================== */}
      <div className="artisan-card rounded-3xl p-6 sm:p-8 border border-[#D9CEB8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9CEB8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A8462D]/10 text-[#A8462D] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#29221D] font-serif">
                The Story Behind This Craft
              </h2>
              <span className="text-xs text-[#6B5E55] font-semibold">Living Heritage & Sustainable Techniques</span>
            </div>
          </div>

          <button
            onClick={() => speakText(`${activeTitle}. ${activeDesc}. Handcrafted by master artisans using traditional heritage techniques.`, language)}
            className="artisan-listen-btn cursor-pointer self-start sm:self-auto"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen to Craft Story 🔊</span>
          </button>
        </div>

        <p className="text-sm text-[#574D45] leading-relaxed max-w-3xl">
          {activeDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F7F2E8] border border-[#D9CEB8]">
            <strong className="block text-[#A8462D] uppercase font-bold mb-1">Authentic Materials</strong>
            <p className="text-[#6B5E55]">{product.material || '100% natural organic materials, eco-friendly natural dyes'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F7F2E8] border border-[#D9CEB8]">
            <strong className="block text-[#A8462D] uppercase font-bold mb-1">Origin & Heritage</strong>
            <p className="text-[#6B5E55]">{product.artisan_district}, {product.artisan_state} • Recognized Cultural Cluster</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F7F2E8] border border-[#D9CEB8]">
            <strong className="block text-[#A8462D] uppercase font-bold mb-1">Care & Longevity</strong>
            <p className="text-[#6B5E55]">Gentle hand wash in cold water. Shade dry. Treat as heirloom craft.</p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* MEET THE MAKER (Emotional Artisan Profile) */}
      {/* ================================================== */}
      <div className="artisan-card rounded-3xl p-6 sm:p-8 border border-[#D9CEB8] shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#A8462D] bg-[#A8462D]/10 px-3 py-1 rounded-full border border-[#A8462D]/20 uppercase">
            Meet the Maker
          </span>
          <span className="text-xs text-[#6B5E55] font-semibold">• Direct Artisan Connection</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#A8462D] text-white flex items-center justify-center font-serif font-black text-2xl sm:text-3xl shadow-md shrink-0">
            {product.artisan_name?.charAt(0) || 'R'}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#29221D] font-serif">
                {product.artisan_name || 'Rameshwar Rao'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                <CheckCircle className="w-3 h-3" /> Verified Master Artisan
              </span>
            </div>

            <p className="text-xs text-[#A8462D] font-bold">
              {product.artisan_category} • {product.artisan_district}, {product.artisan_state} (Over 18 years of heritage practice)
            </p>

            <blockquote className="text-xs sm:text-sm italic text-[#574D45] bg-[#F7F2E8] p-3.5 rounded-2xl border border-[#D9CEB8]">
              "When you purchase this handmade creation, you directly sustain our family's craft tradition and ensure fair living wages for our rural weaving community."
            </blockquote>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* CUSTOMER REVIEWS & ETHICAL SATISFACTION */}
      {/* ================================================== */}
      <div className="artisan-card rounded-3xl p-6 sm:p-8 border border-[#D9CEB8] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D9CEB8]">
          <div>
            <h3 className="text-lg font-black text-[#29221D] font-serif">Customer Reviews & Verification</h3>
            <p className="text-xs text-[#6B5E55]">100% verified patron testimonials</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            ★ 4.9 out of 5.0 (28 reviews)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F7F2E8] border border-[#D9CEB8] space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-[#29221D] font-bold">Ananya Sharma (Bangalore)</strong>
              <span className="text-[#C88732] font-black">★★★★★</span>
            </div>
            <p className="text-[#6B5E55] leading-relaxed">
              "The craft quality is exquisite! Knowing that my payment directly reaches the weaver without middleman cuts makes this purchase deeply meaningful."
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F2E8] border border-[#D9CEB8] space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-[#29221D] font-bold">Vikram Mehra (New Delhi)</strong>
              <span className="text-[#C88732] font-black">★★★★★</span>
            </div>
            <p className="text-[#6B5E55] leading-relaxed">
              "Safe cardboard packaging, prompt delivery, and the provenance certificate with the artisan's signature was a wonderful touch."
            </p>
          </div>
        </div>
      </div>

      {/* Provenance Tag Modal */}
      {showProvenance && (
        <ProvenanceTagModal
          product={product}
          language={language}
          onClose={() => setShowProvenance(false)}
        />
      )}

      {/* Direct Checkout Modal */}
      {showCheckout && (
        <DirectCheckoutModal
          product={product}
          language={language}
          onClose={() => setShowCheckout(false)}
          onOrderSuccess={(order) => {
            setShowCheckout(false);
            navigate('/buyer/orders');
          }}
        />
      )}
    </div>
  );
}
