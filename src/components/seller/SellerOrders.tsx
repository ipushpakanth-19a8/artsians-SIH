import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, Filter, Truck, CheckCircle2, Clock,
  Phone, MapPin, Package, ArrowRight, Check, AlertCircle, Volume2
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
import { Order } from '../../types';
import { formatINR } from '../../lib/billingService';
import { ShowMeButton } from '../tutorial/ContextualHelp';

const STATUS_STEPS = [
  { key: 'created', label: 'New Order', labelHi: 'नया ऑर्डर', labelTe: 'కొత్త ఆర్డర్' },
  { key: 'paid', label: 'Confirmed', labelHi: 'पुष्ट', labelTe: 'ధృవీకరించబడింది' },
  { key: 'preparing', label: 'Preparing', labelHi: 'तैयारी में', labelTe: 'సిద్ధం చేస్తున్నారు' },
  { key: 'ready_to_ship', label: 'Ready to Ship', labelHi: 'भेजने को तैयार', labelTe: 'రవాణాకు సిద్ధం' },
  { key: 'shipped', label: 'Shipped', labelHi: 'भेज दिया', labelTe: 'రవాణా అయింది' },
  { key: 'delivered', label: 'Delivered', labelHi: 'वितरित', labelTe: 'డెలివరీ అయింది' },
];

const DEFAULT_SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-101',
    product_id: 'prod-01',
    product_title: 'Handwoven Kalamkari Cotton Saree',
    buyer_name: 'Priya Sharma',
    buyer_phone: '+91 98765 43210',
    shipping_address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103',
    total_amount: 1850,
    status: 'preparing',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ord-102',
    product_id: 'prod-02',
    product_title: 'Natural Terracotta Kulhar Chai Cups (Set of 6)',
    buyer_name: 'Vikram Mehta',
    buyer_phone: '+91 98111 22334',
    shipping_address: '14, Barakhamba Road, Connaught Place, New Delhi - 110001',
    total_amount: 650,
    status: 'paid',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

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
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(DEFAULT_SAMPLE_ORDERS);
        }
        setLoading(false);
      })
      .catch(() => {
        setOrders(DEFAULT_SAMPLE_ORDERS);
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

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'created': return 0;
      case 'paid': return 1;
      case 'preparing': return 2;
      case 'ready_to_ship': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      default: return 0;
    }
  };

  const getNextStatus = (currentStatus: string): Order['status'] | null => {
    switch (currentStatus) {
      case 'created': return 'paid';
      case 'paid': return 'shipped'; // Maps to shipped or preparing
      case 'shipped': return 'delivered';
      default: return null;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && (o.status === 'created' || o.status === 'paid')) ||
      (filterStatus === 'shipped' && o.status === 'shipped') ||
      (filterStatus === 'delivered' && o.status === 'delivered');
    const matchesSearch =
      o.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleListen = () => {
    const text = language === 'hi'
      ? `आपके पास कुल ${orders.length} ऑर्डर्स हैं। इसमें से ${orders.filter(o => o.status !== 'delivered').length} ऑर्डर्स अभी पूरे किए जाने हैं।`
      : language === 'te'
      ? `మీకు మొత్తం ${orders.length} ఆర్డర్లు ఉన్నాయి. వీటిలో ${orders.filter(o => o.status !== 'delivered').length} ఆర్డర్లు పంపాల్సి ఉంది.`
      : `You have ${orders.length} total orders, with ${orders.filter(o => o.status !== 'delivered').length} active orders to fulfill.`;
    speakText(text, language);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-[#eadfd4] border-t-[#9c4124] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2e9] text-[#9c4124] text-xs font-black uppercase tracking-wider mb-2 border border-[#f8d7c2]">
            <span>Order Fulfillment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#262220] font-['Rozha_One',serif] tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-[#9c4124]" />
            <span>{language === 'hi' ? 'ग्राहक ऑर्डर्स प्रबंधन' : language === 'te' ? 'ఆర్డర్ల నిర్వహణ' : 'Order Management'}</span>
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Track and fulfill your direct craft orders. Zero commissions deducted.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ShowMeButton missionId="explore-orders" />
          <button
            onClick={handleListen}
            className="artisan-listen-btn cursor-pointer py-2 px-3.5 text-xs shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen in Audio 🔊</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#eadfd4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending / In Progress' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Completed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-[#9c4124] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-stone-600 hover:text-stone-900 border border-[#eadfd4]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by buyer, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
          />
        </div>
      </div>

      {/* Orders List with Visual Timelines */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#eadfd4] text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#faf7f2] text-stone-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-stone-800">No orders found in this view</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When buyers purchase your handmade crafts from the marketplace, their orders will appear here with delivery details.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => {
            const stepIdx = getStepIndex(order.status);
            const nextStatus = getNextStatus(order.status);

            return (
              <div
                key={order.id}
                data-tutorial={idx === 0 ? 'order-timeline-card' : undefined}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#eadfd4] shadow-xs space-y-4 hover:border-[#c85a32] transition-colors"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eadfd4]">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <h3 className="text-base font-black text-[#262220] mt-0.5">
                      {order.product_title || 'Handcrafted Artisan Item'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-lg font-black text-[#9c4124]">
                      {formatINR(order.total_amount)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold capitalize ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-[#fdf2e9] text-[#9c4124]'
                    }`}>
                      {order.status === 'created' ? 'New Order' : order.status === 'paid' ? 'Confirmed' : order.status}
                    </span>
                  </div>
                </div>

                {/* Visual Timeline (6 Steps) */}
                <div className="py-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block mb-3">
                    Fulfillment Timeline:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {STATUS_STEPS.map((s, idx) => {
                      const isCompleted = stepIdx >= idx;
                      const isCurrent = stepIdx === idx;
                      return (
                        <div key={s.key} className="text-center space-y-1">
                          <div className={`h-2 rounded-full transition-all ${
                            isCompleted ? 'bg-[#9c4124]' : 'bg-stone-200'
                          }`} />
                          <p className={`text-[10px] leading-tight ${
                            isCurrent
                              ? 'font-black text-[#9c4124]'
                              : isCompleted
                              ? 'font-bold text-stone-700'
                              : 'text-stone-400'
                          }`}>
                            {language === 'hi' ? s.labelHi : language === 'te' ? s.labelTe : s.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Details & Actions */}
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-stone-800 flex items-center gap-1.5">
                      <span className="text-stone-500">Buyer:</span> {order.buyer_name}
                    </p>
                    <p className="text-stone-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <a href={`tel:${order.buyer_phone}`} className="hover:underline font-semibold text-[#9c4124]">
                        {order.buyer_phone || '+91 98765 43210'}
                      </a>
                    </p>
                    <p className="text-stone-500 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{order.shipping_address || 'Hyderabad, Telangana, India'}</span>
                    </p>
                  </div>

                  {/* Advance Status Button */}
                  {nextStatus && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, nextStatus)}
                      className="artisan-btn-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <span>Mark {nextStatus === 'paid' ? 'Confirmed ✓' : nextStatus === 'shipped' ? 'Shipped 🚚' : 'Delivered 🤝'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Order Completed & Settled</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
