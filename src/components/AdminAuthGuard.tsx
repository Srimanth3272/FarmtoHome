'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, KeyRound, User } from 'lucide-react';
import { Logo } from '@/components/Logo';

export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, login } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as Sreemanth ADMIN, show dashboard directly
  const isOwnerAdmin =
    user?.role === 'ADMIN' &&
    user?.email?.toLowerCase() === 'sreemanthnagalakunta@gmail.com';

  if (!loading && isOwnerAdmin) {
    return <>{children}</>;
  }

  const handleAdminUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Access is restricted to platform owner.');
      }

      // Login session updated
      login(data.user);
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

  // If another user is signed in (not Sreemanth), block access
  if (user && user.email?.toLowerCase() !== 'sreemanthnagalakunta@gmail.com') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-cream-300 shadow-elevated p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-serif font-black text-2xl text-forest-950">
            Access Denied
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            The Super Administrator Operations Control Center is strictly private and reserved exclusively for the authorized platform owner.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 transition-colors"
            >
              Return to Storefront
            </a>
          </div>
        </div>
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
            Restricted access. Enter authorized credentials to manage compliance approvals and platform operations.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Admin Email / Username:
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Enter owner email or username"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Administrator Password:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
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
      </div>
    </div>
  );
};
