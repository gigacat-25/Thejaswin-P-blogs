import { getAdminStats, getPublishedBlogs } from '@/lib/db';
import Link from 'next/link';
import { FileText, Users, Eye, TrendingUp, Plus, Bot, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboard() {
  const stats = getAdminStats();
  const { data: recentBlogs } = getPublishedBlogs(1, 5);

  const statCards = [
    { label: 'Total Posts', value: stats.totalBlogs, sub: `${stats.publishedBlogs} published`, icon: <FileText size={20} />, color: 'var(--accent-cyan)' },
    { label: 'Subscribers', value: stats.totalSubscribers, sub: `${stats.activeSubscribers} active`, icon: <Users size={20} />, color: 'var(--accent-purple)' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: 'across all posts', icon: <Eye size={20} />, color: 'var(--accent-orange)' },
    { label: 'Avg Views/Post', value: stats.publishedBlogs > 0 ? Math.round(stats.totalViews / stats.publishedBlogs).toLocaleString() : '0', sub: 'per published post', icon: <TrendingUp size={20} />, color: 'var(--accent-cyan)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 36 }}>
        {statCards.map(({ label, value, sub, icon, color }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
              <span style={{ color, background: `${color}1a`, padding: 8, borderRadius: 8 }}>{icon}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 36 }}>
        {[
          { href: '/admin/blogs/new', icon: <Plus size={16} />, label: 'New Blog Post', color: 'var(--accent-cyan)' },
          { href: '/admin/generate', icon: <Bot size={16} />, label: 'AI Generator', color: 'var(--accent-purple)' },
          { href: '/admin/subscribers', icon: <Users size={16} />, label: 'View Subscribers', color: 'var(--accent-orange)' },
        ].map(({ href, icon, label, color }) => (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 18px',
            background: 'var(--bg-elevated)',
            border: `1px solid ${color}33`,
            borderRadius: 8,
            color,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}1a`; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}>
            {icon} {label}
          </Link>
        ))}
      </div>

      {/* Recent posts */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Recent Posts</h2>
          <Link href="/admin/blogs" style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Title', 'Status', 'Views', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBlogs.map(blog => (
                <tr key={blog.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/blogs/${blog.id}/edit`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600 }}>
                      {blog.title}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 3,
                      background: blog.status === 'published' ? 'rgba(0,255,200,0.1)' : 'rgba(255,107,43,0.1)',
                      color: blog.status === 'published' ? 'var(--accent-cyan)' : 'var(--accent-orange)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                    }}>
                      {blog.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{blog.view_count.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date((blog.published_at || blog.created_at) * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
