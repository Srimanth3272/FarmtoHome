import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ArrowLeft, Sparkles, Sprout } from 'lucide-react';

export const revalidate = 0;

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isActive: true },
        include: {
          category: true,
          farmer: {
            include: {
              user: { select: { name: true, avatar: true } },
            },
          },
          farmPassport: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Categories</span>
        </Link>
      </div>

      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white p-8 sm:p-12 shadow-elevated border border-forest-700/60 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-harvest-400 text-forest-950 inline-block">
            Category Catalog
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-white">
            {category.name}
          </h1>
          <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
            {category.description}
          </p>
          <p className="text-xs text-harvest-300 font-semibold pt-2">
            🌱 {category.products.length} farm-direct products available for dispatch
          </p>
        </div>

        <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white/20 shrink-0 shadow-2xl">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-forest-950">
            Available in {category.name}
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Showing {category.products.length} items
          </span>
        </div>

        {category.products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-3">
            <Sprout className="w-10 h-10 text-forest-700 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-forest-950">
              New harvests arriving soon
            </h3>
            <p className="text-xs text-gray-500">
              Farmers are currently preparing new batches for this category. Check the Harvest Calendar for upcoming dates!
            </p>
            <Link
              href="/harvest-calendar"
              className="inline-block px-5 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold"
            >
              Check Harvest Calendar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
