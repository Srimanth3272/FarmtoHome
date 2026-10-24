import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_FARMERS } from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    const where: any = {};
    if (state) {
      where.state = state;
    }

    const farmers = await prisma.farmerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        products: {
          take: 4,
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            unit: true,
            images: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (farmers && farmers.length > 0) {
      return NextResponse.json(farmers);
    }

    // Filter fallback farmers if state is provided
    let fallback = FALLBACK_FARMERS;
    if (state) {
      fallback = FALLBACK_FARMERS.filter((f) => f.state.toLowerCase() === state.toLowerCase());
    }
    return NextResponse.json(fallback.length > 0 ? fallback : FALLBACK_FARMERS);
  } catch (error) {
    console.warn('Error fetching farmers from database, returning fallback farmers:', error);
    return NextResponse.json(FALLBACK_FARMERS);
  }
}
