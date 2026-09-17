import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShoppingCart, Search, Globe, LogOut, Package, User, Headphones, Menu, X, ArrowLeft, Home, Mic, Volume2 } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { LanguageCode } from '../../types';
import { triggerHaptic, setupHardwareBackButton } from '../../lib/nativeBridge';
import { BuyerOnboarding } from './onboarding/BuyerOnboarding';
import { BuyerAuthModal } from '../auth/BuyerAuthModal';

export function BuyerLayout() {
  const { language, setLanguage } = useLanguage();
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [manualTourOpen, setManualTourOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Auto-init buyer demo session if visiting /buyer unauthenticated, so onboarding and cart are immediately accessible
  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      login('buyer');
    }
  }, [user, login]);

  const isFirstTimeBuyer = user && user.role === 'buyer' && user.hasCompletedBuyerOnboarding !== true;
  const shouldShowOnboarding = manualTourOpen || isFirstTimeBuyer;

  // Auto-trigger tutorial on login or entry from other portals
  useEffect(() => {
    const shouldOpen =
      sessionStorage.getItem('open_buyer_tutorial') === 'true' ||
      !sessionStorage.getItem('ShilpSetu_seen_buyer_tour') ||
      isFirstTimeBuyer;

    if (shouldOpen) {
      setManualTourOpen(true);
      sessionStorage.setItem('ShilpSetu_seen_buyer_tour', 'true');
      sessionStorage.removeItem('open_buyer_tutorial');
    }
  }, [user, isFirstTimeBuyer]);

  useEffect(() => {
    const cleanup = setupHardwareBackButton(() => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        return true;
      }
      return false;
    });
    return () => cleanup();
  }, [mobileMenuOpen]);

  const updateCounts = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('ShilpSetu_cart') || '[]');
      setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
      const wish = JSON.parse(localStorage.getItem('ShilpSetu_wishlist') || '[]');
      setWishlistCount(wish.length);
    } catch {}
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('storage', updateCounts);
    window.addEventListener('cart-updated', updateCounts);
    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cart-updated', updateCounts);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchToSeller = () => {
    login('seller');
    sessionStorage.setItem('open_seller_tutorial', 'true');
    navigate('/seller');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* First-Time User Voice Onboarding Modal (Automatic, zero clicks required + manual replay) */}
      {shouldShowOnboarding && (
        <BuyerOnboarding onComplete={() => setManualTourOpen(false)} />
      )}

      {/* Top Notification Bar: Fair Trade Promise */}
      <div className="bg-stone-900 text-amber-300 text-[11px] py-1.5 px-4 text-center font-medium">
        🇮🇳 100% Verified Indian Handicrafts • Direct Artisan Support • Fair-Trade Guaranteed
      </div>

      {/* Main Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 text-stone-600 hover:text-stone-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/buyer" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-amber-100 font-black text-sm border border-amber-500/30 shadow-sm">
                SS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-stone-900 font-['Rozha_One',serif] text-lg leading-none block">
                    ShilpSetu
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30 rounded tracking-wide uppercase">
                    ShilpSetu
                  </span>
                </div>
                <span className="text-[10px] text-amber-700 font-bold tracking-wider uppercase">
                  Buyer Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-stone-600">
            <NavLink
              to="/buyer"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#fff7ed] text-[#9c4124] font-bold border border-[#fed7aa]'
                    : 'hover:text-stone-900 hover:bg-stone-100/70'
                }`
              }
            >
              {t.buyerHome}
            </NavLink>
            <NavLink
              to="/buyer/browse"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#fff7ed] text-[#9c4124] font-bold border border-[#fed7aa]'
                    : 'hover:text-stone-900 hover:bg-stone-100/70'
                }`
              }
            >
              {t.products}
            </NavLink>
            <NavLink
              to="/buyer/orders"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#fff7ed] text-[#9c4124] font-bold border border-[#fed7aa]'
                    : 'hover:text-stone-900 hover:bg-stone-100/70'
                }`
              }
            >
              {t.orders}
            </NavLink>
            <NavLink
              to="/buyer/customer-care"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#fff7ed] text-[#9c4124] font-bold border border-[#fed7aa]'
                    : 'hover:text-stone-900 hover:bg-stone-100/70'
                }`
              }
            >
              <Headphones className="w-4 h-4" />
              <span>{t.customerCare}</span>
            </NavLink>
          </nav>

          {/* Actions: Language, Search, Tour, Wishlist, Cart, User, Portal Switch */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="hidden sm:inline-flex items-center h-9 bg-white px-1.5 rounded-xl border border-stone-200 gap-0.5 shadow-2xs">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === l
                      ? 'bg-[#9c4124] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
            </div>

            {/* Voice Search for Crafts */}
            <button
              onClick={() => navigate('/buyer/browse?voice=1')}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#9c4124] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Voice Search for Indian Crafts"
            >
              <Mic className="w-3.5 h-3.5 text-[#9c4124] animate-pulse" />
              <span className="hidden md:inline">{language === 'hi' ? 'आवाज़ खोज' : language === 'te' ? 'వాయిస్ శోధన' : 'Voice Search'}</span>
            </button>

            {/* Voice Tour Trigger */}
            <button
              onClick={() => setManualTourOpen(true)}
              className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Start or Replay Automatic Voice Tour"
            >
              <Headphones className="w-3.5 h-3.5 text-stone-600" />
              <span>Voice Tour</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/buyer/wishlist"
              className="w-9 h-9 relative inline-flex items-center justify-center text-stone-600 hover:text-[#9c4124] hover:bg-[#fff7ed] rounded-xl border border-stone-200 transition-colors shadow-2xs"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/buyer/cart"
              className="w-9 h-9 relative inline-flex items-center justify-center text-stone-600 hover:text-[#9c4124] hover:bg-[#fff7ed] rounded-xl border border-stone-200 transition-colors shadow-2xs"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#9c4124] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / Sign In with Voice Assist */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="h-9 inline-flex items-center gap-1.5 px-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Sign In / Switch Account with Voice Assist"
            >
              <User className="w-3.5 h-3.5 text-[#9c4124]" />
              <span className="hidden sm:inline">{user?.role === 'buyer' && user?.name ? user.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            {/* Switch to Seller Portal with Automatic Voice Tour */}
            <button
              onClick={handleSwitchToSeller}
              className="h-9 hidden md:inline-flex items-center gap-1.5 px-3.5 bg-[#9c4124] hover:bg-[#83341b] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              title="Switch to Artisan Studio with Step-by-Step Voice Guide"
            >
              <Volume2 className="w-3.5 h-3.5 text-white/90" />
              <span>Artisan Mode →</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-9 h-9 inline-flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Exit Buyer Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2">
            <NavLink
              to="/buyer"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-stone-700"
            >
              {t.buyerHome}
            </NavLink>
            <NavLink
              to="/buyer/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-stone-700"
            >
              {t.products}
            </NavLink>
            <NavLink
              to="/buyer/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-stone-700"
            >
              {t.orders}
            </NavLink>
            <NavLink
              to="/buyer/customer-care"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-stone-700"
            >
              {t.customerCare}
            </NavLink>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSwitchToSeller();
                }}
                className="text-xs font-bold text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Go to Seller Portal (Voice Guide) →</span>
              </button>
              <button onClick={handleLogout} className="text-xs font-semibold text-red-600 cursor-pointer">
                {t.logout}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* ================================================== */}
      {/* MOBILE-FIRST BUYER BOTTOM NAVIGATION BAR */}
      {/* ================================================== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 pt-1.5 pb-safe lg:hidden flex items-center justify-around shadow-lg"
        aria-label="Buyer Mobile Navigation"
      >
        {/* 1. Home */}
        <NavLink
          to="/buyer"
          end
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-amber-700 font-bold' : 'text-stone-500 font-medium'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{language === 'hi' ? 'होम' : language === 'te' ? 'హోమ్' : 'Home'}</span>
        </NavLink>

        {/* 2. Browse */}
        <NavLink
          to="/buyer/browse"
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-amber-700 font-bold' : 'text-stone-500 font-medium'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{language === 'hi' ? 'शिल्प खोजें' : language === 'te' ? 'బ్రౌజ్' : 'Browse'}</span>
        </NavLink>

        {/* 3. Wishlist */}
        <NavLink
          to="/buyer/wishlist"
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              isActive ? 'text-amber-700 font-bold' : 'text-stone-500 font-medium'
            }`
          }
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">{language === 'hi' ? 'पसंदीदा' : language === 'te' ? 'కోరికలు' : 'Wishlist'}</span>
        </NavLink>

        {/* 4. Cart */}
        <NavLink
          to="/buyer/cart"
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              isActive ? 'text-amber-700 font-bold' : 'text-stone-500 font-medium'
            }`
          }
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">{language === 'hi' ? 'कार्ट' : language === 'te' ? 'కార్ట్' : 'Cart'}</span>
        </NavLink>

        {/* 5. Orders */}
        <NavLink
          to="/buyer/orders"
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-amber-700 font-bold' : 'text-stone-500 font-medium'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{language === 'hi' ? 'ऑर्डर्स' : language === 'te' ? 'ఆర్డర్లు' : 'Orders'}</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-xs">
              SS
            </div>
            <span className="text-white font-bold font-['Rozha_One',serif]">ShilpSetu</span>
            <span className="text-amber-400 text-[11px] font-semibold">(ShilpSetu)</span>
            <span>— Empowering Indian Artisans, Fair Trade Direct to Buyers</span>
          </div>
          <p>© 2026 ShilpSetu (ShilpSetu). Built with pride for Indian Handicrafts.</p>
        </div>
      </footer>

      {/* Buyer Auth Modal with Voice Assist */}
      {authModalOpen && (
        <BuyerAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab="signin"
        />
      )}
    </div>
  );
}
