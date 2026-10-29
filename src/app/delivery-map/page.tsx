import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  MapPin,
  Truck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Phone,
  Building,
  Leaf,
  Navigation
} from 'lucide-react';
import { AndhraPradeshDeliveryMap } from '@/components/AndhraPradeshDeliveryMap';
import { ANDHRA_PRADESH_DISTRICTS, AP_NETWORK_STATS } from '@/lib/andhra-pradesh-data';

export const metadata: Metadata = {
  title: 'Andhra Pradesh Delivery Network & Hub Map | Farm to Home',
  description:
    'Explore our direct farm delivery network across all 26 districts of Andhra Pradesh. Express same-day and 24-hour temperature-controlled dispatches from Amaravati and regional hubs.',
};

export default function DeliveryMapPage() {
  return (
    <div className="bg-cream-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Breadcrumb & Hero */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-forest-700">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="font-bold text-forest-950">Andhra Pradesh Delivery Network</span>
          </div>

          <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white border border-forest-800 shadow-elevated relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Statewide In-State Delivery Network</span>
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
                Delivering Farm-Fresh Directly Across Andhra Pradesh
              </h1>

              <p className="text-forest-200 text-xs sm:text-sm md:text-base leading-relaxed">
                We operate a state-of-the-art cold-chain delivery corridor connecting our partner organic farmers directly with doorsteps in all 26 districts of Andhra Pradesh. From Krishna delta paddy to Araku organic coffee and Guntur spice farms.
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-forest-800/80">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <span className="text-harvest-300 font-extrabold text-2xl sm:text-3xl">26/26</span>
                  <p className="text-forest-200 text-xs font-semibold mt-0.5">AP Districts Covered</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <span className="text-emerald-300 font-extrabold text-2xl sm:text-3xl">4-8 hrs</span>
                  <p className="text-forest-200 text-xs font-semibold mt-0.5">Same-Day Hub Window</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <span className="text-harvest-300 font-extrabold text-2xl sm:text-3xl">4,700+</span>
                  <p className="text-forest-200 text-xs font-semibold mt-0.5">AP Organic Farmers</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <span className="text-white font-extrabold text-2xl sm:text-3xl">100%</span>
                  <p className="text-forest-200 text-xs font-semibold mt-0.5">In-State Cold Chain</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Delivery Map Component */}
        <div>
          <AndhraPradeshDeliveryMap />
        </div>

        {/* 4-Step In-State Cold Chain Process */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              Farm-To-Home Pipeline
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-forest-950">
              How Your Fresh Delivery Moves Across Andhra Pradesh
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Zero storage, zero artificial ripening, and complete temperature regulation from harvest to your dining table.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: '5:00 AM Dawn Harvest',
                desc: 'Produce, leafy greens, and cold-pressed oils are harvested directly at registered AP farms at dawn.',
                badge: 'Fresh Harvest',
              },
              {
                step: '02',
                title: 'Amaravati Central Hub',
                desc: 'Consolidation at Vijayawada Central Cold-Chain Depot for grading, weighing, and Farm Passport QR tagging.',
                badge: 'Quality Graded',
              },
              {
                step: '03',
                title: 'Temperature EV Transit',
                desc: 'Temperature-controlled logistics vans cruise NH-16 and state highways to regional dispatch centers.',
                badge: 'Express Vans',
              },
              {
                step: '04',
                title: 'Doorstep Delivery',
                desc: 'Delivered in your preferred morning or evening slot with live delivery SMS tracking and invoice.',
                badge: 'Doorstep AP',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-cream-50/70 border border-cream-200 hover:border-forest-400 transition-all space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-forest-800/30">{item.step}</span>
                  <span className="px-2 py-0.5 rounded-md bg-forest-100 text-forest-900 text-[10px] font-bold">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-forest-950">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Directory of all 26 AP Districts */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
            <div>
              <h2 className="font-serif font-bold text-2xl text-forest-950">
                All 26 Andhra Pradesh Districts Delivery Schedule
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Click any district to view supported PIN codes, delivery cutoff times, and famous regional harvests.
              </p>
            </div>
            <Link
              href="/customer"
              className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start sm:self-center shrink-0"
            >
              <span>Order To Your District</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ANDHRA_PRADESH_DISTRICTS.map((district) => (
              <div
                key={district.id}
                className="p-4 rounded-2xl border border-cream-200 bg-cream-50/40 hover:bg-white hover:border-forest-600 hover:shadow-soft transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      {district.name}
                    </h3>
                    <p className="text-xs font-serif text-forest-700">{district.teluguName}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      district.deliveryType === 'SAME_DAY'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : district.deliveryType === 'NEXT_DAY'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {district.deliveryType === 'SAME_DAY'
                      ? '⚡ Same-Day'
                      : district.deliveryType === 'NEXT_DAY'
                      ? '🚚 Next-Day'
                      : '📦 24h Express'}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span><strong>HQ:</strong> {district.headquarters} ({district.region})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span><strong>Transit Window:</strong> {district.estimatedDeliveryHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span><strong>Rate:</strong> ₹{district.deliveryFee} (Free above ₹499)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-cream-200">
                  <span className="text-[10px] text-gray-500 font-semibold block mb-1">Key Local Farm Produce:</span>
                  <div className="flex flex-wrap gap-1">
                    {district.famousProduce.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-harvest-100 text-harvest-950 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-mono">PIN: {district.samplePins.slice(0, 3).join(', ')}...</span>
                  <Link
                    href={`/checkout?state=Andhra+Pradesh&city=${encodeURIComponent(district.headquarters)}&pincode=${district.primaryPin}`}
                    className="text-forest-800 font-bold hover:underline"
                  >
                    Ship Here →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Andhra Pradesh Agri Helpline Banner */}
        <div className="bg-forest-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-forest-800">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Need Delivery Assistance in Rural or Mandal Locations?
            </h3>
            <p className="text-forest-200 text-xs sm:text-sm max-w-xl">
              Our Andhra Pradesh dispatch coordination desk in Vijayawada can arrange tractor, tempo, or village milk collection center pickups for bulk agri supplies, manure, and seedlings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="tel:+9118002004882"
              className="px-5 py-3 rounded-2xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-soft"
            >
              <Phone className="w-4 h-4" />
              <span>Call AP Helpdesk</span>
            </a>
            <Link
              href="/shop"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
