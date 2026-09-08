import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, BarChart3, FileText, ShoppingCart, TrendingUp, User, Headphones, LogOut, Menu, X, Globe, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { LanguageCode } from '../../types';

export function SellerLayout() {
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/seller', icon: LayoutDashboard, label: t.sellerDashboard, end: true },
    { to: '/seller/handicrafts', icon: Package, label: t.myHandicrafts },
    { to: '/seller/add', icon: PlusCircle, label: t.addHandicraft },
    { to: '/seller/market-analysis', icon: BarChart3, label: t.marketPriceAnalysis },
    { to: '/seller/create-bill', icon: FileText, label: t.createBill },
    { to: '/seller/orders', icon: ShoppingCart, label: t.orders },
    { to: '/seller/sales', icon: TrendingUp, label: t.salesHistory },
    { to: '/seller/customer-care', icon: Headphones, label: t.customerCare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800 fixed h-full z-30">
        <div className="p-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-amber-100 font-black text-sm border border-amber-500/30 shadow-md">KT</div>
            <div>
              <span className="font-extrabold text-white font-['Rozha_One',serif]">KALAtech</span>
              <p className="text-[10px] text-amber-400 font-semibold">{t.seller}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-stone-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
              <button key={l} onClick={() => setLanguage(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${language === l ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-stone-400 hover:bg-red-500/10 hover:text-red-400 text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-stone-900 text-stone-300 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-sm">KT</div>
                <span className="font-bold text-white">KALAtech</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-stone-400"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 py-3 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400 hover:bg-stone-800'}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-stone-800">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-red-400 text-sm"><LogOut className="w-4 h-4" />{t.logout}</button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-stone-900/95 backdrop-blur border-b border-stone-800 px-4 py-3 flex items-center justify-between text-white">
          <button onClick={() => setSidebarOpen(true)} className="p-1"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-xs">KT</div>
            <span className="font-bold text-sm">{t.seller}</span>
          </div>
          <div className="flex items-center gap-1">
            {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
              <button key={l} onClick={() => setLanguage(l)} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${language === l ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-400'}`}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
