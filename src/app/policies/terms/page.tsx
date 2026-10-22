import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          Terms and Conditions
        </h1>
        <p className="text-xs text-gray-500">
          Last Updated: October 2026 • Governing Agricultural Direct Commerce
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-card space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            1. Platform Nature & Direct Farmer Contracting
          </h2>
          <p>
            Farm to Home functions as a direct bridge enabling agricultural producers to list fresh produce, organic inputs, seeds, and farm by-products for sale to conscious buyers. When you place an order, you contract directly with the verified farmer indicated on the product page.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            2. Organic Authenticity & Claims Representation
          </h2>
          <p>
            Sellers are legally liable for truthful representations of farming practices. Products claiming PGS-India or NPOP certification must hold valid certificates. Misleading representations result in immediate de-listing and revocation of seller status.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
            3. AI Assistant Disclaimers
          </h2>
          <p>
            Information provided by the Smart Farming Assistant represents educational natural agronomy advice. Farm to Home does not guarantee crop yields or disease eradication without physical soil and pest evaluation.
          </p>
        </section>
      </div>
    </div>
  );
}
