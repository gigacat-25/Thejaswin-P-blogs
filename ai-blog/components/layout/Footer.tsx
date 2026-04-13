'use client';

import Link from 'next/link';
import { Zap, Globe, MessageCircle, Rss } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      marginTop: 80,
    }}>
      <div className="accent-bar" />
      <div className="container" style={{ padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ background: 'var(--accent-cyan)', borderRadius: 5, padding: '4px 6px', color: '#000' }}>
                <Zap size={14} strokeWidth={3} />
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>ThejaswinBlogs</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              AI-augmented tech insights on cloud, LLMs, and modern engineering.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-cyan)', marginBottom: 14, textTransform: 'uppercase' }}>
              Navigate
            </h4>
            {[['/', 'Home'], ['/blogs', 'Blog'], ['/admin', 'Dashboard']].map(([href, label]) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                {label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-cyan)', marginBottom: 14, textTransform: 'uppercase' }}>
              Connect
            </h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: <MessageCircle size={18} />, href: '#', label: 'GitHub' },
                { icon: <Globe size={18} />, href: '#', label: 'Twitter' },
                { icon: <Rss size={18} />, href: '/api/rss', label: 'RSS' },
              ].map(({ icon, href, label }) => (
                <a key={label} href={href} title={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6, color: 'var(--text-muted)',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-cyan)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            © {year} ThejaswinBlogs. Built with Next.js + Groq AI.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>●</span> System Operational
          </p>
        </div>
      </div>
    </footer>
  );
}
