import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { OrderDetailClient } from './OrderDetailClient';

export const revalidate = 0;

interface OrderDetailPageProps {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.id },
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

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order as any} />;
}
