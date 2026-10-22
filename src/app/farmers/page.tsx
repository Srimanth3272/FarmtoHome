import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Users, MapPin, Star, ShieldCheck, Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function FarmersDirectoryPage() {
  const farmers = await prisma.farmerProfile.findMany({
    include: {
      user: {
        select: { name: true, avatar: true, email: true },
      },
      products: {
        where: { isActive: true },
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          unit: true,
          images: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { experienceYears: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-8 sm:p-12 shadow-elevated border border-forest-700/60 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
            <Users className="w-4 h-4" />
            <span>Direct Agricultural Producers</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white">
            Meet Our Farmers
          </h1>
          <p className="text-forest-100 text-xs sm:text-base leading-relaxed">
            Real people, real farms, real soil regeneration. Get to know the organic cultivators, seed conservators, and agricultural pioneers growing your food across India.
          </p>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {farmers.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Banner & Avatar */}
              <div className="relative h-44 w-full bg-cream-100">
                <Image
                  src={f.bannerImage || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'}
                  alt={f.farmName}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white">
                      <Image
                        src={f.profileImage || f.user.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                        alt={f.user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h3 className="font-serif font-bold text-lg leading-tight drop-shadow-sm">
                        {f.farmName}
                      </h3>
                      <p className="text-xs text-forest-200">
                        Led by {f.user.name}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-forest-900/90 text-harvest-300 text-xs font-bold backdrop-blur-sm border border-forest-700">
                    {f.experienceYears}+ Yrs
                  </span>
                </div>
              </div>

              {/* Farmer Bio Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-earth-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-forest-700" />
                    <span>{f.district}, {f.state}</span>
                  </span>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{f.rating.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">({f.reviewsCount} reviews)</span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                  {f.story}
                </p>

                <div className="space-y-1.5 text-xs pt-2 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <strong className="text-gray-600 shrink-0">Methods:</strong>
                    <span className="text-forest-900 font-medium">{f.farmingMethods}</span>
                  </div>
                  {f.certifications && (
                    <div className="flex items-start gap-2">
                      <strong className="text-gray-600 shrink-0">Certifications:</strong>
                      <span className="text-forest-700 font-medium">{f.certifications}</span>
                    </div>
                  )}
                </div>

                {/* Products Preview */}
                {f.products.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                      Products for Sale ({f._count.products}):
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {f.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          className="px-2.5 py-1.5 rounded-xl bg-cream-100 hover:bg-forest-50 border border-cream-200 text-xs text-forest-950 font-medium whitespace-nowrap transition-colors"
                        >
                          {p.name} • ₹{p.price}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <Link
                href={`/farmers/${f.id}`}
                className="flex-1 py-3 text-center rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Farm Profile & Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
