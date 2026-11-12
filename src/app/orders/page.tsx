import React from 'react';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { OrdersListClient } from './OrdersListClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  let orders: any[] = [];

  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (err) {
    console.warn('Prisma orders query notice:', err);
  }

  // Backup fallback from data/orders.json
  const dataDir = path.join(process.cwd(), 'data');
  const ordersBackupFile = path.join(dataDir, 'orders.json');
  const alertsFile = path.join(dataDir, 'owner-order-alerts.json');

  const map = new Map<string, any>();

  for (const o of orders) {
    if (o && (o.orderNumber || o.id)) {
      map.set(o.orderNumber || o.id, o);
    }
  }

  if (fs.existsSync(ordersBackupFile)) {
    try {
      const fileOrders = JSON.parse(fs.readFileSync(ordersBackupFile, 'utf-8'));
      if (Array.isArray(fileOrders)) {
        for (const fo of fileOrders) {
          if (fo && (fo.orderNumber || fo.id) && !map.has(fo.orderNumber || fo.id)) {
            map.set(fo.orderNumber || fo.id, fo);
          }
        }
      }
    } catch {}
  }

  if (fs.existsSync(alertsFile)) {
    try {
      const alertOrders = JSON.parse(fs.readFileSync(alertsFile, 'utf-8'));
      if (Array.isArray(alertOrders)) {
        for (const ao of alertOrders) {
          if (ao && (ao.orderNumber || ao.orderId) && !map.has(ao.orderNumber || ao.orderId)) {
            map.set(ao.orderNumber || ao.orderId, {
              ...ao,
              id: ao.orderId || ao.orderNumber,
              createdAt: ao.timestamp || new Date().toISOString(),
            });
          }
        }
      }
    } catch {}
  }

  const combinedOrders = Array.from(map.values()).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return <OrdersListClient initialOrders={combinedOrders} />;
}
