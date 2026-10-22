import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'PIN code is required' }, { status: 400 });
    }

    const pinRecord = await prisma.pinCodeDelivery.findUnique({
      where: { pincode: code },
    });

    if (pinRecord) {
      return NextResponse.json({
        deliverable: pinRecord.isDeliverable,
        district: pinRecord.district,
        state: pinRecord.state,
        estimatedDays: pinRecord.estimatedDays,
        standardRate: pinRecord.standardRate,
        message: `Express Farm Delivery available to ${pinRecord.district}, ${pinRecord.state} (Estimated ${pinRecord.estimatedDays} day${pinRecord.estimatedDays > 1 ? 's' : ''}).`,
      });
    }

    // Default nationwide coverage
    return NextResponse.json({
      deliverable: true,
      district: 'Regional Delivery Zone',
      state: 'India',
      estimatedDays: 3,
      standardRate: 40.0,
      message: 'Deliverable via India Post / Surface Agri Logistics (2-3 days).',
    });
  } catch (error) {
    console.error('Error checking pincode:', error);
    return NextResponse.json({ error: 'Failed to verify PIN code' }, { status: 500 });
  }
}
