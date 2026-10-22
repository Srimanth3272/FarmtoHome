import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { MapPin, Star, ShieldCheck, Sprout, Mail, Phone, Calendar, ArrowLeft, Award, CheckCircle2 } from 'lucide-react';
import { ContactFarmerButton } from './ContactFarmerButton';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface FarmerProfilePageProps {
  params: { id: string };
}

export default async function FarmerProfilePage({ params }: FarmerProfilePageProps) {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { name: true, avatar: true, email: true },
      },
      products: {
        where: { isActive: true },
        include: {
          category: true,
          farmer: {
            include: {
              user: { select: { name: true, avatar: true } },
            },
          },
          farmPassport: true,
        },
      },
      harvestListings: true,
    },
  });

  if (!farmer) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/farmers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Farmers</span>
        </Link>
      </div>

      {/* Hero Farm Header */}
      <div className="relative rounded-3xl overflow-hidden bg-forest-950 text-white shadow-elevated border border-forest-800">
        <div className="relative h-64 sm:h-80 w-full">
          <Image
            src={farmer.bannerImage || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80'}
            alt={farmer.farmName}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-10 -mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-forest-950 shadow-2xl bg-white shrink-0">
              <Image
                src={farmer.profileImage || farmer.user.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'}
                alt={farmer.user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-harvest-400 text-forest-950">
                  {farmer.verificationStatus} PRODUCER
                </span>
                <span className="text-xs text-forest-200">
                  {farmer.farmSizeAcres || 10} Acres Landholding
                </span>
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-4xl text-white">
                {farmer.farmName}
              </h1>
              <p className="text-xs sm:text-sm text-forest-200">
                Managed by <strong>{farmer.user.name}</strong> • {farmer.district}, {farmer.state}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <ContactFarmerButton farmerName={farmer.user.name} farmName={farmer.farmName} />
          </div>
        </div>
      </div>

      {/* Grid: Story & Verification Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-4">
            <h2 className="font-serif font-bold text-xl text-forest-950">
              The Farm Story & Ecological Philosophy
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {farmer.story}
            </p>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="font-serif font-bold text-sm text-forest-950">
                Farming Systems & Natural Inputs
              </h3>
              <p className="text-xs text-gray-600 bg-forest-50 p-4 rounded-2xl border border-forest-100 leading-relaxed">
                {farmer.farmingMethods}
              </p>
            </div>
          </div>

          {/* Products Listed by this Farmer */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-2xl text-forest-950">
                Fresh Harvests & Supplies from this Farm ({farmer.products.length})
              </h3>
            </div>

            {farmer.products.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No active products listed currently.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {farmer.products.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Accreditation and Metrics */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest-700" />
              <span>Verification Records</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100">
                <span className="text-gray-600">Experience:</span>
                <strong className="text-forest-900">{farmer.experienceYears} Years</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100">
                <span className="text-gray-600">Organic Certification:</span>
                <strong className="text-forest-900">
                  {farmer.isOrganicCertified ? 'Certified Organic' : 'Natural SPNF'}
                </strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100">
                <span className="text-gray-600">Accreditation:</span>
                <strong className="text-forest-900 truncate max-w-[150px]">
                  {farmer.certifications || 'PGS-India Green'}
                </strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100">
                <span className="text-gray-600">Farmer Rating:</span>
                <strong className="text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{farmer.rating.toFixed(1)} / 5.0</span>
                </strong>
              </div>
            </div>
          </div>

          {/* Upcoming Harvest Calendar from this Farmer */}
          {farmer.harvestListings.length > 0 && (
            <div className="bg-forest-900 text-white p-6 rounded-3xl shadow-card space-y-3">
              <span className="text-[10px] uppercase font-bold text-harvest-400 tracking-wider">
                Upcoming Crop Cycle
              </span>
              <h4 className="font-serif font-bold text-base text-white">
                Upcoming Harvest Schedules
              </h4>
              <div className="space-y-2 pt-2">
                {farmer.harvestListings.map((h) => (
                  <div key={h.id} className="p-3 rounded-2xl bg-forest-950/70 border border-forest-800 text-xs">
                    <p className="font-bold text-harvest-300">{h.cropName}</p>
                    <p className="text-[11px] text-forest-200 mt-0.5">
                      Expected: {h.expectedHarvestDate} ({h.expectedQuantity})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
