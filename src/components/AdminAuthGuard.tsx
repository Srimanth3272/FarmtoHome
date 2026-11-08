'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { Logo } from '@/components/Logo';

export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, login } = useAuth();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('Srimanth3272');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as ADMIN, show dashboard directly
  if (!loading && user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  const handleAdminUnlock = async (e?: React.FormEvent, overrideUser?: string, overridePwd?: string) => {
    if (e) e.preventDefault();
    const userToTest = overrideUser || username;
    const pwdToTest = overridePwd || password;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userToTest, username: userToTest, password: pwdToTest }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify admin credentials.');
      }

      // Login session updated
      login(data.user || DEMO_USERS.ADMIN);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-cream-300 shadow-elevated p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Admin Gateway Authorization</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-forest-950">
            Super Admin Portal
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Enter the authorized Super Administrator credentials to accept or remove farmer products, manage live storefront orders, and monitor platform operations.
          </p>
        </div>

        {/* Credentials Notice Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Official Admin Credentials:</span>
          </div>
          <div className="font-mono text-[11px] grid grid-cols-2 gap-2 pt-1">
            <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200">
              <span className="text-gray-500 block text-[9px] uppercase font-bold">Username</span>
              <strong className="text-forest-950 font-black">Srimanth3272</strong>
            </div>
            <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200">
              <span className="text-gray-500 block text-[9px] uppercase font-bold">Password</span>
              <strong className="text-forest-950 font-black">Srimanth@3272</strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => handleAdminUnlock(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Administrator Username:
            </label>
            <input
              type="text"
              required
              placeholder="Srimanth3272"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-gray-50 font-semibold text-gray-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Administrator Password:
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Enter Srimanth@3272"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{submitting ? 'Verifying Super Admin...' : 'Unlock Super Admin Portal'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => handleAdminUnlock(undefined, 'Srimanth3272', 'Srimanth@3272')}
            disabled={submitting}
            className="w-full py-2.5 px-3 rounded-xl bg-forest-50 hover:bg-forest-100 border border-forest-200 text-forest-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-harvest-500" />
            <span>1-Click Auto Unlock (Srimanth3272 / Srimanth@3272)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
