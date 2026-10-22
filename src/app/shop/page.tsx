import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export const revalidate = 0;

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

  const [products, categories, farmers] = await Promise.all([
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
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.farmerProfile.findMany({
      include: {
        user: { select: { name: true } },
      },
    }),
  ]);

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
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting and Active Count Bar */}
          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Showing <strong className="text-gray-900">{products.length}</strong> farm-verified products
            </p>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-semibold">Sort by:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Featured', value: '' },
                  { label: 'Price: Low to High', value: 'price-asc' },
                  { label: 'Price: High to Low', value: 'price-desc' },
                  { label: 'Rating', value: 'rating' },
                ].map((s) => (
                  <Link
                    key={s.value}
                    href={`/shop?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(search ? { search } : {}),
                      ...(organic ? { organic } : {}),
                      ...(s.value ? { sort: s.value } : {}),
                    }).toString()}`}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      sort === s.value || (!sort && s.value === '')
                        ? 'bg-forest-900 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center text-forest-700 mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-forest-950">
                No matching products found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try clearing selected filters or searching for terms like "Tomatoes", "Vermicompost", or "Seeds".
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold shadow-soft hover:bg-forest-900 transition-colors"
              >
                Reset All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
