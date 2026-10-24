import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_HARVEST_LISTINGS } from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const state = searchParams.get('state');

    const where: any = {};
    if (season) where.season = season;
    if (state) where.state = state;

    const listings = await prisma.harvestListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    });

    if (listings && listings.length > 0) {
      return NextResponse.json(listings);
    }

    let fallback = FALLBACK_HARVEST_LISTINGS;
    if (season) {
      fallback = fallback.filter((h) => h.season.toLowerCase() === season.toLowerCase());
    }
    if (state) {
      fallback = fallback.filter((h) => h.state.toLowerCase() === state.toLowerCase());
    }
    return NextResponse.json(fallback.length > 0 ? fallback : FALLBACK_HARVEST_LISTINGS);
  } catch (error) {
    console.warn('Error fetching harvest listings from database, returning fallback data:', error);
    return NextResponse.json(FALLBACK_HARVEST_LISTINGS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      farmerId,
      cropName,
      category,
      expectedHarvestDate,
      expectedQuantity,
      state,
      district,
      preOrderAvailable,
      preOrderPrice,
      unit,
      description,
      image,
      season,
    } = body;

    let validFarmerId = farmerId;
    if (!validFarmerId || validFarmerId.startsWith('demo-')) {
      const firstFarmer = await prisma.farmerProfile.findFirst();
      validFarmerId = firstFarmer?.id;
    }

    const listing = await prisma.harvestListing.create({
      data: {
        farmerId: validFarmerId || 'farmer-profile-1',
        cropName,
        category,
        expectedHarvestDate,
        expectedQuantity,
        state,
        district,
        preOrderAvailable: Boolean(preOrderAvailable),
        preOrderPrice: preOrderPrice ? parseFloat(preOrderPrice) : null,
        unit: unit || '1 kg',
        description,
        image: image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
        season: season || 'Kharif',
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Error creating harvest listing:', error);
    return NextResponse.json({ error: 'Failed to create harvest listing' }, { status: 500 });
  }
}
