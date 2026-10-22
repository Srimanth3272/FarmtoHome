import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, receipt, notes } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount in INR is required' }, { status: 400 });
    }

    const orderReceipt = receipt || `f2h_rcpt_${Date.now()}`;
    const result = await createRazorpayOrder({
      amountInRupees: amount,
      receipt: orderReceipt,
      notes: notes || {},
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create Razorpay order' }, { status: 500 });
  }
}
