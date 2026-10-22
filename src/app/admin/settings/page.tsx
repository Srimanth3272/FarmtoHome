'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ShieldCheck, Settings, Lock, CheckCircle2 } from 'lucide-react';
import RazorpaySettingsCard from '@/components/RazorpaySettingsCard';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
              Platform Payment & Gateway Settings
            </h1>
            <p className="text-xs text-gray-500">
              Manage Razorpay API credentials, payment channels, and agricultural merchant settings.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Authentication Verified</span>
        </div>
      </div>

      {/* Razorpay Gateway Card */}
      <RazorpaySettingsCard />

      {/* Integration Details / Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-sm text-forest-950">Customer Checkout</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Customers can pay directly via UPI (GPay, PhonePe, Paytm), Debit/Credit Cards (RuPay, Visa, MC), and NetBanking.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-sm text-forest-950">Farmer Commission</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Farmers can instantly pay their 5% platform commission fees using the connected Razorpay gateway with immediate ledger clearance.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-sm text-forest-950">Direct .env Sync</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Credentials configured here are automatically synchronized to both server runtime memory and the local <code className="bg-cream-100 px-1 py-0.5 rounded text-[11px] font-mono">.env</code> file.
          </p>
        </div>
      </div>
    </div>
  );
}
