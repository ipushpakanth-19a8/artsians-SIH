import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, RefreshCw, CheckCircle, AlertTriangle, Key, Terminal } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';

export function AdminSettings() {
  const { adminUser, fetchAdmin } = useAdminAuth();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetSeed = async () => {
    if (!confirm('Are you sure you want to reset and reseed the platform database to demo state?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/v1/demo/reset-seed', { method: 'POST' });
      if (res.ok) {
        setMessage('Database reseeded successfully with demo master artisans, benchmarks, and orders.');
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (e) {
      console.error('Reset failed:', e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Rozha_One',serif]">
            Platform Governance & Security Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system state, inspect security parameters, verify active administrative session, and control database seeds.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Session Security */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200 font-bold text-sm pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active Administrator Session
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Administrator Name:</span>
              <span className="font-bold text-white">{adminUser?.name || 'Platform Admin'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Authorized Email:</span>
              <span className="font-mono text-slate-200">{adminUser?.email || 'admin@kalatech.gov.in'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Verified Role:</span>
              <span className="px-2 py-0.5 bg-red-950 text-red-400 rounded font-bold uppercase text-[10px]">ADMIN</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Encryption Method:</span>
              <span className="font-mono text-slate-400">HMAC-SHA256 (Server Salted)</span>
            </div>
          </div>
        </div>

        {/* Database & Runtime Controls */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200 font-bold text-sm pb-3 border-b border-slate-800">
            <Database className="w-4 h-4 text-amber-400" />
            Database & Runtime Environment
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Main Application Port:</span>
              <span className="font-mono text-white">3000 (http://localhost:3000)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Dedicated Admin App Port:</span>
              <span className="font-mono text-white">5174 (http://localhost:5174)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Shared Backend Architecture:</span>
              <span className="text-emerald-400 font-semibold">Single Unified DB & API</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleResetSeed}
              disabled={resetting}
              className="w-full py-2.5 bg-amber-950/60 hover:bg-amber-950 text-amber-300 border border-amber-800/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting Database...' : 'Reset to Verified SIH Evaluation Seed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
