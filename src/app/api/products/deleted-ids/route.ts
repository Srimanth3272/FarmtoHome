import { NextResponse } from 'next/server';
import { getDeletedProductIds } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deletedSet = getDeletedProductIds();
    return NextResponse.json(Array.from(deletedSet));
  } catch (err: any) {
    console.warn('Error reading deleted product IDs:', err);
    return NextResponse.json([]);
  }
}
