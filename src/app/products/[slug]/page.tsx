import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { PinCodeChecker } from '@/components/PinCodeChecker';
import { FarmPassportModal } from '@/components/FarmPassportModal';
import { ProductDetailClient } from './ProductDetailClient';

import { FALLBACK_PRODUCTS } from '@/lib/fallback-data';

import { getServerProducts } from '@/lib/server-products';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findUnique({
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

    if (product) {
      relatedProducts = await prisma.product.findMany({
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
    }
  } catch (err) {
    console.error('Database connection notice on ProductDetailPage:', err);
  }

  // Check persistent server store / Firestore cache
  if (!product) {
    try {
      const serverProds = await getServerProducts();
      product = serverProds.find((p) => p.slug === params.slug || p.id === params.slug);
      if (product) {
        relatedProducts = serverProds.filter((p) => p.id !== product?.id).slice(0, 3);
      }
    } catch {}
  }

  if (!product) {
    product = FALLBACK_PRODUCTS.find((p) => p.slug === params.slug) || FALLBACK_PRODUCTS[0];
    relatedProducts = FALLBACK_PRODUCTS.filter((p) => p.slug !== product?.slug).slice(0, 3);
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      slug={params.slug}
      product={product as any}
      relatedProducts={relatedProducts as any}
    />
  );
}
