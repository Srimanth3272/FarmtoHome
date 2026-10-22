'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Heart,
  Share2,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  Send,
  CheckCircle2,
  Check
} from 'lucide-react';
import { BlogPostItem } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface BlogArticleClientProps {
  post: BlogPostItem & {
    author?: { name: string; avatar?: string | null };
    comments: Array<{
      id: string;
      userName: string;
      content: string;
      createdAt: string;
    }>;
  };
  relatedPosts: BlogPostItem[];
}

export const BlogArticleClient: React.FC<BlogArticleClientProps> = ({ post, relatedPosts }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      userName: user?.name || 'Reader',
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Hub</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-900 text-harvest-300">
            {post.category}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTimeMinutes} min read</span>
          </span>
        </div>

        <h1 className="font-serif font-black text-3xl sm:text-5xl text-forest-950 leading-tight">
          {post.title}
        </h1>

        {/* Author card strip */}
        <div className="flex items-center justify-between pt-4 border-t border-b border-gray-100 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold font-serif text-sm">
              {post.authorName[0]}
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs sm:text-sm text-forest-950">
                {post.authorName}
              </h4>
              <p className="text-[11px] text-gray-500">{post.authorRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                hasLiked
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
              <span>{likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-elevated border border-cream-300 bg-cream-100">
        <Image
          src={
            post.coverImage && !post.coverImage.includes('1592417817098')
              ? post.coverImage
              : 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80'
          }
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Main Formatted Content */}
      <article className="prose prose-forest max-w-none text-gray-800 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
        {post.content}
      </article>

      {/* Tags */}
      {post.tags && (
        <div className="pt-6 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500">Related Topics:</span>
          {post.tags.split(',').map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-cream-100 text-forest-900 text-xs font-medium"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Interactive Comments Section */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-forest-700" />
            <h3 className="font-serif font-bold text-lg text-forest-950">
              Community Discussion ({comments.length})
            </h3>
          </div>
          <span className="text-xs text-gray-500">Share your experiences or questions</span>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            required
            rows={3}
            placeholder="Add your practical experience or question for the author..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
          />
          <div className="flex justify-between items-center">
            <p className="text-[11px] text-gray-400">
              Posting as <strong>{user?.name || 'Reader'}</strong>
            </p>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-soft transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>

        {/* Comment Stream */}
        <div className="space-y-4 divide-y divide-gray-100 pt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">
              No comments yet. Start the conversation!
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="pt-4 first:pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-forest-950">{c.userName}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Guides */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-6">
          <h3 className="font-serif font-bold text-xl text-forest-950">
            More Guides in {post.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="p-4 rounded-2xl bg-white border border-cream-300 hover:border-forest-600 transition-colors block space-y-1 shadow-card"
              >
                <h4 className="font-serif font-bold text-sm text-forest-950 line-clamp-1">
                  {r.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
