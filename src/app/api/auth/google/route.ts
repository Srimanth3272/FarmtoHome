import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential, email: directEmail, name: directName, picture: directPicture } = body;

    let email = directEmail;
    let name = directName;
    let picture = directPicture;
    let googleSub = '';

    // If Google JWT credential provided from Google Identity Services
    if (credential && typeof credential === 'string') {
      const payload = decodeJwtPayload(credential);
      if (payload) {
        email = payload.email || email;
        name = payload.name || name;
        picture = payload.picture || picture;
        googleSub = payload.sub || '';
      }
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid Google email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name && typeof name === 'string' && name.trim()) ? name.trim() : cleanEmail.split('@')[0];
    const avatarUrl = picture || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`;

    // Upsert or locate user in Prisma database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(`google-oauth-${Date.now()}-${cleanEmail}`, 10);
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          password: dummyPassword,
          role: 'CUSTOMER',
          avatar: avatarUrl,
          isVerified: true,
        },
      });
    } else if (picture && user.avatar !== picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
      });
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      phone: user.phone || '',
      provider: 'google',
      googleSub: googleSub || undefined,
    };

    return NextResponse.json({
      success: true,
      message: 'Google authentication successful',
      user: sessionData,
    });
  } catch (error: any) {
    console.error('Google Auth error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to authenticate with Google' }, { status: 500 });
  }
}
