'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Bot, Users, Mail, LogOut, Zap, ExternalLink } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { href: '/admin/blogs', icon: <FileText size={16} />, label: 'Blog Posts' },
  { href: '/admin/generate', icon: <Bot size={16} />, label: 'AI Generator' },
  { href: '/admin/subscribers', icon: <Users size={16} />, label: 'Subscribers' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>
      {/* Top accent */}
      <div className="accent-bar" />

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'var(--accent-cyan)', borderRadius: 5, padding: '4px 6px', color: '#000' }}>
            <Zap size={14} strokeWidth={3} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Admin
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Control Panel
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflow: 'auto' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
          Navigation
        </p>
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderRadius: 6,
              color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              background: active ? 'var(--accent-cyan-dim)' : 'transparent',
              border: active ? '1px solid rgba(0,255,200,0.2)' : '1px solid transparent',
              fontFamily: 'var(--font-display)',
              fontWeight: active ? 600 : 400,
              fontSize: '0.875rem',
              textDecoration: 'none',
              marginBottom: 2,
              transition: 'all 0.15s',
            }}>
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border-subtle)' }}>
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: '0.82rem',
          textDecoration: 'none',
          borderRadius: 6,
          marginBottom: 4,
          transition: 'color 0.2s',
        }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <ExternalLink size={14} /> View Site
        </Link>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px',
          width: '100%', background: 'none', border: 'none',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: '0.82rem',
          cursor: 'pointer',
          borderRadius: 6,
          transition: 'color 0.2s',
        }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-orange)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}
