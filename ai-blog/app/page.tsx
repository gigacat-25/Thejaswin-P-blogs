import Link from 'next/link';
import { ArrowRight, Zap, Bot, Mail, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import NewsletterForm from '@/components/forms/NewsletterForm';
import { getPublishedBlogs } from '@/lib/db';

export default async function HomePage() {
  const { data: blogs } = await getPublishedBlogs(1, 6);
  const featured = blogs.slice(0, 3);
  const recent = blogs.slice(3, 6);

  return (
    <>
      <Header />
      <main>
        {/* ============ HERO ============ */}
        <section className="scanlines grid-bg" style={{
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow orbs */}
          <div style={{
            position: 'absolute', top: '10%', left: '-5%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(0,255,200,0.07) 0%, transparent 65%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', right: '-3%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 65%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div className="container" style={{ padding: '80px 24px', position: 'relative', zIndex: 2 }}>
            {/* Status pill */}
            <div className="reveal-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              <span style={{
                padding: '6px 16px',
                background: 'var(--accent-cyan-dim)',
                border: '1px solid rgba(0,255,200,0.25)',
                borderRadius: 100,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                color: 'var(--accent-cyan)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                AI-AUGMENTED CONTENT PLATFORM
              </span>
            </div>

            {/* Main headline */}
            <h1 className="reveal-2 caret" style={{ marginBottom: 22, maxWidth: '14ch' }}>
              Engineering<br />
              <span style={{ color: 'var(--accent-cyan)' }}>Insights</span> at<br />
              Warp Speed
            </h1>

            <p className="reveal-3" style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: '52ch',
              marginBottom: 36,
              lineHeight: 1.7,
            }}>
              Deep-dive articles on AI, Cloudflare Workers, and modern web engineering—
              crafted with the help of Groq&apos;s LLM. Subscribe and stay ahead.
            </p>

            {/* CTA buttons */}
            <div className="reveal-4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/blogs" className="btn-primary">
                Browse Articles <ArrowRight size={16} />
              </Link>
              <Link href="#newsletter" className="btn-ghost">
                Subscribe <Mail size={16} />
              </Link>
            </div>

            {/* Stats bar */}
            <div className="reveal-4" style={{
              display: 'flex', gap: 40, marginTop: 60,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 28,
              flexWrap: 'wrap',
              rowGap: 16,
            }}>
              {[
                { label: 'Articles Published', value: blogs.length.toString() + '+' },
                { label: 'Total Reads', value: blogs.reduce((a, b) => a + b.view_count, 0).toLocaleString() + '+' },
                { label: 'AI-Assisted', value: '100%' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--accent-cyan)' }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </section>

        {/* ============ FEATURES ============ */}
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {[
                { icon: <Bot size={22} />, title: 'AI-Generated Content', desc: 'Powered by Groq\'s Llama 3 for fast, high-quality drafts.', color: 'var(--accent-cyan)' },
                { icon: <TrendingUp size={22} />, title: 'Technical Depth', desc: 'From edge computing to LLM fine-tuning, we go deep.', color: 'var(--accent-purple)' },
                { icon: <Mail size={22} />, title: 'Newsletter', desc: 'Get new posts delivered automatically to your inbox.', color: 'var(--accent-orange)' },
                { icon: <Zap size={22} />, title: 'Lightning Fast', desc: 'Built on Next.js + Cloudflare edge for sub-100ms loads.', color: 'var(--accent-cyan)' },
              ].map(({ icon, title, desc, color }) => (
                <div key={title} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ color, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}1a`, borderRadius: 8 }}>
                    {icon}
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FEATURED POSTS ============ */}
        {featured.length > 0 && (
          <section style={{ padding: '0 0 80px' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Featured Articles</h2>
                  <div style={{ height: 2, width: 48, background: 'var(--accent-cyan)', marginTop: 8, borderRadius: 1 }} />
                </div>
                <Link href="/blogs" style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {featured.map(blog => <BlogCard key={blog.id} blog={blog} featured />)}
              </div>
            </div>
          </section>
        )}

        {/* ============ RECENT POSTS ============ */}
        {recent.length > 0 && (
          <section style={{ padding: '0 0 80px' }}>
            <div className="container">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>Recent Posts</h2>
              <div style={{ height: 2, width: 48, background: 'var(--accent-purple)', marginTop: 0, marginBottom: 28, borderRadius: 1 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {recent.map(blog => <BlogCard key={blog.id} blog={blog} />)}
              </div>
            </div>
          </section>
        )}

        {/* ============ NEWSLETTER ============ */}
        <section id="newsletter" style={{ padding: '0 0 80px' }}>
          <div className="container">
            <NewsletterForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
