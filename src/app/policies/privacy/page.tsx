import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-3">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest-950">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-xs text-gray-500">
          Last Updated: October 2026 • Farm to Home Technologies Pvt. Ltd.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-card space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            1. Farmer & Customer Privacy Protection
          </h2>
          <p>
            Farm to Home is committed to safeguarding personal information for both consumers and agricultural producers. We never sell, rent, or trade customer contact details, browsing habits, or farmer land records to external ad trackers.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            2. Farm Passport Traceability Transparency
          </h2>
          <p>
            When viewing a digital Farm Passport, farm geographical locations are disclosed at the district and taluka level to ensure complete traceability while safeguarding the privacy and physical security of family homesteads.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            3. Payment Security & PCI-DSS Compliance
          </h2>
          <p>
            All online transactions (UPI, Credit/Debit cards, Netbanking) are processed via bank-grade 256-bit encrypted gateways. We never store raw credit card numbers, CVVs, or UPI MPINs on our application servers.
          </p>
        </section>
      </div>
    </div>
  );
}
