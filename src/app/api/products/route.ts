import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_PRODUCTS } from '@/lib/fallback-data';
import { getServerProducts, saveServerProduct } from '@/lib/server-products';

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

    // 1. Fetch server products (from persistent memory, JSON store, and Firestore)
    const serverProducts = await getServerProducts();

    // 2. Fetch Prisma SQLite products (graceful catch if DB is unavailable)
    let dbProducts: any[] = [];
    try {
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

      dbProducts = await prisma.product.findMany({
        where,
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
    } catch (e) {
      console.warn('Prisma query notice on GET /api/products:', e);
    }

    // 3. Merge: server products + DB products + fallback products
    const combined: any[] = [...serverProducts];

    for (const dbp of dbProducts) {
      if (!combined.some((p) => p.id === dbp.id || p.slug === dbp.slug)) {
        combined.push(dbp);
      }
    }

    for (const fb of FALLBACK_PRODUCTS) {
      if (!combined.some((p) => p.slug === fb.slug || p.id === fb.id)) {
        combined.push(fb as any);
      }
    }

    // 4. Apply filters
    let filtered = combined.filter((p) => {
      if (!includePending && p.isActive === false) return false;
      if (categorySlug && p.category?.slug !== categorySlug && p.categoryId !== categorySlug) {
        return false;
      }
      if (farmerId && p.farmerId !== farmerId && p.farmer?.id !== farmerId) {
        return false;
      }
      if (featured === 'true' && !p.featured) {
        return false;
      }
      if (organicOnly === 'true' && !p.isOrganic) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesLoc = p.originLocation?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc) return false;
      }
      return true;
    });

    // 5. Apply sorting
    if (sort === 'price-low' || sort === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price-high' || sort === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Newest first by default
      filtered.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.warn('Error in GET /api/products, returning fallback products:', error);
    return NextResponse.json(FALLBACK_PRODUCTS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, categoryId, farmerId, price } = body;

    // Validate required fields
    if (!name || (!categoryId && !body.category) || !price) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: name, category, and price are required.' },
        { status: 400 }
      );
    }

    // Save product via server persistence layer (in-memory + local file + Firestore + Prisma)
    const result = await saveServerProduct(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Product published successfully and live for customers!',
        product: result.product,
        firestoreSaved: result.firestoreSaved,
        firestoreError: result.firestoreError,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product in /api/products:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
