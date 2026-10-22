import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      farmerName,
      email,
      phone,
      aadharNumber,
      farmName,
      state,
      district,
      village,
      pincode,
      farmSizeAcres,
      experienceYears,
      farmingMethods,
      certifications,
      story,
      idProofDoc,
    } = body;

    // Strict validation for required fields
    if (!farmerName || !email || !phone || !aadharNumber || !farmName || !state || !district) {
      return NextResponse.json(
        {
          error:
            'Missing mandatory information: Farmer Name, Email, Phone Number, Aadhaar Number, Farm Name, State, and District are required.',
        },
        { status: 400 }
      );
    }

    // Clean Aadhaar format (must have 12 digits)
    const cleanAadhaar = aadharNumber.replace(/[^0-9]/g, '');
    if (cleanAadhaar.length !== 12) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number. Must contain exactly 12 digits (e.g. 1234-5678-9012).' },
        { status: 400 }
      );
    }
    const formattedAadhaar = `${cleanAadhaar.slice(0, 4)}-${cleanAadhaar.slice(4, 8)}-${cleanAadhaar.slice(8, 12)}`;

    // Clean Phone format (must have 10 digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must contain a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5, 10)}`;

    // Check if user already exists with email
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('Farmer@123', 10);
      user = await prisma.user.create({
        data: {
          name: farmerName,
          email: email.toLowerCase().trim(),
          phone: formattedPhone,
          password: hashedPassword,
          role: 'FARMER',
          isVerified: false, // Verification pending admin approval
          avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
        },
      });
    }

    // Check if farmer profile already exists for this user
    let profile = await prisma.farmerProfile.findUnique({
      where: { userId: user.id },
    });

    if (profile) {
      // Update profile
      profile = await prisma.farmerProfile.update({
        where: { id: profile.id },
        data: {
          farmName,
          story: story || 'Committed to chemical-free sustainable agriculture and soil health regeneration.',
          experienceYears: parseInt(experienceYears, 10) || 5,
          state,
          district,
          village: village || null,
          pincode: pincode || '500001',
          farmSizeAcres: parseFloat(farmSizeAcres) || 5.0,
          farmingMethods: farmingMethods || 'Natural Farming, Jeevamrutha, Crop Mulch',
          certifications: certifications || 'Self-Declared Chemical-Free Natural Farm',
          aadharNumber: formattedAadhaar,
          phone: formattedPhone,
          email: email.toLowerCase().trim(),
          idProofDoc: idProofDoc || 'aadhaar_card_uploaded.pdf',
          verificationStatus: 'PENDING', // Awaiting Admin Approval!
          commissionRate: 5.0,           // 5% platform commission
        },
      });
    } else {
      // Create new profile
      profile = await prisma.farmerProfile.create({
        data: {
          userId: user.id,
          farmName,
          story: story || 'Committed to chemical-free sustainable agriculture and soil health regeneration.',
          experienceYears: parseInt(experienceYears, 10) || 5,
          state,
          district,
          village: village || null,
          pincode: pincode || '500001',
          farmSizeAcres: parseFloat(farmSizeAcres) || 5.0,
          farmingMethods: farmingMethods || 'Natural Farming, Jeevamrutha, Crop Mulch',
          certifications: certifications || 'Self-Declared Chemical-Free Natural Farm',
          aadharNumber: formattedAadhaar,
          phone: formattedPhone,
          email: email.toLowerCase().trim(),
          idProofDoc: idProofDoc || 'aadhaar_card_uploaded.pdf',
          verificationStatus: 'PENDING', // Awaiting Admin Approval!
          commissionRate: 5.0,
          rating: 4.8,
          reviewsCount: 0,
          isOrganicCertified: false,
          profileImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Farmer registration submitted successfully! Your Aadhaar and farm details are now in the Admin Verification queue. Once accepted, your seller profile and products will proceed for sale.',
        farmer: profile,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering farmer:', error);
    return NextResponse.json({ error: 'Failed to process farmer registration' }, { status: 500 });
  }
}
