'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useTransition } from 'react';

const POPULAR_TAGS = ['AI', 'Cloudflare', 'Next.js', 'Serverless', 'LLM', 'Email Marketing', 'API', 'Edge Computing'];

interface Props {
  currentTag?: string;
  currentSearch?: string;
}

export default function BlogFilters({ currentTag, currentSearch }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');
  const [, startTransition] = useTransition();

  const navigateTo = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    params.delete('page');
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    startTransition(() => router.push(`/blogs?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.toLowerCase().trim() === 'admin') {
      router.push('/admin/login');
      return;
    }
    navigateTo({ search: search || undefined });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 480 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="input"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>Search</button>
        {(currentSearch || currentTag) && (
          <button type="button" onClick={() => { setSearch(''); router.push('/blogs'); }} className="btn-ghost" style={{ padding: '8px 12px' }}>
            <X size={14} />
          </button>
        )}
      </form>

      {/* Tag filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span className={`tag ${!currentTag ? 'active' : ''}`} onClick={() => navigateTo({ tag: undefined, search: search || undefined })}>
          All
        </span>
        {POPULAR_TAGS.map(tag => (
          <span key={tag} className={`tag ${currentTag === tag ? 'active' : ''}`} onClick={() => navigateTo({ tag, search: search || undefined })}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
