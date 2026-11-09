import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerProducts, getDeletedProductIds } from '@/lib/server-products';
import { SellerDashboardClient } from './SellerDashboardClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function SellerDashboardPage() {
  const [dbProducts, serverProducts, harvestListings, orders, categories, farmer] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        farmPassport: true,
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    getServerProducts().catch(() => []),
    prisma.harvestListing.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: true,
      },
    }).catch(() => []),
    prisma.category.findMany().catch(() => []),
    prisma.farmerProfile.findFirst({
      where: {
        user: { email: 'sreemanthnagalakunta@gmail.com' },
      },
      include: {
        user: true,
        commissionPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }).then(async (founderProfile) => {
      if (founderProfile) return founderProfile;
      return prisma.farmerProfile.findFirst({
        include: {
          user: true,
          commissionPayments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }).catch(() => null),
  ]);

  const deletedIds = getDeletedProductIds();

  // Merge products from Prisma and server persistent store
  const mergedMap = new Map<string, any>();
  for (const sp of (serverProducts || []).filter(
    (p) => !deletedIds.has(p.id) && (!p.slug || !deletedIds.has(p.slug)) && (!p.name || !deletedIds.has(p.name))
  )) {
    mergedMap.set(sp.id, sp);
    if (sp.slug) mergedMap.set(sp.slug, sp);
  }
  for (const dp of (dbProducts || []).filter(
    (p) => !deletedIds.has(p.id) && (!p.slug || !deletedIds.has(p.slug)) && (!p.name || !deletedIds.has(p.name))
  )) {
    if (!mergedMap.has(dp.id) && !mergedMap.has(dp.slug)) {
      mergedMap.set(dp.id, dp);
    }
  }

  const allProducts: any[] = [];
  const seenIds = new Set<string>();
  for (const p of Array.from(mergedMap.values())) {
    if (
      deletedIds.has(p.id) ||
      (p.slug && deletedIds.has(p.slug)) ||
      (p.name && deletedIds.has(p.name))
    ) {
      continue;
    }
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      allProducts.push(p);
    }
  }

  const totalSales = (orders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <SellerDashboardClient
        initialProducts={allProducts}
        initialHarvests={harvestListings as any}
        orders={orders as any}
        categories={categories as any}
        totalSales={totalSales}
        farmerProfile={farmer as any}
      />
    </div>
  );
}
