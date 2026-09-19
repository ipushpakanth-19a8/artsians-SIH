import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, ShieldCheck, ArrowRight, Phone, Award, ExternalLink } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#29221D] font-serif flex items-center gap-2.5">
          <Package className="w-7 h-7 text-[#A8462D]" />
          {t.orders}
        </h1>
        <p className="text-sm text-[#6B5E55]">{t.orderTracking}</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#6B5E55]">
          <div className="w-8 h-8 border-2 border-[#D9CEB8] border-t-[#A8462D] rounded-full animate-spin mx-auto mb-2" />
          <span>Loading your orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center artisan-card bg-[#FFFDF8] rounded-3xl border border-[#D9CEB8] space-y-3">
          <Package className="w-12 h-12 text-[#8C827A] mx-auto" />
          <h3 className="text-base font-black text-[#29221D] font-serif">No Orders Placed Yet</h3>
          <p className="text-xs text-[#6B5E55]">Support your first Indian master artisan today!</p>
          <Link
            to="/buyer/browse"
            className="artisan-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold"
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
                className="artisan-card bg-[#FFFDF8] rounded-3xl p-6 border border-[#D9CEB8] shadow-xs space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-[#D9CEB8] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#8C827A]">#{ord.id}</span>
                      <span className="text-[11px] text-[#8C827A]">
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
                    <h3 className="text-base font-bold text-[#29221D] mt-1">{ord.product_title}</h3>
                    <p className="text-xs text-[#6B5E55]">
                      Crafted by <strong className="text-[#29221D]">{ord.artisan_name}</strong>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xl font-black text-[#29221D] font-mono">{formatINR(ord.total_amount)}</span>
                    <p className="text-xs text-[#6B5E55]">
                      {ord.quantity} unit(s) • Paid via {ord.payment_method?.replace(/_/g, ' ') || 'UPI'}
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Tracker */}
                <div className="py-2">
                  <div className="relative flex items-center justify-between">
                    {/* Line connecting steps */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#D9CEB8] -z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#A8462D] transition-all -z-0"
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />

                    {/* Step 1: Created */}
                    <div className="flex flex-col items-center bg-[#FFFDF8] px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 1 ? 'bg-[#A8462D] text-white shadow-xs' : 'bg-[#F7F2E8] text-[#8C827A] border border-[#D9CEB8]'
                        }`}
                      >
                        ✓
                      </div>
                      <span className="text-[10px] font-bold text-[#29221D] mt-1">{t.orderCreated}</span>
                    </div>

                    {/* Step 2: Paid */}
                    <div className="flex flex-col items-center bg-[#FFFDF8] px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 2 ? 'bg-[#A8462D] text-white shadow-xs' : 'bg-[#F7F2E8] text-[#8C827A] border border-[#D9CEB8]'
                        }`}
                      >
                        {step >= 2 ? '✓' : '2'}
                      </div>
                      <span className="text-[10px] font-bold text-[#29221D] mt-1">{t.orderPaid}</span>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex flex-col items-center bg-[#FFFDF8] px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 3 ? 'bg-[#273B59] text-white shadow-xs' : 'bg-[#F7F2E8] text-[#8C827A] border border-[#D9CEB8]'
                        }`}
                      >
                        {step >= 3 ? '✓' : '3'}
                      </div>
                      <span className="text-[10px] font-bold text-[#29221D] mt-1">{t.orderShipped}</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center bg-[#FFFDF8] px-2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= 4 ? 'bg-emerald-700 text-white shadow-xs' : 'bg-[#F7F2E8] text-[#8C827A] border border-[#D9CEB8]'
                        }`}
                      >
                        {step >= 4 ? '✓' : '4'}
                      </div>
                      <span className="text-[10px] font-bold text-[#29221D] mt-1">{t.orderDelivered}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information & Provenance Action */}
                <div className="pt-3 border-t border-[#D9CEB8] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6B5E55] gap-3">
                  <div className="space-y-1">
                    <div>
                      <span className="font-semibold text-[#29221D]">Shipping to: </span>
                      {ord.buyer_address || 'Hyderabad, Telangana'}
                    </div>
                    <div className="flex items-center gap-1 text-[#A8462D] font-bold text-[11px]">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Direct Artisan Transit • Fair Trade Certified</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/provenance/${ord.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#29221D] hover:bg-[#3D332C] text-amber-300 font-bold text-xs border border-amber-500/30 shadow-xs transition-all"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Provenance Passport</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
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
