import { NextResponse } from 'next/server';
import { testRazorpayConnection, getRazorpayCredentialsInternal } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { keyId, keySecret } = body;

    // If not provided in request body, use currently active credentials
    if (!keyId || !keySecret) {
      const active = getRazorpayCredentialsInternal();
      keyId = keyId || active.keyId;
      keySecret = keySecret || active.keySecret;
    }

    if (!keyId || !keySecret) {
      return NextResponse.json({
        success: false,
        message: 'Please provide both Razorpay Key ID and Key Secret to test connection.',
      }, { status: 400 });
    }

    const result = await testRazorpayConnection(keyId, keySecret);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('Error testing Razorpay connection:', error);
    return NextResponse.json({
      success: false,
      message: error?.message || 'Error communicating with Razorpay servers',
    }, { status: 500 });
  }
}
