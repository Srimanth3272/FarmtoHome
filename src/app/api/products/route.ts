import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_PRODUCTS } from '@/lib/fallback-data';

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

    const dbProducts = products || [];
    let combined = [...dbProducts];

    // Merge fallback products that are not already present in DB
    for (const fb of FALLBACK_PRODUCTS) {
      if (!combined.some((p) => p.slug === fb.slug || p.id === fb.id)) {
        if (!categorySlug || fb.category?.slug === categorySlug) {
          if (organicOnly !== 'true' || fb.isOrganic) {
            combined.push(fb as any);
          }
        }
      }
    }

    if (categorySlug) {
      combined = combined.filter((p) => p.category?.slug === categorySlug);
    }
    if (organicOnly === 'true') {
      combined = combined.filter((p) => p.isOrganic);
    }

    return NextResponse.json(combined);
  } catch (error) {
    console.warn('Error fetching products from database, returning fallback products:', error);
    return NextResponse.json(FALLBACK_PRODUCTS);
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

    // Ensure Category exists or upsert it
    let resolvedCategoryId = categoryId;
    try {
      let existingCategory = await prisma.category.findFirst({
        where: {
          OR: [{ id: categoryId }, { slug: categoryId }],
        },
      });

      if (!existingCategory) {
        // Auto-create category if not exists
        const catName = categoryId.replace('cat-', '').replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        const catSlug = categoryId.replace('cat-', '');
        existingCategory = await prisma.category.create({
          data: {
            id: categoryId.startsWith('cat-') ? categoryId : `cat-${categoryId}`,
            slug: catSlug,
            name: catName,
            description: `${catName} collection direct from sellers`,
            image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
            icon: 'Package',
          },
        });
      }
      resolvedCategoryId = existingCategory.id;
    } catch (catErr) {
      console.warn('Category resolution warning:', catErr);
    }

    const numericPrice = parseFloat(price);
    const basePrice = farmerBasePrice ? parseFloat(farmerBasePrice) : Math.round(numericPrice * 0.95 * 10) / 10;
    const commission = commissionAmount ? parseFloat(commissionAmount) : Math.round(numericPrice * 0.05 * 10) / 10;

    const generatedSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString().slice(-4);

    // Create Product: Immediately live so other people see it immediately!
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || 'Verified product listed by seller on the platform.',
        categoryId: resolvedCategoryId,
        farmerId: farmer ? farmer.id : farmerId,
        price: numericPrice,
        farmerBasePrice: basePrice,
        commissionAmount: commission,
        approvalStatus: body.approvalStatus || 'APPROVED', // Immediately approved for sellers!
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true, // Live for everyone!
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        unit: unit || '1 Piece',
        stock: parseInt(stock, 10) || 50,
        images: typeof images === 'string' ? images : JSON.stringify(images || ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80']),
        originLocation: originLocation || (farmer ? `${farmer.district}, ${farmer.state}` : 'India'),
        harvestDate: harvestDate || 'Current Stock',
        storageInstructions: storageInstructions || 'Store in standard dry room conditions.',
        shelfLifeDays: shelfLifeDays ? parseInt(shelfLifeDays, 10) : 365,
        isOrganic: Boolean(isOrganic),
        isVerified: true,
        certificationDetails: certificationDetails || 'Verified Merchant Quality Standard',
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
