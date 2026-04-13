export const runtime = 'edge';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2, Zap, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';

const TONES = ['professional', 'casual', 'technical', 'creative', 'persuasive'];
const LENGTHS = [
  { value: 'short', label: 'Short (~500 words)' },
  { value: 'medium', label: 'Medium (~1000 words)' },
  { value: 'long', label: 'Long (~2000 words)' },
];

export default function GeneratePage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('technical');
  const [keywords, setKeywords] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Please enter a topic'); return; }
    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, keywords, length }),
      });
      const data = await res.json() as any;
      if (data.success) {
        setResult(data.content);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleUseContent = () => {
    // Navigate to new blog with pre-filled content
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('draft_title', topic);
      sessionStorage.setItem('draft_content', result);
    }
    router.push('/admin/blogs/new');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ color: 'var(--accent-cyan)', background: 'var(--accent-cyan-dim)', padding: 8, borderRadius: 8 }}>
            <Bot size={22} />
          </span>
          <h1 style={{ fontSize: '1.6rem' }}>AI Blog Generator</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          Powered by Groq × Llama 3.1 · generates content in seconds
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Input form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 24 }}>
            <div className="accent-bar" style={{ marginBottom: 20, borderRadius: 4 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Topic / Title *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Building a RAG pipeline with Cloudflare Workers AI"
                  className="input"
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Writing Tone
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)} style={{
                      padding: '6px 14px',
                      background: tone === t ? 'var(--accent-cyan-dim)' : 'transparent',
                      border: `1px solid ${tone === t ? 'rgba(0,255,200,0.4)' : 'var(--border-subtle)'}`,
                      borderRadius: 4,
                      color: tone === t ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textTransform: 'capitalize',
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Target Length
                </label>
                <select value={length} onChange={e => setLength(e.target.value)} className="input" style={{ padding: '9px 14px' }}>
                  {LENGTHS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Keywords (optional)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="AI, edge computing, workers, KV"
                  className="input"
                />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.3)', borderRadius: 4, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  ⚠ {error}
                </div>
              )}

              <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ justifyContent: 'center' }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                {loading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div style={{ background: 'var(--accent-cyan-dim)', border: '1px solid rgba(0,255,200,0.2)', borderRadius: 8, padding: 16 }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              💡 Tips for Best Results
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Be specific with your topic title',
                'Add 3-5 targeted keywords',
                'Use "technical" tone for dev content',
                'Edit and review before publishing',
              ].map(tip => (
                <li key={tip} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--accent-cyan)', flexShrink: 0 }}>›</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Generated output */}
        <div>
          {loading ? (
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 40,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
              minHeight: 300,
            }}>
              <div style={{ position: 'relative' }}>
                <Bot size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3 }} />
                <Loader2 size={24} style={{ color: 'var(--accent-cyan)', position: 'absolute', bottom: -4, right: -4, animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>Generating content...</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Groq × Llama 3.1 is writing your post</p>
              </div>
            </div>
          ) : result ? (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: 10, overflow: 'hidden' }}>
              <div className="accent-bar" />
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={13} /> Generated
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleGenerate} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 12px' }}>
                    <RefreshCw size={12} /> Regenerate
                  </button>
                  <button onClick={handleUseContent} className="btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                    Use This <ArrowRight size={13} />
                  </button>
                </div>
              </div>
              <textarea
                value={result}
                onChange={e => setResult(e.target.value)}
                style={{
                  width: '100%', minHeight: 500,
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem', lineHeight: 1.7,
                  padding: 20, resize: 'vertical',
                }}
              />
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-elevated)', border: '1px dashed var(--border-subtle)', borderRadius: 10, padding: 40,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              minHeight: 300, color: 'var(--text-muted)',
            }}>
              <Bot size={40} style={{ opacity: 0.3 }} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>Generated content will appear here</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Fill the form and click "Generate Content"</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
