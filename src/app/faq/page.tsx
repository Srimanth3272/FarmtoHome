'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, Search, ShieldCheck, Truck, Sprout } from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'Delivery & PIN Codes',
    q: 'How does next-day morning harvest delivery work?',
    a: 'When you place an order before 8:00 PM, participating regional farmers harvest your produce at dawn (5:30 AM). Produce is immediately sorted, packed in breathable eco-crates, and dispatched for morning doorstep delivery between 7:00 AM and 11:00 AM across supported PIN codes.',
  },
  {
    category: 'Delivery & PIN Codes',
    q: 'What is the delivery fee structure?',
    a: 'All orders of ₹499 and above receive FREE Express Farm Delivery. Orders below ₹499 are subject to a nominal flat fee of ₹40 to cover eco-friendly temperature-controlled transit directly from rural acreage.',
  },
  {
    category: 'Farm Passport & Authenticity',
    q: 'What is a digital Farm Passport and how do I verify it?',
    a: 'Every eligible product features an official Farm Passport. By scanning the QR code on your delivery box or entering the batch ID on our Farm Passport page, you can inspect the exact farmer profile, land acreage, years without chemical fertilizers, water source, and laboratory residue testing reports.',
  },
  {
    category: 'Farm Passport & Authenticity',
    q: 'How are organic claims verified?',
    a: 'We strictly differentiate self-declared natural farming (Subhash Palekar Natural Farming / SPNF) from accredited certifications. Products marked 100% Organic hold Participatory Guarantee System (PGS-India Green/Organic) or NPOP compliance verified through accreditation records.',
  },
  {
    category: 'Harvest Calendar & Pre-Orders',
    q: 'How does the Harvest Calendar pre-order system work?',
    a: 'The Indian Harvest Calendar lists crops that participating farmers expect to harvest across Kharif, Rabi, and Zaid seasons. Farmers set pre-order availability so you can reserve harvest batches before they sell out at the farm gate.',
  },
  {
    category: 'Farm Waste Exchange',
    q: 'Who can use the Farm Waste Exchange?',
    a: 'Farmers, nurseries, terrace gardeners, and composting startups can list or acquire reusable biomass such as paddy stubble, coconut husks, well-aged cow manure, and orchard pruning logs. Listings can be offered for sale, free donation, or barter exchange.',
  },
  {
    category: 'Returns & Cancellations',
    q: 'What is the return policy for perishable fresh produce?',
    a: 'Because fresh fruits and vegetables are perishable, we offer a 100% Freshness Guarantee. If any item is damaged or fails freshness standards upon delivery, notify us within 12 hours via our app or helpline for an instant replacement or refund.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filtered = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-harvest-400 text-forest-950 inline-block">
          Frequently Asked Questions
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest-950">
          Everything You Need to Know About Farm to Home
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
          Clear answers about our direct farm sourcing, digital traceability, morning harvest deliveries, and organic standards.
        </p>

        {/* Search Input */}
        <div className="max-w-md mx-auto pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions: delivery, farm passport, returns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-forest-50/50 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-forest-950">
                    {item.q}
                  </h3>
                </div>
                <div className="p-1 rounded-full bg-cream-100 text-forest-900 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-cream-100">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help banner */}
      <div className="p-6 rounded-3xl bg-cream-100/70 border border-cream-300 text-center space-y-2">
        <h4 className="font-serif font-bold text-base text-forest-950">
          Still have an unanswered question?
        </h4>
        <p className="text-xs text-gray-600">
          Our agronomy and support team is happy to help you.
        </p>
        <Link
          href="/contact"
          className="inline-block mt-2 px-5 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold"
        >
          Contact Customer Care
        </Link>
      </div>
    </div>
  );
}
