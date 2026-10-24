import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, Heart, Share2, ArrowLeft, MessageSquare, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { BlogArticleClient } from './BlogArticleClient';

import { FALLBACK_BLOG_POSTS } from '@/lib/fallback-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface BlogArticlePageProps {
  params: { slug: string };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  let post: any = null;
  let relatedPosts: any[] = [];

  try {
    post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: { name: true, avatar: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (post) {
      relatedPosts = await prisma.blogPost.findMany({
        where: {
          category: post.category,
          id: { not: post.id },
          isPublished: true,
        },
        take: 2,
      });
    }
  } catch (err) {
    console.error('Database connection notice on BlogArticlePage:', err);
  }

  if (!post) {
    post = FALLBACK_BLOG_POSTS.find((p) => p.slug === params.slug) || FALLBACK_BLOG_POSTS[0];
    relatedPosts = FALLBACK_BLOG_POSTS.filter((p) => p.slug !== post?.slug).slice(0, 2);
  }

  if (!post) {
    notFound();
  }

  return (
    <BlogArticleClient post={post as any} relatedPosts={relatedPosts as any} />
  );
}
