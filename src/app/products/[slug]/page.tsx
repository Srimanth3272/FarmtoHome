import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { PinCodeChecker } from '@/components/PinCodeChecker';
import { FarmPassportModal } from '@/components/FarmPassportModal';
import { ProductDetailClient } from './ProductDetailClient';

export const revalidate = 0;

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      farmer: {
        include: {
          user: { select: { name: true, avatar: true, phone: true } },
        },
      },
      farmPassport: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 3,
    include: {
      category: true,
      farmer: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
      farmPassport: true,
    },
  });

  return (
    <ProductDetailClient
      product={product as any}
      relatedProducts={relatedProducts as any}
    />
  );
}
