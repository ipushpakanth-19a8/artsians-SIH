import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, ArrowRight, Sparkles, Globe, ChevronRight, Handshake, BarChart3, FileText, UserPlus, LogIn } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { translations } from '../lib/i18n';
import { LanguageCode } from '../types';
import { SellerAuthModal } from './auth/SellerAuthModal';
import { BuyerAuthModal } from './auth/BuyerAuthModal';

export function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [sellerModalTab, setSellerModalTab] = useState<'signin' | 'signup'>('signin');
  const [buyerModalOpen, setBuyerModalOpen] = useState(false);
  const [buyerModalTab, setBuyerModalTab] = useState<'signin' | 'signup'>('signin');

  const handleSellerAction = (tab: 'signin' | 'signup') => {
    if (user && role === 'seller') {
      navigate('/seller');
    } else {
      setSellerModalTab(tab);
      setSellerModalOpen(true);
    }
  };

  const handleBuyerAction = (tab: 'signin' | 'signup') => {
    if (user && role === 'buyer') {
      navigate('/buyer');
    } else {
      setBuyerModalTab(tab);
      setBuyerModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar with Language Selector */}
      <nav className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-amber-100 font-black text-lg border border-amber-500/30 shadow-lg shadow-orange-950/40">
              KT
            </div>
            <div>
              <span className="font-extrabold text-lg text-white font-['Rozha_One',serif]">KALAtech</span>
              <span className="hidden sm:inline ml-2 text-amber-300 text-xs font-semibold">कलाTech</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-stone-800/80 p-1 rounded-xl border border-stone-700/50">
              <Globe className="w-3.5 h-3.5 text-stone-400 ml-1.5" />
              {(['en', 'hi', 'te'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === lang
                      ? 'bg-amber-500 text-stone-900 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
            </div>

            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-800">
                <span className="text-xs text-stone-300 font-medium">
                  {user.name} ({role === 'seller' ? t.seller : t.buyer})
                </span>
                <button
                  onClick={() => navigate(role === 'seller' ? '/seller' : '/buyer')}
                  className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold hover:bg-amber-500/30"
                >
                  Dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d97706\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-semibold">Smart India Hackathon</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight max-w-4xl mx-auto">
            {t.landingHeroTitle}
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
            {t.landingHeroSub}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Handshake, label: t.fairTrade },
              { icon: Globe, label: '3 ' + t.selectLanguage },
              { icon: BarChart3, label: t.marketPriceAnalysis },
              { icon: FileText, label: t.generateBills },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-stone-200 text-xs font-medium border border-white/10"
              >
                <badge.icon className="w-3.5 h-3.5 text-amber-400" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Your Portal Section (STRICTLY SELLER & BUYER ONLY) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">{t.choosePortal}</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* SELLER PORTAL CARD */}
          <div className="relative group rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/70 to-orange-50/40 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6 shadow-xs">
                <Store className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-black text-stone-900 font-['Rozha_One',serif]">{t.seller}</h3>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-bold">Artisan Studio</span>
              </div>
              <p className="text-stone-600 text-sm mb-6 leading-relaxed">{t.sellerDesc}</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  t.manageHandicrafts,
                  t.addProducts,
                  t.compareMarketPrices,
                  t.generateBills,
                  t.manageOrders,
                  t.trackSales,
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-700 text-xs sm:text-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-amber-200/60">
              <button
                onClick={() => handleSellerAction('signin')}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                {t.seller} — {t.signIn}
              </button>
              <button
                onClick={() => handleSellerAction('signup')}
                className="w-full py-2.5 px-6 rounded-xl font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t.createAccount} ({t.signUp})
              </button>
            </div>
          </div>

          {/* BUYER PORTAL CARD */}
          <div className="relative group rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-teal-50/40 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 shadow-xs">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-black text-stone-900 font-['Rozha_One',serif]">{t.buyer}</h3>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-bold">Conscious Marketplace</span>
              </div>
              <p className="text-stone-600 text-sm mb-6 leading-relaxed">{t.buyerDesc}</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  t.discoverHandicrafts,
                  t.searchProducts,
                  t.viewArtisanInfo,
                  t.compareProducts,
                  t.purchaseProducts,
                  t.trackOrders,
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-700 text-xs sm:text-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-emerald-200/60">
              <button
                onClick={() => handleBuyerAction('signin')}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                {t.buyer} — {t.signIn}
              </button>
              <button
                onClick={() => handleBuyerAction('signup')}
                className="w-full py-2.5 px-6 rounded-xl font-bold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t.createAccount} ({t.signUp})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Strictly Seller & Buyer) */}
      <section className="bg-stone-100 border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">{t.howItWorks}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 mb-3">{t.seller} Flow</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{t.howItWorksSellerFlow}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 mb-3">{t.buyer} Flow</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{t.howItWorksBuyerFlow}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 px-4 text-center border-t border-stone-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-sm">
            KT
          </div>
          <span className="font-extrabold text-white font-['Rozha_One',serif]">KALAtech</span>
        </div>
        <p className="text-xs">{t.tagline}</p>
        <p className="text-xs mt-1">{t.poweredBy}</p>
      </footer>

      {/* Auth Modals */}
      {sellerModalOpen && (
        <SellerAuthModal
          isOpen={sellerModalOpen}
          onClose={() => setSellerModalOpen(false)}
          defaultTab={sellerModalTab}
        />
      )}

      {buyerModalOpen && (
        <BuyerAuthModal
          isOpen={buyerModalOpen}
          onClose={() => setBuyerModalOpen(false)}
          defaultTab={buyerModalTab}
        />
      )}
    </div>
  );
}
