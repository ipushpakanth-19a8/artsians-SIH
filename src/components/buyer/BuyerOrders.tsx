import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, ShieldCheck, ArrowRight, Phone } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Order } from '../../types';
import { formatINR } from '../../lib/billingService';
import { Link } from 'react-router-dom';

export function BuyerOrders() {
  const { language } = useLanguage();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'created':
        return 1;
      case 'paid':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
          <Package className="w-7 h-7 text-amber-600" />
          {t.orders}
        </h1>
        <p className="text-sm text-stone-600">{t.orderTracking}</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No Orders Placed Yet</h3>
          <p className="text-xs text-stone-500">Support your first Indian master artisan today!</p>
          <Link
            to="/buyer/browse"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
          >
            {t.products} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const step = getStepIndex(ord.status);

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-stone-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-400">#{ord.id}</span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {ord.fair_trade_verified && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Fair Trade Payout
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mt-1">{ord.product_title}</h3>
                    <p className="text-xs text-stone-500">
                      Crafted by <strong className="text-stone-700">{ord.artisan_name}</strong>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xl font-black text-stone-900">{formatINR(ord.total_amount)}</span>
                    <p className="text-xs text-stone-500">
                      {ord.quantity} unit(s) • Paid via {ord.payment_method?.replace(/_/g, ' ') || 'UPI'}
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Tracker */}
                <div className="py-2">
                  <div className="relative flex items-center justify-between">
                    {/* Line connecting steps */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-600 transition-all -z-0"
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />

                    {/* Step 1: Created */}
                    <div className="flex flex-col items-center bg-white px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 1 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        ✓
                      </div>
                      <span className="text-[10px] font-bold text-stone-700 mt-1">{t.orderCreated}</span>
                    </div>

                    {/* Step 2: Paid */}
                    <div className="flex flex-col items-center bg-white px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {step >= 2 ? '✓' : '2'}
                      </div>
                      <span className="text-[10px] font-bold text-stone-700 mt-1">{t.orderPaid}</span>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex flex-col items-center bg-white px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 3 ? 'bg-purple-600 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {step >= 3 ? '✓' : '3'}
                      </div>
                      <span className="text-[10px] font-bold text-stone-700 mt-1">{t.orderShipped}</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center bg-white px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 4 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {step >= 4 ? '✓' : '4'}
                      </div>
                      <span className="text-[10px] font-bold text-stone-700 mt-1">{t.orderDelivered}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row justify-between text-xs text-stone-500 gap-2">
                  <div>
                    <span className="font-semibold text-stone-700">Shipping to: </span>
                    {ord.buyer_address || 'Hyderabad, Telangana'}
                  </div>
                  <div className="flex items-center gap-1 text-amber-700">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Direct Artisan Transit</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
