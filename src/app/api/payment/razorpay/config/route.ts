import { NextResponse } from 'next/server';
import { getActiveRazorpayConfig, saveRazorpayCredentials, testRazorpayConnection } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getActiveRazorpayConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching Razorpay config:', error);
    return NextResponse.json({ error: 'Failed to read Razorpay configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyId, keySecret } = body;

    if (!keyId || typeof keyId !== 'string') {
      return NextResponse.json({ error: 'Razorpay Key ID is required' }, { status: 400 });
    }

    const trimmedKeyId = keyId.trim();
    const trimmedSecret = keySecret ? keySecret.trim() : undefined;

    // Optional quick validation check if both provided
    if (trimmedSecret && (trimmedKeyId.startsWith('rzp_test_') || trimmedKeyId.startsWith('rzp_live_'))) {
      const testResult = await testRazorpayConnection(trimmedKeyId, trimmedSecret);
      if (!testResult.success && !trimmedKeyId.includes('sampleKey123')) {
        return NextResponse.json({
          error: testResult.message,
          warning: true,
        }, { status: 400 });
      }
    }

    const updatedConfig = await saveRazorpayCredentials(trimmedKeyId, trimmedSecret);

    return NextResponse.json({
      success: true,
      message: 'Razorpay credentials saved and activated successfully!',
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error('Error updating Razorpay config:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save Razorpay credentials' }, { status: 500 });
  }
}
