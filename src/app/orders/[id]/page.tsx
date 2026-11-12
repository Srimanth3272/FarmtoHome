import React from 'react';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { OrderDetailClient } from './OrderDetailClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: { id: string };
}

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

  // Backup fallback 1: data/orders.json
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

  // Backup fallback 2: data/owner-order-alerts.json
  if (!order) {
    try {
      const alertsFile = path.join(process.cwd(), 'data', 'owner-order-alerts.json');
      if (fs.existsSync(alertsFile)) {
        const fileAlerts = JSON.parse(fs.readFileSync(alertsFile, 'utf-8'));
        const a = fileAlerts.find((o: any) => o.orderNumber === cleanId || o.orderId === cleanId);
        if (a) {
          order = {
            id: a.orderId || a.orderNumber,
            orderNumber: a.orderNumber,
            status: 'CONFIRMED',
            totalAmount: a.totalAmount,
            subtotal: a.subtotal,
            shippingFee: a.shippingFee,
            discountAmount: a.discountAmount || 0,
            paymentMethod: a.paymentMethod || 'PHONEPE_QR',
            paymentStatus: a.paymentStatus || 'PAID',
            deliveryAddress: typeof a.deliveryAddress === 'string' ? a.deliveryAddress : JSON.stringify(a.deliveryAddress),
            deliverySlot: a.deliverySlot,
            createdAt: a.timestamp || new Date().toISOString(),
            items: (a.items || []).map((it: any, idx: number) => ({
              id: `it-${idx}`,
              productName: it.productName || it.name,
              productUnit: it.productUnit || it.unit || '1 Piece',
              priceAtPurchase: it.priceAtPurchase || it.price,
              quantity: it.quantity || 1,
              itemTotal: it.itemTotal || ((it.priceAtPurchase || 0) * (it.quantity || 1)),
            })),
          };
        }
      }
    } catch (fsErr) {}
  }

  return <OrderDetailClient order={order} orderNumber={cleanId} />;
}
