import React, { useState } from 'react';
import {
  X, Sparkles, MapPin, ShieldCheck, Phone, Mail, Send,
  Share2, CheckCircle2, Globe2, Tag, Eye, Heart, Volume2,
  CreditCard, QrCode, Lock
} from 'lucide-react';
import { LanguageCode, Product, Order } from '../types';
import { translations, speakText } from '../lib/i18n';
import { DirectCheckoutModal } from './DirectCheckoutModal';
import { ProvenanceTagModal } from './ProvenanceTagModal';

interface ProductDetailModalProps {
  product: Product;
  language: LanguageCode;
  onClose: () => void;
  onEnquirySubmitted?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  language,
  onClose,
  onEnquirySubmitted
}) => {
  const t = translations[language];

  const [activeLang, setActiveLang] = useState<LanguageCode>(language);
  const [showEnhanced, setShowEnhanced] = useState(true);
  const [activeActionTab, setActiveActionTab] = useState<'checkout' | 'enquiry'>('checkout');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showProvenanceTagModal, setShowProvenanceTagModal] = useState(false);

  // Enquiry form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('+91 ');
  const [buyerLocation, setBuyerLocation] = useState('Mumbai, Maharashtra');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('I would like to order this handcrafted piece directly. Please share shipping timeline and payment options.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Get active translation or fallback
  const currentTranslation = product.translations[activeLang] || product.translations.en || {
    title: product.title,
    description: product.description,
    tags: product.tags
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerContact) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/products/${product.id}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_name: buyerName,
          buyer_contact: buyerContact,
          buyer_location: buyerLocation,
          quantity,
          message
        })
      });
      if (res.ok) {
        setEnquirySuccess(true);
        if (onEnquirySubmitted) onEnquirySubmitted();
      }
    } catch (err) {
      console.error(err);
      setEnquirySuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 transition-colors shadow-md"
          title={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Craft Image & Visual Proof */}
          <div className="p-6 bg-stone-100 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-stone-900 shadow-md">
              <img
                src={showEnhanced ? (product.enhanced_image_url || product.original_image_url) : product.original_image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3 bg-stone-950/85 backdrop-blur text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{showEnhanced ? 'AI Enhanced Studio' : 'Raw Capture'}</span>
              </div>

              <button
                onClick={() => setShowEnhanced(!showEnhanced)}
                className="absolute bottom-3 right-3 bg-stone-900/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                {showEnhanced ? 'Show Raw' : 'Show Enhanced'}
              </button>
            </div>

            {/* Artisan Heritage Badge */}
            <div className="mt-4 p-3.5 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                {product.artisan_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-semibold block">Crafted by Master Artisan</span>
                <span className="text-xs font-extrabold text-stone-900 block">{product.artisan_name}</span>
                <span className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  {product.artisan_district}, {product.artisan_state}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative, Translations & Direct Enquiry */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
            
            <div>
              {/* Multilingual Switcher for this product */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Language</span>
                </span>
                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs font-bold">
                  {(['en', 'hi', 'te'] as LanguageCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveLang(c)}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        activeLang === c ? 'bg-amber-600 text-white' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Price */}
              <div className="mb-3">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[11px] font-bold inline-block mb-1.5">
                  {product.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-black font-['Rozha_One',serif] text-stone-900 leading-snug">
                  {currentTranslation.title}
                </h1>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black font-mono text-amber-800">
                    ₹{product.final_price?.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Direct Artisan Price (No Middlemen)
                  </span>
                </div>
              </div>

              {/* Narrative Story */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                    Artisan Heritage Story
                  </span>
                  <button
                    onClick={() => speakText(`${currentTranslation.title}. ${currentTranslation.description}`, activeLang)}
                    className="text-stone-500 hover:text-amber-700 p-1"
                    title="Read description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
                  {currentTranslation.description}
                </p>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50/70 p-3 rounded-xl border border-stone-200/60 mb-4">
                <div>
                  <span className="text-stone-500 block text-[11px]">Material</span>
                  <strong className="text-stone-800">{product.material}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Dimensions</span>
                  <strong className="text-stone-800">{product.est_dimensions}</strong>
                </div>
              </div>
            </div>

            {/* Action Tabs: Direct Checkout vs Wholesale Enquiry */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex bg-stone-100 p-1 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveActionTab('checkout')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeActionTab === 'checkout'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Direct Fair-Trade Purchase</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('enquiry')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeActionTab === 'enquiry'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Bespoke / Bulk Enquiry</span>
                </button>
              </div>

              {activeActionTab === 'checkout' ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-emerald-950 block">
                        Direct Artisan Purchase (Razorpay Test Mode)
                      </span>
                      <p className="text-[11px] text-emerald-800">
                        100% of ₹{product.final_price?.toLocaleString('en-IN')} goes to {product.artisan_name} with zero intermediary cut.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-black uppercase">
                      Instant Payout
                    </span>
                  </div>

                  <button
                    id="open-direct-checkout-btn"
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-900/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Instant Sample Checkout (₹{product.final_price?.toLocaleString('en-IN')})</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setShowProvenanceTagModal(true)}
                      className="text-stone-600 hover:text-stone-900 font-bold text-xs flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      <span>View Physical Stall QR Provenance Tag</span>
                    </button>
                    <span className="text-[10px] text-stone-500 font-semibold">Fair Trade Certified</span>
                  </div>
                </div>
              ) : (
                <>
                  {enquirySuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <h4 className="font-extrabold text-emerald-900 text-sm">{t.enquirySentSuccess}</h4>
                      <p className="text-xs text-emerald-700">
                        Master artisan {product.artisan_name} will contact you on WhatsApp/Phone.
                      </p>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hello ${product.artisan_name}, I am ${buyerName} and I submitted an order enquiry for "${product.title}" via KALAtech.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Open Immediate WhatsApp Chat
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleSendEnquiry} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                          {t.sendEnquiryTitle}
                        </span>
                        <span className="text-[11px] text-stone-400">100% Direct to Artisan</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder={t.buyerName}
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          required
                          className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                        />
                        <input
                          type="tel"
                          placeholder={t.buyerPhone}
                          value={buyerContact}
                          onChange={(e) => setBuyerContact(e.target.value)}
                          required
                          className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          placeholder="Qty"
                          className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                        />
                        <input
                          type="text"
                          value={buyerLocation}
                          onChange={(e) => setBuyerLocation(e.target.value)}
                          placeholder="City / Region"
                          className="col-span-2 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t.buyerMessage}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                      />

                      <button
                        id="submit-buyer-enquiry-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-95 text-white font-extrabold rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? 'Sending...' : t.submitEnquiry}</span>
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Modal Elements */}
            {showCheckoutModal && (
              <DirectCheckoutModal
                product={product}
                language={language}
                onClose={() => setShowCheckoutModal(false)}
                onOrderSuccess={(order) => {
                  setShowCheckoutModal(false);
                  if (onEnquirySubmitted) onEnquirySubmitted();
                }}
              />
            )}

            {showProvenanceTagModal && (
              <ProvenanceTagModal
                product={product}
                language={language}
                onClose={() => setShowProvenanceTagModal(false)}
              />
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
