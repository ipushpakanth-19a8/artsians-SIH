import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  SlidersHorizontal,
  BarChart3,
  Sparkles,
  FileDown,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminSellers } from './components/AdminSellers';
import { AdminBuyers } from './components/AdminBuyers';
import { AdminProducts } from './components/AdminProducts';
import { AdminMarketPrices } from './components/AdminMarketPrices';
import { AdminBills } from './components/AdminBills';
import { AdminOrders } from './components/AdminOrders';
import { AdminAnalytics } from './components/AdminAnalytics';
import { AdminCustomerCare } from './components/AdminCustomerCare';
import { AdminReports } from './components/AdminReports';
import { AdminSettings } from './components/AdminSettings';

export function AdminApp() {
  const { isAuthenticated, adminUser, logoutAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If unauthenticated, show dedicated Admin Sign In
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sellers', label: 'Sellers', icon: Users },
    { id: 'buyers', label: 'Buyers', icon: Users },
    { id: 'handicrafts', label: 'Handicrafts', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'bills', label: 'Bills', icon: FileText },
    { id: 'market-prices', label: 'Market Prices', icon: SlidersHorizontal },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customer-care', label: 'Customer Care', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileDown },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-red-950/50 border border-red-500/30">
            AD
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white font-['Rozha_One',serif]">KALAtech</span>
              <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[9px] font-black uppercase">ADMIN</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider">Governance Portal</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === item.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin User Footer & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-xs font-bold text-white line-clamp-1">{adminUser?.name || 'Administrator'}</p>
            <p className="text-[10px] font-mono text-slate-500 line-clamp-1">{adminUser?.email}</p>
          </div>

          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-red-950 hover:text-red-300 text-slate-400 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col p-4 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xs">AD</div>
                <span className="font-bold text-white font-['Rozha_One',serif]">KALAtech Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${
                    activeTab === item.id ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <button
              onClick={logoutAdmin}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-red-950 text-red-300 rounded-xl text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-800 text-slate-300 rounded-xl hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Platform</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-xs font-bold text-white capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Backend Connected • Port 3000 / 5174
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center">
                A
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-300">
                {adminUser?.name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'sellers' && <AdminSellers />}
          {activeTab === 'buyers' && <AdminBuyers />}
          {activeTab === 'handicrafts' && <AdminProducts />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'bills' && <AdminBills />}
          {activeTab === 'market-prices' && <AdminMarketPrices />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'customer-care' && <AdminCustomerCare />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}
