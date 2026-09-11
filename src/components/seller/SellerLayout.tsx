import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, BarChart3, FileText, ShoppingCart,
  TrendingUp, Headphones, LogOut, Menu, X, Globe, WifiOff, Wifi, Sparkles, Home, User
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { LanguageCode } from '../../types';
import { useTutorial } from '../tutorial/TutorialContext';
import { triggerHaptic, setupHardwareBackButton } from '../../lib/nativeBridge';

export function SellerLayout() {
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const { startJourney, journeyPoints, currentLevel } = useTutorial();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    { to: '/seller', icon: LayoutDashboard, label: language === 'hi' ? 'डैशबोर्ड' : language === 'te' ? 'డాష్‌బోర్డ్' : 'Dashboard', end: true },
    { to: '/seller/handicrafts', icon: Package, label: language === 'hi' ? 'मेरे उत्पाद' : language === 'te' ? 'నా ఉత్పత్తులు' : 'My Products' },
    { to: '/seller/add', icon: PlusCircle, label: language === 'hi' ? '+ नया उत्पाद जोड़ें' : language === 'te' ? '+ కొత్త ఉత్పత్తి' : '+ Add Product' },
    { to: '/seller/market-analysis', icon: BarChart3, label: language === 'hi' ? 'उचित मूल्य सहायक' : language === 'te' ? 'సరసమైన ధర కాలిక్యులేటర్' : 'Fair Price Assistant' },
    { to: '/seller/create-bill', icon: FileText, label: language === 'hi' ? 'बिल बनाएं' : language === 'te' ? 'బిల్లు చేయండి' : 'Create Bill' },
    { to: '/seller/orders', icon: ShoppingCart, label: language === 'hi' ? 'ऑर्डर्स' : language === 'te' ? 'ఆర్డర్లు' : 'Orders' },
    { to: '/seller/sales', icon: TrendingUp, label: language === 'hi' ? 'मेरी कमाई' : language === 'te' ? 'నా ఆదాయం' : 'My Earnings' },
    { to: '/seller/customer-care', icon: Sparkles, label: language === 'hi' ? 'कला साथी (AI)' : language === 'te' ? 'కళా సాథీ (AI)' : 'Artisan Saathi (AI)' },
  ];

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
                  KALAtech
                </span>
              </div>
              <p className="text-[11px] text-[#9c4124] font-bold">
                {language === 'hi' ? 'कारीगर डिजिटल सहायक' : language === 'te' ? 'కళాకారుల డిజిటల్ సహాయకుడు' : 'Artisan Business Assistant'}
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
          <div className="flex items-center justify-between gap-1 mb-3 bg-white p-1 rounded-xl border border-[#eadfd4]">
            <span className="text-[10px] font-extrabold text-stone-500 uppercase px-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#9c4124]" />
              Lang
            </span>
            <div className="flex items-center gap-1">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === l ? 'bg-[#9c4124] text-white shadow-xs' : 'text-stone-600 hover:bg-[#f5efeb]'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
            </div>
          </div>

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
                  <span className="text-[10px] text-[#9c4124] block font-semibold">KALAtech Assistant</span>
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
            {/* Artisan Journey Pill on Mobile */}
            <button
              onClick={startJourney}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold cursor-pointer shadow-2xs"
              title="Artisan Journey"
            >
              <span>🌱</span>
              <span className="font-mono text-[10px] bg-amber-200/70 px-1.5 py-0.5 rounded font-black">L{currentLevel}</span>
            </button>

            {/* Quick Language Pills on Mobile */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#eadfd4]">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    language === l ? 'bg-[#9c4124] text-white' : 'text-stone-600'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
                </button>
              ))}
            </div>
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
            <span className="text-[10px]">{language === 'hi' ? 'होम' : language === 'te' ? 'హోమ్' : 'Home'}</span>
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
            <span className="text-[10px]">{language === 'hi' ? 'उत्पाद' : language === 'te' ? 'ఉత్పత్తులు' : 'Products'}</span>
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
              {language === 'hi' ? '+ जोड़ें' : language === 'te' ? '+ జోడించు' : '+ Add'}
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
            <span className="text-[10px]">{language === 'hi' ? 'ऑर्डर्स' : language === 'te' ? 'ఆర్డర్లు' : 'Orders'}</span>
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
            <span className="text-[10px]">{language === 'hi' ? 'साथी AI' : language === 'te' ? 'సాథీ AI' : 'Saathi'}</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
