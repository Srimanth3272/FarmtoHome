'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Check if admin or farmer by email
      if (email.includes('admin')) {
        login(DEMO_USERS.ADMIN);
        router.push('/admin/dashboard');
      } else if (email.includes('farmer') || email.includes('patel')) {
        login(DEMO_USERS.FARMER);
        router.push('/seller/dashboard');
      } else {
        login({
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'CUSTOMER',
        });
        router.push('/account');
      }
      setLoading(false);
    }, 600);
  };

  const handleQuickDemo = (role: 'CUSTOMER' | 'FARMER' | 'ADMIN') => {
    switchDemoUser(role);
    if (role === 'ADMIN') router.push('/admin/dashboard');
    else if (role === 'FARMER') router.push('/seller/dashboard');
    else router.push('/shop');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
          Sign In to Farm to Home
        </h1>
        <p className="text-xs text-gray-500">
          Access fresh farm orders, track harvest passports, or manage your agricultural listings.
        </p>
      </div>

      {/* Quick Demo Selector */}
      <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-harvest-500" />
          <span>Interactive 1-Click Role Login:</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('CUSTOMER')}
            className="p-2.5 rounded-xl bg-white border border-forest-200 hover:bg-forest-100 text-center transition-colors shadow-sm"
          >
            <p className="font-bold text-xs text-forest-950">Customer</p>
            <p className="text-[10px] text-gray-400">Priya Sharma</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('FARMER')}
            className="p-2.5 rounded-xl bg-white border border-forest-200 hover:bg-forest-100 text-center transition-colors shadow-sm"
          >
            <p className="font-bold text-xs text-forest-950">Farmer</p>
            <p className="text-[10px] text-gray-400">Ramesh Patel</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('ADMIN')}
            className="p-2.5 rounded-xl bg-white border border-forest-200 hover:bg-forest-100 text-center transition-colors shadow-sm"
          >
            <p className="font-bold text-xs text-forest-950">Admin</p>
            <p className="text-[10px] text-gray-400">Dr. Anand</p>
          </button>
        </div>
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address:</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password:</label>
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
