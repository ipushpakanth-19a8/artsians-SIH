import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, Shield, ArrowRight, Sparkles, Globe, ChevronRight, Handshake, BarChart3, FileText, Truck } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { translations } from '../lib/i18n';
import { LanguageCode } from '../types';

export function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const handlePortalSelect = (role: 'seller' | 'buyer' | 'admin') => {
    login(role);
    navigate(`/${role}`);
  };

  const portals = [
    {
      role: 'seller' as const,
      icon: Store,
      title: t.seller,
      desc: t.sellerDesc,
      features: [t.manageHandicrafts, t.addProducts, t.compareMarketPrices, t.generateBills, t.manageOrders, t.trackSales],
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    {
      role: 'buyer' as const,
      icon: ShoppingBag,
      title: t.buyer,
      desc: t.buyerDesc,
      features: [t.discoverHandicrafts, t.searchProducts, t.viewArtisanInfo, t.compareProducts, t.purchaseProducts, t.trackOrders],
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      role: 'admin' as const,
      icon: Shield,
      title: t.admin,
      desc: t.adminDesc,
      features: [t.manageUsers, t.manageSellers, t.manageProductsAdmin, t.monitorOrders, t.monitorActivity, t.viewAnalytics],
      gradient: 'from-indigo-500 to-purple-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-700',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar with Language Selector */}
      <nav className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur border-b border-stone-800">
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
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-400" />
            {(['en', 'hi', 'te'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === lang
                    ? 'bg-amber-500 text-stone-900'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'తె'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d97706\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
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
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-stone-200 text-xs font-medium border border-white/10">
                <badge.icon className="w-3.5 h-3.5 text-amber-400" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Your Portal Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">{t.choosePortal}</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {portals.map((portal) => (
            <div
              key={portal.role}
              className={`relative group rounded-2xl border ${portal.border} ${portal.bg} p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}
            >
              <div className={`w-14 h-14 rounded-2xl ${portal.iconBg} flex items-center justify-center mb-5`}>
                <portal.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 mb-2">{portal.title}</h3>
              <p className="text-stone-600 text-sm mb-5 leading-relaxed">{portal.desc}</p>
              <ul className="space-y-2 mb-6 flex-grow">
                {portal.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-700 text-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePortalSelect(portal.role)}
                className={`w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r ${portal.gradient} hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]`}
              >
                {t.enterPortal}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-stone-100 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">{t.howItWorks}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Store, title: t.seller, flow: t.howItWorksSellerFlow, color: 'amber' },
              { icon: ShoppingBag, title: t.buyer, flow: t.howItWorksBuyerFlow, color: 'emerald' },
              { icon: Shield, title: t.admin, flow: t.howItWorksAdminFlow, color: 'indigo' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 text-${item.color}-700 flex items-center justify-center mb-4`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 mb-3">{item.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{item.flow}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 px-4 text-center border-t border-stone-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-sm">KT</div>
          <span className="font-extrabold text-white font-['Rozha_One',serif]">KALAtech</span>
        </div>
        <p className="text-xs">{t.tagline}</p>
        <p className="text-xs mt-1">{t.poweredBy}</p>
      </footer>
    </div>
  );
}
