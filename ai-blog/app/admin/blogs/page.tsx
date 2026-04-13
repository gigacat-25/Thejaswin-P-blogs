'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, RefreshCw, Search } from 'lucide-react';
import type { BlogWithTags } from '@/types/blog';
import { formatDate } from '@/lib/utils';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogWithTags[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchBlogs = async (p = 1) => {
    setLoading(true);
    const res = await fetch(`/api/admin/blogs?page=${p}`);
    const data = await res.json() as any;
    if (data.success) {
      setBlogs(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(p);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeleting(id);
    await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
    setDeleting(null);
    fetchBlogs(page);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Blog Posts</h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{total} total posts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => fetchBlogs(page)} className="btn-ghost" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} />
          </button>
          <Link href="/admin/blogs/new" className="btn-primary" style={{ fontSize: '0.85rem' }}>
            <Plus size={16} /> New Post
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                {['Title', 'Status', 'Tags', 'Views', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, i) => (
                <tr key={blog.id} style={{ borderBottom: i < blogs.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                  <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {blog.title}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>/{blog.slug}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 3,
                      background: blog.status === 'published' ? 'rgba(0,255,200,0.1)' : 'rgba(255,107,43,0.1)',
                      color: blog.status === 'published' ? 'var(--accent-cyan)' : 'var(--accent-orange)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    }}>
                      {blog.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {blog.tags.slice(0, 2).map(tag => <span key={tag} className="tag" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>{tag}</span>)}
                      {blog.tags.length > 2 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{blog.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{blog.view_count.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date((blog.published_at || blog.created_at) * 1000).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/blog/${blog.slug}`} target="_blank" style={{ color: 'var(--text-muted)', padding: 6, borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}>
                        <Eye size={15} />
                      </Link>
                      <Link href={`/admin/blogs/${blog.id}/edit`} style={{ color: 'var(--text-muted)', padding: 6, borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}>
                        <Edit2 size={15} />
                      </Link>
                      <button onClick={() => handleDelete(blog.id)} disabled={deleting === blog.id} style={{ color: 'var(--text-muted)', padding: 6, borderRadius: 4, display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-orange)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchBlogs(p)} style={{
              width: 36, height: 36,
              background: p === page ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
              color: p === page ? '#000' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: p === page ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: p === page ? 700 : 400,
            }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
