import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Truck, CheckCircle, Clock, Phone, MapPin, Eye } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Order } from '../../types';
import { formatINR } from '../../lib/billingService';

export function SellerOrders() {
  const { language } = useLanguage();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      o.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'created':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending</span>;
      case 'paid':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Paid</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Shipped</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-amber-600" />
            {t.orders}
          </h1>
          <p className="text-sm text-stone-600">Track and fulfill received artisan handicraft orders</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['all', 'created', 'paid', 'shipped', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === s
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by buyer, craft, or order ID..."
          className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-12 text-center text-stone-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No orders found</h3>
          <p className="text-xs text-stone-500 mt-1">Orders from buyers will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:border-stone-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-stone-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">#{ord.id}</span>
                    {getStatusBadge(ord.status)}
                    {ord.fair_trade_verified && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Fair Trade Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-1">{ord.product_title}</h3>
                </div>

                <div className="sm:text-right">
                  <span className="text-lg font-black text-stone-900">{formatINR(ord.total_amount)}</span>
                  <p className="text-xs text-stone-500">
                    {ord.quantity} unit(s) @ {formatINR(ord.unit_price)}
                  </p>
                </div>
              </div>

              {/* Buyer & Shipment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-xs text-stone-600">
                <div>
                  <span className="font-bold text-stone-800 block mb-0.5">Buyer Contact</span>
                  <p className="font-medium text-stone-900">{ord.buyer_name}</p>
                  <a
                    href={`tel:${ord.buyer_contact}`}
                    className="inline-flex items-center gap-1 text-amber-700 hover:underline font-semibold mt-1"
                  >
                    <Phone className="w-3 h-3" /> {ord.buyer_contact}
                  </a>
                </div>

                <div>
                  <span className="font-bold text-stone-800 block mb-0.5">Delivery Address</span>
                  <p className="line-clamp-2 text-stone-700">{ord.buyer_address || 'Pochampally District, Telangana'}</p>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-stone-800 block mb-0.5">Payment Method</span>
                    <p className="capitalize">{ord.payment_method?.replace(/_/g, ' ') || 'UPI Direct'}</p>
                  </div>

                  {/* Actions to update status */}
                  <div className="mt-3 flex items-center gap-2">
                    {ord.status === 'created' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'paid')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {ord.status === 'paid' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'shipped')}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3" /> Mark Shipped
                      </button>
                    )}
                    {ord.status === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
