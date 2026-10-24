'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isRoleAdmin = cleanEmail.includes('admin') || cleanEmail === 'admin@farmtohome.in';

      if (isRoleAdmin) {
        // Enforce admin@123 password
        if (password.trim() !== 'admin@123') {
          throw new Error('Invalid administrator password. Please use admin@123');
        }

        try {
          const res = await fetch('/api/auth/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password: password.trim() }),
          });

          if (res.ok) {
            const data = await res.json();
            login(data.user || DEMO_USERS.ADMIN);
            router.push('/admin/dashboard');
            return;
          }
        } catch (apiErr) {
          console.warn('Admin API login call encountered an issue, falling back to local admin session:', apiErr);
        }

        // Resilient fallback for admin
        login(DEMO_USERS.ADMIN);
        router.push('/admin/dashboard');
        return;
      } else if (cleanEmail.includes('farmer') || cleanEmail.includes('patel')) {
        login(DEMO_USERS.FARMER);
        router.push('/seller/dashboard');
      } else {
        login({
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email: cleanEmail,
          role: 'CUSTOMER',
        });
        router.push('/shop');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
          Sign In to Farm to Home
        </h1>
        <p className="text-xs text-gray-500">
          Access fresh farm orders, track harvest passports, or manage your agricultural listings.
        </p>
      </div>

      {/* Email / Password Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-5">
        <div>
          <GoogleSignInButton
            redirectUrl="/shop"
            label="Sign in with Google (Instant Access)"
          />
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address:</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@example.com (or admin@farmtohome.in)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">Password:</label>
              {email.toLowerCase().includes('admin') && (
                <span className="text-[10px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
                  Password: admin@123
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center space-y-2 text-xs text-gray-500">
          <p>
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-bold text-forest-800 hover:underline">
              Create an Account
            </Link>
          </p>
          <p>
            Are you an agricultural producer?{' '}
            <Link href="/seller/register" className="font-bold text-harvest-600 hover:underline">
              Apply as Farmer Seller
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
