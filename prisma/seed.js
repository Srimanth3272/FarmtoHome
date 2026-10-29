const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Farm to Home database...');

  // Clean existing data
  await prisma.commissionPayment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.farmPassport.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.harvestListing.deleteMany();
  await prisma.wasteExchangeListing.deleteMany();
  await prisma.blogComment.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.pinCodeDelivery.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Farm@123', 10);
  const adminHashedPassword = await bcrypt.hash('admin@123', 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Anand Swaminathan',
      email: 'admin@farmtohome.in',
      password: adminHashedPassword,
      phone: '+91 98450 11223',
      role: 'ADMIN',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
  });

  const farmerRamesh = await prisma.user.create({
    data: {
      name: 'Ramesh Patel',
      email: 'ramesh.patel@farmtohome.in',
      password: hashedPassword,
      phone: '+91 98251 43210',
      role: 'FARMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    },
  });

  const farmerLakshmi = await prisma.user.create({
    data: {
      name: 'Lakshmi Narayana Rao',
      email: 'lakshmi.rao@farmtohome.in',
      password: hashedPassword,
      phone: '+91 94401 56789',
      role: 'FARMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  });

  const farmerGurpreet = await prisma.user.create({
    data: {
      name: 'Gurpreet Singh Dhillon',
      email: 'gurpreet.singh@farmtohome.in',
      password: hashedPassword,
      phone: '+91 98140 87654',
      role: 'FARMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
  });

  const farmerMeenakshi = await prisma.user.create({
    data: {
      name: 'Meenakshi Sundaram',
      email: 'meenakshi.s@farmtohome.in',
      password: hashedPassword,
      phone: '+91 94432 10987',
      role: 'FARMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    },
  });

  // Pending Farmer applicant awaiting Admin approval
  const farmerKishan = await prisma.user.create({
    data: {
      name: 'Kishan Lal Meena',
      email: 'kishan.lal@marwaragro.in',
      password: hashedPassword,
      phone: '+91 94140 22319',
      role: 'FARMER',
      isVerified: false,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    },
  });

  const customerPriya = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: hashedPassword,
      phone: '+91 99887 66554',
      role: 'CUSTOMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    },
  });

  const customerRajesh = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar Verma',
      email: 'rajesh@example.com',
      password: hashedPassword,
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
  });

  // 2. Farmer Profiles
  const profileRamesh = await prisma.farmerProfile.create({
    data: {
      userId: farmerRamesh.id,
      farmName: 'Patel Natural Organics',
      story: 'Pioneering Subhash Palekar Natural Farming (SPNF) in Gujarat with 14 indigenous Gir cows. We cultivate organic groundnuts, native wheat, seasonal pomegranates, and prepare fresh Jivamrutha bio-fertilizer.',
      experienceYears: 18,
      state: 'Gujarat',
      district: 'Anand',
      village: 'Borsad',
      pincode: '388540',
      farmSizeAcres: 12.5,
      farmingMethods: 'Zero Budget Natural Farming (ZBNF), Desi Gir Cow Dung & Urine, Multi-Cropping, Mulching',
      certifications: 'PGS-India Green Certified #GJ-PGS-8891, Jaivik Bharat',
      verificationStatus: 'VERIFIED',
      aadharNumber: '5829-3012-7741',
      phone: '+91 98251 43210',
      email: 'ramesh.patel@farmtohome.in',
      idProofDoc: 'aadhaar_ramesh_patel.pdf',
      commissionRate: 5.0,
      totalCommissionPaid: 450.0,
      totalCommissionDue: 96.0,
      rating: 4.9,
      reviewsCount: 84,
      isOrganicCertified: true,
      profileImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    },
  });

  const profileLakshmi = await prisma.farmerProfile.create({
    data: {
      userId: farmerLakshmi.id,
      farmName: 'Godavari Krishna Agro Heritage',
      story: 'Generations of cultivating fertile alluvial soils along the Godavari basin. Specializing in naturally sweet Banganapalli mangoes, organic turmeric with 5.2% curcumin, heirloom pulses, and cold-pressed sesame oil.',
      experienceYears: 24,
      state: 'Andhra Pradesh',
      district: 'West Godavari',
      village: 'Tanuku',
      pincode: '534211',
      farmSizeAcres: 16.0,
      farmingMethods: 'Bio-dynamic Farming, Vermicomposting, Green Manuring (Daincha), Solar Micro-Irrigation',
      certifications: 'NPOP Certified Organic #AP-NPOP-2041, Verified Farm to Home Partner',
      verificationStatus: 'VERIFIED',
      aadharNumber: '6124-8890-1234',
      phone: '+91 94401 56789',
      email: 'lakshmi.rao@farmtohome.in',
      idProofDoc: 'aadhaar_lakshmi_rao.pdf',
      commissionRate: 5.0,
      totalCommissionPaid: 580.0,
      totalCommissionDue: 145.0,
      rating: 4.8,
      reviewsCount: 112,
      isOrganicCertified: true,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1200&auto=format&fit=crop&q=80',
    },
  });

  const profileGurpreet = await prisma.farmerProfile.create({
    data: {
      userId: farmerGurpreet.id,
      farmName: 'Malwa Golden Harvest',
      story: 'Transitioned 20 acres completely away from synthetic inputs 7 years ago. We produce indigenous Bansi and Sharbati whole wheat, organic black rice, cold-pressed mustard oil, and sustainably harvested Eucalyptus & Kikar wood offcuts.',
      experienceYears: 15,
      state: 'Punjab',
      district: 'Sangrur',
      village: 'Sunam',
      pincode: '148028',
      farmSizeAcres: 20.0,
      farmingMethods: 'Crop Stubble Mulching, In-situ Decomposition, Crop Rotation with Legumes, Bio-pesticides',
      certifications: 'State Organic Mission Registered #PB-ORG-7712',
      verificationStatus: 'VERIFIED',
      aadharNumber: '7921-4456-9012',
      phone: '+91 98140 87654',
      email: 'gurpreet.singh@farmtohome.in',
      idProofDoc: 'aadhaar_gurpreet_singh.pdf',
      commissionRate: 5.0,
      totalCommissionPaid: 320.0,
      totalCommissionDue: 80.0,
      rating: 4.8,
      reviewsCount: 65,
      isOrganicCertified: true,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&auto=format&fit=crop&q=80',
    },
  });

  const profileMeenakshi = await prisma.farmerProfile.create({
    data: {
      userId: farmerMeenakshi.id,
      farmName: 'Western Ghats Agroforestry',
      story: 'Nestled on the high ranges of Western Ghats. We grow shade-grown spices, organic moringa leaf powder, raw forest honey, enriched vermicompost, and provide low-carbon coconut coir peat for urban terrace gardens.',
      experienceYears: 12,
      state: 'Tamil Nadu',
      district: 'Theni',
      village: 'Cumbum Valley',
      pincode: '625516',
      farmSizeAcres: 8.5,
      farmingMethods: 'Multi-tiered Agroforestry, Forest Leaf Mulch, Neem & Karanja Pest Repellents',
      certifications: 'Participatory Guarantee System #TN-PGS-5012',
      verificationStatus: 'VERIFIED',
      aadharNumber: '8392-5671-3349',
      phone: '+91 94432 10987',
      email: 'meenakshi.s@farmtohome.in',
      idProofDoc: 'aadhaar_meenakshi_sundaram.pdf',
      commissionRate: 5.0,
      totalCommissionPaid: 410.0,
      totalCommissionDue: 110.0,
      rating: 4.9,
      reviewsCount: 96,
      isOrganicCertified: true,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
    },
  });

  // Profile awaiting Admin Verification
  const profileKishan = await prisma.farmerProfile.create({
    data: {
      userId: farmerKishan.id,
      farmName: 'Marwar Desert Bloom Organics',
      story: 'Cultivating arid soil using rainwater harvesting kunds and indigenous Kankrej cow manure. We produce organic bajra (pearl millet), moth beans, and cold-pressed sesame oil.',
      experienceYears: 14,
      state: 'Rajasthan',
      district: 'Jodhpur',
      village: 'Osian',
      pincode: '342303',
      farmSizeAcres: 15.0,
      farmingMethods: 'Traditional Desert Dryland Organics, Bio-mulch, Neem & Datura spray',
      certifications: 'Rajasthan Organic Certification Agency (ROCA) in progress',
      verificationStatus: 'PENDING',
      aadharNumber: '4829-1092-8831',
      phone: '+91 94140 22319',
      email: 'kishan.lal@marwaragro.in',
      idProofDoc: 'aadhaar_card_kishan_lal.pdf',
      commissionRate: 5.0,
      totalCommissionPaid: 0.0,
      totalCommissionDue: 0.0,
      rating: 4.7,
      reviewsCount: 0,
      isOrganicCertified: false,
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    },
  });

  // 3. Addresses
  await prisma.address.createMany({
    data: [
      {
        userId: customerPriya.id,
        fullName: 'Priya Sharma',
        phone: '+91 99887 66554',
        addressLine1: 'Flat 402, Green Glen Gardens',
        addressLine2: 'Bellandur Main Road, Outer Ring Road',
        landmark: 'Near Eco World Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        isDefault: true,
        type: 'HOME',
      },
      {
        userId: customerRajesh.id,
        fullName: 'Rajesh Kumar Verma',
        phone: '+91 98765 43210',
        addressLine1: 'Plot 78, Madhapur Enclave',
        addressLine2: 'Hi-Tech City Phase 2',
        landmark: 'Behind Cyber Towers',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        isDefault: true,
        type: 'HOME',
      },
    ],
  });

  // 4. Categories
  const catProduce = await prisma.category.create({
    data: {
      slug: 'fresh-produce',
      name: 'Fresh Produce',
      description: 'Naturally harvested farm-fresh fruits, crisp vegetables, greens, pulses, and native grains directly from verified growers.',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      icon: 'Apple',
      banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&auto=format&fit=crop&q=80',
    },
  });

  const catSeeds = await prisma.category.create({
    data: {
      slug: 'seeds-and-planting',
      name: 'Seeds & Planting',
      description: 'Native non-GMO heirloom seeds, fruit saplings, flowering varieties, and nursery plants suited for Indian weather.',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
      icon: 'Sprout',
      banner: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&auto=format&fit=crop&q=80',
    },
  });

  const catOrganic = await prisma.category.create({
    data: {
      slug: 'organic-farming',
      name: 'Organic Soil & Crop Care',
      description: 'Pure vermicompost, aged cow dung manure, neem cake soil amendments, Panchagavya, and natural biofertilizers.',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
      icon: 'Leaf',
      banner: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&auto=format&fit=crop&q=80',
    },
  });

  const catWood = await prisma.category.create({
    data: {
      slug: 'wood-and-materials',
      name: 'Wood & Farm Materials',
      description: 'Permitted seasoned firewood logs, cocopeat blocks, virgin red loam, black cotton soil, and organic garden mulch.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      icon: 'TreePine',
      banner: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&auto=format&fit=crop&q=80',
    },
  });

  const catTools = await prisma.category.create({
    data: {
      slug: 'gardening-tools',
      name: 'Gardening & Farm Tools',
      description: 'Heavy-duty HDPE grow bags, drip irrigation kits, pruning tools, and organic terrace gardening essentials.',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80',
      icon: 'Wrench',
      banner: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1400&auto=format&fit=crop&q=80',
    },
  });

  const catMobile = await prisma.category.create({
    data: {
      slug: 'mobile-accessories',
      name: 'Mobile Accessories',
      description: 'Fast chargers, durable braided cables, magnetic car holders, wireless earbuds, and screen protectors.',
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      icon: 'Smartphone',
      banner: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1400&auto=format&fit=crop&q=80',
    },
  });

  const catClothes = await prisma.category.create({
    data: {
      slug: 'clothes',
      name: 'Clothes & Apparel',
      description: 'Organic cotton shirts, handspun khadi kurtas, comfortable field work wear, and breathable garments.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
      icon: 'Shirt',
      banner: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1400&auto=format&fit=crop&q=80',
    },
  });

  const catOther = await prisma.category.create({
    data: {
      slug: 'other-products',
      name: 'Other Products',
      description: 'Biodegradable jute bags, copper water bottles, lifestyle essentials, and artisan utility goods.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
      icon: 'Package',
      banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1400&auto=format&fit=crop&q=80',
    },
  });

  // 5. Products & Farm Passports
  // Product 1: Desi Tomatoes
  const prodTomato = await prisma.product.create({
    data: {
      slug: 'naturally-grown-desi-tomatoes',
      name: 'Naturally Grown Desi Country Tomatoes (Naati Tamatar)',
      description: 'Heirloom sour and flavorful Naati tomatoes picked fresh at dawn from Patel Natural Organics. Cultivated without synthetic chemical sprays or ripening agents. High lycopene content, thin skin, and traditional tangy flavor perfect for rasam, curries, and salads.',
      categoryId: catProduce.id,
      farmerId: profileRamesh.id,
      price: 48.0,
      compareAtPrice: 65.0,
      unit: '1 kg',
      stock: 120,
      sku: 'F2H-PROD-TOM-01',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'Anand, Gujarat',
      harvestDate: 'Fresh Morning Harvest (Picked Daily)',
      storageInstructions: 'Store at cool room temperature. Avoid refrigeration to preserve natural sweetness and aroma.',
      shelfLifeDays: 6,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 45.6,
      commissionAmount: 2.4,
      certificationDetails: 'PGS-India Green Registered',
      featured: true,
      rating: 4.9,
      reviewCount: 38,
    },
  });

  await prisma.farmPassport.create({
    data: {
      productId: prodTomato.id,
      batchNumber: 'F2H-2026-GJ-TOM-04',
      farmName: 'Patel Natural Organics',
      farmerName: 'Ramesh Patel',
      location: 'Anand District, Gujarat (Borsad Taluka)',
      harvestDate: 'October 21, 2026 - Dawn Harvest',
      declaredPractices: 'Zero Synthetic Pesticides, Native Cow Dung Slurry (Jivamrutha), Sorghum Windbreak Bio-barriers',
      soilType: 'Deep Alluvial Sandy Loam rich in Humus',
      waterSource: 'Solar Tubewell & Drip Irrigation',
      chemicalFreeYears: 9,
      verificationBadge: 'Verified PGS-India Green Farm',
      labReportUrl: 'https://farmtohome.in/verify/reports/GJ-TOM-2026.pdf',
      traceabilityNotes: 'Tested residue-free for 142 organophosphate and carbamate chemicals by state agri lab.',
    },
  });

  // Product 2: Banganapalli Mangoes / Organic Turmeric
  const prodTurmeric = await prisma.product.create({
    data: {
      slug: 'organic-high-curcumin-lakadong-turmeric',
      name: 'Farm-Fresh High-Curcumin Raw Turmeric Rhizomes',
      description: 'Unpolished fresh raw turmeric rhizomes cultivated on nutrient-rich Godavari riverbeds. Contains high natural curcumin content (over 5%). Wash, slice, and use for golden milk, fresh pickles, or natural detox juices.',
      categoryId: catProduce.id,
      farmerId: profileLakshmi.id,
      price: 110.0,
      compareAtPrice: 150.0,
      unit: '500 g',
      stock: 85,
      sku: 'F2H-PROD-TURM-02',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'West Godavari, Andhra Pradesh',
      harvestDate: 'October 19, 2026',
      storageInstructions: 'Keep in a cool, ventilated basket or wrapped in dry jute cloth.',
      shelfLifeDays: 30,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 104.5,
      commissionAmount: 5.5,
      certificationDetails: 'NPOP Certified Organic #AP-NPOP-2041',
      featured: true,
      rating: 5.0,
      reviewCount: 42,
    },
  });

  await prisma.farmPassport.create({
    data: {
      productId: prodTurmeric.id,
      batchNumber: 'F2H-2026-AP-TURM-11',
      farmName: 'Godavari Krishna Agro Heritage',
      farmerName: 'Lakshmi Narayana Rao',
      location: 'Tanuku, West Godavari, Andhra Pradesh',
      harvestDate: 'October 19, 2026',
      declaredPractices: 'Vermicompost, Panchagavya root treatment, Intercropped with banana for micro-climate',
      soilType: 'Heavy Riverbed Alluvium',
      waterSource: 'Godavari Canal & Rainwater Recharge',
      chemicalFreeYears: 14,
      verificationBadge: 'NPOP India Certified',
      labReportUrl: 'https://farmtohome.in/verify/reports/AP-TURM-2026.pdf',
      traceabilityNotes: 'Curcumin concentration verified at 5.4% by accredited NABL laboratory.',
    },
  });

  // Product 3: Heirloom Bansi Wheat Grain
  const prodWheat = await prisma.product.create({
    data: {
      slug: 'traditional-bansi-whole-wheat-grain',
      name: 'Unpolished Traditional Bansi Golden Wheat Grain',
      description: 'Indigenous ancient Bansi wheat variety grown in Punjab. Non-hybrid, low gluten glycemic index, rich in dietary fiber, zinc, and magnesium. Stone grind into soft, fragrant golden rotis that stay soft for hours.',
      categoryId: catProduce.id,
      farmerId: profileGurpreet.id,
      price: 360.0,
      compareAtPrice: 450.0,
      unit: '5 kg bag',
      stock: 60,
      sku: 'F2H-PROD-WHEAT-03',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'Sangrur, Punjab',
      harvestDate: 'Recent Season Harvest',
      storageInstructions: 'Store in an airtight container with neem leaves to prevent pests naturally.',
      shelfLifeDays: 180,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 342.0,
      commissionAmount: 18.0,
      certificationDetails: 'State Organic Mission Registered',
      featured: true,
      rating: 4.8,
      reviewCount: 29,
    },
  });

  await prisma.farmPassport.create({
    data: {
      productId: prodWheat.id,
      batchNumber: 'F2H-2026-PB-WHT-09',
      farmName: 'Malwa Golden Harvest',
      farmerName: 'Gurpreet Singh Dhillon',
      location: 'Sunam, Sangrur, Punjab',
      harvestDate: 'April 2026 Season Batch',
      declaredPractices: 'No synthetic fertilizers, green manure intercropping, natural sun-drying on clean brick floors',
      soilType: 'Loamy Alluvial Soil',
      waterSource: 'Deep Aquifer Tube-well',
      chemicalFreeYears: 7,
      verificationBadge: 'Pure Traditional Heirloom Variety',
      labReportUrl: 'https://farmtohome.in/verify/reports/PB-WHT-2026.pdf',
      traceabilityNotes: 'Non-GMO declared and verified non-hybrid heritage landrace seed.',
    },
  });

  // Product 4: Organic Enriched Vermicompost
  const prodVermicompost = await prisma.product.create({
    data: {
      slug: 'enriched-organic-vermicompost-eisenia-fetida',
      name: 'Microbial Enriched Organic Vermicompost with Neem Cake & Trichoderma',
      description: 'Premium dark black, odorless worm castings processed with red wigglers (Eisenia fetida) fed exclusively on desi cow dung and farm compost. Fortified with cold-pressed neem cake and beneficial Trichoderma viride to protect roots against fungal diseases. Perfect for terrace vegetables, potted plants, and nursery beds.',
      categoryId: catOrganic.id,
      farmerId: profileMeenakshi.id,
      price: 249.0,
      compareAtPrice: 320.0,
      unit: '10 kg bag',
      stock: 150,
      sku: 'F2H-PROD-VERM-04',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'Theni, Tamil Nadu',
      harvestDate: 'Cured & Sieved - Batch 2026',
      storageInstructions: 'Store under shade in a cool moisture-retaining area. Avoid direct sunlight.',
      shelfLifeDays: 365,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 236.5,
      commissionAmount: 12.5,
      certificationDetails: 'PGS-India Certified #TN-PGS-5012',
      featured: true,
      rating: 4.9,
      reviewCount: 57,
    },
  });

  await prisma.farmPassport.create({
    data: {
      productId: prodVermicompost.id,
      batchNumber: 'F2H-2026-TN-VERM-19',
      farmName: 'Western Ghats Agroforestry',
      farmerName: 'Meenakshi Sundaram',
      location: 'Cumbum Valley, Theni, Tamil Nadu',
      harvestDate: 'October 15, 2026',
      declaredPractices: '60-day vermi-reactor composting, inoculated with nitrogen fixing Azotobacter & PSB',
      soilType: 'Organic Humus Feedstock',
      waterSource: 'Mountain Spring Gravity Feed',
      chemicalFreeYears: 12,
      verificationBadge: 'Laboratory Tested High NPK & Organic Carbon > 16%',
      labReportUrl: 'https://farmtohome.in/verify/reports/TN-VERM-2026.pdf',
      traceabilityNotes: 'Carbon to Nitrogen (C:N) ratio tested at 13.8:1, ideal for instant plant bio-availability.',
    },
  });

  // Product 5: Pure Neem Cake Powder Soil Conditioner
  const prodNeem = await prisma.product.create({
    data: {
      slug: 'pure-cold-pressed-neem-seed-cake-fertilizer',
      name: 'Cold-Pressed Pure Neem Seed Cake (Khad) for Soil Pest Defense',
      description: '100% pure de-oiled neem seed cake powder with high Azadirachtin content (over 1000 ppm). Acts as a natural organic fertilizer that slowly releases nitrogen while eliminating soil-dwelling pests like nematodes, white grubs, and termites naturally.',
      categoryId: catOrganic.id,
      farmerId: profileRamesh.id,
      price: 180.0,
      compareAtPrice: 220.0,
      unit: '5 kg bag',
      stock: 90,
      sku: 'F2H-PROD-NEEM-05',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'Anand, Gujarat',
      harvestDate: 'Cold Expelled - Sept 2026',
      storageInstructions: 'Keep in dry airtight container away from moisture.',
      shelfLifeDays: 360,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 171.0,
      commissionAmount: 9.0,
      certificationDetails: 'PGS-India Green Registered',
      featured: false,
      rating: 4.8,
      reviewCount: 31,
    },
  });

  // Product 6: Indigenous Vegetable Seeds Combo Pack
  const prodSeeds = await prisma.product.create({
    data: {
      slug: 'indigenous-desi-kitchen-garden-seeds-combo-12',
      name: 'Heirloom Desi Kitchen Garden Seed Kit (12 Native Vegetable Varieties)',
      description: 'Carefully curated collection of open-pollinated, non-hybrid heritage seeds for Indian homes and terrace gardens. Includes: Desi Palak, Cherry Tomatoes, Bottle Gourd (Lauki), Ridge Gourd, Okra (Bhindi), Green Chilli, Brinjal (Purple Eggplant), Radish (Mooli), Coriander (Dhania), Methi (Fenugreek), Bush Beans, and Amaranth (Chaulai). Over 85% germination rate guaranteed.',
      categoryId: catSeeds.id,
      farmerId: profileLakshmi.id,
      price: 299.0,
      compareAtPrice: 450.0,
      unit: '1 Pack (12 Seed Pouches)',
      stock: 200,
      sku: 'F2H-PROD-SEEDS-06',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'West Godavari, Andhra Pradesh',
      harvestDate: 'Current Seed Collection Season',
      storageInstructions: 'Store sealed packets in a cool, dark, dry place or refrigerator drawer.',
      shelfLifeDays: 365,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 284.0,
      commissionAmount: 15.0,
      certificationDetails: 'Seed Heritage Conservation Initiative',
      featured: true,
      rating: 5.0,
      reviewCount: 64,
    },
  });

  // Product 7: Low-EC Washed Cocopeat Block
  const prodCocopeat = await prisma.product.create({
    data: {
      slug: 'washed-low-ec-compressed-cocopeat-block-5kg',
      name: 'Triple-Washed Low-EC Compressed Cocopeat Block (Expands to 75 Litres)',
      description: 'Export-grade coir peat washed with clean fresh water to remove excess sodium and salts (EC < 0.5 mS/cm). High water holding capacity, spongy aeration, and neutral pH (5.8 - 6.5). Essential base medium for potting mixes, succulent mixes, and hydroponics.',
      categoryId: catWood.id,
      farmerId: profileMeenakshi.id,
      price: 210.0,
      compareAtPrice: 280.0,
      unit: '5 kg compressed block',
      stock: 110,
      sku: 'F2H-PROD-COCO-07',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'Theni, Tamil Nadu',
      harvestDate: 'Washed & Solar Dried Batch',
      storageInstructions: 'Keep dry until ready to hydrate with water.',
      shelfLifeDays: 720,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 199.5,
      commissionAmount: 10.5,
      certificationDetails: 'ISO 9001 Tested Low EC Coir',
      featured: true,
      rating: 4.7,
      reviewCount: 45,
    },
  });

  // Product 8: Seasoned Acacia & Eucalyptus Farm Firewood Logs
  const prodFirewood = await prisma.product.create({
    data: {
      slug: 'seasoned-acacia-hardwood-farm-firewood-logs',
      name: 'Sustainably Harvested Seasoned Acacia & Eucalyptus Wood Logs',
      description: 'Well-seasoned hardwood logs from legally pruned farm windbreak trees in Sangrur. Moisture content below 15% for clean, high-calorific combustion with minimal smoke. Ideal for tandoors, winter heating, traditional pottery kilns, and outdoor farm cooking.',
      categoryId: catWood.id,
      farmerId: profileGurpreet.id,
      price: 499.0,
      compareAtPrice: 650.0,
      unit: '20 kg bundle',
      stock: 40,
      sku: 'F2H-PROD-WOOD-08',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'Sangrur, Punjab',
      harvestDate: 'Sun-cured 90 Days',
      storageInstructions: 'Store elevated off the ground under a waterproof tarp or shed.',
      shelfLifeDays: 1000,
      isOrganic: true,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 474.0,
      commissionAmount: 25.0,
      certificationDetails: 'Legal Farm Agroforestry Pruning Clearance',
      featured: false,
      rating: 4.6,
      reviewCount: 18,
    },
  });

  // Product 9: UV Stabilized HDPE Grow Bags
  const prodGrowBags = await prisma.product.create({
    data: {
      slug: 'uv-stabilized-hdpe-terrace-garden-grow-bags-set',
      name: 'Heavy-Duty 260 GSM UV Stabilized Green Grow Bags (Pack of 5, Size 12x12 inch)',
      description: 'Long-lasting virgin HDPE green fabric grow bags treated with UV stabilizers to withstand intense Indian summers for over 5 years. Features reinforced drainage eyelets, double-stitched carry handles, and breathable root-aeration design for tomatoes, chillies, and terrace greens.',
      categoryId: catTools.id,
      farmerId: profileLakshmi.id,
      price: 349.0,
      compareAtPrice: 480.0,
      unit: 'Pack of 5 Grow Bags',
      stock: 80,
      sku: 'F2H-PROD-TOOL-09',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'West Godavari, Andhra Pradesh',
      harvestDate: 'Manufactured 2026',
      storageInstructions: 'Washable and foldable for seasonal storage.',
      shelfLifeDays: 1800,
      isOrganic: false,
      isVerified: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      farmerBasePrice: 331.5,
      commissionAmount: 17.5,
      certificationDetails: 'UV 260 GSM Tested',
      featured: false,
      rating: 4.9,
      reviewCount: 52,
    },
  });

  // Product 10 (PENDING APPROVAL BY ADMIN): Kashmiri Mamra Almonds
  const prodAlmonds = await prisma.product.create({
    data: {
      slug: 'naturally-sun-dried-kashmiri-mamra-almonds',
      name: 'Single-Origin Traditional Kashmiri Mamra Almonds (Unpolished Kandagari Giri)',
      description: 'Authentic high-oil content (over 50%) non-irrigated Kashmiri Mamra almonds grown organically on mountain slopes. Hand-cracked from hard shells, unbleached, and naturally sun-cured. Superior taste and nutritional density compared to imported California almonds.',
      categoryId: catProduce.id,
      farmerId: profileRamesh.id,
      price: 895.0,
      farmerBasePrice: 850.0,
      commissionAmount: 45.0,
      approvalStatus: 'PENDING',
      isActive: false, // Pending Admin Acceptance!
      compareAtPrice: 1100.0,
      unit: '500 g pouch',
      stock: 45,
      sku: 'F2H-PROD-MAMRA-10',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&auto=format&fit=crop&q=80',
      ]),
      originLocation: 'Pulwama & Anand Organic Collaborative, Kashmir / Gujarat',
      harvestDate: 'Fresh Autumn Harvest - Oct 2026',
      storageInstructions: 'Store in airtight glass jar in a cool, dry cupboard.',
      shelfLifeDays: 360,
      isOrganic: true,
      isVerified: true,
      certificationDetails: 'Pesticide-Free Himalayan Agroforestry Declaration',
      featured: false,
      rating: 4.9,
      reviewCount: 0,
    },
  });

  await prisma.farmPassport.create({
    data: {
      productId: prodAlmonds.id,
      batchNumber: 'F2H-2026-KM-ALM-01',
      farmName: 'Patel Natural Organics',
      farmerName: 'Ramesh Patel',
      location: 'Himalayan Slope Orchards (Audited Collaborative)',
      harvestDate: 'October 12, 2026',
      declaredPractices: 'Rainfed Mountain Farming, Zero Chemical Descaling, Sun-cured on Cotton Tarps',
      soilType: 'Virgin Mountain Slope Loam',
      waterSource: 'Direct Rainwater & Mountain Glacial Streams',
      chemicalFreeYears: 8,
      verificationBadge: 'Pending Verification by Admin Agronomist',
      traceabilityNotes: 'Batch sample submitted for NABL pesticide residue testing report.',
    },
  });

  // 6. Harvest Calendar Listings
  await prisma.harvestListing.createMany({
    data: [
      {
        farmerId: profileLakshmi.id,
        cropName: 'Geographical Indication (GI) Banganapalli Sweet Mangoes',
        category: 'Fruits',
        expectedHarvestDate: 'April 25, 2027',
        expectedQuantity: '2,500 kg',
        state: 'Andhra Pradesh',
        district: 'West Godavari',
        preOrderAvailable: true,
        preOrderPrice: 160.0,
        unit: '1 kg (approx 3 fruits)',
        description: 'Tree-ripened naturally without carbide. Golden yellow, fiberless pulp with rich natural aroma. Book early for farm-gate harvest priority delivery.',
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
        season: 'Zaid',
        status: 'UPCOMING',
      },
      {
        farmerId: profileGurpreet.id,
        cropName: 'Heirloom Aromatic Pusa Basmati 1121 Paddy',
        category: 'Grains',
        expectedHarvestDate: 'November 15, 2026',
        expectedQuantity: '8,000 kg',
        state: 'Punjab',
        district: 'Sangrur',
        preOrderAvailable: true,
        preOrderPrice: 125.0,
        unit: '1 kg',
        description: 'Single-origin traditional Basmati rice with grains that elongate to over 18mm when cooked. Irrigated with snowmelt river channels and biological pest prevention.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
        season: 'Kharif',
        status: 'UPCOMING',
      },
      {
        farmerId: profileRamesh.id,
        cropName: 'Winter Sweet Red Delhi Carrots (Desi Gajar)',
        category: 'Vegetables',
        expectedHarvestDate: 'December 05, 2026',
        expectedQuantity: '1,200 kg',
        state: 'Gujarat',
        district: 'Anand',
        preOrderAvailable: true,
        preOrderPrice: 42.0,
        unit: '1 kg',
        description: 'Naturally sweet deep red native carrots harvested with fresh crisp greens. High beta-carotene, ideal for traditional Gajar ka Halwa and raw cold-pressed salads.',
        image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800&auto=format&fit=crop&q=80',
        season: 'Rabi',
        status: 'UPCOMING',
      },
      {
        farmerId: profileMeenakshi.id,
        cropName: 'Fresh PKM-1 Drumsticks & Moringa Oleifera Pods',
        category: 'Vegetables',
        expectedHarvestDate: 'November 20, 2026',
        expectedQuantity: '900 kg',
        state: 'Tamil Nadu',
        district: 'Theni',
        preOrderAvailable: true,
        preOrderPrice: 65.0,
        unit: '1 kg',
        description: 'Tender fleshy organic drumsticks grown in sunny valley soil. Packed with plant calcium, vitamin C, and iron.',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
        season: 'Year-round',
        status: 'UPCOMING',
      },
    ],
  });

  // 7. Farm Waste Exchange Listings
  await prisma.wasteExchangeListing.createMany({
    data: [
      {
        sellerId: farmerGurpreet.id,
        sellerName: 'Gurpreet Singh Dhillon',
        sellerPhone: '+91 98140 87654',
        title: 'Clean Paddy Stubble & Straw Bales for Mulching & Oyster Mushroom Beds',
        description: 'Dry, mold-free paddy straw compacted into 18 kg square bales. Excellent for soil water conservation mulching in orchards, dairy cattle bedding, and mushroom substrate.',
        materialType: 'CROP_RESIDUE',
        quantity: '150 Bales (approx 2.7 Tonnes)',
        listingType: 'SALE',
        price: 80.0, // Rs 80 per bale
        state: 'Punjab',
        district: 'Sangrur',
        pincode: '148028',
        collectionTerms: 'Buyer arranges truck/trolley pickup from farm gate at Sunam village.',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
      },
      {
        sellerId: farmerMeenakshi.id,
        sellerName: 'Meenakshi Sundaram',
        sellerPhone: '+91 94432 10987',
        title: 'Raw Coconut Husks & Fibrous Coir Waste for Composting or Biochar',
        description: 'Surplus organic coconut husks from recent harvest de-husking. High lignin content, ideal for pyrolysis biochar making or moisture trenching around fruit trees.',
        materialType: 'COCONUT_HUSK',
        quantity: '2 Tractor Trolleys',
        listingType: 'DONATION',
        price: 0,
        state: 'Tamil Nadu',
        district: 'Theni',
        pincode: '625516',
        collectionTerms: 'Free for organic farmers and soil regenerators. Bring your own tractor trolley for loading.',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
      },
      {
        sellerId: farmerRamesh.id,
        sellerName: 'Ramesh Patel',
        sellerPhone: '+91 98251 43210',
        title: 'Well-Composted Aged Desi Cow Dung Manure for Organic Terrace Gardens',
        description: 'Seasoned 8-month-old desi Gir cow manure composted with dried neem leaves and dry straw. Crumbles like rich soil, no pungent smell, free from weed seeds.',
        materialType: 'MANURE',
        quantity: '40 Gunny Bags (approx 40 kg each)',
        listingType: 'EXCHANGE',
        price: 0,
        state: 'Gujarat',
        district: 'Anand',
        pincode: '388540',
        collectionTerms: 'Looking to exchange for native heirloom vegetable seeds or neem oil supplies.',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
      },
    ],
  });

  // 8. Blog Posts & Comments
  const post1 = await prisma.blogPost.create({
    data: {
      slug: 'how-to-prepare-vermicompost-at-home',
      title: 'How to Prepare Nutrient-Rich Vermicompost at Home for Terrace Gardens',
      excerpt: 'Learn the exact step-by-step method to turn kitchen scraps and dried garden leaves into dark, microbial-rich black gold using Eisenia fetida earthworms.',
      content: `## Why Vermicompost is the Gold Standard for Organic Gardening

Vermicomposting is the process of using specialized earthworms—most notably the red wiggler (*Eisenia fetida*)—to break down organic waste into a fine, nutrient-dense humus known as **vermicast** or **black gold**.

Unlike traditional cold heap composting which can take four to six months, vermicomposting operates rapidly, generates no foul odors when properly aerated, and concentrates plant-available nitrogen, phosphorus, potassium, and beneficial fungal mycorrhizae.

### 1. Choosing the Right Container
For terrace gardens and urban apartments, a shallow, breathable container works best:
- **Material:** Food-grade HDPE plastic bin or earthen terracotta pots.
- **Dimensions:** 2 feet wide, 3 feet long, and 1 to 1.5 feet deep. Earthworms are surface feeders and rarely dig deeper than 12 inches.
- **Drainage & Aeration:** Drill 6 to 8 small holes (1/8th inch) at the bottom for vermiwash runoff, and 10 to 12 holes around the upper rim for oxygen exchange.

### 2. Preparing the Worm Bedding
Never drop worms onto bare plastic or fresh food waste.
1. Soak shredded brown cardboard, coconut coir pith, or dry fallen leaves in water until damp like a wrung-out sponge.
2. Layer 4 to 6 inches of this bedding across the bottom of your container.
3. Sprinkle two handfuls of aged cow manure or rich garden soil to introduce beneficial decomposer bacteria.

### 3. What to Feed and What to Avoid
| Do Feed (Green & Brown Materials) | Never Feed in Vermicompost |
| --- | --- |
| Vegetable peels, carrot tops, gourd skins | Citrus peels (lemons, oranges) in large quantities |
| Spent tea leaves and coffee grounds | Onions, garlic, and hot chillies |
| Crushed eggshells (provides calcium) | Cooked oily food, dairy, meat, and bones |
| Soft ripe fruit scraps (melon, banana peels) | Dog or cat feces, plastic, chemical wrappers |

### 4. Harvesting Your Vermicast
Within 45 to 60 days, your bin will transform into a rich, dark brown material resembling fine coffee grounds. Push the finished compost to one side and add fresh kitchen scraps on the other side. Within 48 hours, the worms will migrate to the fresh food, allowing you to harvest the finished compost cleanly!`,
      coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80',
      authorId: farmerMeenakshi.id,
      authorName: 'Meenakshi Sundaram',
      authorRole: 'Organic Agroforestry Specialist',
      category: 'Vermicomposting',
      tags: 'Vermicompost, Kitchen Gardening, Organic Manure, Soil Health',
      readTimeMinutes: 6,
      language: 'en',
      likesCount: 84,
      viewsCount: 620,
    },
  });

  const post2 = await prisma.blogPost.create({
    data: {
      slug: 'understanding-neem-based-crop-protection',
      title: 'Neem-Based Crop Protection: Preparing Neemastra and Agniastra Organically',
      excerpt: 'Discover how traditional cold-pressed neem seed oil, neem leaf extracts, and botanical decoctions eliminate aphids, whiteflies, and borers without toxic chemical residues.',
      content: `## The Ancient Science of Neem in Indian Agriculture

The Neem tree (*Azadirachta indica*) has earned the venerable title of **Sarva Roga Nivarini** in Ayurvedic literature and is revered across Indian farming traditions as a natural bio-shield.

Unlike synthetic chemical neurotoxins that indiscriminately annihilate both harmful pests and pollinator honeybees, neem derivatives act as anti-feedants, insect growth regulators (IGR), and reproductive inhibitors.

### Understanding Active Compounds
The primary active limonoid in neem is **Azadirachtin**. When a sucking pest such as an aphid or leafhopper ingests plant sap treated with neem, the azadirachtin disrupts the insect's ecdysone hormone cascade, preventing molting and pupation.

### Recipe 1: Preparing Desi Neemastra
Neemastra is particularly effective against sucking pests, aphids, jassids, and caterpillar hatchlings.

**Ingredients Required:**
- 5 kg fresh, crushed neem leaves or 2 kg ground neem seed powder
- 5 litres fresh desi cow urine (Gomutra)
- 2 kg fresh desi cow dung
- 100 litres clean water

**Preparation Steps:**
1. In a shaded plastic barrel, thoroughly combine the water, cow dung, and Gomutra using a wooden paddle.
2. Add the finely crushed neem foliage.
3. Cover the drum with a breathable cotton or jute sheet to protect from direct flies.
4. Stir clockwise twice a day for 48 hours.
5. Strain through a fine muslin cloth and spray directly without further dilution.

### Safety and Application Best Practices
- **Spray Time:** Always spray during the late afternoon (4 PM onwards). Sunlight rapidly degrades the active azadirachtin molecules.
- **Coverage:** Ensure thorough coverage on the undersides of leaves where aphids, whiteflies, and spider mites nest.`,
      coverImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&auto=format&fit=crop&q=80',
      authorId: farmerRamesh.id,
      authorName: 'Ramesh Patel',
      authorRole: 'Pioneer, Subhash Palekar Natural Farming',
      category: 'Neem-Based Pest Management',
      tags: 'Neem, Organic Pest Control, Neemastra, ZBNF, Natural Farming',
      readTimeMinutes: 7,
      language: 'en',
      likesCount: 112,
      viewsCount: 940,
    },
  });

  const post3 = await prisma.blogPost.create({
    data: {
      slug: 'beginners-guide-to-kitchen-and-terrace-gardening',
      title: 'A Beginner’s Guide to Kitchen and Terrace Gardening in Indian Cities',
      excerpt: 'Transform your balcony or rooftop into an abundant edible sanctuary with the right potting mix, companion plants, and low-cost irrigation tricks.',
      content: `## Bringing the Farm to Your Rooftop

Growing your own organic greens and vegetables is not just a rewarding weekend hobby; it is a profound step towards food sovereignty, nutritional wellness, and mental calm in busy urban lives.

Whether you have a 40-square-foot apartment balcony in Bengaluru or a 600-square-foot open terrace in Hyderabad, you can easily grow 40% to 70% of your family's daily salad and vegetable needs.

### 1. The Ideal Soil-Less Potting Mix
The single biggest mistake new terrace gardeners make is filling pots with heavy garden mud. Heavy mud compacts, drowns root hairs, and stresses building roofs with excessive wet weight.

**The Golden 40:40:20 Ratio:**
- **40% Washed Cocopeat:** Provides moisture retention and feather-light structure.
- **40% Well-Cured Vermicompost or Cow Manure:** Supplies slow-release bio-nutrients.
- **20% Aeration Base:** Perlite, coarse river sand, or rice husk to ensure drainage.
- Add 2 tablespoons of cold-pressed neem cake per 10-inch pot to protect tender root tips against soil grubs.

### 2. High-Yield Vegetables for Beginners
Start with forgiving, fast-growing varieties to build confidence:
1. **Palak (Spinach) & Methi (Fenugreek):** First harvest in just 21 days!
2. **Cherry Tomatoes:** Highly productive in 12x12 inch grow bags with simple bamboo staking.
3. **Green Chillies (Desi Guntur or Birdseye):** Thrives in full Indian sunlight with minimal water.
4. **Bush Beans & Cluster Beans (Gawar):** Enriches pot soil with nitrogen while yielding continuous pods.`,
      coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80',
      authorId: farmerLakshmi.id,
      authorName: 'Lakshmi Narayana Rao',
      authorRole: 'Agronomist & Heritage Seed Conserver',
      category: 'Kitchen Gardening',
      tags: 'Kitchen Garden, Terrace Garden, Potting Mix, Urban Farming',
      readTimeMinutes: 5,
      language: 'en',
      likesCount: 95,
      viewsCount: 780,
    },
  });

  // Comments
  await prisma.blogComment.createMany({
    data: [
      {
        postId: post1.id,
        userId: customerPriya.id,
        userName: 'Priya Sharma',
        content: 'I followed your vermicompost bedding technique on my Bengaluru balcony and in 5 weeks my tomato plants are showing incredible flowering! Thank you Meenakshiji.',
      },
      {
        postId: post2.id,
        userId: customerRajesh.id,
        userName: 'Rajesh Kumar Verma',
        content: 'Neemastra saved my terrace brinjal crop from whiteflies completely within three days of late evening spraying.',
      },
    ],
  });

  // 9. Reviews for Products
  await prisma.review.createMany({
    data: [
      {
        productId: prodTomato.id,
        userId: customerPriya.id,
        userName: 'Priya Sharma',
        rating: 5,
        comment: 'Unbelievable taste! You can immediately smell the difference compared to wax-coated supermarket tomatoes. Made traditional rasam and the flavor was outstanding.',
        verifiedPurchase: true,
      },
      {
        productId: prodTomato.id,
        userId: customerRajesh.id,
        userName: 'Rajesh Kumar Verma',
        rating: 5,
        comment: 'Fresh, firm, and delivered within 24 hours of harvest. The Farm Passport QR code gave complete peace of mind seeing Ramesh Patel’s chemical-free farm.',
        verifiedPurchase: true,
      },
      {
        productId: prodVermicompost.id,
        userId: customerPriya.id,
        userName: 'Priya Sharma',
        rating: 5,
        comment: 'Dark, completely odorless, and wonderfully textured. My rose plants put out new flushes within 10 days of top-dressing.',
        verifiedPurchase: true,
      },
      {
        productId: prodSeeds.id,
        userId: customerRajesh.id,
        userName: 'Rajesh Kumar Verma',
        rating: 5,
        comment: 'Germination rate was almost 90%! The palak and coriander popped up in four days. Beautiful heirloom packing.',
        verifiedPurchase: true,
      },
    ],
  });

  // 10. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'FARM10',
        description: '10% discount on all fresh produce directly from local farms',
        discountPercent: 10,
        discountMaxAmount: 150.0,
        minOrderAmount: 299.0,
        isActive: true,
      },
      {
        code: 'ORGANIC20',
        description: '20% off on all organic manures, vermicompost, and soil care supplies',
        discountPercent: 20,
        discountMaxAmount: 250.0,
        minOrderAmount: 499.0,
        isActive: true,
      },
      {
        code: 'HARVEST100',
        description: 'Flat ₹100 instant discount on orders above ₹899',
        discountPercent: 12,
        discountMaxAmount: 100.0,
        minOrderAmount: 899.0,
        isActive: true,
      },
    ],
  });

  // 11. PIN Code Delivery Database
  await prisma.pinCodeDelivery.createMany({
    data: [
      { pincode: '560103', district: 'Bengaluru Urban', state: 'Karnataka', isDeliverable: true, estimatedDays: 1, standardRate: 40.0 },
      { pincode: '560001', district: 'Bengaluru Urban', state: 'Karnataka', isDeliverable: true, estimatedDays: 1, standardRate: 40.0 },
      { pincode: '500081', district: 'Hyderabad', state: 'Telangana', isDeliverable: true, estimatedDays: 2, standardRate: 40.0 },
      { pincode: '500034', district: 'Hyderabad', state: 'Telangana', isDeliverable: true, estimatedDays: 2, standardRate: 40.0 },
      { pincode: '110001', district: 'New Delhi', state: 'Delhi', isDeliverable: true, estimatedDays: 3, standardRate: 60.0 },
      { pincode: '400001', district: 'Mumbai', state: 'Maharashtra', isDeliverable: true, estimatedDays: 2, standardRate: 50.0 },
      { pincode: '600001', district: 'Chennai', state: 'Tamil Nadu', isDeliverable: true, estimatedDays: 2, standardRate: 45.0 },
      { pincode: '388540', district: 'Anand', state: 'Gujarat', isDeliverable: true, estimatedDays: 2, standardRate: 40.0 },
      { pincode: '534211', district: 'West Godavari', state: 'Andhra Pradesh', isDeliverable: true, estimatedDays: 2, standardRate: 40.0 },
      { pincode: '148028', district: 'Sangrur', state: 'Punjab', isDeliverable: true, estimatedDays: 3, standardRate: 60.0 },
    ],
  });

  // 12. Sample Confirmed Order for Customer Priya
  const orderPriya = await prisma.order.create({
    data: {
      orderNumber: 'F2H-ORD-88219',
      userId: customerPriya.id,
      status: 'CONFIRMED',
      subtotal: 546.0,
      shippingFee: 40.0,
      discountAmount: 50.0,
      totalAmount: 536.0,
      couponCode: 'FARM10',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      deliverySlot: 'Morning Slot (7 AM - 11 AM)',
      estimatedDelivery: 'Tomorrow Morning',
      deliveryAddress: JSON.stringify({
        fullName: 'Priya Sharma',
        phone: '+91 99887 66554',
        addressLine1: 'Flat 402, Green Glen Gardens, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
      }),
      items: {
        create: [
          {
            productId: prodTomato.id,
            farmerId: profileRamesh.id,
            productName: prodTomato.name,
            productUnit: prodTomato.unit,
            priceAtPurchase: 48.0,
            quantity: 2,
            itemTotal: 96.0,
          },
          {
            productId: prodVermicompost.id,
            farmerId: profileMeenakshi.id,
            productName: prodVermicompost.name,
            productUnit: prodVermicompost.unit,
            priceAtPurchase: 249.0,
            quantity: 1,
            itemTotal: 249.0,
          },
          {
            productId: prodSeeds.id,
            farmerId: profileLakshmi.id,
            productName: prodSeeds.name,
            productUnit: prodSeeds.unit,
            priceAtPurchase: 299.0,
            quantity: 1,
            itemTotal: 299.0,
          },
        ],
      },
    },
  });

  // 13. Platform Commission Payments
  await prisma.commissionPayment.createMany({
    data: [
      {
        farmerId: profileRamesh.id,
        amount: 450.0,
        paymentMethod: 'UPI',
        transactionUtr: '428910398412',
        status: 'COMPLETED',
        notes: 'October 2026 Platform Facilitation Commission (5% on ₹9,000 GMV)',
      },
      {
        farmerId: profileLakshmi.id,
        amount: 580.0,
        paymentMethod: 'UPI',
        transactionUtr: '428910400192',
        status: 'COMPLETED',
        notes: 'October 2026 Platform Facilitation Commission (5% on ₹11,600 GMV)',
      },
      {
        farmerId: profileMeenakshi.id,
        amount: 410.0,
        paymentMethod: 'UPI',
        transactionUtr: '428910512831',
        status: 'COMPLETED',
        notes: 'Platform Facilitation Commission (5%)',
      },
    ],
  });

  console.log(`Database seeded successfully! Created Order ${orderPriya.orderNumber}`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
