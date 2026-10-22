import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Sprout,
  Users,
  Award,
  Truck,
  Leaf,
  CheckCircle2,
  ChevronRight,
  Clock,
  Star,
  MapPin,
  Flame,
  TreePine,
  HelpCircle,
  Quote
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { PinCodeChecker } from '@/components/PinCodeChecker';
import { ProductItem } from '@/lib/types';

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  // Fetch real data from Prisma database
  const [products, categories, farmers, blogPosts] = await Promise.all([
    prisma.product.findMany({
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
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
    prisma.farmerProfile.findMany({
      include: {
        user: { select: { name: true, avatar: true } },
        products: { take: 3 },
      },
      take: 4,
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { viewsCount: 'desc' },
    }),
  ]);

  const freshHarvest = products.filter((p) => p.category.slug === 'fresh-produce');
  const organicManures = products.filter((p) => p.category.slug === 'organic-farming');
  const seedsAndTools = products.filter(
    (p) => p.category.slug === 'seeds-and-planting' || p.category.slug === 'gardening-tools'
  );
  const woodAndMaterials = products.filter((p) => p.category.slug === 'wood-and-materials');

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white shadow-2xl border border-forest-700/50">
          {/* Subtle nature grid texture */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-forest-600/60 text-harvest-300 text-xs font-semibold backdrop-blur-md shadow-sm">
                <Sparkles className="w-4 h-4 text-harvest-400" />
                <span>100% Direct from Verified Indian Farmers • Zero Middlemen</span>
              </div>

              {/* Headline */}
              <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]">
                Good Food Begins with{' '}
                <span className="text-harvest-400 underline decoration-forest-400/50 decoration-wavy underline-offset-8">
                  Good Farming.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-forest-100 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                Discover fresh produce, quality seeds, natural farming essentials, and products grown with care—directly from farms and trusted agricultural suppliers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-sm shadow-soft hover:shadow-elevated transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Shop Farm Products</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/blog"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <Leaf className="w-4 h-4 text-green-300" />
                  <span>Explore Organic Farming</span>
                </Link>
              </div>

              {/* Trust Highlights */}
              <div className="pt-6 border-t border-forest-700/60 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="font-serif font-bold text-xl sm:text-2xl text-harvest-300">100%</p>
                  <p className="text-[11px] text-forest-200 mt-0.5">Direct Farm Gate</p>
                </div>
                <div>
                  <p className="font-serif font-bold text-xl sm:text-2xl text-harvest-300">Farm Passport</p>
                  <p className="text-[11px] text-forest-200 mt-0.5">Complete Traceability</p>
                </div>
                <div>
                  <p className="font-serif font-bold text-xl sm:text-2xl text-harvest-300">Zero</p>
                  <p className="text-[11px] text-forest-200 mt-0.5">Synthetic Sprays</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card / Layered Farm Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-square shadow-2xl border-4 border-white/20">
                <Image
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80"
                  alt="Lush green organic farm in India"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />

                {/* Floating Farm Passport Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md text-forest-950 shadow-elevated border border-white/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 text-harvest-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-forest-700 tracking-wider">
                      Live Harvest Traceability
                    </p>
                    <p className="text-xs font-serif font-bold text-gray-900 truncate">
                      Batch #F2H-2026-GJ-TOM-04
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Dawn Harvested • Ramesh Patel, Anand
                    </p>
                  </div>
                  <Link
                    href="/farm-passport"
                    className="p-2 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-900 shrink-0 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PIN CODE CHECKER WIDGET STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white p-6 rounded-3xl border border-cream-300 shadow-card">
          <div className="md:col-span-1 space-y-1">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
              Check Delivery Hub
            </span>
            <h3 className="font-serif font-bold text-lg text-forest-950">
              Fresh Delivery Availability
            </h3>
            <p className="text-xs text-gray-500">
              Enter your Indian PIN code to view next-day morning harvest delivery slots.
            </p>
          </div>
          <div className="md:col-span-2">
            <PinCodeChecker initialPin="560103" />
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-600">
              Browse the Farm
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950 mt-1">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              From dawn-picked fruits to heirloom seeds and farm-grade manures.
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative bg-white rounded-2xl border border-cream-300 p-4 shadow-card hover:shadow-elevated transition-all flex flex-col items-center text-center overflow-hidden hover:-translate-y-1"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-forest-100 group-hover:border-forest-600 transition-colors">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-serif font-bold text-sm text-forest-950 group-hover:text-forest-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <span className="mt-3 text-[11px] font-bold text-forest-700 group-hover:underline flex items-center gap-1">
                <span>Explore</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FRESH HARVEST OF THE DAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-gradient-to-r from-cream-200/80 to-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                  Daily Morning Harvest
                </span>
              </div>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950 mt-1">
                Fresh Harvest of the Day
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Harvested at daybreak from participating regional farms and delivered within 24 hours.
              </p>
            </div>
            <Link
              href="/categories/fresh-produce"
              className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-950 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>See All Fresh Produce</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freshHarvest.map((product) => (
              <ProductCard key={product.id} product={product as any} featured />
            ))}
          </div>
        </div>
      </section>

      {/* 5. ORGANIC SOIL & CROP CARE (VERMICOMPOST & MANURE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-600">
              Natural Soil Health & Plant Nutrition
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950 mt-1">
              Natural Manures and Soil Care
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Fortified vermicompost, cold-pressed neem cake, and biofertilizers for abundant root growth.
            </p>
          </div>
          <Link
            href="/categories/organic-farming"
            className="flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 group"
          >
            <span>Explore All Soil Care</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {organicManures.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 6. UNIQUE FEATURE PROMO: HARVEST CALENDAR & FARM PASSPORT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Interactive Harvest Calendar */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-harvest-900 via-harvest-800 to-amber-950 text-white p-8 sm:p-10 shadow-elevated border border-harvest-700/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-harvest-300 border border-white/20">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-harvest-400 text-forest-950 inline-block">
                Interactive Seasonal Guide
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                Indian Seasonal Harvest Calendar
              </h3>
              <p className="text-harvest-100 text-xs sm:text-sm leading-relaxed">
                Discover which crops Indian farmers are harvesting next across Kharif, Rabi, and Zaid seasons. Pre-order directly before harvest for guaranteed freshness.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-harvest-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-harvest-200">Upcoming Harvest:</p>
                <p className="font-serif font-bold text-sm text-white">Banganapalli GI Mangoes</p>
              </div>
              <Link
                href="/harvest-calendar"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-harvest-100 text-harvest-900 font-bold text-xs shadow-soft transition-colors flex items-center gap-1.5"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Digital Farm Passport */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white p-8 sm:p-10 shadow-elevated border border-forest-700/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-harvest-300 border border-white/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-green-400 text-forest-950 inline-block">
                Digital Traceability
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                The Digital Farm Passport
              </h3>
              <p className="text-forest-100 text-xs sm:text-sm leading-relaxed">
                Every eligible harvest features a tamper-proof digital passport with farmer name, GPS-level location, verified pesticide-free years, and accredited lab analysis reports.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-forest-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-forest-200">Traceability Standard:</p>
                <p className="font-serif font-bold text-sm text-white">PGS-India & NPOP Compliant</p>
              </div>
              <Link
                href="/farm-passport"
                className="px-5 py-2.5 rounded-xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs shadow-soft transition-colors flex items-center gap-1.5"
              >
                <span>Verify a Passport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SEEDS, GARDENING TOOLS & FARM MATERIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-600">
              Terrace Gardening & Nursery
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950 mt-1">
              Seeds, Grow Bags & Farm Materials
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Non-GMO heirloom seeds, UV-treated terrace grow bags, and low-EC washed cocopeat blocks.
            </p>
          </div>
          <Link
            href="/categories/seeds-and-planting"
            className="flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 group"
          >
            <span>Shop Gardening Essentials</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {seedsAndTools.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 8. MEET OUR FARMERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-600">
              The Hands Behind Your Food
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950 mt-1">
              Meet Our Farmers
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Every crop has a face, an address, and a commitment to zero-chemical soil regeneration.
            </p>
          </div>
          <Link
            href="/farmers"
            className="flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 group"
          >
            <span>View All Farmer Profiles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {farmers.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full aspect-[4/3] bg-cream-100 overflow-hidden">
                  <Image
                    src={farmer.bannerImage || farmer.profileImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                    alt={farmer.farmName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-forest-900/90 text-harvest-300 text-[10px] font-bold backdrop-blur-sm">
                    {farmer.experienceYears} Years Farming
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-earth-600">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-forest-600 shrink-0" />
                      <span>{farmer.district}, {farmer.state}</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{farmer.rating.toFixed(1)}</span>
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-forest-950">
                    {farmer.farmName}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Led by {farmer.user.name}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {farmer.story}
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Farming Practices:
                    </span>
                    <span className="text-[11px] text-forest-800 bg-forest-50 px-2 py-1 rounded-md block truncate">
                      {farmer.farmingMethods}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  href={`/farmers/${farmer.id}`}
                  className="block w-full py-2.5 text-center rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 text-xs font-bold transition-colors"
                >
                  View Farm & Products →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FARM TO HOME KNOWLEDGE HUB (POPULAR BLOG ARTICLES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-600">
              Community Learning
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950 mt-1">
              Organic Farming Knowledge Hub
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Field-tested guides written by experienced organic farmers and agronomy researchers.
            </p>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 group"
          >
            <span>Explore All Knowledge Guides</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full aspect-[16/10] bg-cream-100 overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-900/90 text-harvest-300 backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTimeMinutes} min read</span>
                    </span>
                    <span>•</span>
                    <span>By {post.authorName}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base sm:text-lg text-forest-950 group-hover:text-forest-700 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <span className="text-xs font-bold text-forest-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. HOW FARM TO HOME WORKS */}
      <section className="bg-cream-100/70 border-y border-cream-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-earth-600">
              Transparency at Every Step
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
              How Farm to Home Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Connecting rural farming heritage directly to mindful urban tables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Direct from Verified Farms',
                desc: 'Farmers list produce, seeds, and soil essentials directly from their acreage with verified natural practices.',
                icon: Sprout,
              },
              {
                step: '02',
                title: 'Digital Farm Passport',
                desc: 'Every batch is assigned a verifiable QR passport detailing farmer identity, soil origin, and laboratory testing.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Harvested at Dawn & Packed',
                desc: 'Produce is picked fresh at morning dawn upon order confirmation, minimizing transit degradation and cold storage.',
                icon: Clock,
              },
              {
                step: '04',
                title: 'Naturally to Your Home',
                desc: 'Eco-friendly packed crates delivered directly to your doorstep across 10,000+ Indian PIN codes.',
                icon: Truck,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-serif font-black text-3xl text-cream-400">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-earth-600">
            Real Experiences
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            Loved by Mindful Families & Gardeners
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Read authentic feedback from customers buying straight from our partner farmers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: 'Priya Sharma',
              location: 'Bellandur, Bengaluru',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
              comment:
                'The Naati Country Tomatoes and vermicompost from Farm to Home completely changed my perspective on produce. You can smell the sweetness in the tomatoes the moment you open the crate. Plus, scanning the Farm Passport QR code gave us complete trust knowing Ramesh Patel cultivated it without chemical sprays.',
              rating: 5,
              product: 'Naturally Grown Country Tomatoes & Vermicompost',
            },
            {
              name: 'Rajesh Kumar Verma',
              location: 'Hi-Tech City, Hyderabad',
              avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
              comment:
                'As an avid terrace gardener, finding genuine desi non-GMO seeds and pure cold-pressed neem cake in Hyderabad was always tough. Farm to Home delivered heirloom seeds with a 90% germination rate and the Smart AI Assistant even gave me guidance in Telugu on how to formulate neem oil spray!',
              rating: 5,
              product: 'Kitchen Garden Seed Kit & Cold-Pressed Neem Cake',
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Purchase</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-forest-200">
                    <Image src={rev.avatar} alt={rev.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-forest-950">{rev.name}</h4>
                    <p className="text-[11px] text-gray-500">{rev.location}</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg hidden sm:inline">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. FARMER ONBOARDING CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-earth-800 via-earth-700 to-earth-900 text-white rounded-3xl p-8 sm:p-12 shadow-elevated border border-earth-600 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-harvest-400 text-forest-950 inline-block">
              For Farmers & Agronomists
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Are you an Organic Farmer or Seed Conserver?
            </h3>
            <p className="text-earth-100 text-xs sm:text-sm leading-relaxed">
              Sell directly to conscious consumers, publish your own farming guides in the Knowledge Hub, list farm waste for exchange, and get fair prices with transparent payouts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link
              href="/seller/register"
              className="px-6 py-3.5 rounded-2xl bg-harvest-400 hover:bg-harvest-300 text-forest-950 font-bold text-xs sm:text-sm text-center shadow-soft transition-colors"
            >
              Register as Farm Seller
            </Link>
            <Link
              href="/farmers"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm text-center border border-white/20 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
