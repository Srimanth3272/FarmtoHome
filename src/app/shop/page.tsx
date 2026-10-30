import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_FARMERS,
} from '@/lib/fallback-data';
import { getServerProducts } from '@/lib/server-products';
import { ShopProductsGrid } from '@/components/ShopProductsGrid';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: {
    category?: string;
    farmer?: string;
    search?: string;
    sort?: string;
    organic?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, farmer, search, sort, organic, minPrice, maxPrice } = searchParams;

  const where: any = { isActive: true, approvalStatus: 'APPROVED' };

  if (category) {
    where.category = { slug: category };
  }

  if (farmer) {
    where.farmerId = farmer;
  }

  if (organic === 'true') {
    where.isOrganic = true;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { originLocation: { contains: search } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  let products: any[] = [];
  let categories: any[] = [];
  let farmers: any[] = [];

  try {
    const [dbProdsRaw, dbCatsRaw, dbFarmersRaw, serverProdsRaw] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: true,
          farmer: {
            include: {
              user: { select: { name: true, avatar: true } },
            },
          },
          farmPassport: true,
        },
      }).catch(() => []),
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
      }).catch(() => []),
      prisma.farmerProfile.findMany({
        include: {
          user: { select: { name: true } },
        },
      }).catch(() => []),
      getServerProducts().catch(() => []),
    ]);

    const dbProds = dbProdsRaw || [];
    const serverProds = serverProdsRaw || [];
    const mergedProds: any[] = [...serverProds];

    for (const dp of dbProds) {
      if (!mergedProds.some((p) => p.id === dp.id || p.slug === dp.slug)) {
        mergedProds.push(dp);
      }
    }

    for (const fb of FALLBACK_PRODUCTS) {
      if (!mergedProds.some((p) => p.slug === fb.slug || p.id === fb.id)) {
        if (!category || fb.category?.slug === category) {
          mergedProds.push(fb as any);
        }
      }
    }
    products = mergedProds;

    const dbCats = dbCatsRaw || [];
    const mergedCats = [...dbCats];
    for (const fc of FALLBACK_CATEGORIES) {
      if (!mergedCats.some((c) => c.slug === fc.slug)) {
        mergedCats.push(fc as any);
      }
    }
    categories = mergedCats;
    farmers = dbFarmersRaw && dbFarmersRaw.length > 0 ? dbFarmersRaw : (FALLBACK_FARMERS as any);
  } catch (err) {
    console.error('Database connection notice on ShopPage:', err);
    products = FALLBACK_PRODUCTS as any;
    categories = FALLBACK_CATEGORIES as any;
    farmers = FALLBACK_FARMERS as any;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white rounded-3xl p-8 sm:p-10 shadow-elevated border border-forest-700/60">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-harvest-400 text-forest-950">
              Complete Farm Catalog
            </span>
            <span className="text-xs text-forest-200">
              {products.length} Products Available
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-white">
            Direct from Farms & Organic Producers
          </h1>
          <p className="text-forest-200 text-xs sm:text-sm">
            {search
              ? `Showing results for "${search}"`
              : 'Browse naturally grown harvests, native non-GMO seeds, enriched vermicomposts, and farm-grade materials.'}
          </p>
        </div>
      </div>

      {/* Quick Google Customer Access Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-cream-300 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-harvest-600" />
          </div>
          <div>
            <p className="font-bold text-xs sm:text-sm text-forest-950">
              Want 1-click access to harvest alerts & direct farm prices?
            </p>
            <p className="text-[11px] text-gray-500">
              Customers can sign in directly with Google to see products, order fresh produce, and verify digital Farm Passports.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto flex-shrink-0">
          <GoogleSignInButton
            redirectUrl="/shop"
            label="Sign in with Google"
            className="!py-2 !px-4 text-xs font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-cream-300 shadow-card h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-serif font-bold text-base text-forest-950">
              <Filter className="w-4 h-4 text-forest-700" />
              <span>Filters</span>
            </div>
            {(category || farmer || organic || search || sort) && (
              <Link
                href="/shop"
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Clear All
              </Link>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2.5">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-gray-500">
              Categories
            </h3>
            <div className="space-y-1 text-xs">
              <Link
                href="/shop"
                className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                  !category
                    ? 'bg-forest-100 text-forest-900 font-bold'
                    : 'text-gray-600 hover:bg-forest-50'
                }`}
              >
                <span>All Categories</span>
                <span className="text-gray-400 text-[11px]">{products.length}</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    category === cat.slug
                      ? 'bg-forest-100 text-forest-900 font-bold'
                      : 'text-gray-600 hover:bg-forest-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-gray-400 text-[11px]">{cat._count.products}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Purity & Verification Filter */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-gray-500">
              Purity
            </h3>
            <div className="space-y-1.5 text-xs">
              <Link
                href={`/shop?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(organic === 'true' ? {} : { organic: 'true' }),
                }).toString()}`}
                className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                  organic === 'true'
                    ? 'bg-forest-800 text-white font-bold border-forest-800'
                    : 'border-cream-300 text-gray-700 hover:bg-forest-50'
                }`}
              >
                <span>🌱 100% Organic Only</span>
                {organic === 'true' && <span>✓</span>}
              </Link>
            </div>
          </div>

          {/* Participating Farmers */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-gray-500">
              Direct Farmer
            </h3>
            <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
              {farmers.map((f) => (
                <Link
                  key={f.id}
                  href={`/shop?farmer=${f.id}`}
                  className={`block p-2 rounded-xl text-xs transition-colors ${
                    farmer === f.id
                      ? 'bg-forest-100 text-forest-900 font-bold'
                      : 'text-gray-600 hover:bg-forest-50'
                  }`}
                >
                  <p className="truncate font-semibold">{f.farmName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{f.state}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-3">
          <ShopProductsGrid
            initialProducts={products}
            category={category}
            farmer={farmer}
            search={search}
            sort={sort}
            organic={organic}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>
      </div>
    </div>
  );
}
