import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShoppingCart, Search, Globe, LogOut, Package, User, Headphones, Menu, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { LanguageCode } from '../../types';

export function BuyerLayout() {
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const updateCounts = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('kalatech_cart') || '[]');
      setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
      const wish = JSON.parse(localStorage.getItem('kalatech_wishlist') || '[]');
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

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
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
                    KALAtech
                  </span>
                </div>
                <span className="text-[10px] text-amber-700 font-bold tracking-wider uppercase">
                  Artisan Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-stone-600">
            <NavLink
              to="/buyer"
              end
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-amber-700 font-bold' : 'hover:text-stone-900'}`
              }
            >
              {t.buyerHome}
            </NavLink>
            <NavLink
              to="/buyer/browse"
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-amber-700 font-bold' : 'hover:text-stone-900'}`
              }
            >
              {t.products}
            </NavLink>
            <NavLink
              to="/buyer/orders"
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-amber-700 font-bold' : 'hover:text-stone-900'}`
              }
            >
              {t.orders}
            </NavLink>
            <NavLink
              to="/buyer/customer-care"
              className={({ isActive }) =>
                `transition-colors flex items-center gap-1 ${isActive ? 'text-amber-700 font-bold' : 'hover:text-stone-900'}`
              }
            >
              <Headphones className="w-3.5 h-3.5" />
              {t.customerCare}
            </NavLink>
          </nav>

          {/* Actions: Language, Wishlist, Cart, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200">
              <Globe className="w-3.5 h-3.5 text-stone-500 ml-1 mr-1 hidden sm:inline" />
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    language === l ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
            </div>

            {/* Wishlist */}
            <Link
              to="/buyer/wishlist"
              className="relative p-2 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/buyer/cart"
              className="relative p-2 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Switch to Seller Portal link */}
            <Link
              to="/seller"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-amber-100/70 text-stone-800 rounded-xl text-xs font-bold border border-stone-200 transition-colors"
            >
              Artisan Mode
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
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
              <Link
                to="/seller"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-amber-700"
              >
                Go to Seller Portal →
              </Link>
              <button onClick={handleLogout} className="text-xs font-semibold text-red-600">
                {t.logout}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-xs">
              SS
            </div>
            <span className="text-white font-bold font-['Rozha_One',serif]">ShilpSetu</span>
            <span className="text-amber-400 text-[11px] font-semibold">(KALAtech)</span>
            <span>— Empowering Indian Artisans, Fair Trade Direct to Buyers</span>
          </div>
          <p>© 2026 ShilpSetu (KALAtech). Built with pride for Indian Handicrafts.</p>
        </div>
      </footer>
    </div>
  );
}
