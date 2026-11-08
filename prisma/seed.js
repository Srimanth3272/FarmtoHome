const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Farm to Home database with Food Delivery & Verified Products catalog...');

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

  const adminHashedPassword = await bcrypt.hash('Srimanth@3272', 10);

  // 1. Founder & Super Admin User (Srimanth Nagalakunta)
  const founder = await prisma.user.upsert({
    where: { email: 'srimanth3272@farmtohome.in' },
    update: {
      name: 'Srimanth Nagalakunta',
      role: 'ADMIN',
      isVerified: true,
      phone: '+91 98480 12345',
      password: adminHashedPassword,
    },
    create: {
      id: 'user-srimanth-founder',
      name: 'Srimanth Nagalakunta',
      email: 'srimanth3272@farmtohome.in',
      password: adminHashedPassword,
      phone: '+91 98480 12345',
      role: 'ADMIN',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  // Secondary email for legacy founder
  await prisma.user.upsert({
    where: { email: 'sreemanthnagalakunta@gmail.com' },
    update: {
      role: 'ADMIN',
      isVerified: true,
      password: adminHashedPassword,
    },
    create: {
      id: 'user-sreemanth-legacy',
      name: 'Srimanth Nagalakunta',
      email: 'sreemanthnagalakunta@gmail.com',
      password: adminHashedPassword,
      phone: '+91 98480 12345',
      role: 'ADMIN',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  const farmerProfile = await prisma.farmerProfile.upsert({
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

  // 2. Official Product Categories
  const categories = [
    {
      id: 'cat-food-delivery',
      slug: 'food-delivery',
      name: 'Dhaba Food & Village Kitchen',
      description: 'Hot village-style meals, slow-cooked clay pot dal tadka, rich paneer gravies, woodfire rotis, and country-style delicacies freshly prepared and delivered fast.',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
      icon: 'UtensilsCrossed',
    },
    {
      id: 'cat-dosas-parothas',
      slug: 'dosas-parothas',
      name: 'Dosas & Parothas Express',
      description: 'Crispy golden desi ghee roast dosas, Andhra MLA pesarattu, stuffed Punjabi dhaba aloo parathas, and flaky layered Malabar parottas served with fresh chutneys and sambar.',
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
      icon: 'Flame',
    },
    {
      id: 'cat-pickles',
      slug: 'pickles',
      name: 'Traditional Andhra Pickles & Pachallu',
      description: 'Heritage home-crafted pickles made with cold-pressed sesame oil, native Guntur chillies, organic raw mangoes, gongura leaves, and stone-ground spices.',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      icon: 'Soup',
    },
    {
      id: 'cat-sweets',
      slug: 'sweets',
      name: 'Desi Ghee Sweets & Mithai',
      description: 'Pure A2 desi cow ghee sweets, traditional Tirupati laddus, melt-in-mouth Mysore Pak, Bellam Bobbatlu, and festive delicacies made without artificial chemicals.',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      icon: 'Cake',
    },
    {
      id: 'cat-hots',
      slug: 'hots',
      name: 'Hot Savories & Desi Namkeen',
      description: 'Crunchy homemade Janthikalu, spicy Andhra mixture, Chekodilu, roasted masala peanuts, and kara boondi prepared using cold-pressed peanut oil.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
      icon: 'Sparkles',
    },
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

  // 3. Products Catalog Seed (Dhaba, Dosas, Parothas, Pickles, Sweets, Hots, and Single Clean Mango)
  const productsToSeed = [
    // Dhaba Food Items
    {
      id: 'prod-dhaba-dal-tadka',
      slug: 'dhaba-dal-tadka-jeera-rice',
      name: 'Grand Dhaba Clay Pot Dal Tadka & Jeera Rice Meal',
      description: 'Authentic highway dhaba style slow-simmered yellow arhar dal with smoky ghee tadka, jeera basmati rice, papad, and fresh mint chutney.',
      categoryId: 'cat-food-delivery',
      farmerId: 'farmer-sreemanth-founder',
      price: 180,
      compareAtPrice: 220,
      unit: '1 Thali Combo',
      stock: 50,
      images: JSON.stringify(['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Vijayawada Highway Dhaba Kitchen, NTR District',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.9,
      reviewCount: 38,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-dhaba-paneer-butter-masala',
      slug: 'dhaba-paneer-butter-masala',
      name: 'Dhaba Shahi Paneer Butter Masala with Tandoori Roti',
      description: 'Fresh country cottage cheese cubes in rich tomato, butter, and cashew gravy served with 3 soft clay-oven tandoori rotis and spiced onion salad.',
      categoryId: 'cat-food-delivery',
      farmerId: 'farmer-sreemanth-founder',
      price: 220,
      compareAtPrice: 260,
      unit: 'Curry + 3 Rotis',
      stock: 45,
      images: JSON.stringify(['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Village Desi Kitchen, NTR District',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.8,
      reviewCount: 42,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-village-natukodi-gravy',
      slug: 'village-natukodi-gravy-bagara-rice',
      name: 'Village Style Natukodi (Country Chicken) Gravy with Bagara Rice',
      description: 'Free-range country chicken cooked in stone-ground spices and spicy village gravy, paired with fragrant aromatic bagara rice.',
      categoryId: 'cat-food-delivery',
      farmerId: 'farmer-sreemanth-founder',
      price: 280,
      compareAtPrice: 340,
      unit: '1 Special Meal',
      stock: 30,
      images: JSON.stringify(['https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Krishna Delta Country Kitchen, Andhra Pradesh',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 5.0,
      reviewCount: 56,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-punjabi-dhaba-lassi',
      slug: 'punjabi-dhaba-malai-lassi',
      name: 'Punjabi Dhaba Thick Sweet Malai Lassi in Clay Kulhad',
      description: 'Traditional thick curd churned with cardamom, topped with thick malai, crushed pistachios, and saffron in an authentic clay cup.',
      categoryId: 'cat-food-delivery',
      farmerId: 'farmer-sreemanth-founder',
      price: 70,
      compareAtPrice: 90,
      unit: '350 ml Clay Cup',
      stock: 60,
      images: JSON.stringify(['https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Dairy Heritage Hub, Vijayawada',
      isOrganic: true,
      isVerified: true,
      featured: false,
      rating: 4.9,
      reviewCount: 29,
      approvalStatus: 'APPROVED',
      isActive: true,
    },

    // Dosas & Parothas
    {
      id: 'prod-ghee-karam-dosa',
      slug: 'ghee-karam-podi-dosa',
      name: 'Crisp Desi Ghee Karam Podi Dosa with 3 Chutneys & Sambar',
      description: 'Golden fermented rice-urad batter crepe roasted crisp in pure desi ghee, smeared with spicy garlic red chilli karam and gun powder podi.',
      categoryId: 'cat-dosas-parothas',
      farmerId: 'farmer-sreemanth-founder',
      price: 110,
      compareAtPrice: 140,
      unit: '2 Crispy Dosas',
      stock: 60,
      images: JSON.stringify(['https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Tiffin Center Hub, Vijayawada',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 5.0,
      reviewCount: 64,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-mla-pesarattu-upma',
      slug: 'mla-pesarattu-upma',
      name: 'Andhra Special MLA Pesarattu Upma with Allam Chutney',
      description: 'Authentic green gram (moong dal) crepe stuffed with seasoned roasted suji upma, served with sweet-tangy ginger (allam) pachadi and coconut chutney.',
      categoryId: 'cat-dosas-parothas',
      farmerId: 'farmer-sreemanth-founder',
      price: 130,
      compareAtPrice: 160,
      unit: '2 Pesarattu + Upma',
      stock: 50,
      images: JSON.stringify(['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Krishna Delta Tiffins, NTR District',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.9,
      reviewCount: 45,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-dhaba-aloo-paratha',
      slug: 'dhaba-stuffed-aloo-paratha',
      name: 'Dhaba Stuffed Aloo Paratha with White Makkhan & Curd',
      description: 'Wholesome whole wheat flatbread stuffed with spiced mashed potatoes, fresh green coriander, and roasted cumin. Served with farm butter and creamy curd.',
      categoryId: 'cat-dosas-parothas',
      farmerId: 'farmer-sreemanth-founder',
      price: 140,
      compareAtPrice: 170,
      unit: '2 Stuffed Parathas + Butter',
      stock: 45,
      images: JSON.stringify(['https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Punjab-Andhra Kitchen Hub, Vijayawada',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.9,
      reviewCount: 37,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-malabar-parotta-kurma',
      slug: 'malabar-parotta-veg-kurma',
      name: 'Layered Malabar Parotta with Rich Veg Kurma',
      description: 'Multi-layered flaky, soft parotta beaten to perfection, accompanied by aromatic coconut and vegetable kurma cooked in mild coastal spices.',
      categoryId: 'cat-dosas-parothas',
      farmerId: 'farmer-sreemanth-founder',
      price: 120,
      compareAtPrice: 150,
      unit: '3 Flaky Parottas + Kurma',
      stock: 40,
      images: JSON.stringify(['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Coastal Kitchen, Visakhapatnam',
      isOrganic: true,
      isVerified: true,
      featured: false,
      rating: 4.7,
      reviewCount: 22,
      approvalStatus: 'APPROVED',
      isActive: true,
    },

    // Pickles & Pachallu
    {
      id: 'prod-andhra-avakaya-pickle',
      slug: 'andhra-avakaya-mango-pickle',
      name: 'Authentic Andhra Avakaya (Raw Mango) Pickle in Cold-Pressed Sesame Oil',
      description: 'Handmade heritage recipe using firm green mango pieces, fiery Guntur red chilli powder, mustard powder, garlic cloves, and pure cold-pressed gingelly oil.',
      categoryId: 'cat-pickles',
      farmerId: 'farmer-sreemanth-founder',
      price: 190,
      compareAtPrice: 240,
      unit: '500g Glass Jar',
      stock: 75,
      images: JSON.stringify(['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Mylavaram Groves, NTR District, Andhra Pradesh',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 5.0,
      reviewCount: 88,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-andhra-gongura-pachadi',
      slug: 'andhra-gongura-pachadi',
      name: 'Traditional Andhra Gongura Pachadi (Guntur Sorrel Leaves)',
      description: 'Signature tang of freshly plucked red-stem Gongura leaves sautéed with green chillies, fenugreek, garlic, and seasoned in cold-pressed oil.',
      categoryId: 'cat-pickles',
      farmerId: 'farmer-sreemanth-founder',
      price: 170,
      compareAtPrice: 210,
      unit: '500g Jar',
      stock: 65,
      images: JSON.stringify(['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Guntur Rural Farms, Andhra Pradesh',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.9,
      reviewCount: 52,
      approvalStatus: 'APPROVED',
      isActive: true,
    },

    // Sweets & Mithai
    {
      id: 'prod-tirupati-ghee-laddu',
      slug: 'tirupati-ghee-laddu',
      name: 'Tirupati Style Desi Cow Ghee Laddu (Dry Fruits Infused)',
      description: 'Golden gram flour pearls cooked in aromatic A2 desi cow ghee, seasoned with cardamom, green camphor, cashews, raisins, and pure mishri sugar crystals.',
      categoryId: 'cat-sweets',
      farmerId: 'farmer-sreemanth-founder',
      price: 260,
      compareAtPrice: 320,
      unit: '500g Box (8 Pcs)',
      stock: 70,
      images: JSON.stringify(['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Tirupati Temple Foothills Sweet Guild, Tirupati',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 5.0,
      reviewCount: 112,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-pure-ghee-mysore-pak',
      slug: 'pure-ghee-mysore-pak',
      name: 'Traditional Melt-in-Mouth Pure Ghee Mysore Pak',
      description: 'Silky, honeycomb-textured confection crafted by slow roasting roasted besan in piping hot pure desi ghee until it dissolves softly on the tongue.',
      categoryId: 'cat-sweets',
      farmerId: 'farmer-sreemanth-founder',
      price: 240,
      compareAtPrice: 290,
      unit: '500g Box',
      stock: 55,
      images: JSON.stringify(['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Krishna Confectionery Guild, Vijayawada',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.9,
      reviewCount: 48,
      approvalStatus: 'APPROVED',
      isActive: true,
    },

    // Hot Savories (Hots)
    {
      id: 'prod-traditional-rice-janthikalu',
      slug: 'traditional-rice-janthikalu',
      name: 'Traditional Crunchy Rice Janthikalu / Murukku (Cold-Pressed Oil)',
      description: 'Crispy spiral savory snacks made from freshly ground raw rice flour, roasted urad dal, ajwain seeds, and sesame, fried in cold-pressed peanut oil.',
      categoryId: 'cat-hots',
      farmerId: 'farmer-sreemanth-founder',
      price: 130,
      compareAtPrice: 160,
      unit: '400g Pack',
      stock: 80,
      images: JSON.stringify(['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'NTR District Cottage Snacks, Andhra Pradesh',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.9,
      reviewCount: 42,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-andhra-royal-mixture',
      slug: 'andhra-royal-mixture',
      name: 'Spicy Andhra Royal Mixture with Fried Cashews & Curry Leaves',
      description: 'Crispy sev, roasted cashews, fried groundnuts, boondi, and crunchy poha tossed in fiery red chilli and garlic seasoning.',
      categoryId: 'cat-hots',
      farmerId: 'farmer-sreemanth-founder',
      price: 150,
      compareAtPrice: 190,
      unit: '400g Pack',
      stock: 75,
      images: JSON.stringify(['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Guntur Snacking Guild, Andhra Pradesh',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.8,
      reviewCount: 39,
      approvalStatus: 'APPROVED',
      isActive: true,
    },

    // ONLY ONE SINGLE AUTHENTIC BANAGANAPALLI MANGO PRODUCT (NO DUPLICATES)
    {
      id: 'prod-gi-banganapalli-mangoes',
      slug: 'gi-banganapalli-sweet-mangoes',
      name: 'Farm Fresh GI Banganapalli Sweet Mangoes (Naturally Tree Ripened)',
      description: 'Authentic Geographical Indication certified sweet Banganapalli mangoes. Naturally tree-ripened without harmful calcium carbide. Fiberless golden yellow pulp with rich fragrance.',
      categoryId: 'cat-fresh-produce',
      farmerId: 'farmer-sreemanth-founder',
      price: 180,
      compareAtPrice: 220,
      unit: '1 kg (approx 3 fruits)',
      stock: 120,
      images: JSON.stringify(['https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Nuzvid Organic Mango Orchards, Eluru / Krishna Delta',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 5.0,
      reviewCount: 94,
      approvalStatus: 'APPROVED',
      isActive: true,
    },

    // Staples & Organics
    {
      id: 'prod-sona-masoori-rice',
      slug: 'krishna-delta-sona-masoori-rice',
      name: 'Krishna Delta Sona Masoori Raw Rice (Aged 1 Year)',
      description: 'Naturally aged non-hybrid pesticide-free Sona Masoori grain from the nutrient-rich alluvial soils of the Krishna River basin. Light, aromatic, and easy on digestion.',
      categoryId: 'cat-fresh-produce',
      farmerId: 'farmer-sreemanth-founder',
      price: 85,
      compareAtPrice: 110,
      unit: '1 kg',
      stock: 200,
      images: JSON.stringify(['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Avanigadda Alluvial Paddy Belt, Krishna District',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 4.9,
      reviewCount: 58,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-desi-gir-cow-ghee',
      slug: 'desi-gir-cow-a2-bilona-ghee',
      name: 'Handcrafted Desi Gir Cow A2 Vedic Bilona Ghee',
      description: 'Prepared using traditional ancient wooden churn bilona process from the whole curd of grass-fed native Gir cows. Golden, granular texture with therapeutic aroma.',
      categoryId: 'cat-fresh-produce',
      farmerId: 'farmer-sreemanth-founder',
      price: 850,
      compareAtPrice: 1050,
      unit: '500 ml Glass Jar',
      stock: 45,
      images: JSON.stringify(['https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Chittoor Desi Cow Goshala, Andhra Pradesh',
      isOrganic: true,
      isVerified: true,
      featured: true,
      rating: 5.0,
      reviewCount: 72,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-earthworm-vermicompost',
      slug: 'earthworm-vermicompost-black-gold',
      name: 'Enriched Desi Earthworm Vermicompost (Black Gold)',
      description: '100% pure organic compost converted by Eisenia fetida earthworms from cow dung and farm crop residue. High organic carbon and humic acid for soil revival.',
      categoryId: 'cat-organic-farming',
      farmerId: 'farmer-sreemanth-founder',
      price: 320,
      compareAtPrice: 400,
      unit: '10 kg Eco Bag',
      stock: 90,
      images: JSON.stringify(['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Gannavaram Vermicompost Hub, NTR District',
      isOrganic: true,
      isVerified: true,
      featured: false,
      rating: 4.9,
      reviewCount: 34,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    {
      id: 'prod-native-seed-kit',
      slug: 'native-seed-starter-kit',
      name: 'Native Desi Vegetable Seed Starter Kit (12 Heirloom Varieties)',
      description: 'Heirloom open-pollinated non-GMO seeds including country tomato, bhendi, ridge gourd, brinjal, palak, and coriander. Conserved by traditional seed savers.',
      categoryId: 'cat-seeds-and-planting',
      farmerId: 'farmer-sreemanth-founder',
      price: 199,
      compareAtPrice: 280,
      unit: '1 Kit (12 Packs)',
      stock: 110,
      images: JSON.stringify(['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop&q=80']),
      originLocation: 'Andhra Desi Seed Bank, Amaravati',
      isOrganic: true,
      isVerified: true,
      featured: false,
      rating: 4.8,
      reviewCount: 41,
      approvalStatus: 'APPROVED',
      isActive: true,
    },
  ];

  // Fetch all categories to map IDs accurately
  const allDbCats = await prisma.category.findMany();
  const catSlugMap = new Map();
  for (const c of allDbCats) {
    catSlugMap.set(c.slug, c.id);
    catSlugMap.set(c.id, c.id);
    catSlugMap.set(`cat-${c.slug}`, c.id);
  }

  for (const prod of productsToSeed) {
    const resolvedCatId = catSlugMap.get(prod.categoryId) || 
      catSlugMap.get(prod.categoryId.replace(/^cat-/, '')) || 
      allDbCats[0]?.id;

    const prodPayload = {
      ...prod,
      categoryId: resolvedCatId,
      farmerId: farmerProfile.id,
    };

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prodPayload,
      create: prodPayload,
    });
  }

  // Also sync to local data/community-products.json so offline / instant sync has clean items
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const communityProducts = productsToSeed.map((p) => {
    const cat = categories.find((c) => c.id === p.categoryId);
    return {
      ...p,
      category: cat ? { id: cat.id, slug: cat.slug, name: cat.name } : undefined,
      farmer: {
        id: farmerProfile.id,
        farmName: farmerProfile.farmName,
        state: farmerProfile.state,
        district: farmerProfile.district,
        isOrganicCertified: true,
        verificationStatus: 'VERIFIED',
        rating: 5.0,
        user: { name: founder.name, avatar: founder.avatar },
      },
    };
  });
  fs.writeFileSync(path.join(dataDir, 'community-products.json'), JSON.stringify(communityProducts, null, 2), 'utf-8');

  // 4. Coupons
  await prisma.coupon.upsert({
    where: { code: 'FARM10' },
    update: {},
    create: {
      code: 'FARM10',
      description: '10% Flat Discount on Fresh Organic Farm Harvests & Food',
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

  console.log(`Seed completed successfully! Inserted ${categories.length} categories and ${productsToSeed.length} clean products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
