import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, ShoppingCart, TrendingUp, FileText, Clock, PlusCircle, BarChart3, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';

export function SellerDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/artisans/art-01/dashboard')
      .then(r => r.json())
      .then(d => { setDashData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Package, label: t.totalProducts, value: dashData?.productsCount || 0, color: 'bg-amber-100 text-amber-700' },
    { icon: CheckCircle, label: t.activeProducts, value: dashData?.publishedCount || 0, color: 'bg-emerald-100 text-emerald-700' },
    { icon: ShoppingCart, label: t.orders, value: dashData?.ordersCount || 0, color: 'bg-blue-100 text-blue-700' },
    { icon: TrendingUp, label: t.totalSales, value: formatINR(dashData?.totalOrderRevenue || 0), color: 'bg-purple-100 text-purple-700' },
    { icon: Clock, label: t.pendingOrders, value: dashData?.ordersCount ? dashData.ordersCount - (dashData.paidOrdersCount || 0) : 0, color: 'bg-orange-100 text-orange-700' },
    { icon: FileText, label: t.billsGenerated, value: 0, color: 'bg-indigo-100 text-indigo-700' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-stone-300 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-stone-900">{t.sellerDashboard}</h1>
        <p className="text-stone-500 text-sm mt-1">{t.tagline}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-500 font-medium">{stat.label}</p>
            <p className="text-lg font-extrabold text-stone-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-stone-900 mb-4">{t.quickActions}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: PlusCircle, label: t.addHandicraft, path: '/seller/add', gradient: 'from-amber-500 to-orange-600' },
            { icon: FileText, label: t.createBill, path: '/seller/create-bill', gradient: 'from-emerald-500 to-teal-600' },
            { icon: BarChart3, label: t.marketPriceAnalysis, path: '/seller/market-analysis', gradient: 'from-blue-500 to-indigo-600' },
            { icon: ShoppingCart, label: t.orders, path: '/seller/orders', gradient: 'from-purple-500 to-violet-600' },
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)}
              className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${action.gradient} text-white font-bold shadow-md hover:opacity-90 transition-all active:scale-[0.98]`}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm">{action.label}</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-bold text-stone-900">{t.recentOrders}</h2>
        </div>
        <div className="overflow-x-auto">
          {dashData?.orders && dashData.orders.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-stone-500 text-xs border-b border-stone-100">
                  <th className="px-4 py-3 font-semibold">{t.productName}</th>
                  <th className="px-4 py-3 font-semibold">{t.buyerName}</th>
                  <th className="px-4 py-3 font-semibold">{t.quantity}</th>
                  <th className="px-4 py-3 font-semibold">{t.totalAmount}</th>
                  <th className="px-4 py-3 font-semibold">{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {dashData.orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-stone-900 max-w-[200px] truncate">{order.product_title}</td>
                    <td className="px-4 py-3 text-stone-600">{order.buyer_name}</td>
                    <td className="px-4 py-3 text-stone-600">{order.quantity}</td>
                    <td className="px-4 py-3 font-bold text-stone-900">{formatINR(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-stone-400">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t.noResults}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
