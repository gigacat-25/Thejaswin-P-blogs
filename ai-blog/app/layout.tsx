import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ThejaswinBlogs – AI-Powered Tech Insights',
    template: '%s | ThejaswinBlogs',
  },
  description: 'Deep-dive technical articles on AI, cloud architecture, and modern development — augmented by Groq AI.',
  keywords: ['AI', 'tech blog', 'Cloudflare', 'Next.js', 'Groq', 'LLM'],
  authors: [{ name: 'Thejaswin' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'ThejaswinBlogs',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
