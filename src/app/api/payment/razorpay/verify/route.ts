import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
      farmerCommissionId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing Razorpay order or payment ID' }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || '',
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Razorpay payment signature verification failed' }, { status: 400 });
    }

    // 1. If linked to a customer order
    if (orderNumber) {
      const updatedOrder = await prisma.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: 'RAZORPAY',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Order payment verified successfully via Razorpay!',
        order: updatedOrder,
      });
    }

    // 2. If linked to farmer commission payment
    if (farmerCommissionId) {
      const commission = await prisma.commissionPayment.update({
        where: { id: farmerCommissionId },
        data: {
          status: 'COMPLETED',
          paymentMethod: 'RAZORPAY',
          transactionUtr: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Farmer commission payment verified successfully via Razorpay!',
        commission,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment signature verified successfully!',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ error: error?.message || 'Failed to verify Razorpay payment' }, { status: 500 });
  }
}
