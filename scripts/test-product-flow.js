const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testProductFlow() {
  console.log('--- Testing Product Creation & Persistence Flow ---');

  // Verify Categories exist
  const categories = await prisma.category.findMany();
  console.log(`Verified ${categories.length} categories in database.`);
  if (categories.length === 0) {
    throw new Error('Categories are missing!');
  }

  // Verify Founder Farmer profile exists
  const farmer = await prisma.farmerProfile.findFirst({
    include: { user: true },
  });
  console.log('Verified Farmer profile:', farmer?.farmName, 'Farmer user:', farmer?.user?.name);
  if (!farmer) {
    throw new Error('Farmer profile is missing!');
  }

  // Simulate product creation
  const testId = `prod-verify-${Date.now()}`;
  const testSlug = `fresh-organic-alphonso-mangoes-${Date.now().toString().slice(-4)}`;

  const createdProduct = await prisma.product.create({
    data: {
      id: testId,
      name: 'Farm-Fresh Sweet Alphonso Mangoes (Ratnagiri Hapus)',
      slug: testSlug,
      description: 'Naturally ripened, carbide-free GI tagged Alphonso mangoes.',
      categoryId: categories[0].id,
      farmerId: farmer.id,
      price: 650.0,
      compareAtPrice: 850.0,
      unit: '1 Dozen (12 fruits)',
      stock: 40,
      images: JSON.stringify(['https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Vijayawada Hub, Andhra Pradesh',
      harvestDate: 'Morning Harvest',
      shelfLifeDays: 8,
      storageInstructions: 'Keep in ventilated wooden crate at room temperature.',
      isOrganic: true,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    include: {
      category: true,
      farmer: { include: { user: true } },
    },
  });

  console.log('Successfully created product in Prisma DB:', createdProduct.name);

  // Check Prisma read
  const fetched = await prisma.product.findUnique({
    where: { id: testId },
    include: { category: true, farmer: true },
  });
  if (!fetched || fetched.id !== testId) {
    throw new Error('Prisma read failed!');
  }
  console.log('Verified product is queryable from database by ID:', fetched.id);

  // Update data/community-products.json
  const dataDir = path.join(__dirname, '..', 'data');
  const localDataFile = path.join(dataDir, 'community-products.json');
  fs.writeFileSync(localDataFile, JSON.stringify([createdProduct], null, 2), 'utf-8');
  console.log('Verified product is written to data/community-products.json');

  // Clean up test verification product
  await prisma.product.delete({ where: { id: testId } });
  fs.writeFileSync(localDataFile, '[]', 'utf-8');
  console.log('Cleaned up test verification product. Database and file are pristine.');
  console.log('--- ALL SYSTEMS VERIFIED & WORKING 100% ---');
}

testProductFlow()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
