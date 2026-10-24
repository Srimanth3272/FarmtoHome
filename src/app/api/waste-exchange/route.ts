import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_WASTE_LISTINGS } from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const materialType = searchParams.get('materialType');
    const listingType = searchParams.get('listingType');

    const where: any = { status: 'AVAILABLE' };
    if (materialType) where.materialType = materialType;
    if (listingType) where.listingType = listingType;

    const listings = await prisma.wasteExchangeListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { name: true, phone: true },
        },
      },
    });

    if (listings && listings.length > 0) {
      return NextResponse.json(listings);
    }

    let fallback = FALLBACK_WASTE_LISTINGS;
    if (materialType) {
      fallback = fallback.filter((w) => w.materialType.toLowerCase() === materialType.toLowerCase());
    }
    if (listingType) {
      fallback = fallback.filter((w) => w.listingType.toLowerCase() === listingType.toLowerCase());
    }
    return NextResponse.json(fallback.length > 0 ? fallback : FALLBACK_WASTE_LISTINGS);
  } catch (error) {
    console.warn('Error fetching waste listings from database, returning fallback data:', error);
    return NextResponse.json(FALLBACK_WASTE_LISTINGS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sellerId,
      sellerName,
      sellerPhone,
      title,
      description,
      materialType,
      quantity,
      listingType,
      price,
      state,
      district,
      pincode,
      collectionTerms,
      image,
    } = body;

    let validSellerId = sellerId;
    if (!validSellerId || validSellerId.startsWith('demo-')) {
      const firstFarmer = await prisma.user.findFirst({ where: { role: 'FARMER' } });
      validSellerId = firstFarmer ? firstFarmer.id : (await prisma.user.findFirst())?.id;
    }

    const listing = await prisma.wasteExchangeListing.create({
      data: {
        sellerId: validSellerId || 'demo-seller-1',
        sellerName: sellerName || 'Farm Producer',
        sellerPhone: sellerPhone || '+91 98450 11223',
        title,
        description,
        materialType: materialType || 'CROP_RESIDUE',
        quantity,
        listingType: listingType || 'SALE',
        price: price ? parseFloat(price) : null,
        state,
        district,
        pincode: pincode || '560103',
        collectionTerms: collectionTerms || 'Farm gate pickup',
        image: image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Error creating waste listing:', error);
    return NextResponse.json({ error: 'Failed to create waste exchange listing' }, { status: 500 });
  }
}
