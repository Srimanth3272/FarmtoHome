'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CookingPot,
  Flame,
  Soup,
  Zap,
  Smartphone,
  Shirt,
  Sprout,
  Leaf,
  Wheat,
  TreePine,
  Wrench,
  Package,
  Search,
  Grid
} from 'lucide-react';
import { FALLBACK_CATEGORIES } from '@/lib/fallback-data';
import { ProductItem } from '@/lib/types';
import { subscribeToProducts } from '@/lib/firebase';

export default function CategoriesPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = subscribeToProducts((live) => {
      setProducts(live);
    });
    return () => unsub();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'food-delivery':
        return <CookingPot className="w-5 h-5 text-amber-600" />;
      case 'dosas-parothas':
        return <Flame className="w-5 h-5 text-orange-600" />;
      case 'pickles':
        return <Soup className="w-5 h-5 text-rose-600" />;
      case 'sweets':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'hots':
        return <Zap className="w-5 h-5 text-red-600" />;
      case 'mobile-accessories':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'clothes':
        return <Shirt className="w-5 h-5 text-purple-600" />;
      case 'fresh-produce':
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'organic-farming':
        return <Leaf className="w-5 h-5 text-green-600" />;
      case 'seeds-and-planting':
        return <Wheat className="w-5 h-5 text-amber-600" />;
      case 'wood-and-materials':
        return <TreePine className="w-5 h-5 text-amber-800" />;
      case 'gardening-tools':
        return <Wrench className="w-5 h-5 text-stone-600" />;
      case 'other-products':
      default:
        return <Package className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getCategoryCount = (cat: { id: string; slug: string }) => {
    return products.filter((p) => {
      if (p.approvalStatus === 'REJECTED' || p.isActive === false) return false;
      return (
        p.category?.slug === cat.slug ||
        p.categoryId === cat.id ||
        p.categoryId === cat.slug ||
        p.categoryId === `cat-${cat.slug}` ||
        p.category?.id === cat.id
      );
    }).length;
  };

  const filteredCategories = FALLBACK_CATEGORIES.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.slug.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white p-8 sm:p-12 shadow-elevated border border-forest-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold uppercase tracking-wider">
            <Grid className="w-3.5 h-3.5" />
            <span>Marketplace Directory</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Explore All Categories
          </h1>

          <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
            Browse our full spectrum of verified offerings — from hot dhaba thalis and desi sweets to farm harvests, heirloom seeds, and everyday lifestyle essentials.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/customer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs transition-all shadow-soft"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop All Products ({products.filter(p => p.approvalStatus !== 'REJECTED' && p.isActive !== false).length})</span>
            </Link>
            <Link
              href="/seller/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <span>Upload Product in a Category →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories (e.g. food, sweets, mobile, produce)..."
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-cream-300 text-xs sm:text-sm text-forest-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 font-semibold self-start sm:self-auto">
          Showing <strong>{filteredCategories.length}</strong> categories
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredCategories.map((cat) => {
          const count = getCategoryCount(cat);

          return (
            <div
              key={cat.id}
              className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Image banner */}
              <div className="relative h-44 w-full overflow-hidden bg-cream-100">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-white/90 shadow-xs backdrop-blur-xs">
                      {getCategoryIcon(cat.slug)}
                    </span>
                    <span className="text-xs font-bold drop-shadow-sm">{cat.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-forest-950/80 border border-white/20 text-[11px] font-bold text-harvest-300 backdrop-blur-xs">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
              </div>

              {/* Description & Links */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {cat.description}
                </p>

                <div className="pt-2 flex items-center gap-2 border-t border-gray-100">
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex-1 py-2 px-3 text-center bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>View Category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/customer?category=${cat.slug}`}
                    className="py-2 px-3 text-center border border-forest-800 text-forest-900 hover:bg-forest-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    Filter in Store
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
