import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, Truck, CheckCircle2, Clock,
  Phone, MapPin, Package, ArrowRight, Volume2, Sparkles, Filter
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
import { Order } from '../../types';
import { formatINR } from '../../lib/billingService';
import { PageHeader, StatusBadge, OrderTimeline } from './ui';

const DEFAULT_SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-101',
    product_id: 'prod-01',
    product_title: 'Handwoven Kalamkari Cotton Saree',
    artisan_id: 'art-01',
    artisan_name: 'Pavan',
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
    artisan_id: 'art-03',
    artisan_name: 'Pavan',
    buyer_name: 'Vikram Mehta',
    buyer_phone: '+91 98111 22334',
    shipping_address: '14, Barakhamba Road, Connaught Place, New Delhi - 110001',
    total_amount: 650,
    status: 'paid',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ord-103',
    product_id: 'prod-03',
    product_title: 'Channapatna Non-Toxic Lacquered Wooden Stacker',
    artisan_id: 'art-01',
    artisan_name: 'Pavan',
    buyer_name: 'Ananya Roy',
    buyer_phone: '+91 99000 11223',
    shipping_address: 'B-12, Salt Lake Sector 5, Kolkata, West Bengal - 700091',
    total_amount: 890,
    status: 'ready_to_ship',
    created_at: new Date(Date.now() - 172800000).toISOString(),
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

  const getNextStatus = (currentStatus: string): Order['status'] | null => {
    switch (currentStatus) {
      case 'created':
        return 'paid';
      case 'paid':
        return 'preparing';
      case 'preparing':
        return 'ready_to_ship';
      case 'ready_to_ship':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && (o.status === 'created' || o.status === 'paid' || o.status === 'preparing')) ||
      (filterStatus === 'ready_to_ship' && o.status === 'ready_to_ship') ||
      (filterStatus === 'shipped' && o.status === 'shipped') ||
      (filterStatus === 'delivered' && o.status === 'delivered');
    const matchesSearch =
      o.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleListen = () => {
    const activeOrders = orders.filter((o) => o.status !== 'delivered').length;
    const textMap: Record<string, string> = {
      hi: `आपके पास कुल ${orders.length} ऑर्डर्स हैं। इसमें से ${activeOrders} ऑर्डर्स अभी पूरे किए जाने हैं।`,
      te: `మీకు మొత్తం ${orders.length} ఆర్డర్లు ఉన్నాయి. వీటిలో ${activeOrders} ఆర్డర్లు పంపాల్సి ఉంది.`,
      en: `You have ${orders.length} total orders, with ${activeOrders} active orders waiting for fulfillment.`,
    };
    const text = textMap[language] || textMap.en;
    speakText(text, language);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-[#D9CEB8] border-t-[#A8462D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="CUSTOMER ORDERS & FULFILLMENT"
        title={t.orders || 'Customer Orders'}
        description="Track and manage buyer orders, update preparation and shipment statuses with real-time customer tracking."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleListen}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] text-[#A8462D] text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Audio Summary</span>
            </button>
          </div>
        }
      />

      {/* 2. Filter & Search Controls */}
      <div className="rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Preparing / Active' },
              { id: 'ready_to_ship', label: 'Ready to Ship' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === f.id
                    ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                    : 'bg-[#F7F2E8] text-[#5C4A3A] hover:bg-[#E8DFC9] border border-[#D9CEB8]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E65]" />
            <input
              type="text"
              placeholder="Search by buyer or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 rounded-full border border-[#D9CEB8] bg-[#F7F2E8]/60 text-xs text-[#29221D] focus:outline-none focus:border-[#A8462D]"
            />
          </div>
        </div>
      </div>

      {/* 3. Order List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDF8] rounded-2xl border border-dashed border-[#D9CEB8] p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#A8462D]/10 text-[#A8462D] flex items-center justify-center mx-auto mb-4 border border-[#A8462D]/20">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-serif text-[#29221D]">No Orders Found</h3>
          <p className="text-xs text-[#7A6E65] mt-1">
            {searchQuery
              ? `No orders matched your search "${searchQuery}".`
              : 'There are no customer orders matching this status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);

            return (
              <div
                key={order.id}
                className="bg-[#FFFDF8] rounded-2xl border border-[#D9CEB8] p-5 sm:p-6 shadow-2xs hover:border-[#A8462D]/40 transition-all duration-200 space-y-5"
              >
                {/* Order Top Bar: ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9CEB8]/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#A8462D] bg-[#A8462D]/10 px-2.5 py-1 rounded-md border border-[#A8462D]/20">
                      {order.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#7A6E65]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                {/* Main Content: Craft details & Buyer details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Craft Info */}
                  <div className="md:col-span-6 flex items-start gap-3.5">
                    <div className="w-16 h-16 rounded-xl bg-[#F7F2E8] border border-[#D9CEB8] flex items-center justify-center shrink-0 text-2xl">
                      🏺
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#C88732] uppercase tracking-wider block">
                        Direct Artisan Order
                      </span>
                      <h4 className="font-serif font-bold text-base text-[#29221D] line-clamp-1">
                        {order.product_title}
                      </h4>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs font-bold text-[#7A6E65]">Total:</span>
                        <span className="text-base font-mono font-bold text-[#4A7A52]">
                          {formatINR(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buyer & Shipping Info */}
                  <div className="md:col-span-6 bg-[#F7F2E8]/60 rounded-xl p-3.5 border border-[#D9CEB8]/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#29221D]">{order.buyer_name}</span>
                      {order.buyer_phone && (
                        <a
                          href={`tel:${order.buyer_phone}`}
                          className="text-[#A8462D] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.buyer_phone}</span>
                        </a>
                      )}
                    </div>
                    {order.shipping_address && (
                      <p className="text-[#5C4A3A] flex items-start gap-1.5 line-clamp-2">
                        <MapPin className="w-3.5 h-3.5 text-[#7A6E65] shrink-0 mt-0.5" />
                        <span>{order.shipping_address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Order Timeline */}
                <div className="pt-2 border-t border-[#D9CEB8]/50">
                  <OrderTimeline
                    currentStatus={order.status}
                    interactive
                    onSelectStatus={(statusKey) => handleUpdateStatus(order.id, statusKey as any)}
                  />
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D9CEB8]/40">
                  <div className="text-[11px] text-[#7A6E65]">
                    Click any timeline step above or use the button to advance status.
                  </div>

                  <div className="flex items-center gap-2">
                    {order.buyer_phone && (
                      <a
                        href={`tel:${order.buyer_phone}`}
                        className="px-3.5 py-1.5 rounded-full border border-[#D9CEB8] hover:border-[#A8462D] bg-[#FFFDF8] text-xs font-bold text-[#29221D] hover:text-[#A8462D] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Buyer</span>
                      </a>
                    )}

                    {nextStatus && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, nextStatus)}
                        className="px-4 py-1.5 rounded-full bg-[#A8462D] hover:bg-[#8E3822] text-[#FFFDF8] text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <span>Advance to {nextStatus.replace('_', ' ')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
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
