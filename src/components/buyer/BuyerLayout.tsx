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
    <div className="min-h-screen bg-[#F7F2E8] text-[#29221D] flex flex-col font-sans selection:bg-[#A8462D]/20 selection:text-[#A8462D]">
      {/* First-Time User Voice Onboarding Modal (Automatic, zero clicks required + manual replay) */}
      {shouldShowOnboarding && (
        <BuyerOnboarding onComplete={() => setManualTourOpen(false)} />
      )}

      {/* Top Notification Bar: Fair Trade Promise */}
      <div className="bg-[#29221D] text-[#F3E5AB] text-[11px] py-2 px-4 text-center font-medium tracking-wide border-b border-[#3E342B]">
        🇮🇳 100% Verified Indian Handicrafts • Direct Artisan Support • Fair-Trade Guaranteed
      </div>

      {/* Main Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#D9CEB8] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#29221D] hover:bg-[#F7F2E8] rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/buyer" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A8462D] to-[#C88732] flex items-center justify-center text-[#FFFDF8] font-serif font-black text-base border border-[#C88732]/40 shadow-xs group-hover:scale-105 transition-transform">
                A
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[#29221D] font-serif text-lg leading-none block tracking-tight">
                    Artisans
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 rounded tracking-wider uppercase">
                    कारीगर
                  </span>
                </div>
                <span className="text-[10px] text-[#A8462D] font-bold tracking-widest uppercase">
                  Buyer Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-[#6B5E55]">
            <NavLink
              to="/buyer"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#A8462D]/10 text-[#A8462D] font-bold border border-[#A8462D]/25'
                    : 'hover:text-[#29221D] hover:bg-[#F7F2E8]'
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
                    ? 'bg-[#A8462D]/10 text-[#A8462D] font-bold border border-[#A8462D]/25'
                    : 'hover:text-[#29221D] hover:bg-[#F7F2E8]'
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
                    ? 'bg-[#A8462D]/10 text-[#A8462D] font-bold border border-[#A8462D]/25'
                    : 'hover:text-[#29221D] hover:bg-[#F7F2E8]'
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
                    ? 'bg-[#A8462D]/10 text-[#A8462D] font-bold border border-[#A8462D]/25'
                    : 'hover:text-[#29221D] hover:bg-[#F7F2E8]'
                }`
              }
            >
              <Headphones className="w-4 h-4 text-[#A8462D]" />
              <span>{t.customerCare}</span>
            </NavLink>
          </nav>

          {/* Actions: Language, Search, Tour, Wishlist, Cart, User, Portal Switch */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="hidden sm:inline-flex items-center h-9 bg-[#FFFDF8] px-1 rounded-xl border border-[#D9CEB8] gap-0.5 shadow-2xs">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === l
                      ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                      : 'text-[#6B5E55] hover:text-[#29221D] hover:bg-[#F7F2E8]'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
            </div>

            {/* Voice Search for Crafts */}
            <button
              onClick={() => navigate('/buyer/browse?voice=1')}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] text-[#A8462D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Voice Search for Indian Crafts"
            >
              <Mic className="w-3.5 h-3.5 text-[#A8462D] animate-pulse" />
              <span className="hidden md:inline">{language === 'hi' ? 'आवाज़ खोज' : language === 'te' ? 'వాయిస్ శోధన' : 'Voice Search'}</span>
            </button>

            {/* Voice Tour Trigger */}
            <button
              onClick={() => setManualTourOpen(true)}
              className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 rounded-xl bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] text-[#29221D] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Start or Replay Automatic Voice Tour"
            >
              <Headphones className="w-3.5 h-3.5 text-[#A8462D]" />
              <span>Voice Tour</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/buyer/wishlist"
              className="w-9 h-9 relative inline-flex items-center justify-center text-[#29221D] hover:text-[#A8462D] bg-[#FFFDF8] hover:bg-[#F7F2E8] rounded-xl border border-[#D9CEB8] transition-colors shadow-2xs"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A8462D] text-[#FFFDF8] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs font-mono">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/buyer/cart"
              className="w-9 h-9 relative inline-flex items-center justify-center text-[#29221D] hover:text-[#A8462D] bg-[#FFFDF8] hover:bg-[#F7F2E8] rounded-xl border border-[#D9CEB8] transition-colors shadow-2xs"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A8462D] text-[#FFFDF8] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs font-mono">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / Sign In with Voice Assist */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="h-9 inline-flex items-center gap-1.5 px-3 bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#29221D] border border-[#D9CEB8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Sign In / Switch Account with Voice Assist"
            >
              <User className="w-3.5 h-3.5 text-[#A8462D]" />
              <span className="hidden sm:inline">{user?.role === 'buyer' && user?.name ? user.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            {/* Switch to Seller Portal with Automatic Voice Tour */}
            <button
              onClick={handleSwitchToSeller}
              className="h-9 hidden md:inline-flex items-center gap-1.5 px-3.5 bg-[#A8462D] hover:bg-[#8D3823] text-[#FFFDF8] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              title="Switch to Artisan Studio with Step-by-Step Voice Guide"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#FFFDF8]" />
              <span>Artisan Mode →</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-9 h-9 inline-flex items-center justify-center text-[#8C827A] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Exit Buyer Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D9CEB8] bg-[#FFFDF8] px-4 py-3 space-y-2 animate-fadeIn">
            <NavLink
              to="/buyer"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#29221D]"
            >
              {t.buyerHome}
            </NavLink>
            <NavLink
              to="/buyer/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#29221D]"
            >
              {t.products}
            </NavLink>
            <NavLink
              to="/buyer/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#29221D]"
            >
              {t.orders}
            </NavLink>
            <NavLink
              to="/buyer/customer-care"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#29221D]"
            >
              {t.customerCare}
            </NavLink>
            <div className="pt-2 border-t border-[#D9CEB8] flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSwitchToSeller();
                }}
                className="text-xs font-bold text-[#A8462D] flex items-center gap-1 cursor-pointer"
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
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-t border-[#D9CEB8] px-2 pt-1.5 pb-safe lg:hidden flex items-center justify-around shadow-lg"
        aria-label="Buyer Mobile Navigation"
      >
        {/* 1. Home */}
        <NavLink
          to="/buyer"
          end
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-[#A8462D] font-bold' : 'text-[#6B5E55] font-medium'
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
              isActive ? 'text-[#A8462D] font-bold' : 'text-[#6B5E55] font-medium'
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
              isActive ? 'text-[#A8462D] font-bold' : 'text-[#6B5E55] font-medium'
            }`
          }
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#A8462D] text-white text-[8px] font-bold rounded-full flex items-center justify-center font-mono">
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
              isActive ? 'text-[#A8462D] font-bold' : 'text-[#6B5E55] font-medium'
            }`
          }
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#A8462D] text-white text-[8px] font-bold rounded-full flex items-center justify-center font-mono">
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
              isActive ? 'text-[#A8462D] font-bold' : 'text-[#6B5E55] font-medium'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{language === 'hi' ? 'ऑर्डर्स' : language === 'te' ? 'ఆర్డర్లు' : 'Orders'}</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <footer className="bg-[#29221D] text-[#D9CEB8] py-12 border-t border-[#3E342B] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A8462D] to-[#C88732] flex items-center justify-center text-white font-serif font-bold text-xs shadow-xs">
              SS
            </div>
            <span className="text-white font-bold font-serif text-sm">ShilpSetu</span>
            <span className="text-[#C88732] text-[11px] font-semibold">(ShilpSetu)</span>
            <span className="text-[#A49A90]">— Empowering Indian Artisans, Fair Trade Direct to Buyers</span>
          </div>
          <p className="text-[#8C827A]">© 2026 ShilpSetu (ShilpSetu). Built with pride for Indian Handicrafts.</p>
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
