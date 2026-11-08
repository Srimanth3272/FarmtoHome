import { NextResponse } from 'next/server';
import { updateServerProductApproval } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, action, remarks } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updated = await updateServerProductApproval(
      productId,
      action === 'REJECT' ? 'REJECT' : action === 'DEACTIVATE' ? 'DEACTIVATE' : 'APPROVE',
      remarks
    );

    const isApproved = action !== 'REJECT' && action !== 'DEACTIVATE';

    return NextResponse.json({
      success: true,
      message: `Product has been ${isApproved ? 'APPROVED & activated for sale' : 'REJECTED/DEACTIVATED'} by Admin.`,
      product: updated,
    });
  } catch (error: any) {
    console.error('Error approving product:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update product approval status' }, { status: 500 });
  }
}
