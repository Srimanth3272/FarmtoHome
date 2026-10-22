import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farmerId, action, remarks } = body;

    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer ID is required' }, { status: 400 });
    }

    const newStatus = action === 'REJECT' ? 'REJECTED' : 'VERIFIED';
    const isVerifiedBool = action !== 'REJECT';

    const farmer = await prisma.farmerProfile.update({
      where: { id: farmerId },
      data: {
        verificationStatus: newStatus,
        isOrganicCertified: isVerifiedBool,
      },
      include: {
        user: true,
      },
    });

    if (farmer.userId) {
      await prisma.user.update({
        where: { id: farmer.userId },
        data: {
          isVerified: isVerifiedBool,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Farmer profile has been ${newStatus.toLowerCase()} by Admin. ${
        newStatus === 'VERIFIED'
          ? 'The farmer can now list verified harvest products for sale.'
          : 'The farmer application has been marked as rejected.'
      }`,
      farmer,
    });
  } catch (error) {
    console.error('Error approving farmer:', error);
    return NextResponse.json({ error: 'Failed to update farmer status' }, { status: 500 });
  }
}
