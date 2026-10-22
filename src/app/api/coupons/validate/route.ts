import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired coupon code' }, { status: 404 });
    }

    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderAmount} required for ${coupon.code}`,
      });
    }

    const calculatedDiscount = Math.min(
      Math.round((subtotal * coupon.discountPercent) / 100),
      coupon.discountMaxAmount
    );

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: calculatedDiscount,
      message: `Coupon ${coupon.code} applied! Saved ₹${calculatedDiscount}`,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ valid: false, message: 'Error checking coupon' }, { status: 500 });
  }
}
