import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Truck, CheckCircle2, Clock, Check, X, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { formatINR } from '../../lib/billingService';
import { Order } from '../../types';

export function AdminOrders() {
  const { fetchAdmin } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAdmin('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetchAdmin(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Order #${orderId} operational status updated to "${newStatus}".`);
        setTimeout(() => setActionMessage(null), 3500);
        loadOrders();
      }
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (o.id || '').toLowerCase().includes(q) ||
      (o.product_title || '').toLowerCase().includes(q) ||
      (o.buyer_name || '').toLowerCase().includes(q) ||
      (o.artisan_name || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800/60">
              Fulfillment Oversight
            </span>
            <span className="text-xs text-slate-400">Total Transactions: {orders.length}</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rozha_One',serif]">
            Direct Order Fulfillment & Delivery Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track handmade craft parcels directly from village artisans to domestic and international patrons.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by order ID, product, buyer, artisan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Statuses</option>
          <option value="created">Created / Pending</option>
          <option value="paid">Paid / Confirmed</option>
          <option value="shipped">Shipped in Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Handcrafted Item</th>
                <th className="py-3.5 px-4">Buyer Details</th>
                <th className="py-3.5 px-4">Artisan Origin</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-purple-300 text-xs">{ord.id}</p>
                      <p className="text-[11px] text-slate-500">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{ord.product_title}</p>
                      <p className="text-[11px] text-slate-400">Qty: {ord.quantity} units</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-200 text-xs">{ord.buyer_name}</p>
                      <p className="text-[11px] text-slate-400">{ord.buyer_contact}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-amber-300 text-xs">{ord.artisan_name}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-emerald-400 text-xs">
                        {formatINR(ord.total_amount)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : ord.status === 'shipped'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                            : ord.status === 'paid'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800/60'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusUpdate(ord.id, e.target.value)}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="created">Created</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
