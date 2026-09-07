import React, { useState, useEffect } from 'react';
import {
  Plus, Eye, MessageSquare, TrendingUp, ShieldCheck, Share2,
  ExternalLink, Phone, Mail, MapPin, Clock, Sparkles, Volume2, CheckCircle2,
  QrCode, CreditCard, Package, DollarSign
} from 'lucide-react';
import { LanguageCode, Product, Artisan, Enquiry, Order } from '../types';
import { translations, speakText } from '../lib/i18n';
import { ProvenanceTagModal } from './ProvenanceTagModal';

interface ArtisanDashboardProps {
  artisan: Artisan;
  language: LanguageCode;
  onAddNewProduct: () => void;
  onViewProduct: (product: Product) => void;
}

export const ArtisanDashboard: React.FC<ArtisanDashboardProps> = ({
  artisan,
  language,
  onAddNewProduct,
  onViewProduct
}) => {
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProvenanceProduct, setSelectedProvenanceProduct] = useState<Product | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'enquiries' | 'orders'>('enquiries');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/artisans/${artisan.id}/dashboard`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setEnquiries(data.recentEnquiries || []);
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [artisan.id]);

  // Calculate middleman savings metrics
  let totalDirectRevenue = 0;
  let totalMiddlemanSavings = 0;
  products.forEach((p) => {
    const price = p.final_price || p.pricing?.target_recommended || 0;
    const middlemanPrice = p.pricing?.typical_middleman_price || Math.round(price * 0.42);
    totalDirectRevenue += price;
    totalMiddlemanSavings += Math.max(0, price - middlemanPrice);
  });

  const handleShareWhatsApp = (product: Product) => {
    const shareText = `Explore authentic handcrafted ${product.title} made by master craftsperson ${product.artisan_name} from ${product.artisan_district}. Direct price: ₹${product.final_price}. View certified listing on KALAtech!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const copyProductLink = (product: Product) => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Top Banner: Artisan Profile & Middleman Economic Impact */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Artisan Profile Info */}
          <div className="flex items-center gap-4">
            <img
              src={artisan.profile_image_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"}
              alt={artisan.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-['Rozha_One',serif] text-white">
                  {artisan.name}
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-bold">
                  {artisan.category}
                </span>
              </div>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{artisan.district}, {artisan.state}</span>
                <span className="text-stone-600">•</span>
                <span>{artisan.experience_years} Years Heritage</span>
              </p>
              <p className="text-stone-300 text-xs mt-2 max-w-xl line-clamp-2 italic">
                "{artisan.bio}"
              </p>
            </div>
          </div>

          {/* Action Button: Add Craft */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="add-new-craft-btn"
              onClick={onAddNewProduct}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{t.addNewCraft}</span>
            </button>
            <button
              onClick={() => speakText(`${t.myArtisanStudio}. ${products.length} ${t.publishedProducts}.`, language)}
              className="p-3 rounded-2xl bg-stone-800 text-amber-400 border border-stone-700 hover:bg-stone-700 transition-colors shrink-0"
              title={t.audioGuide}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Economic Impact Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-stone-800">
          <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800">
            <span className="text-xs text-stone-400 font-medium block">
              {t.publishedProducts}
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {products.length} <span className="text-xs font-normal text-stone-500">Creations</span>
            </div>
          </div>

          <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800">
            <span className="text-xs text-stone-400 font-medium block">
              {t.buyerEnquiries}
            </span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {enquiries.length} <span className="text-xs font-normal text-stone-500">Direct Inquiries</span>
            </div>
          </div>

          <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800">
            <span className="text-xs text-stone-400 font-medium block">
              Direct Orders (Paid)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {orders.length} <span className="text-xs font-normal text-stone-500">Sample Orders</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-2xl p-4 border border-emerald-500/30">
            <span className="text-xs text-emerald-300 font-bold block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {t.incomeImpactTitle}
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              +₹{totalMiddlemanSavings.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-300/80">
              {t.middlemanComparison}
            </span>
          </div>
        </div>
      </div>

      {/* Main Section: Product Catalog & Inquiries/Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Artisan's Handcrafted Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-stone-900 font-['Rozha_One',serif]">
              {t.publishedProducts} ({products.length})
            </h2>
            <button
              onClick={onAddNewProduct}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addNewCraft}</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-200">
              Loading your studio listings...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-stone-800 mb-1">{t.noProductsYet}</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                {t.startFirstListing}
              </p>
              <button
                onClick={onAddNewProduct}
                className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
              >
                {t.addNewCraft}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const localizedTitle = product.translations[language]?.title || product.title;
                const localizedDesc = product.translations[language]?.description || product.description;

                return (
                  <div
                    key={product.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-amber-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={product.enhanced_image_url || product.original_image_url}
                        alt={product.title}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-bold uppercase">
                            {product.category}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {product.artisan_district}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-stone-900 mt-0.5 line-clamp-1">
                          {localizedTitle}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="font-extrabold text-amber-800 font-mono">
                            ₹{product.final_price?.toLocaleString()}
                          </span>
                          <span className="text-stone-400 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {product.views_count || 0}
                          </span>
                          <span className="text-stone-400 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {product.enquiry_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                      <button
                        onClick={() => setSelectedProvenanceProduct(product)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Generate printable stall provenance tag with QR"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-700" />
                        <span>Stall QR</span>
                      </button>

                      <button
                        onClick={() => onViewProduct(product)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(product)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Share listing on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Direct Buyer Inquiries & Paid Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {/* Tab switch between Enquiries and Orders */}
            <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveRightTab('enquiries')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'enquiries'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Inquiries ({enquiries.length})
              </button>
              <button
                onClick={() => setActiveRightTab('orders')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Orders ({orders.length})
              </button>
            </div>
            <span className="text-[11px] text-stone-500">
              {activeRightTab === 'enquiries' ? 'Direct Leads' : '100% Direct Payouts'}
            </span>
          </div>

          <div className="space-y-3">
            {activeRightTab === 'enquiries' ? (
              <>
                {enquiries.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
                    No buyer messages received yet. Once your products are discovered in the marketplace, direct enquiries will arrive here.
                  </div>
                ) : (
                  enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-stone-900 block">
                            {enq.buyer_name}
                          </span>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {enq.buyer_location}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold">
                          Qty: {enq.quantity}
                        </span>
                      </div>

                      <div className="p-2.5 bg-stone-50 rounded-xl text-xs text-stone-700 border border-stone-100 italic">
                        "{enq.message}"
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-stone-400">
                          Regarding: <strong className="text-stone-700 truncate inline-block max-w-[140px] align-bottom">{enq.product_title}</strong>
                        </span>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${enq.buyer_contact.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${enq.buyer_name}, this is master craftsperson ${artisan.name} regarding your enquiry for "${enq.product_title}".`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Reply WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                {orders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
                    No direct customer orders placed yet.
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-stone-900 block">
                            {ord.buyer_name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {ord.payment_id}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black uppercase">
                          Paid ₹{ord.total_amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-2 bg-emerald-50/50 rounded-xl text-xs text-emerald-950 border border-emerald-100">
                        <div className="font-bold">{ord.quantity}x {ord.product_title}</div>
                        <div className="text-[11px] text-stone-600 mt-0.5 truncate">{ord.buyer_address}</div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                        <span>Status: <b className="text-emerald-700">100% Settled</b></span>
                        <a
                          href={`tel:${ord.buyer_contact}`}
                          className="text-stone-700 hover:text-stone-900 font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-amber-600" />
                          <span>{ord.buyer_contact}</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Global Stall Tag Modal */}
      {selectedProvenanceProduct && (
        <ProvenanceTagModal
          product={selectedProvenanceProduct}
          language={language}
          onClose={() => setSelectedProvenanceProduct(null)}
        />
      )}

    </div>
  );
};
