import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    return NextResponse.json({ error: 'Failed to fetch farmers' }, { status: 500 });
  }
}
