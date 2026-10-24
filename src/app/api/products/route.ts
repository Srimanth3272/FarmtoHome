import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const farmerId = searchParams.get('farmerId');
    const featured = searchParams.get('featured');
    const organicOnly = searchParams.get('organic');
    const sort = searchParams.get('sort'); // price-low, price-high, rating, newest
    const includePending = searchParams.get('includePending') === 'true';

    const where: any = {};

    if (!includePending) {
      where.isActive = true;
      where.approvalStatus = 'APPROVED';
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (farmerId) {
      where.farmerId = farmerId;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (organicOnly === 'true') {
      where.isOrganic = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { originLocation: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        farmer: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        farmPassport: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      categoryId,
      farmerId,
      price,
      farmerBasePrice,
      commissionAmount,
      compareAtPrice,
      unit,
      stock,
      images,
      originLocation,
      harvestDate,
      isOrganic,
      certificationDetails,
      shelfLifeDays,
      storageInstructions,
      // Farmer verification attributes
      aadharNumber,
      phone,
      email,
      // Digital Farm Passport attributes
      declaredPractices,
      soilType,
      waterSource,
      chemicalFreeYears,
    } = body;

    // Validate required fields
    if (!name || !categoryId || !farmerId || !price) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: name, category, farmer, and price are required.' },
        { status: 400 }
      );
    }

    // Verify or find farmer profile
    let farmer = await prisma.farmerProfile.findFirst({
      where: {
        OR: [{ id: farmerId }, { userId: farmerId }],
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!farmer) {
      // Find default verified farmer for demo session
      farmer = await prisma.farmerProfile.findFirst({
        include: {
          user: { select: { name: true } },
        },
      });
    }

    if (farmer && (aadharNumber || phone || email)) {
      // Update farmer contact and Aadhaar if provided during upload
      await prisma.farmerProfile.update({
        where: { id: farmer.id },
        data: {
          aadharNumber: aadharNumber || farmer.aadharNumber,
          phone: phone || farmer.phone,
          email: email || farmer.email,
        },
      });
    }

    const numericPrice = parseFloat(price);
    const basePrice = farmerBasePrice ? parseFloat(farmerBasePrice) : Math.round(numericPrice * 0.95 * 10) / 10;
    const commission = commissionAmount ? parseFloat(commissionAmount) : Math.round(numericPrice * 0.05 * 10) / 10;

    const generatedSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString().slice(-4);

    // Create Product with PENDING approval and isActive: false
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || 'Naturally cultivated agricultural product from verified regional farm.',
        categoryId,
        farmerId: farmer ? farmer.id : farmerId,
        price: numericPrice,
        farmerBasePrice: basePrice,
        commissionAmount: commission,
        approvalStatus: 'PENDING', // Requires Admin Acceptance!
        isActive: false,           // Inactive until Admin approval!
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        unit: unit || '1 kg',
        stock: parseInt(stock, 10) || 50,
        images: typeof images === 'string' ? images : JSON.stringify(images || ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80']),
        originLocation: originLocation || (farmer ? `${farmer.district}, ${farmer.state}` : 'India'),
        harvestDate: harvestDate || 'Fresh Harvest Cycle',
        storageInstructions: storageInstructions || 'Store in cool ventilated space away from direct sunlight.',
        shelfLifeDays: shelfLifeDays ? parseInt(shelfLifeDays, 10) : 14,
        isOrganic: Boolean(isOrganic),
        isVerified: true,
        certificationDetails: certificationDetails || 'PGS-India / Jaivik Bharat Declaration',
      },
    });

    // Create associated Digital Farm Passport
    const batchNumber = `F2H-2026-${(farmer?.state || 'IND').slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    await prisma.farmPassport.create({
      data: {
        productId: newProduct.id,
        batchNumber,
        farmName: farmer?.farmName || 'Verified Family Farm',
        farmerName: farmer?.user?.name || farmer?.farmName || 'Verified Farmer',
        location: originLocation || `${farmer?.district || 'Central'}, ${farmer?.state || 'India'}`,
        harvestDate: harvestDate || 'Current Season Harvest',
        declaredPractices: declaredPractices || farmer?.farmingMethods || 'Zero Synthetic Chemical Spray, Desi Cow Jeevamrutha, Crop Mulch',
        soilType: soilType || 'Fertile Loam rich in Organic Carbon',
        waterSource: waterSource || 'Tubewell & Rainwater Harvesting',
        chemicalFreeYears: chemicalFreeYears ? parseInt(chemicalFreeYears, 10) : (farmer?.experienceYears || 5),
        verificationBadge: 'Pending Admin Verification Audit',
        traceabilityNotes: `Batch submitted with 5% Platform Facilitation Commission agreement (Base: ₹${basePrice}, Commission: ₹${commission}).`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product submitted successfully! It is now in the Admin Verification queue. Once accepted, it will be published for sale.',
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
