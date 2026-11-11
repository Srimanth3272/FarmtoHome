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

import { getServerProducts, getDeletedProductIds } from '@/lib/server-products';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const deletedIds = getDeletedProductIds();
  const rawSlug = params.slug;
  const decodedSlug = decodeURIComponent(rawSlug);

  if (deletedIds.has(rawSlug) || deletedIds.has(decodedSlug)) {
    notFound();
  }

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findUnique({
      where: { slug: decodedSlug },
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
      if (
        deletedIds.has(product.id) ||
        deletedIds.has(product.slug) ||
        (product.name && deletedIds.has(product.name)) ||
        product.approvalStatus !== 'APPROVED' ||
        product.isActive === false
      ) {
        notFound();
      }

      const rawRelated = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        take: 6,
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

      relatedProducts = rawRelated
        .filter(
          (p) =>
            !deletedIds.has(p.id) &&
            (!p.slug || !deletedIds.has(p.slug)) &&
            (!p.name || !deletedIds.has(p.name))
        )
        .slice(0, 3);
    }
  } catch (err) {
    console.error('Database connection notice on ProductDetailPage:', err);
  }

  // Check persistent server store / Firestore cache
  if (!product) {
    try {
      const serverProds = await getServerProducts();
      product = serverProds.find(
        (p) =>
          !deletedIds.has(p.id) &&
          (!p.slug || !deletedIds.has(p.slug)) &&
          (!p.name || !deletedIds.has(p.name)) &&
          p.approvalStatus === 'APPROVED' &&
          p.isActive !== false &&
          (p.slug === decodedSlug || p.id === decodedSlug || p.slug === rawSlug || p.id === rawSlug)
      );
      if (product) {
        relatedProducts = serverProds
          .filter(
            (p) =>
              p.id !== product?.id &&
              !deletedIds.has(p.id) &&
              (!p.slug || !deletedIds.has(p.slug)) &&
              (!p.name || !deletedIds.has(p.name))
          )
          .slice(0, 3);
      }
    } catch {}
  }

  if (!product || deletedIds.has(product.id) || deletedIds.has(product.slug)) {
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
