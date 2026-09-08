import React, { useState, useEffect } from 'react';
import { FileText, Search, Eye, Download, ShieldCheck, Printer } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Bill } from '../../types';
import { formatINR } from '../../lib/billingService';
import { BillPreview } from '../seller/BillPreview';

export function AdminBills() {
  const { language } = useLanguage();
  const t = translations[language];

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    fetch('/api/bills')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBills(data);
        setLoading(false);
      })
      .catch(() => {
        const stored = JSON.parse(localStorage.getItem('kalatech_bills') || '[]');
        setBills(stored);
        setLoading(false);
      });
  }, []);

  const filtered = bills.filter(
    (b) =>
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
            <FileText className="w-7 h-7 text-red-600" />
            {t.bills} Audit & Governance ({bills.length})
          </h1>
          <p className="text-sm text-stone-600">Platform-wide artisan invoice records, cost structures, and fair-pricing compliance</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, artisan..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400">Loading invoice records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400">No generated bills found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Artisan Seller</th>
                  <th className="p-4">Handicraft Product</th>
                  <th className="p-4">Production Cost</th>
                  <th className="p-4">Valuation Price</th>
                  <th className="p-4">Artisan Margin</th>
                  <th className="p-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-800">{b.billNumber}</td>
                    <td className="p-4 font-semibold text-stone-900">{b.sellerName}</td>
                    <td className="p-4">
                      <span className="font-bold text-stone-900 block">{b.productName}</span>
                      <span className="text-[10px] text-stone-400">{b.quantity} unit(s) • {b.productCategory}</span>
                    </td>
                    <td className="p-4 font-medium text-stone-600">{formatINR(b.totalCost)}</td>
                    <td className="p-4 font-black text-stone-900">{formatINR(b.finalPrice * b.quantity)}</td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-600">
                        +{formatINR(b.profit)} ({b.profitPercentage}%)
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBill(b)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Preview Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900">Invoice Review: #{selectedBill.billNumber}</h3>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <BillPreview bill={selectedBill} />
          </div>
        </div>
      )}
    </div>
  );
}
