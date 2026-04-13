'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react';

interface NewsletterFormProps {
  compact?: boolean;
}

export default function NewsletterForm({ compact = false }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json() as any;
      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Check your inbox to confirm!');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (compact) {
    return (
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 32, marginTop: 40 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6, fontSize: '1.1rem' }}>
          Stay in the loop
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
          Get new articles delivered to your inbox.
        </p>
        <NewsletterInner email={email} setEmail={setEmail} name={name} setName={setName} status={status} message={message} onSubmit={handleSubmit} layout="row" />
      </div>
    );
  }

  return (
    <section style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-lg)',
      padding: '48px 40px',
      boxShadow: 'var(--glow-cyan)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200,
        background: 'radial-gradient(circle, rgba(0,255,200,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ color: 'var(--accent-cyan)' }}><Mail size={22} /></span>
          <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>Subscribe to the newsletter</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, maxWidth: '50ch' }}>
          Get AI-generated deep-dives on LLMs, cloud architecture, and engineering—directly in your inbox.
          No spam. Unsubscribe any time.
        </p>
        <NewsletterInner email={email} setEmail={setEmail} name={name} setName={setName} status={status} message={message} onSubmit={handleSubmit} layout="col" />
      </div>
    </section>
  );
}

interface InnerProps {
  email: string; setEmail: (v: string) => void;
  name: string; setName: (v: string) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  onSubmit: (e: React.FormEvent) => void;
  layout: 'row' | 'col';
}

function NewsletterInner({ email, setEmail, name, setName, status, message, onSubmit, layout }: InnerProps) {
  if (status === 'success') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-cyan)' }}>
        <Check size={20} />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: layout === 'col' ? 'column' : 'row', gap: 10, maxWidth: 520, flexWrap: 'wrap' }}>
      {layout === 'col' && (
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          style={{ flex: 1 }}
        />
      )}
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="input"
        style={{ flex: 1, minWidth: 200 }}
      />
      <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
        {status === 'loading' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
        Subscribe
      </button>
      {status === 'error' && (
        <p style={{ width: '100%', color: 'var(--accent-orange)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
          ⚠ {message}
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
