import React from 'react';
import { prisma } from '@/lib/prisma';
import { SellerDashboardClient } from './SellerDashboardClient';

export const revalidate = 0;

export default async function SellerDashboardPage() {
  const [products, harvestListings, orders, categories, farmer] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        farmPassport: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.harvestListing.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: true,
      },
    }),
    prisma.category.findMany(),
    prisma.farmerProfile.findFirst({
      include: {
        user: true,
        commissionPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <SellerDashboardClient
        initialProducts={products as any}
        initialHarvests={harvestListings as any}
        orders={orders as any}
        categories={categories as any}
        totalSales={totalSales}
        farmerProfile={farmer as any}
      />
    </div>
  );
}
