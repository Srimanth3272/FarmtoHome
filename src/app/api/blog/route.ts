import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
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
        authorId: validAuthorId,
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
