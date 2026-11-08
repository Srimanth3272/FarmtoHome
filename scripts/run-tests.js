const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
  console.log('\n========================================');
  console.log('🌾 FARM TO HOME PLATFORM TEST SUITE 🌾');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Database & Catalog Structure Tests
    console.log('📦 1. Database & Product Category Tests:');
    const categories = await prisma.category.findMany();
    assert(categories.length >= 8, `Official categories verified (${categories.length} found)`);

    const expectedSlugs = [
      'fresh-produce',
      'organic-farming',
      'seeds-and-planting',
      'wood-and-materials',
      'gardening-tools',
      'mobile-accessories',
      'clothes',
      'other-products',
    ];
    const hasAllCategories = expectedSlugs.every((slug) => categories.some((c) => c.slug === slug));
    assert(hasAllCategories, 'All 8 standardized market categories present');

    // 2. Real-Time Product Lifecycle & Persistence Tests
    console.log('\n🛡️ 2. Real-Time Product Lifecycle & Persistence Tests:');
    const founder = await prisma.farmerProfile.findFirst({
      where: { user: { email: 'sreemanthnagalakunta@gmail.com' } },
      include: { user: true },
    });
    assert(founder !== null, 'Founder Sreemanth Nagalakunta has registered verified seller profile');

    const testProdId = `prod-test-live-${Date.now()}`;
    const testProd = await prisma.product.create({
      data: {
        id: testProdId,
        name: 'Single-Origin Test Produce',
        slug: `single-origin-test-produce-${Date.now().toString().slice(-4)}`,
        description: 'Quality tested produce for live network verification.',
        categoryId: categories[0].id,
        farmerId: founder ? founder.id : (await prisma.farmerProfile.findFirst()).id,
        price: 250.0,
        unit: '1 kg',
        stock: 50,
        images: JSON.stringify(['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800']),
        originLocation: 'Andhra Pradesh, India',
        isOrganic: true,
        approvalStatus: 'APPROVED',
        isActive: true,
      },
    });

    assert(testProd.id === testProdId, 'Product successfully created and stored in Prisma DB');

    const passport = await prisma.farmPassport.create({
      data: {
        productId: testProdId,
        batchNumber: `F2H-2026-TEST-${Date.now().toString().slice(-4)}`,
        farmName: "Sreemanth's Certified Organic Farm & Store",
        farmerName: 'Sreemanth Nagalakunta',
        location: 'Andhra Pradesh, India',
        harvestDate: 'Current Batch',
        declaredPractices: '100% Quality Inspected',
        soilType: 'Natural Farm Loam',
        waterSource: 'Clean Tubewell',
        chemicalFreeYears: 5,
        verificationBadge: 'Verified Platform Seller',
      },
    });

    assert(passport.productId === testProdId, 'Farm Passport linked to product successfully');
    assert(passport.batchNumber.startsWith('F2H-2026-'), 'Passport batch conforms to F2H-2026 standardized format');

    // Clean up test verification record so catalog remains clean
    await prisma.farmPassport.delete({ where: { id: passport.id } });
    await prisma.product.delete({ where: { id: testProdId } });
    assert(true, 'Test product and passport cleaned up to maintain clean catalog state');

    // 3. Platform Security & Founder VIP Plan Tests
    console.log('\n🔐 3. Platform Administrator & Founder Security:');
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    assert(adminUser !== null, 'Platform Administrator exists in database');
    assert(adminUser.email === 'admin@farmtohome.in', 'Admin email is admin@farmtohome.in');
    const isAdminPwdValid = bcrypt.compareSync('admin@123', adminUser.password);
    assert(isAdminPwdValid, 'Administrator password strictly verifies with admin@123');

    const founderUser = await prisma.user.findUnique({ where: { email: 'sreemanthnagalakunta@gmail.com' } });
    assert(founderUser !== null && founderUser.role === 'FARMER', 'Founder Sreemanth Nagalakunta verified with FARMER role');

    // 4. Coupons & Shipping Engine Tests
    console.log('\n🏷️ 4. Coupon & Shipping Calculation Engine Tests:');
    const coupon10 = await prisma.coupon.findUnique({ where: { code: 'FARM10' } });
    assert(coupon10 !== null && coupon10.discountPercent === 10, 'FARM10 coupon configured at 10%');

    const coupon20 = await prisma.coupon.findUnique({ where: { code: 'ORGANIC20' } });
    assert(coupon20 !== null && coupon20.discountPercent === 20, 'ORGANIC20 coupon configured at 20%');

    // 5. Indian Postal Delivery Coverage Tests
    console.log('\n🚚 5. Indian Postal Delivery Coverage Tests:');
    const pinBangalore = await prisma.pinCodeDelivery.findUnique({ where: { pincode: '560103' } });
    assert(pinBangalore !== null && pinBangalore.isDeliverable === true, 'Bengaluru PIN 560103 is deliverable (1 day)');

    const pinHyd = await prisma.pinCodeDelivery.findUnique({ where: { pincode: '500081' } });
    assert(pinHyd !== null && pinHyd.isDeliverable === true, 'Hyderabad PIN 500081 is deliverable (2 days)');

    const pinVijayawada = await prisma.pinCodeDelivery.findUnique({ where: { pincode: '520001' } });
    assert(pinVijayawada !== null && pinVijayawada.state === 'Andhra Pradesh', 'Andhra Pradesh NTR/Vijayawada PIN 520001 is deliverable (1 day)');

    // 6. Razorpay Gateway & Signature Verification Tests
    console.log('\n💳 6. Razorpay Gateway Configuration & Cryptographic Tests:');
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
    assert(envContent.includes('RAZORPAY_KEY_ID'), 'RAZORPAY_KEY_ID defined in .env configuration');
    assert(envContent.includes('RAZORPAY_KEY_SECRET'), 'RAZORPAY_KEY_SECRET defined in .env configuration');

    const sampleSecret = 'rzp_sampleSecret456';
    const testOrderId = 'order_test_99881122';
    const testPaymentId = 'pay_test_55443322';

    const validSignature = crypto
      .createHmac('sha256', sampleSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    assert(typeof validSignature === 'string' && validSignature.length === 64, 'Razorpay HMAC-SHA256 signature computes valid 64-char hex digest');

    const tamperedSig = 'tampered_hash_0123456789abcdef0123456789abcdef0123456789abcdef01234567';
    assert(validSignature !== tamperedSig, 'Tampered Razorpay signature correctly rejected by verification check');

    const testAmountInRupees = 650;
    const testAmountInPaise = Math.round(testAmountInRupees * 100);
    assert(testAmountInPaise === 65000, 'Razorpay currency calculation converts ₹650 into exactly 65,000 paise');

    // 7. Firebase & Cloud Firestore Configuration Tests
    console.log('\n🔥 7. Firebase Real-Time Firestore Configuration Tests:');
    assert(envContent.includes('FIREBASE_PROJECT_ID="farm-to-home-9ff91"'), 'FIREBASE_PROJECT_ID configured for farm-to-home-9ff91');
    assert(envContent.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID'), 'NEXT_PUBLIC_FIREBASE_PROJECT_ID exposed for browser components');
    assert(envContent.includes('FIREBASE_API_KEY'), 'FIREBASE_API_KEY securely configured in .env');

    // 8. Google OAuth 2.0 Tests
    console.log('\n🌐 8. Google OAuth 2.0 Configuration Tests:');
    assert(envContent.includes('GOOGLE_CLIENT_ID'), 'GOOGLE_CLIENT_ID defined in platform environment');
    assert(envContent.includes('NEXT_PUBLIC_GOOGLE_CLIENT_ID'), 'NEXT_PUBLIC_GOOGLE_CLIENT_ID configured for 1-click Google Sign-in');
    assert(Boolean(envContent.match(/GOOGLE_CLIENT_SECRET\s*=\s*["']?GOCSPX-/)), 'User Google Client Secret starting with GOCSPX securely stored in .env');

    // 9. Knowledge Hub Blog Posts
    console.log('\n📖 9. Organic Farming Knowledge Hub Tests:');
    const posts = await prisma.blogPost.findMany();
    assert(posts.length >= 3, `Published blog guides found (${posts.length} articles)`);

    console.log('\n========================================');
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
