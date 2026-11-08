const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Farm to Home database (Clean Base Catalog)...');

  // Clean existing operational data
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

  const founderHashedPassword = await bcrypt.hash('Srimanth@3272', 10);
  const adminHashedPassword = await bcrypt.hash('admin@123', 10);

  // 1. Founder User (Sreemanth Nagalakunta)
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
      password: founderHashedPassword,
      phone: '+91 98480 12345',
      role: 'FARMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  await prisma.farmerProfile.upsert({
    where: { userId: founder.id },
    update: {
      farmName: "Sreemanth's Certified Organic Farm & Store",
      verificationStatus: 'VERIFIED',
      isOrganicCertified: true,
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

  // 2. Admin User
  await prisma.user.upsert({
    where: { email: 'admin@farmtohome.in' },
    update: {
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      id: 'user-admin',
      name: 'Dr. Anand Swaminathan',
      email: 'admin@farmtohome.in',
      password: adminHashedPassword,
      phone: '+91 98450 11223',
      role: 'ADMIN',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
  });

  // 3. Official Product Categories
  const categories = [
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

  for (const cat of categories) {
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
      await prisma.category.create({ data: cat });
    }
  }

  // 4. Coupons
  await prisma.coupon.upsert({
    where: { code: 'FARM10' },
    update: {},
    create: {
      code: 'FARM10',
      description: '10% Flat Discount on Fresh Organic Farm Harvests',
      discountPercent: 10,
      discountMaxAmount: 150.0,
      minOrderAmount: 499.0,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'ORGANIC20' },
    update: {},
    create: {
      code: 'ORGANIC20',
      description: '20% off on first organic orders over ₹999',
      discountPercent: 20,
      discountMaxAmount: 250.0,
      minOrderAmount: 999.0,
      isActive: true,
    },
  });

  console.log('Seed completed successfully. Database is clean and ready for real products.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
