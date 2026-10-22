import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { BookOpen, Clock, Heart, Search, Globe, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { BlogListClient } from './BlogListClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface BlogPageProps {
  searchParams: {
    category?: string;
    lang?: string;
    search?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, lang, search } = searchParams;

  const where: any = { isPublished: true };
  if (category && category !== 'ALL') where.category = category;
  if (lang && lang !== 'ALL') where.language = lang;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      comments: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-8 sm:p-12 shadow-elevated border border-forest-700/60 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-400 text-forest-950 text-xs font-bold">
            <BookOpen className="w-4 h-4" />
            <span>Farm to Home Knowledge Hub</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white">
            Organic Farming Knowledge & Techniques
          </h1>
          <p className="text-forest-100 text-xs sm:text-base leading-relaxed">
            Practical agricultural knowledge, traditional Indian natural farming recipes (Jeevamrutha, Neemastra, Agniastra), and urban terrace gardening methods documented by real growers.
          </p>
        </div>
      </div>

      {/* Interactive Blog List with Language and Category filters */}
      <BlogListClient
        initialPosts={posts as any}
        currentCategory={category || 'ALL'}
        currentLang={lang || 'ALL'}
        initialSearch={search || ''}
      />
    </div>
  );
}
