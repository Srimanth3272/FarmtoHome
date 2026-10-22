import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Calendar, MapPin, Sparkles, Clock, CheckCircle2, ArrowRight, Filter } from 'lucide-react';
import { HarvestCalendarClient } from './HarvestCalendarClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface HarvestCalendarPageProps {
  searchParams: {
    season?: string;
    state?: string;
  };
}

export default async function HarvestCalendarPage({ searchParams }: HarvestCalendarPageProps) {
  const { season, state } = searchParams;

  const where: any = {};
  if (season && season !== 'ALL') where.season = season;
  if (state && state !== 'ALL') where.state = state;

  const listings = await prisma.harvestListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      farmer: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-950 via-harvest-900 to-forest-950 text-white rounded-3xl p-8 sm:p-12 shadow-elevated border border-harvest-700/60 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
            <Calendar className="w-4 h-4" />
            <span>Indian Agricultural Harvest Schedules</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white">
            Seasonal Harvest Calendar
          </h1>
          <p className="text-harvest-100 text-xs sm:text-base leading-relaxed">
            Follow the natural rhythm of Indian farming across Kharif (monsoon), Rabi (winter), and Zaid (summer) seasons. Pre-order direct from farmers before harvest to secure the season's freshest crops.
          </p>
        </div>
      </div>

      {/* Interactive Seasons and Listings */}
      <HarvestCalendarClient
        initialListings={listings as any}
        currentSeason={season || 'ALL'}
        currentState={state || 'ALL'}
      />
    </div>
  );
}
