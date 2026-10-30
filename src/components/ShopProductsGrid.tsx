'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { ProductItem } from '@/lib/types';
import { Sparkles, Radio } from 'lucide-react';
import { subscribeToProducts } from '@/lib/firebase';

interface ShopProductsGridProps {
  initialProducts: any[];
  category?: string;
  farmer?: string;
  search?: string;
  sort?: string;
  organic?: string;
  minPrice?: string;
  maxPrice?: string;
}

export function ShopProductsGrid({
  initialProducts,
  category,
  farmer,
  search,
  sort,
  organic,
  minPrice,
  maxPrice,
}: ShopProductsGridProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [liveCount, setLiveCount] = useState<number>(initialProducts.length);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    // Subscribe to live products from Firestore / Server / Local sync
    const unsubscribe = subscribeToProducts((liveList) => {
      setIsLiveConnected(true);

      // Filter the incoming live products according to current search params
      let filtered = [...liveList];

      if (category) {
        filtered = filtered.filter(
          (p) =>
            p.category?.slug === category ||
            p.categoryId === category ||
            p.categoryId === `cat-${category}`
        );
      }

      if (farmer) {
        filtered = filtered.filter((p) => p.farmerId === farmer || p.farmer?.id === farmer);
      }

      if (organic === 'true') {
        filtered = filtered.filter((p) => p.isOrganic);
      }

      if (minPrice) {
        const min = parseFloat(minPrice);
        filtered = filtered.filter((p) => (p.price || 0) >= min);
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice);
        filtered = filtered.filter((p) => (p.price || 0) <= max);
      }

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.originLocation?.toLowerCase().includes(q)
        );
      }

      // Sort
      if (sort === 'price-asc') {
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sort === 'price-desc') {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (sort === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      setProducts(filtered);
      setLiveCount(filtered.length);
    });

    return () => {
      unsubscribe();
    };
  }, [category, farmer, search, sort, organic, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Sorting and Active Count Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{products.length}</strong> farm-verified products
          </p>
          {isLiveConnected && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Network
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold">Sort by:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { label: 'Featured', value: '' },
              { label: 'Price: Low to High', value: 'price-asc' },
              { label: 'Price: High to Low', value: 'price-desc' },
              { label: 'Rating', value: 'rating' },
            ].map((s) => (
              <Link
                key={s.value}
                href={`/shop?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(search ? { search } : {}),
                  ...(organic ? { organic } : {}),
                  ...(s.value ? { sort: s.value } : {}),
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  sort === s.value || (!sort && s.value === '')
                    ? 'bg-forest-900 text-white font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center text-forest-700 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-forest-950">
            No matching products found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try clearing selected filters or searching for terms like "Tomatoes", "Vermicompost", or "Seeds".
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold shadow-soft hover:bg-forest-900 transition-colors"
          >
            Reset All Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}
