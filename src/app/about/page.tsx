import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, ShieldCheck, Heart, Users, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-harvest-400 text-forest-950 inline-block">
          Our Farming Mission
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-forest-950 leading-tight">
          Restoring the Direct Bond Between Farmer and Consumer.
        </h1>
        <p className="text-xs sm:text-base text-gray-600 leading-relaxed">
          Farm to Home was born from a simple conviction: <strong>Good food begins with good farming</strong>. We connect verified natural cultivators across India directly with urban families who value authentic, unadulterated, chemical-free food.
        </p>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-elevated border border-cream-300">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&auto=format&fit=crop&q=80"
          alt="Natural farming fields in India"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-forest-950">
            Zero Chemical Compromise
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            All produce, seeds, and soil manures are sourced strictly from farms adhering to Subhash Palekar Natural Farming (SPNF), cow-based Jivamrutha, or verified organic practices without synthetic neurotoxins.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-forest-950">
            Farm Passport Traceability
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            We reject anonymous food. Every batch comes with a digital Farm Passport linking directly to the farmer who cultivated it, their soil health, water source, and residue test results.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-forest-950">
            Fair Rural Prosperity
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Traditional mandis strip up to 65% of the crop price in commission and spoilage. We settle payments directly with farmers within 48 hours of harvest at fair farm-gate prices.
          </p>
        </div>
      </div>

      {/* Story Narrative */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-cream-300 shadow-card space-y-6 leading-relaxed text-xs sm:text-sm text-gray-700">
        <h2 className="font-serif font-black text-2xl text-forest-950">
          From Punjab Grains to Godavari Riverbeds & Kerala Spice Forests
        </h2>
        <p>
          In modern supermarkets, produce sits in cold storage for weeks before reaching kitchen counters—losing vital phytochemicals, vitamins, and the natural aroma of real earth. Farmers simultaneously struggle with high chemical input costs and predatory middlemen.
        </p>
        <p>
          Farm to Home re-imagines agriculture as a connected, regenerative ecosystem. When a customer in Bengaluru or Hyderabad places an order, participating farmers in Anand, Tanuku, or Sangrur harvest the crop at daybreak. Within hours, produce is sorted and packed in breathable, eco-friendly crates.
        </p>
        <p>
          Our platform also bridges the knowledge divide. The <strong>Farm to Home Knowledge Hub</strong> provides a home where traditional farmers can publish their generational knowledge on neem bio-shields, vermicomposting, and indigenous seed conservation for millions of new terrace gardeners.
        </p>
      </div>

      {/* Join Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-950 text-white p-8 sm:p-10 rounded-3xl shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
            Ready to experience fresh direct farm harvests?
          </h3>
          <p className="text-forest-200 text-xs mt-1">
            Browse 100% natural produce harvested and dispatched within 24 hours.
          </p>
        </div>
        <Link
          href="/shop"
          className="px-6 py-3 rounded-2xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs shadow-soft transition-colors shrink-0"
        >
          Explore Store
        </Link>
      </div>
    </div>
  );
}
