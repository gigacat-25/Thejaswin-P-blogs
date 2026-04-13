import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Eye, Calendar, Share2, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import NewsletterForm from '@/components/forms/NewsletterForm';
import TableOfContents from '@/components/blog/TableOfContents';
import BlogContent from '@/components/blog/BlogContent';
import { getBlogBySlug, getRelatedBlogs, incrementViewCount } from '@/lib/db';
import { formatDate, readingTime, extractHeadings } from '@/lib/utils';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: 'Not Found' };
  return {
    title: blog.title,
    description: blog.excerpt || undefined,
    openGraph: { title: blog.title, description: blog.excerpt || undefined, type: 'article' },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  // Increment view count
  await incrementViewCount(slug);

  const related = await getRelatedBlogs(blog.id, blog.tags);
  const headings = extractHeadings(blog.content);
  const readTime = readingTime(blog.content);
  const date = blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <>
      <Header />
      <main style={{ padding: '48px 0 80px' }}>
        <div className="container">
          {/* Back link */}
          <Link href="/blogs" className="link-hover" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', textDecoration: 'none', marginBottom: 32 }}>
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(260px, 30%)', gap: 48, alignItems: 'start' }}>
            {/* Main article */}
            <article>
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {blog.tags.map(tag => (
                  <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}>
                    <span className="tag">{tag}</span>
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 style={{ marginBottom: 20, maxWidth: '22ch', lineHeight: 1.1 }}>{blog.title}</h1>

              {/* Meta bar */}
              <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20,
                padding: '14px 20px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                marginBottom: 36,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} /> {date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> {readTime} min read
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} /> {(blog.view_count + 1).toLocaleString()} views
                </span>

                {/* Share buttons */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`${appUrl}/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="link-hover" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Share2 size={13} /> Share
                  </a>
                </div>
              </div>

              {/* Excerpt */}
              {blog.excerpt && (
                <p style={{
                  borderLeft: '3px solid var(--accent-cyan)',
                  paddingLeft: 16,
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  marginBottom: 32,
                  lineHeight: 1.7,
                }}>
                  {blog.excerpt}
                </p>
              )}

              {/* Markdown content */}
              <BlogContent content={blog.content} />

              {/* Newsletter */}
              <div style={{ marginTop: 48 }}>
                <NewsletterForm compact />
              </div>
            </article>

            {/* Sidebar */}
            <aside style={{ position: 'sticky', top: 90 }}>
              {headings.length > 0 && <TableOfContents headings={headings} />}
            </aside>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div style={{ marginTop: 72 }}>
              <div className="divider" style={{ margin: '0 0 48px 0' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24, fontSize: '1.5rem' }}>Related Articles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {related.map(b => <BlogCard key={b.id} blog={b} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
