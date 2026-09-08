import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, AlertCircle, CheckCircle, Ban, Eye, Phone, Mail, MapPin, Sparkles, X } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { formatINR } from '../../lib/billingService';

export function AdminSellers() {
  const { fetchAdmin } = useAdminAuth();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdmin('/api/admin/sellers');
      if (res.ok) {
        const data = await res.json();
        setSellers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load sellers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleStatusChange = async (sellerId: string, newStatus: 'active' | 'deactivated' | 'suspended') => {
    try {
      const res = await fetchAdmin(`/api/admin/sellers/${sellerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Seller status updated to "${newStatus}". Real-time effect: Login access and permissions updated.`);
        setTimeout(() => setActionMessage(null), 4000);
        loadSellers();
      }
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  const filteredSellers = sellers.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q) ||
      (s.craft_type || '').toLowerCase().includes(q) ||
      (s.location || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
              Artisan Governance
            </span>
            <span className="text-xs text-slate-400">Total Registered: {sellers.length}</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rozha_One',serif]">
            Artisan & Seller Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor artisan cluster credentials, craft certifications, account standing, and live login authorization.
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
            placeholder="Search sellers by name, craft, email, phone, location..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="deactivated">Deactivated</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Artisan / Business</th>
                <th className="py-3.5 px-4">Craft Tradition</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Catalog / Sales</th>
                <th className="py-3.5 px-4">Standing</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading verified artisan records...
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching sellers found.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                          {seller.name?.slice(0, 2).toUpperCase() || 'AR'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{seller.name}</p>
                          <p className="text-[11px] text-slate-500">{seller.business_name || 'Individual Craftsperson'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-amber-300 rounded-lg text-[11px] font-semibold">
                        {seller.craft_type || seller.artisan?.category || 'Handloom'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {seller.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {seller.phone}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="flex items-center gap-1 text-[11px] text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {seller.location || seller.artisan?.district || 'Telangana'}, {seller.state || seller.artisan?.state || ''}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-white text-xs">{seller.productsCount ?? 1} items</p>
                        <p className="text-[11px] text-emerald-400 font-semibold">
                          {formatINR(seller.totalSales ?? 8400)} sales
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          seller.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : seller.status === 'deactivated'
                            ? 'bg-red-950 text-red-400 border border-red-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${seller.status === 'active' ? 'bg-emerald-400' : seller.status === 'deactivated' ? 'bg-red-400' : 'bg-amber-400'}`} />
                        {seller.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSeller(seller)}
                          title="View Full Profile"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {seller.status !== 'active' ? (
                          <button
                            onClick={() => handleStatusChange(seller.id, 'active')}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(seller.id, 'deactivated')}
                            className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-bold transition-colors"
                            title="Deactivate seller account to block login"
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

      {/* Seller Detail Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Artisan Profile: {selectedSeller.name}
              </h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">User ID</span>
                  <span className="font-mono text-slate-300">{selectedSeller.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Craft Tradition</span>
                  <span className="font-bold text-amber-400">{selectedSeller.craft_type || 'Handloom'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Registered Email</span>
                  <span className="text-slate-200">{selectedSeller.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Registered Mobile</span>
                  <span className="text-slate-200">{selectedSeller.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Cluster Location</span>
                  <span className="text-slate-200">{selectedSeller.location}, {selectedSeller.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Account Status</span>
                  <span className="font-bold uppercase text-emerald-400">{selectedSeller.status}</span>
                </div>
              </div>

              {selectedSeller.artisan && (
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1.5">
                  <p className="font-bold text-amber-300 text-xs">Artisan Bio / Background:</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{selectedSeller.artisan.bio}</p>
                  <p className="text-[11px] text-slate-500">
                    Experience: {selectedSeller.artisan.experience_years} years
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleStatusChange(
                    selectedSeller.id,
                    selectedSeller.status === 'active' ? 'deactivated' : 'active'
                  );
                  setSelectedSeller(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${
                  selectedSeller.status === 'active'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {selectedSeller.status === 'active' ? 'Deactivate Seller Account' : 'Activate Seller Account'}
              </button>
              <button
                onClick={() => setSelectedSeller(null)}
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
