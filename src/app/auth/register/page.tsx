'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Phone, ArrowRight, Sprout, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'FARMER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login({
        id: `user-${Date.now()}`,
        name,
        email,
        phone,
        role,
        isVerified: true,
      });

      if (role === 'FARMER') {
        router.push('/seller/dashboard');
      } else {
        router.push('/shop');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
          Join Farm to Home
        </h1>
        <p className="text-xs text-gray-500">
          Create an account to order verified farm harvests or list your own agricultural produce.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-4">
        {/* Role Toggle */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            I am joining as a:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`p-3 rounded-xl border text-center transition-all ${
                role === 'CUSTOMER'
                  ? 'border-forest-800 bg-forest-900 text-white font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <p className="text-xs">Customer</p>
              <p className={`text-[10px] ${role === 'CUSTOMER' ? 'text-forest-200' : 'text-gray-400'}`}>
                Buying produce & seeds
              </p>
            </button>
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              className={`p-3 rounded-xl border text-center transition-all ${
                role === 'FARMER'
                  ? 'border-forest-800 bg-forest-900 text-white font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <p className="text-xs">Farmer / Seller</p>
              <p className={`text-[10px] ${role === 'FARMER' ? 'text-forest-200' : 'text-gray-400'}`}>
                Selling farm goods
              </p>
            </button>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Full Name:</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Address:</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Mobile Number:</label>
            <input
              type="tel"
              required
              placeholder="+91 98450 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Create Password:</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link href="/auth/login" className="font-bold text-forest-800 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
