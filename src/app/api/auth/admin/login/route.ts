import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const identifier = (body.username || body.email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Admin access strictly restricted ONLY to owner Sreemanth Nagalakunta
    const isOwner =
      identifier === 'sreemanthnagalakunta@gmail.com' ||
      identifier === 'srimanth3272';

    const isPasswordValid = cleanPassword === 'Srimanth@3272';

    if (!isOwner || !isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials. Super Admin access is strictly restricted to platform owner.' },
        { status: 401 }
      );
    }

    let adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'sreemanthnagalakunta@gmail.com' },
          { email: 'srimanth3272@farmtohome.in' },
        ],
      },
    }).catch(() => null);

    const sessionData = {
      id: adminUser?.id || 'admin-sreemanth',
      name: 'Sreemanth Nagalakunta (Super Admin)',
      email: 'sreemanthnagalakunta@gmail.com',
      role: 'ADMIN',
      phone: '9347405899',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      provider: 'email',
    };

    return NextResponse.json({
      success: true,
      message: 'Super Admin authenticated successfully',
      user: sessionData,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: error?.message || 'Authentication error' }, { status: 500 });
  }
}
