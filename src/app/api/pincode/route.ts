import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findDistrictByPincode, isAndhraPradeshPincode } from '@/lib/andhra-pradesh-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'PIN code is required' }, { status: 400 });
    }

    const trimmedCode = code.trim();

    // 1. Check database for explicit custom rate/delivery records
    try {
      const pinRecord = await prisma.pinCodeDelivery.findUnique({
        where: { pincode: trimmedCode },
      });

      if (pinRecord) {
        const isAP = pinRecord.state.toLowerCase().includes('andhra');
        return NextResponse.json({
          deliverable: pinRecord.isDeliverable,
          district: pinRecord.district,
          state: pinRecord.state,
          isAndhraPradesh: isAP,
          estimatedDays: pinRecord.estimatedDays,
          standardRate: pinRecord.standardRate,
          message: isAP
            ? `⚡ In-State Andhra Pradesh Direct Farm Delivery to ${pinRecord.district} (Est. ${pinRecord.estimatedDays} day${pinRecord.estimatedDays > 1 ? 's' : ''}).`
            : `Express Farm Delivery available to ${pinRecord.district}, ${pinRecord.state} (Estimated ${pinRecord.estimatedDays} day${pinRecord.estimatedDays > 1 ? 's' : ''}).`,
        });
      }
    } catch (dbErr) {
      console.warn('DB lookup skipped for pincode, continuing with static registry:', dbErr);
    }

    // 2. Check Andhra Pradesh in-state logistics network
    if (isAndhraPradeshPincode(trimmedCode)) {
      const apDistrict = findDistrictByPincode(trimmedCode);
      if (apDistrict) {
        const estDays = apDistrict.deliveryType === 'SAME_DAY' ? 1 : apDistrict.deliveryType === 'NEXT_DAY' ? 1 : 2;
        return NextResponse.json({
          deliverable: true,
          isAndhraPradesh: true,
          district: apDistrict.name,
          state: 'Andhra Pradesh',
          headquarters: apDistrict.headquarters,
          estimatedDays: estDays,
          estimatedDeliveryHours: apDistrict.estimatedDeliveryHours,
          standardRate: apDistrict.deliveryFee,
          hubName: apDistrict.hubName,
          message: `⚡ In-State Andhra Pradesh Express Delivery available to ${apDistrict.name}. Transit Window: ${apDistrict.estimatedDeliveryHours} from ${apDistrict.hubName}.`,
        });
      }
    }

    // 3. Known metro hubs fallback
    const knownPins: Record<string, { district: string; state: string; days: number; rate: number }> = {
      '560103': { district: 'Bengaluru Urban', state: 'Karnataka', days: 1, rate: 40.0 },
      '560001': { district: 'Bengaluru Urban', state: 'Karnataka', days: 1, rate: 40.0 },
      '500081': { district: 'Hyderabad', state: 'Telangana', days: 2, rate: 40.0 },
      '110001': { district: 'New Delhi', state: 'Delhi', days: 3, rate: 60.0 },
      '400001': { district: 'Mumbai', state: 'Maharashtra', days: 2, rate: 50.0 },
      '600001': { district: 'Chennai', state: 'Tamil Nadu', days: 2, rate: 45.0 },
      '388540': { district: 'Anand', state: 'Gujarat', days: 2, rate: 40.0 },
      '148028': { district: 'Sangrur', state: 'Punjab', days: 3, rate: 60.0 },
    };

    const matched = knownPins[trimmedCode];
    if (matched) {
      return NextResponse.json({
        deliverable: true,
        district: matched.district,
        state: matched.state,
        isAndhraPradesh: false,
        estimatedDays: matched.days,
        standardRate: matched.rate,
        message: `Delivery available to ${matched.district}, ${matched.state} (Estimated in ${matched.days} day(s)). Note: In-state Andhra Pradesh orders receive direct fresh farm dispatch.`,
      });
    }

    // 4. Default nationwide delivery
    return NextResponse.json({
      deliverable: true,
      district: 'Regional Delivery Hub',
      state: 'India',
      isAndhraPradesh: false,
      estimatedDays: 3,
      standardRate: 40.0,
      message: 'Deliverable via India Post / Surface Agri Logistics (2-3 days). Note: For direct fresh farm harvest dispatch, choose an Andhra Pradesh address.',
    });
  } catch (error) {
    console.error('Error checking pincode:', error);
    return NextResponse.json({ error: 'Failed to verify PIN code' }, { status: 500 });
  }
}
