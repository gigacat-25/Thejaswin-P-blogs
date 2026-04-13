export const runtime = 'edge';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import BlogFilters from '@/components/blog/BlogFilters';
import { getPublishedBlogs } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Browse all articles on AI, cloud engineering, and modern development. Managed by Thejaswin.',
  alternates: {
    canonical: 'https://thejaswinp.in/blogs',
  },
  openGraph: {
    title: 'ThejaswinBlogs – All Articles',
    description: 'Deep-dive technical articles on AI, cloud architecture, and modern development.',
    url: 'https://thejaswinp.in/blogs',
    type: 'website',
  },
};

interface Props {
  searchParams: Promise<{ page?: string; tag?: string; search?: string; sort?: string }>;
}

export default async function BlogsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const tag = params.tag;
  const search = params.search;

  const { data: blogs, total, totalPages } = await getPublishedBlogs(page, 9, tag, search);

  return (
    <>
      <Header />
      <main style={{ padding: '60px 0 80px' }}>
        <div className="container">
          {/* Page header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ marginBottom: 10 }}>
              {tag ? <><span style={{ color: 'var(--accent-cyan)' }}>#</span>{tag}</> : 'All Articles'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              {total} {total === 1 ? 'article' : 'articles'} found
              {search && <> · matching &quot;<span style={{ color: 'var(--accent-cyan)' }}>{search}</span>&quot;</>}
            </p>
            <div style={{ height: 2, width: 48, background: 'var(--accent-cyan)', marginTop: 14, borderRadius: 1 }} />
          </div>

          {/* Filters */}
          <Suspense>
            <BlogFilters currentTag={tag} currentSearch={search} />
          </Suspense>

          {/* Grid */}
          {blogs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginTop: 32 }}>
              {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8 }}>No articles found</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Try a different search or filter.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`/blogs?page=${p}${tag ? `&tag=${tag}` : ''}${search ? `&search=${search}` : ''}`}
                  style={{
                    width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: p === page ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                    color: p === page ? '#000' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: p === page ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                    borderRadius: 4,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: p === page ? 700 : 400,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
