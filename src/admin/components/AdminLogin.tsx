import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';

export function AdminLogin() {
  const { loginAdmin } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please provide administrative email and password');
      return;
    }

    setLoading(true);
    const res = await loginAdmin(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Authentication denied. Invalid administrative credentials.');
    }
  };

  const handleQuickSeedFill = () => {
    setEmail('admin@kalatech.gov.in');
    setPassword('Admin@123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#ef4444 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      <div className="max-w-md w-full relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-700 text-white shadow-xl shadow-red-950/50 mb-4 border border-red-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rozha_One',serif] tracking-tight">
            KALAtech <span className="text-red-500 font-sans text-xl font-bold">Admin</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Platform Governance & Enterprise Cluster Management</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-800/40 rounded-full text-red-400 text-[11px] font-semibold mt-3">
            <Lock className="w-3 h-3" />
            Restricted Access • Authorized Personnel Only
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-8 shadow-2xl shadow-black/80">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/50 rounded-xl text-red-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Administrative Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kalatech.gov.in"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Administrative Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Governance Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Fill for Development / Evaluation */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleQuickSeedFill}
                className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Fill Seed Credentials (admin@kalatech.gov.in)
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-slate-500 text-xs">
          <p>Protected by KALAtech Role-Based Access Control (RBAC).</p>
          <p className="mt-0.5 text-slate-600">All administrative sessions are logged for audit compliance.</p>
        </div>
      </div>
    </div>
  );
}
