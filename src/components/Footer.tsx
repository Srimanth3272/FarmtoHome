'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Send, MapPin, Phone, Mail, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-forest-950 text-cream-100 pt-16 pb-12 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand Banner */}
        <div className="bg-forest-900/90 rounded-3xl p-8 sm:p-12 mb-16 border border-forest-800 shadow-elevated flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-harvest-400 text-forest-950 inline-block mb-3">
              Direct Farm Community
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Stay Connected to Seasonal Harvests & Organic Farming Guides
            </h3>
            <p className="text-forest-200 text-xs sm:text-sm mt-2">
              Receive weekly farm dispatch notifications, regional harvest calendar alerts, and verified natural farming techniques.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 text-harvest-300 font-semibold text-sm bg-forest-950 px-6 py-3.5 rounded-2xl border border-forest-800">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Thank you for subscribing to Farm to Home!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-forest-950 border border-forest-700 text-white placeholder-forest-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-harvest-400 flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shrink-0 shadow-soft"
                >
                  <span>Subscribe</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12 text-xs">
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <Logo variant="light" />
            <p className="mt-4 text-forest-300 text-xs leading-relaxed max-w-sm">
              Connecting Indian organic farmers directly with mindful consumers. Good food begins with good farming—harvested fresh and delivered with full Farm Passport traceability.
            </p>
            <div className="mt-6 space-y-2 text-forest-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-harvest-400 shrink-0" />
                <span>Kisan Bhavan, Agro-Tech Corridor, Bellandur, Bengaluru 560103</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-harvest-400 shrink-0" />
                <span>Helpline: +91 1800 200 4882 / +91 98450 11223</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-harvest-400 shrink-0" />
                <span>support@farmtohome.in</span>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Catalog */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white mb-4">Shop Products</h4>
            <ul className="space-y-2.5 text-forest-300">
              <li>
                <Link href="/categories/fresh-produce" className="hover:text-white transition-colors">
                  Fresh Produce & Fruits
                </Link>
              </li>
              <li>
                <Link href="/categories/seeds-and-planting" className="hover:text-white transition-colors">
                  Native Heirloom Seeds
                </Link>
              </li>
              <li>
                <Link href="/categories/organic-farming" className="hover:text-white transition-colors">
                  Pure Vermicompost & Manures
                </Link>
              </li>
              <li>
                <Link href="/categories/wood-and-materials" className="hover:text-white transition-colors">
                  Cocopeat & Farm Wood
                </Link>
              </li>
              <li>
                <Link href="/categories/gardening-tools" className="hover:text-white transition-colors">
                  UV Grow Bags & Terrace Kits
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors font-semibold text-harvest-300">
                  Browse All 100+ Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Unique Features */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white mb-4">Agri Innovations</h4>
            <ul className="space-y-2.5 text-forest-300">
              <li>
                <Link href="/farm-passport" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-harvest-400" />
                  <span>Farm Passport Traceability</span>
                </Link>
              </li>
              <li>
                <Link href="/harvest-calendar" className="hover:text-white transition-colors">
                  🌾 Indian Harvest Calendar
                </Link>
              </li>
              <li>
                <Link href="/waste-exchange" className="hover:text-white transition-colors">
                  ♻️ Farm Waste Exchange
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-white transition-colors">
                  🤖 Smart AI Farming Assistant
                </Link>
              </li>
              <li>
                <Link href="/farmers" className="hover:text-white transition-colors">
                  👨‍🌾 Meet Verified Farmers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  📖 Organic Farming Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Policies */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white mb-4">Trust & Seller Access</h4>
            <ul className="space-y-2.5 text-forest-300">
              <li>
                <Link href="/seller/register" className="text-harvest-400 font-bold hover:underline">
                  Join as Farmer / Seller
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping & Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Verification Seals & Compliances */}
        <div className="py-6 border-t border-forest-900/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-forest-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-forest-200">Standards & Compliance:</span>
            <span className="px-2.5 py-1 rounded bg-forest-900 border border-forest-800 text-forest-200">
              PGS-India Green Compliant
            </span>
            <span className="px-2.5 py-1 rounded bg-forest-900 border border-forest-800 text-forest-200">
              NPOP Organic Standard Compatible
            </span>
            <span className="px-2.5 py-1 rounded bg-forest-900 border border-forest-800 text-forest-200">
              100% Secure Indian UPI & Card Payments
            </span>
          </div>

          <p className="text-forest-400">
            © {new Date().getFullYear()} Farm to Home Technologies Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
