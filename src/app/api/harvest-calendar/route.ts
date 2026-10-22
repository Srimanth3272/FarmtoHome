import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching harvest listings:', error);
    return NextResponse.json({ error: 'Failed to fetch harvest calendar' }, { status: 500 });
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

    const listing = await prisma.harvestListing.create({
      data: {
        farmerId,
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
