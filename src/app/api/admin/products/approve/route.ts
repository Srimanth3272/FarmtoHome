import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, action, remarks } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const isApproved = action !== 'REJECT';
    const approvalStatus = isApproved ? 'APPROVED' : 'REJECTED';

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        approvalStatus,
        isActive: isApproved, // Only active if approved!
        adminRemarks: remarks || (isApproved ? 'Approved by Admin Agronomist' : 'Rejected due to compliance review'),
      },
      include: {
        farmer: true,
        farmPassport: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Product ${product.name} has been ${approvalStatus.toLowerCase()} by Admin. ${
        isApproved
          ? 'It is now active and immediately available for sale in the public catalog.'
          : 'It has been deactivated from public sales.'
      }`,
      product,
    });
  } catch (error) {
    console.error('Error approving product:', error);
    return NextResponse.json({ error: 'Failed to update product approval status' }, { status: 500 });
  }
}
