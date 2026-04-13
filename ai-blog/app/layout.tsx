import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://thejaswinp.in'),
  title: {
    default: 'ThejaswinBlogs – AI-Powered Tech Insights',
    template: '%s | ThejaswinBlogs',
  },
  description: 'Deep-dive technical articles on AI, cloud architecture, and modern development — augmented by Groq AI and Llama 3.',
  keywords: ['AI', 'tech blog', 'Cloudflare Workers', 'Next.js', 'Groq', 'LLM', 'Edge Computing', 'Software Engineering'],
  authors: [{ name: 'Thejaswin' }],
  creator: 'Thejaswin',
  publisher: 'Thejaswin Blogs',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/shortcut-icon.png',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thejaswinp.in',
    siteName: 'ThejaswinBlogs',
    title: 'ThejaswinBlogs – AI-Powered Tech Insights',
    description: 'Deep-dive technical articles on AI, cloud architecture, and modern development.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ThejaswinBlogs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThejaswinBlogs – AI-Powered Tech Insights',
    description: 'Deep-dive technical articles on AI, cloud architecture, and modern development.',
    creator: '@thejaswinp', // Update if known
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Thejaswin Blogs',
              url: 'https://thejaswinp.in',
              logo: 'https://thejaswinp.in/logo.png',
              sameAs: [
                'https://twitter.com/thejaswinp',
                'https://github.com/thejaswin-p',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Thejaswin Blogs',
              url: 'https://thejaswinp.in',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://thejaswinp.in/blogs?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
