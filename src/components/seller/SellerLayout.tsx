import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, BarChart3, FileText, ShoppingCart,
  TrendingUp, Headphones, LogOut, Menu, X, Globe, WifiOff, Sparkles, User, Volume2, Home
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { LanguageCode } from '../../types';
import { triggerHaptic, setupHardwareBackButton } from '../../lib/nativeBridge';
import { SellerOnboarding } from './onboarding/SellerOnboarding';
import { SellerAuthModal } from '../auth/SellerAuthModal';

export function SellerLayout() {
  const { language, setLanguage, selectedState, selectedLanguageName, openLanguageModal } = useLanguage();
  const { user, logout, login } = useAuth();
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

  const navSections = [
    {
      title: 'ARTISAN WORKSPACE',
      items: [
        { to: '/seller', icon: LayoutDashboard, label: t.sellerDashboard || 'Artisan Studio', end: true },
        { to: '/seller/handicrafts', icon: Package, label: t.myHandicrafts || 'My Handicrafts' },
        { to: '/seller/add', icon: PlusCircle, label: t.addHandicraft || 'Add Handicraft' },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        { to: '/seller/market-analysis', icon: BarChart3, label: t.marketPriceAnalysis || 'Market Price Analysis' },
        { to: '/seller/create-bill', icon: FileText, label: t.createBill || 'Create Bill' },
        { to: '/seller/orders', icon: ShoppingCart, label: t.orders || 'Orders' },
        { to: '/seller/sales', icon: TrendingUp, label: t.salesHistory || 'Sales History' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { to: '/seller/customer-care', icon: Headphones, label: t.customerCare || 'Customer Care' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const artisanName = user?.name || 'Pavan';
  const artisanSubtitle = user?.craft_type
    ? `${user.craft_type} • ${user.district || selectedState}`
    : `Master Artisan • ${selectedState}`;

  return (
    <div className="min-h-screen bg-[#F7F2E8] flex flex-col font-sans text-[#29221D]">
      {/* Offline Status Warning Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#A8462D] text-[#FFFDF8] px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Offline Mode — Your changes and drafts are saved locally and will sync automatically when reconnected.</span>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#FFFDF8] border-r border-[#D9CEB8] fixed h-full z-30 shadow-xs">
        {/* Sidebar Header: Artisans Studio */}
        <div className="p-4 border-b border-[#D9CEB8]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-[#A8462D]/10 border border-[#A8462D]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L17 10.5H26L19 15.5L21.5 24L14 19L6.5 24L9 15.5L2 10.5H11L14 2Z" fill="#A8462D" />
                <path d="M14 5L16.2 11.8H23.5L17.7 15.7L19.9 22.5L14 18.6L8.1 22.5L10.3 15.7L4.5 11.8H11.8L14 5Z" fill="#C88732" opacity="0.6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#29221D] font-serif text-base tracking-tight">Artisans</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 rounded uppercase">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-[#7A6E65] font-semibold truncate max-w-[170px]">
                {artisanSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Sectioned Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold text-[#7A6E65] tracking-[0.16em] uppercase">
                {section.title}
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs translate-x-0.5'
                        : 'text-[#5C4A3A] hover:bg-[#F7F2E8] hover:text-[#29221D]'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer actions in sidebar: Language, Account, Logout */}
        <div className="p-3 border-t border-[#D9CEB8] bg-[#F7F2E8]/60 space-y-2">
          <div className="flex flex-col gap-1.5 bg-[#FFFDF8] p-2 rounded-xl border border-[#D9CEB8]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#7A6E65] uppercase px-0.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#A8462D]" />
                {t.selectLanguage || 'Language'}
              </span>
              <span className="text-[10px] font-bold text-[#A8462D] bg-[#A8462D]/10 border border-[#A8462D]/20 px-1.5 py-0.5 rounded-md">
                {selectedLanguageName}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === l ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs' : 'text-[#7A6E65] hover:bg-[#F7F2E8]'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
              <button
                onClick={() => openLanguageModal('language')}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-[#A8462D] hover:bg-[#F7F2E8] border border-[#D9CEB8] cursor-pointer transition-colors"
                title="View all 12 Indian Languages"
              >
                + More
              </button>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#5C4A3A] hover:text-[#A8462D] border border-[#D9CEB8] text-xs font-semibold transition-colors cursor-pointer"
            title="Sign In / Switch Account"
          >
            <User className="w-3.5 h-3.5 text-[#A8462D]" />
            <span>{language === 'hi' ? 'खाता बदलें' : 'Account / Sign In'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-xl text-[#7A6E65] hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-[#29221D]/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#FFFDF8] text-[#29221D] flex flex-col shadow-2xl border-r border-[#D9CEB8]">
            <div className="p-4 border-b border-[#D9CEB8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#A8462D]/10 border border-[#A8462D]/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d="M14 2L17 10.5H26L19 15.5L21.5 24L14 19L6.5 24L9 15.5L2 10.5H11L14 2Z" fill="#A8462D" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-[#29221D] font-serif">Artisans</span>
                  <span className="text-[10px] text-[#A8462D] block font-semibold">Studio</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-[#7A6E65] hover:text-[#29221D]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-bold text-[#7A6E65] tracking-[0.16em] uppercase">
                    {section.title}
                  </div>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                            : 'text-[#5C4A3A] hover:bg-[#F7F2E8] hover:text-[#29221D]'
                        }`
                      }
                    >
                      <item.icon className="w-4.5 h-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
            <div className="p-3 border-t border-[#D9CEB8]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-rose-700 text-xs font-semibold"
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
        <header className="lg:hidden sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#D9CEB8] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-[#29221D] rounded-lg hover:bg-[#F7F2E8]">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-7 h-7 rounded-lg bg-[#A8462D]/10 border border-[#A8462D]/20 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L17 10.5H26L19 15.5L21.5 24L14 19L6.5 24L9 15.5L2 10.5H11L14 2Z" fill="#A8462D" />
                </svg>
              </div>
              <span className="font-bold text-sm text-[#29221D] font-serif">Artisans</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step-by-Step App Tour Button on Mobile */}
            <button
              onClick={() => setManualTourOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A8462D] text-[#FFFDF8] text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
              title="Voice step-by-step tutorial on how to use the app"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>{language === 'hi' ? 'गाइड' : 'Tour'}</span>
            </button>

            {/* Quick Language Pills on Mobile */}
            <div className="flex items-center bg-[#F7F2E8] p-0.5 rounded-full border border-[#D9CEB8]">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                    language === l ? 'bg-[#A8462D] text-[#FFFDF8]' : 'text-[#7A6E65] hover:bg-[#E8DFC9]/40'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
              <button
                onClick={() => openLanguageModal('language')}
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-[#A8462D] hover:bg-[#A8462D]/10 cursor-pointer"
                title="All 12 Indian Languages"
              >
                🌐+
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Top Navigation Header */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#D9CEB8] px-8 py-3.5 items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A6E65]">
              Artisan Studio
            </span>
            <span className="text-[#D9CEB8]">•</span>
            <span className="text-xs font-semibold text-[#A8462D]">
              {artisanSubtitle}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dedicated Step-by-Step Voice Assistance Tutorial Button */}
            <button
              onClick={() => setManualTourOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#A8462D] hover:bg-[#C5614A] text-[#FFFDF8] text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Voice step-by-step tutorial on how to use the app"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? '🔊 आवाज़ गाइड' : language === 'te' ? '🔊 వాయిస్ గైడ్' : '🔊 Voice Tour'}</span>
            </button>

            {/* State & Language Indicator Pill */}
            <button
              id="seller-header-state-lang-btn"
              onClick={() => openLanguageModal('state')}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-full bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] hover:border-[#A8462D] text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Change State or Language"
            >
              <span className="text-[#A8462D] font-bold flex items-center gap-1">
                📍 {selectedState}
              </span>
              <span className="text-[#D9CEB8]">•</span>
              <Globe className="w-3.5 h-3.5 text-[#4A7A52]" />
              <span className="text-[#29221D]">{selectedLanguageName}</span>
            </button>

            {/* Quick Language Switcher on Desktop Top Bar */}
            <div className="hidden sm:inline-flex items-center h-9 bg-[#F7F2E8] px-1.5 rounded-full border border-[#D9CEB8] gap-0.5 shadow-2xs">
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
                    className={`h-7 px-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                        : 'text-[#7A6E65] hover:text-[#29221D] hover:bg-[#E8DFC9]/40'
                    }`}
                  >
                    {langItem.label}
                  </button>
                );
              })}
              <button
                onClick={() => openLanguageModal('language')}
                className="h-7 px-2 text-[11px] font-semibold text-[#A8462D] hover:underline cursor-pointer"
                title="All 12 Indian Languages"
              >
                More
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
              className="h-9 inline-flex items-center gap-2 px-3.5 rounded-full bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#29221D] hover:text-[#A8462D] text-xs font-semibold transition-colors border border-[#D9CEB8] hover:border-[#A8462D] cursor-pointer shadow-2xs active:scale-95"
            >
              <span>🛍️ Buyer Market →</span>
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
          className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-t border-[#D9CEB8] px-2 pt-1.5 pb-safe lg:hidden flex items-center justify-around shadow-lg"
          aria-label="Mobile Navigation"
        >
          {/* 1. Home */}
          <NavLink
            to="/seller"
            end
            onClick={() => triggerHaptic('light')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#A8462D] font-bold' : 'text-[#7A6E65] font-medium'
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
                isActive ? 'text-[#A8462D] font-bold' : 'text-[#7A6E65] font-medium'
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
            className="flex flex-col items-center justify-center -mt-5 relative group"
            aria-label="Add New Product"
          >
            <div className="w-13 h-13 rounded-full bg-[#A8462D] text-[#FFFDF8] flex items-center justify-center shadow-lg shadow-[#A8462D]/30 border-4 border-[#FFFDF8] transition-transform active:scale-95 hover:bg-[#C5614A]">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-[#A8462D] mt-0.5">
              {t.addHandicraft ? `+ ${t.addHandicraft.replace(/^\+\s*/, '')}` : (language === 'hi' ? '+ जोड़ें' : language === 'te' ? '+ జోడించు' : '+ Add')}
            </span>
          </NavLink>

          {/* 4. Orders */}
          <NavLink
            to="/seller/orders"
            onClick={() => triggerHaptic('light')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#A8462D] font-bold' : 'text-[#7A6E65] font-medium'
              }`
            }
          >
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.orders || (language === 'hi' ? 'ऑर्डर्स' : language === 'te' ? 'ఆర్డర్లు' : 'Orders')}</span>
          </NavLink>

          {/* 5. Artisan Saathi */}
          <NavLink
            to="/seller/customer-care"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#A8462D] font-bold' : 'text-[#7A6E65] font-medium'
              }`
            }
          >
            <Sparkles className="w-5 h-5 mb-0.5 text-[#C88732]" />
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
