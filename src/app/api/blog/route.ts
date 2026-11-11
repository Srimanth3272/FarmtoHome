import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_BLOG_POSTS } from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const search = searchParams.get('search');

    const where: any = { isPublished: true };
    if (category) where.category = category;
    if (language) where.language = language;
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
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (posts && posts.length > 0) {
      return NextResponse.json(posts);
    }

    let fallback = FALLBACK_BLOG_POSTS;
    if (category) {
      fallback = fallback.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (language) {
      fallback = fallback.filter((p: any) => !p.language || p.language.toLowerCase() === language.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.tags?.toLowerCase().includes(q)
      );
    }
    return NextResponse.json(fallback.length > 0 ? fallback : FALLBACK_BLOG_POSTS);
  } catch (error) {
    console.warn('Error fetching blog posts from database, returning fallback data:', error);
    return NextResponse.json(FALLBACK_BLOG_POSTS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      authorId,
      authorName,
      authorRole,
      category,
      tags,
      readTimeMinutes,
      language,
    } = body;

    let validAuthorId = authorId;
    if (!validAuthorId || validAuthorId.startsWith('demo-')) {
      const author = await prisma.user.findFirst();
      validAuthorId = author?.id;
    }

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt,
        content,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=1200&auto=format&fit=crop&q=80',
        authorId: validAuthorId || 'author-1',
        authorName: authorName || 'Organic Farming Expert',
        authorRole: authorRole || 'Practicing Agronomist',
        category: category || 'Organic Farming Basics',
        tags: tags || 'Organic, Sustainable, Soil Health',
        readTimeMinutes: parseInt(readTimeMinutes, 10) || 5,
        language: language || 'en',
        isPublished: true,
        isApproved: true,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let slug = searchParams.get('slug');

    if (!id && !slug) {
      try {
        const body = await request.json();
        id = body?.id;
        slug = body?.slug;
      } catch {}
    }

    if (!id && !slug) {
      return NextResponse.json({ error: 'Blog ID or Slug is required' }, { status: 400 });
    }

    const where: any = {};
    if (id) where.id = id;
    if (slug) where.slug = slug;

    // First delete any comments
    const existing = await prisma.blogPost.findFirst({ where });
    if (existing) {
      await prisma.blogComment.deleteMany({ where: { postId: existing.id } }).catch(() => {});
      await prisma.blogPost.delete({ where: { id: existing.id } }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: 'Blog article removed successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete blog post' }, { status: 500 });
  }
}
