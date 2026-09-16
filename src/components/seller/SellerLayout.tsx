import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, BarChart3, FileText, ShoppingCart,
  TrendingUp, Headphones, LogOut, Menu, X, Globe, WifiOff, Wifi, Sparkles, Home, User, Volume2
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { LanguageCode } from '../../types';
import { useTutorial } from '../tutorial/TutorialContext';
import { triggerHaptic, setupHardwareBackButton } from '../../lib/nativeBridge';
import { SellerOnboarding } from './onboarding/SellerOnboarding';
import { SellerAuthModal } from '../auth/SellerAuthModal';

export function SellerLayout() {
  const { language, setLanguage, selectedState, selectedLanguageName, openLanguageModal } = useLanguage();
  const { user, logout, login } = useAuth();
  const { startJourney, journeyPoints, currentLevel } = useTutorial();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualTourOpen, setManualTourOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check if seller has not completed onboarding or needs automatic tutorial on entry
  const isFirstTimeSeller = user && user.role === 'seller' && user.hasCompletedSellerOnboarding !== true;
  const showSellerTour = manualTourOpen || isFirstTimeSeller;

  // Auto-trigger tutorial on login or entry from buyer portal
  useEffect(() => {
    const shouldOpen =
      sessionStorage.getItem('open_seller_tutorial') === 'true' ||
      !sessionStorage.getItem('ShilpSetu_seen_seller_tour') ||
      isFirstTimeSeller;

    if (shouldOpen) {
      setManualTourOpen(true);
      sessionStorage.setItem('ShilpSetu_seen_seller_tour', 'true');
      sessionStorage.removeItem('open_seller_tutorial');
    }
  }, [user, isFirstTimeSeller]);

  // Ensure seller session if user is not set or has different role
  useEffect(() => {
    if (!user || user.role !== 'seller') {
      login('seller');
    }
  }, [user, login]);

  useEffect(() => {
    const cleanup = setupHardwareBackButton(() => {
      if (sidebarOpen) {
        setSidebarOpen(false);
        return true;
      }
      return false;
    });
    return () => cleanup();
  }, [sidebarOpen]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { to: '/seller', icon: LayoutDashboard, label: t.sellerDashboard || 'Dashboard', end: true },
    { to: '/seller/handicrafts', icon: Package, label: t.myHandicrafts || 'My Products' },
    { to: '/seller/add', icon: PlusCircle, label: `+ ${t.addHandicraft || 'Add Product'}` },
    { to: '/seller/market-analysis', icon: BarChart3, label: t.marketPriceAnalysis || 'Fair Price Assistant' },
    { to: '/seller/create-bill', icon: FileText, label: t.createBill || 'Create Bill' },
    { to: '/seller/orders', icon: ShoppingCart, label: t.orders || 'Orders' },
    { to: '/seller/sales', icon: TrendingUp, label: t.salesHistory || 'My Earnings' },
    { to: '/seller/customer-care', icon: Sparkles, label: t.customerCare ? `${t.customerCare} (AI)` : 'Artisan Saathi (AI)' },
  ];

  const artisanSubtitle =
    language === 'hi'
      ? 'कारीगर डिजिटल सहायक'
      : language === 'te'
      ? 'కళాకారుల డిజిటల్ సహాయకుడు'
      : language === 'ta'
      ? 'கைவினைஞர் டிஜிட்டல் உதவியாளர்'
      : language === 'kn'
      ? 'ಕರಕುಶಲಕರ್ಮಿ ಡಿಜಿಟಲ್ ಸಹಾಯಕ'
      : language === 'ml'
      ? 'കരകൗശല ഡിജിറ്റൽ സഹായി'
      : language === 'mr'
      ? 'कारागीर डिजिटल सहाय्यक'
      : language === 'gu'
      ? 'કારીગર ડિજિટલ સહાયક'
      : language === 'bn'
      ? 'কারিগর ডিজিটাল সহকারী'
      : language === 'or'
      ? 'କାରିଗର ଡିଜିଟାଲ୍ ସହାୟକ'
      : language === 'pa'
      ? 'ਕਾਰੀਗਰ ਡਿਜੀਟਲ ਸਹਾਇਕ'
      : language === 'as'
      ? 'কাৰিকৰ ডিজিটেল সহায়ক'
      : 'Artisan Business Assistant';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col lg:flex-row text-[#262220] font-sans">
      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Offline Mode — Your changes and drafts are saved locally and will sync automatically when reconnected.</span>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#eadfd4] fixed h-full z-30 shadow-xs">
        <div className="p-4 border-b border-[#eadfd4]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-[#9c4124] flex items-center justify-center text-white font-black text-sm shadow-xs">
              SS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-[#262220] font-['Rozha_One',serif] text-base">ShilpSetu</span>
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-[#fdf2e9] text-[#9c4124] border border-[#f8d7c2] rounded uppercase">
                  ShilpSetu
                </span>
              </div>
              <p className="text-[11px] text-[#9c4124] font-bold truncate max-w-[170px]">
                {artisanSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#9c4124] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-[#f5efeb] hover:text-[#262220]'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Artisan Journey Quick Banner */}
        <div className="px-3 py-2 border-t border-[#eadfd4]">
          <button
            onClick={startJourney}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 text-left flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🌱</span>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                  {language === 'hi' ? 'शिल्प यात्रा' : language === 'te' ? 'శిల్ప యాత్ర' : 'Artisan Journey'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {language === 'hi' ? `लेवल ${currentLevel}/8` : language === 'te' ? `లెవల్ ${currentLevel}/8` : `Level ${currentLevel}/8`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-amber-200/60 px-2 py-0.5 rounded-lg text-[11px] font-black text-amber-900">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{journeyPoints}</span>
            </div>
          </button>
        </div>

        {/* Footer actions in sidebar */}
        <div className="p-3 border-t border-[#eadfd4] bg-[#faf7f2]/60">
          <div className="flex flex-col gap-1.5 mb-3 bg-white p-2 rounded-xl border border-[#eadfd4]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-stone-500 uppercase px-0.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#9c4124]" />
                {t.selectLanguage || 'Language'}
              </span>
              <span className="text-[10px] font-black text-[#9c4124] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                {selectedLanguageName}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === l ? 'bg-[#9c4124] text-white shadow-xs' : 'text-stone-600 hover:bg-[#f5efeb]'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
              <button
                onClick={() => openLanguageModal('language')}
                className="px-2 py-1 rounded-lg text-xs font-bold text-[#9c4124] hover:bg-[#fdf2e9] border border-[#f8d7c2] cursor-pointer transition-colors"
                title="View all 12 Indian Languages"
              >
                + More
              </button>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-2 mb-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#9c4124] border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
            title="Sign In / Switch Account with Voice Assist"
          >
            <User className="w-4 h-4 text-[#9c4124]" />
            <span>{language === 'hi' ? 'खाता बदलें (लॉगिन)' : 'Switch / Sign In'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white text-[#262220] flex flex-col shadow-2xl border-r border-[#eadfd4]">
            <div className="p-4 border-b border-[#eadfd4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#9c4124] flex items-center justify-center text-white font-black text-sm">
                  SS
                </div>
                <div>
                  <span className="font-bold text-[#262220] font-['Rozha_One',serif]">ShilpSetu</span>
                  <span className="text-[10px] text-[#9c4124] block font-semibold">ShilpSetu Assistant</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-stone-500 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive ? 'bg-[#9c4124] text-white shadow-xs' : 'text-stone-700 hover:bg-[#f5efeb]'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-[#eadfd4]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-red-600 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Navigation Bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#eadfd4] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-7 h-7 rounded-xl bg-[#9c4124] flex items-center justify-center text-white font-black text-xs">
                SS
              </div>
              <span className="font-extrabold text-sm text-[#262220] font-['Rozha_One',serif]">ShilpSetu</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step-by-Step App Tour Button on Mobile */}
            <button
              onClick={() => setManualTourOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[11px] font-black cursor-pointer shadow-xs"
              title="Voice step-by-step tutorial on how to use the app"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>{language === 'hi' ? 'गाइड' : 'Tour'}</span>
            </button>

            {/* Quick Language Pills on Mobile with All Indian Languages trigger */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#eadfd4]">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    language === l ? 'bg-[#9c4124] text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
              <button
                onClick={() => openLanguageModal('language')}
                className="px-1.5 py-0.5 rounded text-[10px] font-black text-[#9c4124] hover:bg-amber-50 cursor-pointer"
                title="All 12 Indian Languages"
              >
                🌐+
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Top Navigation Header */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#eadfd4] px-8 py-3.5 items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">
              Artisan Studio
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs font-bold text-[#9c4124]">
              {artisanSubtitle}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dedicated Step-by-Step Voice Assistance Tutorial Button */}
            <button
              onClick={() => setManualTourOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
              title="Voice step-by-step tutorial on how to use the app"
            >
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>{language === 'hi' ? '🔊 आवाज़ गाइड' : language === 'te' ? '🔊 వాయిస్ గైడ్' : '🔊 Voice Tour'}</span>
            </button>

            {/* Artisan Journey Voice Tutorial Launch Button */}
            <button
              onClick={startJourney}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 text-amber-950 text-xs font-black transition-all shadow-xs cursor-pointer"
              title="Launch Artisan Saathi Voice Guided Journey"
            >
              <span className="text-sm animate-bounce">🌱</span>
              <span>{language === 'hi' ? 'शिल्प यात्रा' : language === 'te' ? 'శిల్ప యాత్ర' : 'Artisan Journey'}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-300/80 text-amber-950 text-[10px] font-mono font-black">
                L{currentLevel}/9
              </span>
            </button>

            {/* State & Language Indicator Pill (Exact match with Landing Portal) */}
            <button
              id="seller-header-state-lang-btn"
              onClick={() => openLanguageModal('state')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-[#eadfd4] hover:border-[#9c4124] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Change State or Language"
            >
              <span className="text-[#9c4124] font-extrabold flex items-center gap-1">
                📍 {selectedState}
              </span>
              <span className="text-stone-300">•</span>
              <Globe className="w-3.5 h-3.5 text-stone-600" />
              <span className="text-stone-700">{selectedLanguageName}</span>
            </button>

            {/* Quick Language Switcher on Desktop Top Bar */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-[#eadfd4]">
              {(
                [
                  { code: 'en' as const, label: 'EN' },
                  { code: 'hi' as const, label: 'हिं' },
                  { code: 'te' as const, label: 'తె' },
                ]
              ).map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    onClick={() => setLanguage(langItem.code)}
                    className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#9c4124] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-[#f5efeb]'
                    }`}
                  >
                    {langItem.label}
                  </button>
                );
              })}
              <button
                onClick={() => openLanguageModal('language')}
                className="px-1.5 py-0.5 text-[10px] font-bold text-[#9c4124] hover:underline cursor-pointer"
                title="All 12 Indian Languages"
              >
                More...
              </button>
            </div>

            {/* Switch to Buyer Marketplace */}
            <button
              onClick={() => {
                login('buyer');
                sessionStorage.setItem('open_buyer_tutorial', 'true');
                sessionStorage.removeItem('ShilpSetu_seen_buyer_tour');
                navigate('/buyer');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 text-xs font-bold transition-colors border border-[#eadfd4] cursor-pointer shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>🛍️ Buyer Marketplace →</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* ================================================== */}
        {/* MOBILE-FIRST BOTTOM NAVIGATION BAR (Prominent + Add) */}
        {/* ================================================== */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#eadfd4] px-2 pt-1.5 pb-safe lg:hidden flex items-center justify-around shadow-lg"
          aria-label="Mobile Navigation"
        >
          {/* 1. Home */}
          <NavLink
            to="/seller"
            end
            onClick={() => triggerHaptic('light')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#9c4124] font-bold' : 'text-stone-500 font-medium'
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.home || (language === 'hi' ? 'होम' : language === 'te' ? 'హోమ్' : 'Home')}</span>
          </NavLink>

          {/* 2. Products */}
          <NavLink
            to="/seller/handicrafts"
            onClick={() => triggerHaptic('light')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#9c4124] font-bold' : 'text-stone-500 font-medium'
              }`
            }
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.myHandicrafts || (language === 'hi' ? 'उत्पाद' : language === 'te' ? 'ఉత్పత్తులు' : 'Products')}</span>
          </NavLink>

          {/* 3. Elevated + ADD Button */}
          <NavLink
            to="/seller/add"
            onClick={() => triggerHaptic('medium')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center -mt-5 relative group`
            }
            aria-label="Add New Product"
          >
            <div className="w-13 h-13 rounded-full bg-[#9c4124] text-white flex items-center justify-center shadow-lg shadow-[#9c4124]/30 border-4 border-white transition-transform active:scale-95 group-hover:bg-[#83341b]">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold text-[#9c4124] mt-0.5">
              {t.addHandicraft ? `+ ${t.addHandicraft.replace(/^\+\s*/, '')}` : (language === 'hi' ? '+ जोड़ें' : language === 'te' ? '+ జోడించు' : '+ Add')}
            </span>
          </NavLink>

          {/* 4. Orders */}
          <NavLink
            to="/seller/orders"
            onClick={() => triggerHaptic('light')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#9c4124] font-bold' : 'text-stone-500 font-medium'
              }`
            }
          >
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.orders || (language === 'hi' ? 'ऑर्डर्स' : language === 'te' ? 'ఆర్డర్లు' : 'Orders')}</span>
          </NavLink>

          {/* 5. Artisan Saathi (AI Business Mentor) */}
          <NavLink
            to="/seller/customer-care"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#9c4124] font-bold' : 'text-stone-500 font-medium'
              }`
            }
          >
            <Sparkles className="w-5 h-5 mb-0.5 text-amber-600" />
            <span className="text-[10px]">{language === 'hi' ? 'साथी AI' : language === 'te' ? 'సాథీ AI' : 'Saathi AI'}</span>
          </NavLink>
        </nav>
      </div>

      {/* Automatic Voice-Guided First-Time Seller Onboarding Tutorial */}
      {showSellerTour && (
        <SellerOnboarding onComplete={() => setManualTourOpen(false)} />
      )}

      {/* Seller Auth Modal with Voice Assist */}
      {authModalOpen && (
        <SellerAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab="signin"
        />
      )}
    </div>
  );
}
