'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Users, Search, Trash2, RefreshCw, Download } from 'lucide-react';
import type { Subscriber } from '@/types/blog';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSubscribers = async (p = 1) => {
    setLoading(true);
    const res = await fetch(`/api/admin/subscribers?page=${p}`);
    const data = await res.json() as any;
    if (data.success) {
      setSubscribers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(p);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this subscriber?')) return;
    await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
    fetchSubscribers(page);
  };

  const statusColor = (s: string) => {
    if (s === 'active') return 'var(--accent-cyan)';
    if (s === 'pending') return 'var(--accent-orange)';
    return 'var(--text-muted)';
  };

  const statusBg = (s: string) => {
    if (s === 'active') return 'rgba(0,255,200,0.1)';
    if (s === 'pending') return 'rgba(255,107,43,0.1)';
    return 'rgba(100,100,100,0.1)';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ color: 'var(--accent-purple)', background: 'var(--accent-purple-dim)', padding: 8, borderRadius: 8 }}>
              <Users size={18} />
            </span>
            <h1 style={{ fontSize: '1.6rem' }}>Subscribers</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{total} total subscribers</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => fetchSubscribers(page)} className="btn-ghost" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active', value: subscribers.filter(s => s.status === 'active').length, color: 'var(--accent-cyan)' },
          { label: 'Pending', value: subscribers.filter(s => s.status === 'pending').length, color: 'var(--accent-orange)' },
          { label: 'Unsubscribed', value: subscribers.filter(s => s.status === 'unsubscribed').length, color: 'var(--text-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                {['Email', 'Name', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr key={sub.id} style={{ borderBottom: i < subscribers.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{sub.email}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub.name || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 3, background: statusBg(sub.status), color: statusColor(sub.status), fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(sub.created_at * 1000).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(sub.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-orange)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    No subscribers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchSubscribers(p)} style={{
              width: 36, height: 36,
              background: p === page ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
              color: p === page ? '#000' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: p === page ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', cursor: 'pointer',
            }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
