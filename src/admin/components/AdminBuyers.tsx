import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, CheckCircle, AlertCircle, Eye, Phone, Mail, MapPin, X } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { formatINR } from '../../lib/billingService';

export function AdminBuyers() {
  const { fetchAdmin } = useAdminAuth();
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdmin('/api/admin/buyers');
      if (res.ok) {
        const data = await res.json();
        setBuyers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load buyers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, []);

  const handleStatusChange = async (buyerId: string, newStatus: 'active' | 'deactivated') => {
    try {
      const res = await fetchAdmin(`/api/admin/buyers/${buyerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Buyer status updated to "${newStatus}". Real-time effect: Marketplace access updated.`);
        setTimeout(() => setActionMessage(null), 4000);
        loadBuyers();
      }
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  const filteredBuyers = buyers.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (b.name || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.phone || '').includes(q) ||
      (b.location || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Buyer Governance
            </span>
            <span className="text-xs text-slate-400">Total Registered: {buyers.length}</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rozha_One',serif]">
            Conscious Buyer Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Oversee consumer profiles, direct-to-artisan purchase activity, delivery destinations, and standing.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search buyers by name, email, phone, city..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Buyer Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading registered buyer records...
                  </td>
                </tr>
              ) : filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching buyers found.
                  </td>
                </tr>
              ) : (
                filteredBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                          {buyer.name?.slice(0, 2).toUpperCase() || 'BY'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{buyer.name}</p>
                          <p className="text-[11px] text-slate-500">ID: {buyer.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {buyer.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {buyer.phone}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="flex items-center gap-1 text-[11px] text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {buyer.location || 'India'}, {buyer.state || ''}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white text-xs">{buyer.ordersCount ?? 0} Orders</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-400 text-xs">
                        {formatINR(buyer.totalSpent ?? 0)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          buyer.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-red-950 text-red-400 border border-red-800/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${buyer.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {buyer.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBuyer(buyer)}
                          title="View Details"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {buyer.status !== 'active' ? (
                          <button
                            onClick={() => handleStatusChange(buyer.id, 'active')}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(buyer.id, 'deactivated')}
                            className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buyer Detail Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                Buyer Profile: {selectedBuyer.name}
              </h3>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">User ID</span>
                  <span className="font-mono text-slate-300">{selectedBuyer.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                  <span className="font-bold uppercase text-emerald-400">{selectedBuyer.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Email</span>
                  <span className="text-slate-200">{selectedBuyer.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Mobile</span>
                  <span className="text-slate-200">{selectedBuyer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Region</span>
                  <span className="text-slate-200">{selectedBuyer.location}, {selectedBuyer.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Direct Orders</span>
                  <span className="font-bold text-white">{selectedBuyer.ordersCount ?? 0}</span>
                </div>
              </div>

              {selectedBuyer.address && (
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-slate-400 text-[10px] uppercase">Delivery Address:</p>
                  <p className="text-slate-300 text-xs leading-relaxed">{selectedBuyer.address}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleStatusChange(
                    selectedBuyer.id,
                    selectedBuyer.status === 'active' ? 'deactivated' : 'active'
                  );
                  setSelectedBuyer(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${
                  selectedBuyer.status === 'active'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {selectedBuyer.status === 'active' ? 'Deactivate Buyer Account' : 'Activate Buyer Account'}
              </button>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
