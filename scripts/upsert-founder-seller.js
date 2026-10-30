const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'sreemanthnagalakunta@gmail.com';
  const rawPassword = 'Srimanth@3272';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  console.log(`Upserting founder seller account for: ${email}`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: 'Sreemanth Nagalakunta',
      role: 'FARMER',
      isVerified: true,
      phone: '+91 98480 12345',
    },
    create: {
      id: 'user-sreemanth-founder',
      name: 'Sreemanth Nagalakunta',
      email,
      password: hashedPassword,
      phone: '+91 98480 12345',
      role: 'FARMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  console.log('User created/updated in SQLite:', user.id, user.email, user.role);

  // Check if FarmerProfile exists
  const existingProfile = await prisma.farmerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!existingProfile) {
    await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        farmName: "Sreemanth's Certified Organic Farm & Store",
        story: 'Pioneering organic cultivation, sustainable desi seed preservation, and direct farm-to-table supply across Andhra Pradesh.',
        experienceYears: 10,
        state: 'Andhra Pradesh',
        district: 'NTR (Vijayawada)',
        village: 'Benz Circle Hub',
        pincode: '520001',
        farmSizeAcres: 12.5,
        farmingMethods: 'Natural Farming, ZBNF, Desi Cow Jivamrutha, Neemastra Pest Management',
        certifications: 'PGS-India Green Certified, AP Organic Mission Verified',
        verificationStatus: 'VERIFIED',
        isOrganicCertified: true,
        commissionRate: 0.0, // 0% platform commission for founder
        rating: 5.0,
        reviewsCount: 24,
      },
    });
    console.log('FarmerProfile created for founder seller!');
  } else {
    await prisma.farmerProfile.update({
      where: { userId: user.id },
      data: {
        verificationStatus: 'VERIFIED',
        isOrganicCertified: true,
        commissionRate: 0.0,
      },
    });
    console.log('FarmerProfile verified for founder seller!');
  }

  console.log('Success! sreemanthnagalakunta@gmail.com is now a verified seller in the database.');
}

main()
  .catch((e) => {
    console.error('Error adding user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
