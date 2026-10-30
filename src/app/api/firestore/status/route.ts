import { NextResponse } from 'next/server';
import { checkFirestoreStatus } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await checkFirestoreStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      {
        enabled: false,
        status: 'ERROR',
        message: error?.message || 'Failed checking Firestore status',
        fixUrl: 'https://console.firebase.google.com/project/farm-to-home-9ff91/firestore',
        projectId: 'farm-to-home-9ff91',
      },
      { status: 500 }
    );
  }
}
