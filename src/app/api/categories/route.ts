import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_CATEGORIES } from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json(categories.length > 0 ? categories : FALLBACK_CATEGORIES);
  } catch (error) {
    console.warn('Error fetching categories from database, returning fallback categories:', error);
    return NextResponse.json(FALLBACK_CATEGORIES);
  }
}
