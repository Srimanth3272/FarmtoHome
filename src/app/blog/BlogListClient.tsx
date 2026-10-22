'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Heart, Search, Globe, ArrowRight, MessageSquare } from 'lucide-react';
import { BlogPostItem } from '@/lib/types';

interface BlogListClientProps {
  initialPosts: BlogPostItem[];
  currentCategory: string;
  currentLang: string;
  initialSearch: string;
}

export const BlogListClient: React.FC<BlogListClientProps> = ({
  initialPosts,
  currentCategory,
  currentLang,
  initialSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedLang, setSelectedLang] = useState(currentLang);
  const [search, setSearch] = useState(initialSearch);

  const categories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'Vermicomposting', name: 'Vermicomposting' },
    { id: 'Neem-Based Pest Management', name: 'Neem Pest Control' },
    { id: 'Kitchen Gardening', name: 'Kitchen & Terrace' },
    { id: 'Soil Health', name: 'Soil Regeneration' },
  ];

  const languages = [
    { id: 'ALL', name: 'All Languages' },
    { id: 'en', name: 'English' },
    { id: 'te', name: 'తెలుగు (Telugu)' },
    { id: 'hi', name: 'हिंदी (Hindi)' },
  ];

  const filteredPosts = initialPosts.filter((post) => {
    const matchCat = selectedCategory === 'ALL' || post.category === selectedCategory;
    const matchLang = selectedLang === 'ALL' || post.language === selectedLang;
    const matchSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLang && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides: vermicompost, neemastra, aphid defense..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
            />
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Globe className="w-4 h-4 text-forest-700 shrink-0 ml-1 mr-1" />
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLang(l.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedLang === l.id
                    ? 'bg-forest-900 text-white font-bold'
                    : 'bg-cream-100 hover:bg-cream-200 text-gray-700'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="pt-3 border-t border-gray-100 flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-forest-800 text-white shadow-soft'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-forest-950">
            Published Agricultural Guides ({filteredPosts.length})
          </h2>
          <Link
            href="/seller/dashboard"
            className="text-xs font-bold text-forest-800 hover:underline"
          >
            Author access? Write an article →
          </Link>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-forest-950">No guides found</h3>
            <p className="text-xs text-gray-500">
              Try adjusting your search terms or clearing the selected language filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCardItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const BlogCardItem: React.FC<{ post: BlogPostItem }> = ({ post }) => {
  const FALLBACK_BLOG_IMAGE = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80';
  const initial =
    post.coverImage && !post.coverImage.includes('1592417817098')
      ? post.coverImage
      : FALLBACK_BLOG_IMAGE;
  const [imgSrc, setImgSrc] = useState(initial);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[16/10] bg-cream-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc(FALLBACK_BLOG_IMAGE)}
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-900/90 text-harvest-300 backdrop-blur-sm">
            {post.category}
          </span>
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/90 text-forest-950 backdrop-blur-sm">
            {post.language.toUpperCase()}
          </span>
        </div>

        <div className="p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
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

          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-forest-800 font-semibold">
            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            <span>{post.likesCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.comments ? post.comments.length : 0}</span>
          </span>
        </div>

        <span className="text-forest-800 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Read Article</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};
