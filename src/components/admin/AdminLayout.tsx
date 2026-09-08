import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Users, Package, ShoppingCart, FileText, BarChart3, LogOut, Menu, X, Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { LanguageCode } from '../../types';

export function AdminLayout() {
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t.adminDashboard, end: true },
    { to: '/admin/sellers', icon: Users, label: t.sellers },
    { to: '/admin/products', icon: Package, label: t.products },
    { to: '/admin/orders', icon: ShoppingCart, label: t.orders },
    { to: '/admin/bills', icon: FileText, label: t.bills },
    { to: '/admin/analytics', icon: BarChart3, label: t.analytics },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-stone-950 text-stone-300 border-r border-stone-800 fixed h-full z-30">
        <div className="p-4 border-b border-stone-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-700 flex items-center justify-center text-white font-black text-sm border border-red-500/30 shadow-md">
              KT
            </div>
            <div>
              <span className="font-extrabold text-white font-['Rozha_One',serif]">KALAtech</span>
              <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">{t.adminPortal}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-red-600/20 text-red-300 border border-red-500/30 font-extrabold'
                    : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-stone-800 space-y-3">
          <div className="flex items-center gap-1.5 justify-center">
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2 py-1 rounded text-[10px] font-bold ${
                  language === l ? 'bg-red-600 text-white' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-stone-400 hover:bg-red-500/10 hover:text-red-400 text-xs font-semibold transition-colors justify-center"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-stone-950 text-stone-300 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">KT</div>
                <span className="font-bold text-white">KALAtech Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-stone-400"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 py-3 overflow-y-auto space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-xs font-bold ${
                      isActive ? 'bg-red-600/20 text-red-300' : 'text-stone-400 hover:bg-stone-900'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-stone-800">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-red-400 text-xs font-bold">
                <LogOut className="w-4 h-4" /> {t.logout}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-stone-950 px-4 py-3 flex items-center justify-between text-white border-b border-stone-800">
          <button onClick={() => setSidebarOpen(true)} className="p-1"><Menu className="w-5 h-5" /></button>
          <span className="font-bold text-sm text-red-400">{t.adminPortal}</span>
          <div className="flex items-center gap-1">
            {(['en', 'hi', 'te'] as LanguageCode[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${language === l ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-400'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
