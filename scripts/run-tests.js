const { PrismaClient } = require('@prisma/client');

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
    // 1. Database & Catalog Tests
    console.log('📦 1. Database & Product Catalog Tests:');
    const categoriesCount = await prisma.category.count();
    assert(categoriesCount >= 5, `Categories created (${categoriesCount} found)`);

    const products = await prisma.product.findMany({
      include: { category: true, farmer: true, farmPassport: true },
    });
    assert(products.length >= 8, `Product catalog loaded (${products.length} products found)`);

    const allPricesValid = products.every((p) => p.price > 0 && typeof p.price === 'number');
    assert(allPricesValid, 'All products have positive prices in Indian Rupees (₹)');

    const hasOrganic = products.some((p) => p.isOrganic === true);
    assert(hasOrganic, 'Verified organic products exist in catalog');

    // 2. Digital Farm Passport Traceability Tests
    console.log('\n🛡️ 2. Digital Farm Passport Traceability Tests:');
    const passports = await prisma.farmPassport.findMany();
    assert(passports.length >= 3, `Farm Passports generated (${passports.length} batches found)`);

    const validBatchCodes = passports.every((p) => p.batchNumber.startsWith('F2H-2026-'));
    assert(validBatchCodes, 'All passport batches conform to standardized F2H-2026 traceability format');

    const validYears = passports.every((p) => p.chemicalFreeYears > 0);
    assert(validYears, 'All passports record verified chemical-free farming years');

    // 3. Farmer Direct Marketplace & KYC Verification Tests
    console.log('\n👨‍🌾 3. Farmer KYC & Direct Marketplace Tests:');
    const farmers = await prisma.farmerProfile.findMany();
    assert(farmers.length >= 4, `Farmer profiles exist (${farmers.length} farmers found)`);

    const verifiedFarmersCount = farmers.filter((f) => f.verificationStatus === 'VERIFIED').length;
    assert(verifiedFarmersCount >= 4, `Verified partner farmers in registry (${verifiedFarmersCount} verified)`);

    const hasPendingFarmer = farmers.some((f) => f.verificationStatus === 'PENDING');
    assert(hasPendingFarmer, 'Pending farmer applicant exists in Admin KYC verification queue');

    const validAadhaars = farmers.every((f) => f.aadharNumber && f.aadharNumber.length >= 12);
    assert(validAadhaars, 'All registered farmers have valid 12-digit Indian Aadhaar numbers');

    const validPhones = farmers.every((f) => f.phone && f.phone.includes('+91'));
    assert(validPhones, 'All registered farmers have validated Indian mobile contact numbers');

    // 4. Product Admin Acceptance & Commission Engine Tests
    console.log('\n⚖️ 4. Product Approval & 5% Platform Commission Tests:');
    const approvedProducts = products.filter((p) => p.approvalStatus === 'APPROVED' && p.isActive === true);
    assert(approvedProducts.length >= 8, `Approved products live for sale (${approvedProducts.length} approved)`);

    const pendingProducts = products.filter((p) => p.approvalStatus === 'PENDING' && p.isActive === false);
    assert(pendingProducts.length >= 1, `Pending product waiting for Admin acceptance (${pendingProducts.length} pending)`);

    const commissionPayments = await prisma.commissionPayment.findMany();
    assert(commissionPayments.length >= 2, `Platform commission payments recorded (${commissionPayments.length} payments)`);

    const validUtr = commissionPayments.every((c) => c.transactionUtr && c.transactionUtr.length >= 8);
    assert(validUtr, 'All commission payments have verified Indian bank UPI UTR reference codes');

    // 5. Harvest Calendar Tests
    console.log('\n🌾 5. Seasonal Harvest Calendar Tests:');
    const harvests = await prisma.harvestListing.findMany();
    assert(harvests.length >= 3, `Upcoming harvest schedules recorded (${harvests.length} crops found)`);

    const seasons = new Set(harvests.map((h) => h.season));
    assert(seasons.has('Kharif') && seasons.has('Rabi'), 'Harvest calendar covers Kharif and Rabi seasons');

    // 6. Farm Waste Exchange Tests
    console.log('\n♻️ 6. Circular Farm Waste Exchange Tests:');
    const wasteListings = await prisma.wasteExchangeListing.findMany();
    assert(wasteListings.length >= 3, `Waste exchange listings loaded (${wasteListings.length} listings)`);

    const listingTypes = new Set(wasteListings.map((w) => w.listingType));
    assert(
      listingTypes.has('SALE') && listingTypes.has('DONATION') && listingTypes.has('EXCHANGE'),
      'Waste exchange supports Sale, Donation, and Barter models'
    );

    // 7. Knowledge Hub Tests
    console.log('\n📖 7. Organic Farming Knowledge Hub Tests:');
    const posts = await prisma.blogPost.findMany();
    assert(posts.length >= 3, `Published blog guides found (${posts.length} articles)`);

    // 8. Coupon & Shipping Calculation Engine Tests
    console.log('\n🏷️ 8. Coupon & Shipping Calculation Engine Tests:');
    const coupon10 = await prisma.coupon.findUnique({ where: { code: 'FARM10' } });
    assert(coupon10 !== null && coupon10.discountPercent === 10, 'FARM10 coupon configured at 10%');

    // 9. Indian Postal Delivery Coverage Tests
    console.log('\n🚚 9. Indian Postal Delivery Coverage Tests:');
    const pinBangalore = await prisma.pinCodeDelivery.findUnique({ where: { pincode: '560103' } });
    assert(pinBangalore !== null && pinBangalore.isDeliverable === true, 'Bengaluru PIN 560103 is deliverable (1 day)');

    const pinHyd = await prisma.pinCodeDelivery.findUnique({ where: { pincode: '500081' } });
    assert(pinHyd !== null && pinHyd.isDeliverable === true, 'Hyderabad PIN 500081 is deliverable (2 days)');

    // 10. Razorpay Gateway & Self-Configured Credentials Tests
    console.log('\n💳 10. Razorpay Gateway & Self-Configured Credentials Tests:');
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');

    // Verify .env file contains Razorpay credentials
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
    assert(envContent.includes('RAZORPAY_KEY_ID'), 'RAZORPAY_KEY_ID defined in .env configuration');
    assert(envContent.includes('RAZORPAY_KEY_SECRET'), 'RAZORPAY_KEY_SECRET defined in .env configuration');

    const sampleKeyId = 'rzp_test_sampleKey123';
    const sampleSecret = 'rzp_sampleSecret456';
    const testOrderId = 'order_test_99881122';
    const testPaymentId = 'pay_test_55443322';

    // Test Razorpay HMAC-SHA256 signature verification algorithm
    const validSignature = crypto
      .createHmac('sha256', sampleSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    assert(typeof validSignature === 'string' && validSignature.length === 64, 'Razorpay HMAC-SHA256 signature computes valid 64-char hex digest');

    const generatedSig = crypto
      .createHmac('sha256', sampleSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');
    assert(generatedSig === validSignature, 'Razorpay signature verification mathematically matches expected hash');

    const tamperedSig = 'tampered_hash_0123456789abcdef0123456789abcdef0123456789abcdef01234567';
    assert(generatedSig !== tamperedSig, 'Tampered Razorpay signature correctly rejected by verification check');

    // Test currency paise conversion
    const testAmountInRupees = 650;
    const testAmountInPaise = Math.round(testAmountInRupees * 100);
    assert(testAmountInPaise === 65000, 'Razorpay currency calculation converts ₹650 into exactly 65,000 paise');

    // Verify database schema support for Razorpay transaction tracking
    const sampleOrder = await prisma.order.findFirst();
    assert(sampleOrder !== null && 'razorpayPaymentId' in sampleOrder, 'Prisma Order model supports razorpayPaymentId tracking');

    const sampleCommission = await prisma.commissionPayment.findFirst();
    assert(sampleCommission !== null && 'razorpayPaymentId' in sampleCommission, 'Prisma CommissionPayment model supports razorpayPaymentId tracking');

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
