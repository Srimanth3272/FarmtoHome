import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { OrderDetailClient } from './OrderDetailClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: { id: string };
}

import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const cleanId = decodeURIComponent(params.id || '').trim();

  let order: any = null;
  try {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: cleanId },
          { id: cleanId },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                slug: true,
                originLocation: true,
                farmPassport: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  } catch (err) {
    console.warn('Prisma lookup notice in OrderDetailPage:', err);
  }

  // Backup fallback from data/orders.json
  if (!order) {
    try {
      const ordersFile = path.join(process.cwd(), 'data', 'orders.json');
      if (fs.existsSync(ordersFile)) {
        const fileOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
        order = fileOrders.find((o: any) => o.orderNumber === cleanId || o.id === cleanId);
      }
    } catch (fsErr) {
      console.warn('Fallback file read notice:', fsErr);
    }
  }

  // If still not found, gracefully redirect to order history instead of showing a harsh 404
  if (!order) {
    redirect('/orders');
  }

  return <OrderDetailClient order={order as any} />;
}
