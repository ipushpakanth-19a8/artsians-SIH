import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, CheckCircle, Database, ShieldCheck, Download } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';

export function AdminReports() {
  const { fetchAdmin } = useAdminAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCSV = async (endpoint: string, filename: string, keyName: string) => {
    setDownloading(keyName);
    try {
      const res = await fetchAdmin(endpoint);
      const data = await res.json();
      if (!Array.isArray(data)) return;

      if (data.length === 0) {
        alert('No data records available to export.');
        return;
      }

      const headers = Object.keys(data[0]).filter((k) => typeof data[0][k] !== 'object');
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = row[h] ?? '';
              return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: 'sellers',
      title: 'Artisan & Seller Cluster Registry',
      desc: 'Complete export of verified master artisans, GI craft traditions, mobile contacts, and onboarding status.',
      endpoint: '/api/admin/sellers',
      filename: 'kalatech-artisan-registry',
      badge: 'Artisans',
    },
    {
      id: 'orders',
      title: 'Direct Marketplace Order Ledger',
      desc: 'Transaction audit of all direct sales with 0% platform commission, payment IDs, and fulfillment tracking.',
      endpoint: '/api/admin/orders',
      filename: 'kalatech-orders-ledger',
      badge: 'Orders',
    },
    {
      id: 'bills',
      title: 'Finalized Invoices & Cost Breakdown',
      desc: 'Financial audit report of material, labor, and logistical costs compared to market benchmarks.',
      endpoint: '/api/admin/bills',
      filename: 'kalatech-invoices-audit',
      badge: 'Invoices',
    },
    {
      id: 'benchmarks',
      title: 'National Market Price Benchmarks',
      desc: 'Curated price benchmarks by craft category and region, with recommended target prices.',
      endpoint: '/api/admin/market-prices',
      filename: 'kalatech-market-benchmarks',
      badge: 'Benchmarks',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Audit Data Extraction
            </span>
            <span className="text-xs text-slate-400">CSV & Spreadsheet Exports</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rozha_One',serif]">
            Compliance Reports & Export Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Download verified datasets for Ministry of Textiles submissions, state handicraft board audits, and evaluator compliance checks.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <div key={rep.id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                  {rep.badge}
                </span>
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-base">{rep.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rep.desc}</p>
            </div>

            <button
              onClick={() => downloadCSV(rep.endpoint, rep.filename, rep.id)}
              disabled={downloading === rep.id}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Download className={`w-4 h-4 ${downloading === rep.id ? 'animate-bounce' : ''}`} />
              {downloading === rep.id ? 'Generating Export...' : 'Download CSV Dataset'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
