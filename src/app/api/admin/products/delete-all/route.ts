import { NextResponse } from 'next/server';
import { deleteAllServerProducts } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const count = await deleteAllServerProducts();
    return NextResponse.json({
      success: true,
      message: `All ${count} products permanently purged from storefront, catalog, and database.`,
      deletedCount: count,
    });
  } catch (error: any) {
    console.error('Error deleting all products:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete all products' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  return POST(request);
}
