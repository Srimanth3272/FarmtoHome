import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, Heart, Share2, ArrowLeft, MessageSquare, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { BlogArticleClient } from './BlogArticleClient';

export const revalidate = 0;

interface BlogArticlePageProps {
  params: { slug: string };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = await prisma.blogPost.findUnique({
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

  if (!post) {
    notFound();
  }

  // Fetch related articles
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      category: post.category,
      id: { not: post.id },
      isPublished: true,
    },
    take: 2,
  });

  return (
    <BlogArticleClient post={post as any} relatedPosts={relatedPosts as any} />
  );
}
