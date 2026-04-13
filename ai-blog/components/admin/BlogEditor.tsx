'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, ArrowLeft, Plus, X } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface BlogEditorProps {
  initialData?: {
    id?: number;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    tags?: string[];
    status?: 'draft' | 'published';
    featured_image?: string;
  };
  mode: 'create' | 'edit';
}

export default function BlogEditor({ initialData, mode }: BlogEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!initialData?.id) setSlug(slugify(v));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const handleSave = async () => {
    setError('');
    if (!title || !content) { setError('Title and content are required'); return; }
    setSaving(true);
    const url = mode === 'edit' ? `/api/admin/blogs/${initialData?.id}` : '/api/admin/blogs';
    const method = mode === 'edit' ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, content, excerpt, tags: JSON.stringify(tags), status, featured_image: featuredImage }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      router.push('/admin/blogs');
    } else {
      setError(data.error || 'Save failed');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 style={{ fontSize: '1.4rem' }}>{mode === 'create' ? 'New Post' : 'Edit Post'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPreview(!preview)} className="btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
            <Eye size={14} /> {preview ? 'Editor' : 'Preview'}
          </button>
          <select value={status} onChange={e => setStatus(e.target.value as 'draft' | 'published')} className="input" style={{ width: 'auto', padding: '8px 14px' }}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 16px', background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.3)', borderRadius: 6, color: 'var(--accent-orange)', marginBottom: 20, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Title *</label>
            <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title..." className="input" style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600 }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Slug</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="post-slug" className="input" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Excerpt</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Brief description..." className="input" style={{ resize: 'vertical', minHeight: 72 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Content (Markdown) *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your post in Markdown..."
              className="input"
              style={{ resize: 'vertical', minHeight: 400, fontFamily: 'var(--font-mono)', fontSize: '0.875rem', lineHeight: 1.7 }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Tags */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Tags</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {tags.map(tag => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} className="tag">
                  {tag}
                  <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag..."
                className="input"
                style={{ fontSize: '0.8rem', padding: '7px 10px' }}
              />
              <button onClick={addTag} className="btn-ghost" style={{ padding: '7px 10px' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Featured Image URL</h3>
            <input type="url" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..." className="input" style={{ fontSize: '0.8rem', padding: '7px 10px' }} />
          </div>

          {/* Info */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Words</span>
                <span style={{ color: 'var(--text-primary)' }}>{content.trim().split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Read time</span>
                <span style={{ color: 'var(--text-primary)' }}>{Math.ceil(content.trim().split(/\s+/).length / 200)} min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Status</span>
                <span style={{ color: status === 'published' ? 'var(--accent-cyan)' : 'var(--accent-orange)' }}>{status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
