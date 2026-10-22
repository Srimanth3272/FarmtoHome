import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching waste listings:', error);
    return NextResponse.json({ error: 'Failed to fetch waste listings' }, { status: 500 });
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
        sellerId: validSellerId,
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
