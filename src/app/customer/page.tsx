'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Filter,
  Sparkles,
  Smartphone,
  Shirt,
  Sprout,
  Package,
  Leaf,
  Wheat,
  TreePine,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  Flame,
  Radio,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/lib/fallback-data';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { subscribeToProducts, isFirebaseConfigured, getActiveFirebaseConfig } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function CustomerMarketplacePage() {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS as any);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [priceMax, setPriceMax] = useState<number>(3000);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [customProjectId, setCustomProjectId] = useState('');
  const [firebaseActive, setFirebaseActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    setFirebaseActive(isFirebaseConfigured());

    // Subscribe to live products (from Firebase Firestore or local real-time sync)
    const unsubscribe = subscribeToProducts((liveProducts) => {
      setProducts(liveProducts);
      setLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Category Icon Resolver
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'mobile-accessories':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'clothes':
        return <Shirt className="w-4 h-4 text-purple-600" />;
      case 'fresh-produce':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'organic-farming':
        return <Leaf className="w-4 h-4 text-green-600" />;
      case 'seeds-and-planting':
        return <Wheat className="w-4 h-4 text-amber-600" />;
      case 'wood-and-materials':
        return <TreePine className="w-4 h-4 text-orange-700" />;
      case 'gardening-tools':
        return <Wrench className="w-4 h-4 text-stone-600" />;
      case 'other-products':
      default:
        return <Package className="w-4 h-4 text-indigo-600" />;
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      p.category?.slug === selectedCategory ||
      p.categoryId === selectedCategory ||
      p.categoryId === `cat-${selectedCategory}`;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.farmer?.farmName && p.farmer.farmName.toLowerCase().includes(query)) ||
      (p.farmer?.user?.name && p.farmer.user.name.toLowerCase().includes(query)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(query));

    const matchesPrice = p.price <= priceMax;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    return 0; // default newest
  });

  const handleAddToCart = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiKey || !customProjectId) {
      alert('Please provide at least the Firebase API Key and Project ID');
      return;
    }
    const cfg = {
      apiKey: customApiKey.trim(),
      projectId: customProjectId.trim(),
      authDomain: `${customProjectId.trim()}.firebaseapp.com`,
      storageBucket: `${customProjectId.trim()}.appspot.com`,
    };
    localStorage.setItem('f2h_firebase_custom_config', JSON.stringify(cfg));
    setFirebaseActive(true);
    setShowFirebaseModal(false);
    alert('Firebase configuration saved! Live Firestore is now connected.');
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white p-8 sm:p-12 shadow-elevated border border-forest-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-harvest-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              Customer Marketplace
            </span>

            {/* Real-time Firebase Badge */}
            <button
              onClick={() => setShowFirebaseModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>{firebaseActive ? 'Firebase Firestore Live' : 'Live Real-Time Sync Active'}</span>
              <span className="text-[10px] text-emerald-200/70">({lastSyncTime || 'Syncing...'})</span>
            </button>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Shop Everything from Verified Independent Sellers
          </h1>

          <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
            Discover mobile accessories, authentic handloom clothes, fresh harvest produce, and daily utility products directly from registered sellers with 100% verified quality guarantee.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-harvest-300 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-harvest-400" />
              <span>₹500 Subscribed Verified Sellers</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-forest-100 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Instant Cross-User Sync</span>
            </div>
            <Link
              href="/seller"
              className="text-xs font-bold text-white underline hover:text-harvest-300 transition-colors ml-1"
            >
              Are you a seller? Start selling →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Category Filter Bar */}
      <div className="space-y-4">
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mobile accessories, clothes, organic veggies, seller stores..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs sm:text-sm shadow-sm"
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Sort Selector */}
            <div className="relative flex-1 md:flex-initial">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-white rounded-2xl border border-cream-300 text-xs font-semibold text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-sm appearance-none pr-8 cursor-pointer"
              >
                <option value="newest">Sort: Newly Listed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>

            {/* Price Max Slider */}
            <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-cream-300 text-xs text-gray-700 shadow-sm">
              <span className="font-semibold text-forest-950">Max: ₹{priceMax}</span>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-24 accent-forest-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-white text-gray-700 border border-cream-300 hover:bg-cream-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-harvest-400" />
            <span>All Categories ({products.length})</span>
          </button>

          {FALLBACK_CATEGORIES.map((cat) => {
            const count = products.filter(
              (p) =>
                p.category?.slug === cat.slug ||
                p.categoryId === cat.id ||
                p.categoryId === cat.slug
            ).length;
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shadow-sm ${
                  isSelected
                    ? 'bg-forest-900 text-white shadow-soft'
                    : 'bg-white text-gray-700 border border-cream-300 hover:bg-cream-100'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-forest-800 text-forest-100' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-black text-xl sm:text-2xl text-forest-950">
              {selectedCategory === 'all'
                ? 'All Available Products'
                : FALLBACK_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || 'Category Products'}
            </h2>
            <span className="text-xs text-gray-500 font-semibold">
              ({sortedProducts.length} items found)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-forest-700">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Firebase Real-time Storefront</span>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-cream-100 text-forest-800 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-serif font-bold text-lg text-forest-950">
              No products found in this selection
            </h3>
            <p className="text-xs text-gray-500">
              Try adjusting your search terms or select another category above.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setPriceMax(5000);
              }}
              className="px-4 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedProducts.map((product) => {
              const images =
                typeof product.images === 'string'
                  ? (() => {
                      try {
                        return JSON.parse(product.images);
                      } catch {
                        return [product.images];
                      }
                    })()
                  : product.images || [];
              const mainImage =
                images[0] ||
                'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80';

              const discount =
                product.compareAtPrice && product.compareAtPrice > product.price
                  ? Math.round(
                      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                    )
                  : null;

              const sellerName =
                product.farmer?.farmName ||
                product.farmer?.user?.name ||
                'Subscribed Platform Seller';

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
                >
                  {/* Top Image Box */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden bg-cream-100">
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        {discount && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                            {discount}% OFF
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-forest-900/90 text-harvest-300 text-[10px] font-bold backdrop-blur-sm shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Category Pill on Image */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-lg bg-white/95 text-forest-950 text-[10px] font-bold backdrop-blur-sm shadow-sm">
                          {product.category?.name || 'General Product'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      {/* Seller Tag */}
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                        <span className="truncate">Sold by: {sellerName}</span>
                      </div>

                      {/* Product Title */}
                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="font-serif font-bold text-sm text-forest-950 line-clamp-2 hover:text-forest-700 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating & Stock */}
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating || '4.9'}</span>
                          <span className="text-gray-400 text-[10px]">
                            ({product.reviewCount || 18})
                          </span>
                        </div>

                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          In Stock ({product.stock})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="p-4 pt-0 space-y-3 border-t border-cream-200 mt-2">
                    <div className="flex items-baseline justify-between pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-lg text-forest-950">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">{product.unit}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full py-2 px-3 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-900 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={(e) => handleBuyNow(product, e)}
                        className="w-full py-2 px-3 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs transition-colors shadow-soft flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 text-harvest-400" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Firebase Configuration Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-cream-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  Firebase Real-time Sync
                </h3>
              </div>
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <p>
                <strong>Why Firebase?</strong> When sellers add products, they are stored centrally in Firebase Firestore so customers on any device or browser see new products live immediately!
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time Multi-Client Sync Engine</span>
                </p>
                <p className="text-[11px] text-emerald-800">
                  Active status: <span className="font-bold">{firebaseActive ? 'Connected to Firebase Project' : 'Integrated Local Real-time Multi-Tab Synchronizer'}</span>
                </p>
              </div>

              <form onSubmit={handleSaveFirebaseConfig} className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-gray-800">
                  Optional: Paste Your Custom Firebase Keys:
                </label>
                <div>
                  <span className="text-[11px] text-gray-500">API Key:</span>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500">Project ID:</span>
                  <input
                    type="text"
                    placeholder="farmtohome-xxx"
                    value={customProjectId}
                    onChange={(e) => setCustomProjectId(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-950 transition-colors"
                  >
                    Save & Connect Firebase
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFirebaseModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
