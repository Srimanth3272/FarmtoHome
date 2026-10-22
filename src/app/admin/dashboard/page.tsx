import React from 'react';
import { prisma } from '@/lib/prisma';
import { AdminDashboardClient } from './AdminDashboardClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [users, farmers, products, orders, blogPosts, coupons, wasteListings, commissionPayments] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.farmerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      include: {
        category: true,
        farmPassport: true,
        farmer: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.coupon.findMany(),
    prisma.wasteExchangeListing.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.commissionPayment.findMany({
      include: { farmer: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <AdminDashboardClient
        users={users as any}
        farmers={farmers as any}
        products={products as any}
        orders={orders as any}
        blogPosts={blogPosts as any}
        coupons={coupons as any}
        wasteListings={wasteListings as any}
        commissionPayments={commissionPayments as any}
        totalRevenue={totalRevenue}
      />
    </div>
  );
}
