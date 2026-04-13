'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, Sparkles, CheckCircle, LayoutTemplate } from 'lucide-react';

export default function EmailCampaignPage() {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState(`<h2>Weekly Update</h2>
<p>Here is what's new on the AI Blog.</p>

<a href="http://localhost:3000" style="display:inline-block;background:#00FFC8;color:#000;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">Read More</a>`);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTestSend = async () => {
    if (!subject || !html) {
      setStatus('error');
      setMessage('Subject and content are required');
      return;
    }
    
    setStatus('sending');
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test', subject, html }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Test email sent successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send test email');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error occurred');
    }
  };

  const handleBroadcast = async () => {
    if (!confirm('Are you sure you want to send this to ALL active subscribers?')) return;
    
    setStatus('sending');
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'broadcast', subject, html }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(`Broadcast initiated for ${data.count} subscribers`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to start broadcast');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error occurred');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ color: 'var(--accent-orange)', background: 'rgba(255,107,43,0.1)', padding: 8, borderRadius: 8 }}>
            <Mail size={22} />
          </span>
          <h1 style={{ fontSize: '1.6rem' }}>Email Campaigns</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          Compose and send newsletters to your subscribers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Composer */}
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="The latest insights from AI Blog..."
                className="input"
                style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Message Body (HTML)
              </label>
              <textarea
                value={html}
                onChange={e => setHtml(e.target.value)}
                className="input"
                style={{ minHeight: 300, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical' }}
              />
            </div>

            {status !== 'idle' && (
              <div style={{
                padding: '12px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                background: status === 'success' ? 'rgba(0,255,200,0.1)' : status === 'error' ? 'rgba(255,107,43,0.1)' : 'var(--bg-surface)',
                color: status === 'success' ? 'var(--accent-cyan)' : status === 'error' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                border: `1px solid ${status === 'success' ? 'rgba(0,255,200,0.2)' : status === 'error' ? 'rgba(255,107,43,0.3)' : 'var(--border-subtle)'}`
              }}>
                {status === 'sending' && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {status === 'success' && <CheckCircle size={16} />}
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={handleTestSend} disabled={status === 'sending'} className="btn-ghost" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>
                <Sparkles size={16} /> Send Test to Admin
              </button>
              <button onClick={handleBroadcast} disabled={status === 'sending'} className="btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>
                <Send size={16} /> Broadcast to Subscribers
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
            <LayoutTemplate size={16} />
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview</h3>
          </div>
          
          <div style={{ 
            background: '#ffffff', color: '#111111', 
            borderRadius: 10, overflow: 'hidden', padding: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', margin: '0 0 20px 0', borderBottom: '1px solid #eeeeee', paddingBottom: 16 }}>
              {subject || "Subject line will appear here"}
            </h2>
            <div 
              style={{ fontFamily: 'Arial, sans-serif', fontSize: '15px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: html || "<p style='color:#888'>Email body preview...</p>" }} 
            />
            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eeeeee' }} />
            <p style={{ fontSize: '12px', color: '#888' }}>
              You're receiving this because you subscribed to our newsletter.<br/>
              <a href="#" style={{ color: '#888' }}>Unsubscribe</a>
            </p>
          </div>
        </div>
        
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
