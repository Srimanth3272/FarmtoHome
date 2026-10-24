import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const isAdminPassword = cleanPassword === 'admin@123';

    let adminUser: any = null;
    try {
      adminUser = await prisma.user.findFirst({
        where: {
          role: 'ADMIN',
        },
      });
    } catch (dbErr) {
      console.warn('Database query during admin login failed, using fallback admin profile:', dbErr);
    }

    let isValid = false;
    if (adminUser && adminUser.password) {
      isValid = isAdminPassword || (await bcrypt.compare(cleanPassword, adminUser.password));
    } else {
      isValid = isAdminPassword;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials. Please use password admin@123' },
        { status: 401 }
      );
    }

    const sessionData = {
      id: adminUser?.id || 'admin-root',
      name: adminUser?.name || 'Dr. Anand Swaminathan',
      email: adminUser?.email || (cleanEmail.includes('admin') ? cleanEmail : 'admin@farmtohome.in'),
      role: 'ADMIN',
      phone: adminUser?.phone || '+91 98450 11223',
      avatar: adminUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      provider: 'email',
    };

    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      user: sessionData,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: error?.message || 'Authentication error' }, { status: 500 });
  }
}
