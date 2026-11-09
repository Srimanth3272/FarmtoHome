import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerProducts, getDeletedProductIds } from '@/lib/server-products';
import { AdminDashboardClient } from './AdminDashboardClient';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [users, farmers, dbProducts, orders, blogPosts, coupons, wasteListings, commissionPayments, serverProds] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.farmerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.product.findMany({
      include: {
        category: true,
        farmPassport: true,
        farmer: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }).catch(() => []),
    prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.coupon.findMany().catch(() => []),
    prisma.wasteExchangeListing.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.commissionPayment.findMany({
      include: { farmer: true },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    getServerProducts().catch(() => []),
  ]);

  const deletedIds = getDeletedProductIds();

  // Merge all products from database and server store
  const mergedMap = new Map<string, any>();
  for (const sp of (serverProds || []).filter(
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

  const uniqueProducts: any[] = [];
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
      uniqueProducts.push(p);
    }
  }

  const totalRevenue = (orders || []).reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <AdminAuthGuard>
        <AdminDashboardClient
          users={users as any}
          farmers={farmers as any}
          products={uniqueProducts as any}
          orders={orders as any}
          blogPosts={blogPosts as any}
          coupons={coupons as any}
          wasteListings={wasteListings as any}
          commissionPayments={commissionPayments as any}
          totalRevenue={totalRevenue}
        />
      </AdminAuthGuard>
    </div>
  );
}
