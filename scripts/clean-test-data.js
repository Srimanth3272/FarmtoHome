const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('--- Cleaning all test data from Farm to Home ---');

  // 1. Delete all test operational records
  await prisma.commissionPayment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.farmPassport.deleteMany();
  await prisma.product.deleteMany();
  await prisma.harvestListing.deleteMany();
  await prisma.wasteExchangeListing.deleteMany();
  await prisma.blogComment.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.address.deleteMany();

  // Keep blog posts if needed, or reassign author to admin/founder
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@farmtohome.in' },
  });
  if (admin) {
    await prisma.blogPost.updateMany({
      data: { authorId: admin.id },
    });
  }

  // 2. Clean fake demo farmers (keep founder Sreemanth and admin)
  const nonFounderFarmers = await prisma.user.findMany({
    where: {
      email: {
        notIn: ['sreemanthnagalakunta@gmail.com', 'admin@farmtohome.in'],
      },
      role: 'FARMER',
    },
  });

  for (const u of nonFounderFarmers) {
    await prisma.farmerProfile.deleteMany({ where: { userId: u.id } });
    await prisma.blogPost.deleteMany({ where: { authorId: u.id } });
    await prisma.user.delete({ where: { id: u.id } }).catch(() => {});
  }

  // 3. Ensure Founder User exists
  const founderPassword = await bcrypt.hash('Srimanth@3272', 10);
  const founder = await prisma.user.upsert({
    where: { email: 'sreemanthnagalakunta@gmail.com' },
    update: {
      name: 'Sreemanth Nagalakunta',
      role: 'FARMER',
      isVerified: true,
      phone: '+91 98480 12345',
    },
    create: {
      id: 'user-sreemanth-founder',
      name: 'Sreemanth Nagalakunta',
      email: 'sreemanthnagalakunta@gmail.com',
      password: founderPassword,
      phone: '+91 98480 12345',
      role: 'FARMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  // Ensure Founder has a verified Farmer Profile
  await prisma.farmerProfile.upsert({
    where: { userId: founder.id },
    update: {
      farmName: "Sreemanth's Certified Organic Farm & Store",
      verificationStatus: 'VERIFIED',
      isOrganicCertified: true,
      experienceYears: 10,
      state: 'Andhra Pradesh',
      district: 'NTR (Vijayawada)',
      pincode: '520001',
      farmingMethods: 'Natural Farming, ZBNF, Desi Cow Jivamrutha, Neemastra Pest Management',
      certifications: 'PGS-India Green Certified, AP Organic Mission Verified',
    },
    create: {
      id: 'farmer-sreemanth-founder',
      userId: founder.id,
      farmName: "Sreemanth's Certified Organic Farm & Store",
      story: 'Pioneering organic cultivation, sustainable desi seed preservation, and direct farm-to-table supply across Andhra Pradesh.',
      experienceYears: 10,
      state: 'Andhra Pradesh',
      district: 'NTR (Vijayawada)',
      pincode: '520001',
      farmingMethods: 'Natural Farming, ZBNF, Desi Cow Jivamrutha, Neemastra Pest Management',
      certifications: 'PGS-India Green Certified, AP Organic Mission Verified',
      verificationStatus: 'VERIFIED',
      isOrganicCertified: true,
    },
  });

  // Ensure Admin exists
  const adminPassword = await bcrypt.hash('admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@farmtohome.in' },
    update: { role: 'ADMIN', isVerified: true },
    create: {
      id: 'user-admin',
      name: 'Dr. Anand Swaminathan',
      email: 'admin@farmtohome.in',
      password: adminPassword,
      phone: '+91 98450 11223',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // 4. Ensure all 8 Categories exist with clean IDs & Slugs
  const standardCategories = [
    {
      id: 'cat-fresh-produce',
      slug: 'fresh-produce',
      name: 'Fresh Farm Produce',
      description: 'Pesticide-free seasonal vegetables, naturally ripened heirloom fruits, and desi cold-pressed staples directly from regional growers.',
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80',
      icon: 'Sprout',
    },
    {
      id: 'cat-organic-farming',
      slug: 'organic-farming',
      name: 'Organic Manures & Bio-Inputs',
      description: 'Earthworm vermicompost, Jeevamrutha bio-cultures, cold-pressed neem cake powder, and Panchagavya soil regenerators.',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
      icon: 'Leaf',
    },
    {
      id: 'cat-seeds-and-planting',
      slug: 'seeds-and-planting',
      name: 'Desi Seeds & Saplings',
      description: 'Native non-GMO heirloom vegetable seeds, medicinal companion planting herbs, and heritage paddy strains conserved by farmer collectives.',
      image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&auto=format&fit=crop&q=80',
      icon: 'Wheat',
    },
    {
      id: 'cat-wood-materials',
      slug: 'wood-and-materials',
      name: 'Wood & Farm Materials',
      description: 'Permitted seasoned firewood logs, cocopeat blocks, virgin red loam, black cotton soil, and organic garden mulch.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      icon: 'TreePine',
    },
    {
      id: 'cat-gardening-tools',
      slug: 'gardening-tools',
      name: 'Gardening & Farm Tools',
      description: 'Heavy-duty HDPE grow bags, drip irrigation kits, pruning tools, and organic terrace gardening essentials.',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80',
      icon: 'Wrench',
    },
    {
      id: 'cat-mobile-accessories',
      slug: 'mobile-accessories',
      name: 'Mobile Accessories',
      description: 'Shockproof phone cases, fast charging type-C cables, magnetic car holders, wireless earbuds, and toughened glass screen protectors.',
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      icon: 'Smartphone',
    },
    {
      id: 'cat-clothes',
      slug: 'clothes',
      name: 'Clothes & Apparel',
      description: '100% natural organic cotton shirts, handloom khadi kurtas, comfortable farmer field-wear, sarees, and eco-friendly breathable garments.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
      icon: 'Shirt',
    },
    {
      id: 'cat-other-products',
      slug: 'other-products',
      name: 'Other Products',
      description: 'Handcrafted jute bags, utility toolkits, home lifestyle essentials, herbal oils, and versatile artisan goods.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
      icon: 'Package',
    },
  ];

  for (const cat of standardCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ id: cat.id }, { slug: cat.slug }],
      },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          icon: cat.icon,
        },
      });
    } else {
      await prisma.category.create({
        data: cat,
      });
    }
  }

  // 5. Clean local community products JSON file
  const dataDir = path.join(__dirname, '..', 'data');
  const localDataFile = path.join(dataDir, 'community-products.json');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(localDataFile, '[]', 'utf-8');

  console.log('Product count in database:', await prisma.product.count());
  console.log('Category count in database:', await prisma.category.count());
  console.log('Farmer profile count in database:', await prisma.farmerProfile.count());
  console.log('Clean complete! Ready for real products.');
}

cleanTestData()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
