import { NextResponse } from 'next/server';
import { deleteServerProduct } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required for deletion' }, { status: 400 });
    }

    const success = await deleteServerProduct(productId);

    return NextResponse.json({
      success: true,
      message: `Product ${productId} has been permanently removed from the platform and store catalog.`,
    });
  } catch (error: any) {
    console.error('Error deleting product via admin:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  return POST(request);
}
