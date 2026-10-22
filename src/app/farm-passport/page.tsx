import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, QrCode, Search, CheckCircle2, MapPin, Calendar, Award, Droplets, Sprout, ArrowRight, FileText } from 'lucide-react';

export const revalidate = 0;

interface FarmPassportPageProps {
  searchParams: {
    batch?: string;
  };
}

export default async function FarmPassportPage({ searchParams }: FarmPassportPageProps) {
  const { batch } = searchParams;

  const allPassports = await prisma.farmPassport.findMany({
    include: {
      product: {
        include: {
          category: true,
          farmer: {
            include: {
              user: { select: { name: true, avatar: true } },
            },
          },
        },
      },
    },
  });

  const selectedPassport = batch
    ? allPassports.find((p) => p.batchNumber.toLowerCase() === batch.toLowerCase()) || allPassports[0]
    : allPassports[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-8 sm:p-12 shadow-elevated border border-forest-700/60 relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Agricultural Traceability</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white">
            The Digital Farm Passport
          </h1>

          <p className="text-forest-100 text-xs sm:text-base leading-relaxed">
            Every harvest carries an open digital identity. Scan or enter any batch code on your delivery box to inspect verified farm origin, soil amendments, pesticide-free history, and accredited laboratory testing results.
          </p>

          {/* Batch Code Lookup Input */}
          <form method="GET" action="/farm-passport" className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                name="batch"
                defaultValue={batch || ''}
                placeholder="Enter Batch ID (e.g. F2H-2026-GJ-TOM-04)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-forest-950/80 border border-forest-700 text-white placeholder-forest-400 text-xs focus:outline-none focus:ring-2 focus:ring-harvest-400 uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 text-xs font-bold transition-colors shrink-0"
            >
              Verify Batch
            </button>
          </form>
        </div>
      </div>

      {/* Verified Batch Showcase */}
      {selectedPassport && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
          {/* Top Banner Header */}
          <div className="bg-forest-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-harvest-300 border border-white/20 shrink-0">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-harvest-400 block">
                  Active Verified Certificate
                </span>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
                  Batch: {selectedPassport.batchNumber}
                </h2>
                <p className="text-xs text-forest-200">
                  Product: {selectedPassport.product.name}
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-green-500/20 border border-green-400 text-green-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Identity & Origin Confirmed</span>
            </span>
          </div>

          {/* Passport Body Grid */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: Farmer & Farm */}
              <div className="p-5 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-3">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs uppercase tracking-wider">
                  <Sprout className="w-4 h-4 text-forest-700" />
                  <span>Grower & Land Origin</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-forest-950">
                    {selectedPassport.farmerName}
                  </h4>
                  <p className="text-xs text-forest-800 font-medium">
                    {selectedPassport.farmName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-earth-600" />
                    <span>{selectedPassport.location}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-cream-200 text-[11px] text-gray-600">
                  Soil Classification: <strong>{selectedPassport.soilType}</strong>
                </div>
              </div>

              {/* Box 2: Chemical-Free Timeline */}
              <div className="p-5 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-3">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-harvest-500" />
                  <span>Purity Status</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif font-black text-3xl text-forest-950">
                      {selectedPassport.chemicalFreeYears}+
                    </span>
                    <span className="text-xs text-forest-800 font-bold">Years Chemical Free</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Zero synthetic chemical fertilizers, herbicides, or synthetic ripening agents since transition.
                  </p>
                </div>
                <div className="pt-2 border-t border-cream-200 text-[11px] text-forest-800 font-semibold">
                  Standard: {selectedPassport.verificationBadge}
                </div>
              </div>

              {/* Box 3: Harvest & Water Source */}
              <div className="p-5 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-3">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Harvest & Hydration</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-forest-950">
                    {selectedPassport.harvestDate}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>Water: {selectedPassport.waterSource}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-cream-200 text-[11px] text-gray-600">
                  Traceability Audit: Fresh Farm Gate Batch
                </div>
              </div>
            </div>

            {/* Declared Natural Practices & Lab Testing */}
            <div className="p-6 rounded-2xl bg-forest-50 border border-forest-200 space-y-3">
              <h3 className="font-serif font-bold text-sm sm:text-base text-forest-950 flex items-center gap-2">
                <span>Declared Subhash Palekar / Organic Agricultural Practices</span>
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {selectedPassport.declaredPractices}
              </p>
              {selectedPassport.traceabilityNotes && (
                <p className="text-xs text-forest-800 bg-white p-3 rounded-xl border border-forest-200 font-medium">
                  🔬 <strong>Laboratory Residue Analysis:</strong> {selectedPassport.traceabilityNotes}
                </p>
              )}
            </div>

            {/* Action to Product */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Available in store for immediate dispatch.
              </span>
              <Link
                href={`/products/${selectedPassport.product.slug}`}
                className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>View Product Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Directory of All Tracked Batches */}
      <section className="space-y-6">
        <div>
          <h3 className="font-serif font-bold text-2xl text-forest-950">
            Browse All Active Traceability Passports
          </h3>
          <p className="text-xs text-gray-500">
            Click on any batch code below to view its full soil, water, and farmer credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPassports.map((pass) => (
            <Link
              key={pass.id}
              href={`/farm-passport?batch=${pass.batchNumber}`}
              className="bg-white p-5 rounded-2xl border border-cream-300 shadow-card hover:shadow-elevated transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg">
                  {pass.batchNumber}
                </span>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                  {pass.chemicalFreeYears}+ Yrs Pure
                </span>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-gray-900 group-hover:text-forest-700 transition-colors">
                  {pass.product.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Farmed by {pass.farmerName} • {pass.location}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-[11px] text-forest-800 font-semibold flex items-center justify-between">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
