'use client';

import Link from 'next/link';
import { Clock, Eye, ArrowRight } from 'lucide-react';
import { BlogWithTags } from '@/types/blog';
import { formatDate, readingTime, truncate } from '@/lib/utils';

interface BlogCardProps {
  blog: BlogWithTags;
  featured?: boolean;
}

export default function BlogCard({ blog, featured = false }: BlogCardProps) {
  const readTime = readingTime(blog.content);
  const date = blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at);

  return (
    <article className="card" style={{
      padding: featured ? '32px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      height: '100%',
    }}>
      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {blog.tags.slice(0, 3).map(tag => (
          <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}>
            <span className="tag">{tag}</span>
          </Link>
        ))}
      </div>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <Link href={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: featured ? '1.4rem' : '1.1rem',
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}>
            {blog.title}
          </h3>
        </Link>
        {blog.excerpt && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 8, lineHeight: 1.6 }}>
            {truncate(blog.excerpt, featured ? 200 : 120)}
          </p>
        )}
      </div>

      {/* Footer meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {readTime} min
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} /> {blog.view_count.toLocaleString()}
          </span>
          <span>{date}</span>
        </div>
        <Link href={`/blog/${blog.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.03em' }}>
          Read <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
