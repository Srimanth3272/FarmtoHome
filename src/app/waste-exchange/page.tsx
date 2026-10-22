import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Recycle, MapPin, Tag, Phone, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { WasteExchangeClient } from './WasteExchangeClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface WasteExchangePageProps {
  searchParams: {
    materialType?: string;
    listingType?: string;
  };
}

export default async function WasteExchangePage({ searchParams }: WasteExchangePageProps) {
  const { materialType, listingType } = searchParams;

  const where: any = { status: 'AVAILABLE' };
  if (materialType && materialType !== 'ALL') where.materialType = materialType;
  if (listingType && listingType !== 'ALL') where.listingType = listingType;

  const listings = await prisma.wasteExchangeListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-950 via-earth-900 to-forest-900 text-white rounded-3xl p-8 sm:p-12 shadow-elevated border border-earth-700/60 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
            <Recycle className="w-4 h-4" />
            <span>Circular Agricultural Economy</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white">
            Farm Waste Exchange
          </h1>
          <p className="text-forest-100 text-xs sm:text-base leading-relaxed">
            Turn crop residues, stubble, coconut husks, and pruned orchard wood into valuable resources instead of burning them. Connect directly with farmers for sale, donation, or barter exchange.
          </p>
        </div>
      </div>

      {/* Interactive Marketplace Client */}
      <WasteExchangeClient
        initialListings={listings as any}
        currentMaterial={materialType || 'ALL'}
        currentListingType={listingType || 'ALL'}
      />
    </div>
  );
}
