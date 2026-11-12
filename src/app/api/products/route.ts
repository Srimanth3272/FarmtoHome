import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // 1. Fetch server products (unified from SQLite DB, JSON store, memory cache, and Firestore)
    const combined = await getServerProducts({ includePending });

    // 2. Apply filters
    let filtered = combined.filter((p) => {
      if (!includePending && (p.isActive === false || p.approvalStatus === 'REJECTED')) return false;
      if (categorySlug) {
        const matchesCat =
          p.category?.slug === categorySlug ||
          p.categoryId === categorySlug ||
          p.categoryId === `cat-${categorySlug}` ||
          p.category?.id === categorySlug;
        if (!matchesCat) return false;
      }
      if (farmerId) {
        const matchesFarmer =
          p.farmerId === farmerId ||
          p.farmer?.id === farmerId ||
          p.farmer?.user?.name === farmerId;
        if (!matchesFarmer) return false;
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
        const matchesCatName = p.category?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc && !matchesCatName) return false;
      }
      return true;
    });

    // 3. Apply sorting
    if (sort === 'price-low' || sort === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price-high' || sort === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Newest first by default
      filtered.sort((a, b) => {
        const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.warn('Error in GET /api/products:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, categoryId, price } = body;

    // Validate required fields
    if (!name || (!categoryId && !body.category) || !price) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: name, category, and price are required.' },
        { status: 400 }
      );
    }

    // Save product via server persistence layer (SQLite + JSON file + Memory cache + Firestore)
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
