# AI-Powered Blogging Platform - Technical Specification

## Project Overview
Build a production-ready, full-stack AI-powered blogging platform with automated email newsletters, AI content generation, and enterprise-grade backend infrastructure.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **UI Libraries**: Lucide React (icons), Radix UI or Headless UI (components)

### Backend & Infrastructure
- **Database**: Cloudflare D1 (SQLite)
- **Serverless**: Cloudflare Workers
- **Caching**: Cloudflare KV
- **CDN**: Cloudflare Pages/CDN

### Third-Party APIs
- **AI Generation**: Groq API (Llama 3 or Mixtral)
- **Email Service**: Gmail API with OAuth 2.0
- **Authentication**: NextAuth.js or custom JWT

---

## Core Features

### 1. Public Website

#### Home Page (`/`)
- Hero section with platform description
- Featured blog posts (3-4 cards with images, title, excerpt, tags)
- Recent posts section (chronological, paginated)
- Newsletter subscription CTA (prominent placement)
- Responsive design with mobile-first approach

#### Blog Listing Page (`/blogs`)
- **Search**: Full-text search across title and content
- **Filters**: 
  - Filter by tags (multi-select)
  - Sort by date, popularity, or relevance
- **Pagination**: Server-side pagination (10 posts per page)
- **UI**: Card grid layout with hover effects

#### Blog Detail Page (`/blog/[slug]`)
- **Markdown Rendering**: 
  - Use `react-markdown` with `remark-gfm` and `rehype-highlight`
  - Syntax highlighting for code blocks (Highlight.js or Prism)
- **Table of Contents**: 
  - Auto-generated from H2/H3 headings
  - Sticky sidebar on desktop
  - Smooth scroll navigation
- **Metadata**: 
  - Author, publish date, reading time, tags
  - Social share buttons (Twitter, LinkedIn, Facebook)
- **Related Posts**: Show 3 related posts based on tags
- **Newsletter Signup**: Inline form at article end

#### Newsletter Subscription
- **Form Fields**: Email (required), optional name
- **Validation**: 
  - Email format validation
  - Duplicate prevention
  - Honeypot for spam protection
- **Confirmation**: Double opt-in (send confirmation email)
- **Unsubscribe**: Unique token-based unsubscribe link in every email

---

### 2. Admin Dashboard

#### Authentication (`/admin/login`)
- **Method**: Email/password with bcrypt hashing
- **Session**: JWT tokens (httpOnly cookies)
- **Security**: 
  - Rate limiting (5 attempts per 15 minutes)
  - CSRF protection
  - Secure headers (helmet.js or built-in Next.js config)

#### Dashboard Home (`/admin`)
- **Analytics Overview**:
  - Total blogs, total subscribers, recent activity
  - Charts: Blog views over time, subscriber growth
- **Quick Actions**: Create new blog, view subscribers, AI generator

#### Blog Management (`/admin/blogs`)
- **List View**: 
  - Table with title, status (draft/published), date, actions
  - Bulk actions (delete, publish/unpublish)
- **Create/Edit**: 
  - Rich markdown editor with live preview (e.g., SimpleMDE, Toast UI Editor)
  - Fields: Title, slug (auto-generated, editable), content, tags, featured image URL, excerpt
  - Status: Draft or Published
  - Schedule publishing (optional bonus feature)
- **Delete**: Soft delete with confirmation modal

#### AI Blog Generator (`/admin/generate`)
- **Input Form**:
  - Topic/title (required)
  - Tone (dropdown: Professional, Casual, Technical, Creative, Persuasive)
  - Keywords (comma-separated, optional)
  - Target length (dropdown: Short ~500 words, Medium ~1000 words, Long ~2000 words)
- **Generation Process**:
  1. Submit form → loading state
  2. Call Groq API via Cloudflare Worker
  3. Stream response or show full result
  4. Display generated content in editor
- **Post-Generation**:
  - Fully editable before saving
  - Auto-save as draft
  - Option to regenerate with different parameters

#### Subscriber Management (`/admin/subscribers`)
- **List View**: Table with email, subscription date, status
- **Actions**: Export to CSV, bulk delete, send test email
- **Stats**: Total subscribers, growth rate

#### Email Campaign Composer (`/admin/email`)
- **Manual Campaigns**:
  - Subject line, preview text
  - Rich text editor for email body
  - Preview email before sending
  - Send to all subscribers or test email
- **Automated Blog Notifications**: Configured per blog publish

---

## Email Automation (Gmail API)

### Setup Requirements
1. **Google Cloud Console**:
   - Enable Gmail API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/gmail/callback`, production URL
   - Download credentials JSON

2. **Scopes Required**:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly` (optional, for tracking)

### OAuth Flow
1. Admin initiates OAuth from dashboard settings
2. Redirect to Google consent screen
3. Receive authorization code, exchange for access + refresh tokens
4. Store tokens securely in Cloudflare KV or D1 (encrypted)

### Token Management
- **Refresh Logic**: 
  - Tokens expire in 1 hour
  - Automatically refresh using refresh token before expiration
  - Handle refresh failures gracefully (re-auth prompt)
- **Storage**: Encrypt tokens with AES-256 before storing

### Email Sending Workflow
**Trigger**: Blog status changes from draft to published

**Process**:
1. Fetch all active subscribers from D1 (`SELECT email FROM subscribers WHERE status = 'active'`)
2. For each subscriber:
   - Generate personalized email HTML
   - Include: Blog title, excerpt, "Read More" link, unsubscribe link
   - Send via Gmail API using batch requests (up to 100 emails per batch)
3. Implement retry logic (3 attempts with exponential backoff)
4. Log results: Sent, failed, bounced

**Rate Limiting**:
- Gmail API quota: 250 requests/second, 1 billion requests/day
- Implement queue system for large subscriber lists (>1000)
- Use Cloudflare Durable Objects or Queue for job management

**Email Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50;">{{blog_title}}</h1>
    <p>{{blog_excerpt}}</p>
    <a href="{{blog_url}}" style="display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">Read Full Article</a>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #7f8c8d;">
      You're receiving this because you subscribed to our newsletter.
      <a href="{{unsubscribe_url}}">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
```

---

## Backend Architecture (Cloudflare)

### Database Schema (D1)

```sql
-- Blogs table
CREATE TABLE blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT, -- JSON array stored as text
  featured_image TEXT,
  status TEXT DEFAULT 'draft', -- 'draft' or 'published'
  created_at INTEGER NOT NULL, -- Unix timestamp
  updated_at INTEGER NOT NULL,
  published_at INTEGER, -- Unix timestamp, null if draft
  view_count INTEGER DEFAULT 0
);

-- Subscribers table
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'unsubscribed'
  confirmation_token TEXT UNIQUE,
  unsubscribe_token TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER
);

-- Email logs table (optional, for tracking)
CREATE TABLE email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER,
  blog_id INTEGER,
  status TEXT, -- 'sent', 'failed', 'bounced'
  sent_at INTEGER,
  error_message TEXT,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id),
  FOREIGN KEY (blog_id) REFERENCES blogs(id)
);

-- Create indexes
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_email ON subscribers(email);
```

### Cloudflare Workers API Endpoints

**Base URL**: `/api` (proxied through Next.js or direct worker)

#### Blog APIs
- `GET /api/blogs` - List blogs (with pagination, filters)
- `GET /api/blogs/:slug` - Get single blog
- `POST /api/blogs` - Create blog (admin only)
- `PUT /api/blogs/:id` - Update blog (admin only)
- `DELETE /api/blogs/:id` - Delete blog (admin only)
- `POST /api/blogs/:id/publish` - Publish blog + trigger emails

#### Subscriber APIs
- `POST /api/subscribe` - Subscribe to newsletter
- `GET /api/subscribe/confirm/:token` - Confirm subscription
- `GET /api/unsubscribe/:token` - Unsubscribe
- `GET /api/subscribers` - List subscribers (admin only)
- `DELETE /api/subscribers/:id` - Delete subscriber (admin only)

#### AI Generation API
- `POST /api/generate` - Generate blog content using Groq API
  - **Request**: `{ topic, tone, keywords, length }`
  - **Response**: `{ content: string }`
  - **Implementation**: Stream response from Groq API

#### Email APIs
- `POST /api/email/send` - Send email to subscribers (admin only)
- `POST /api/email/test` - Send test email (admin only)
- `GET /api/email/status/:id` - Check email send status

### Cloudflare KV (Caching)

**Namespace**: `BLOG_CACHE`

**Cache Strategy**:
- Cache published blogs for 5 minutes: `blog:${slug}`
- Cache blog list for 2 minutes: `blogs:list:${page}:${filters}`
- Invalidate on blog update/publish
- Cache subscriber count: `stats:subscribers`

**Implementation**:
```typescript
// Example caching logic
const cached = await KV.get(`blog:${slug}`);
if (cached) return JSON.parse(cached);

const blog = await D1.prepare('SELECT * FROM blogs WHERE slug = ?').bind(slug).first();
await KV.put(`blog:${slug}`, JSON.stringify(blog), { expirationTtl: 300 });
return blog;
```

---

## Security Best Practices

### 1. Environment Variables
Store sensitive data in `.env.local` (local) and Cloudflare secrets (production):
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GROQ_API_KEY`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `NEXT_PUBLIC_API_URL`

### 2. Input Validation
- Use Zod for schema validation on all API endpoints
- Sanitize markdown content to prevent XSS
- Validate email format with regex + DNS check (optional)

### 3. Rate Limiting
- Implement rate limiting on:
  - Login attempts: 5/15 minutes per IP
  - Newsletter signup: 3/hour per IP
  - AI generation: 10/hour per admin session
  - Email sending: Respect Gmail quotas

### 4. Authentication & Authorization
- Admin routes protected with middleware
- JWT tokens with 24-hour expiration
- Refresh token rotation
- CSRF tokens for state-changing operations

### 5. Data Protection
- Encrypt sensitive data at rest (Gmail tokens)
- Use HTTPS only in production
- Set secure cookie flags: `httpOnly`, `secure`, `sameSite`
- Implement Content Security Policy (CSP) headers

---

## File Structure

```
ai-blog-platform/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Home page
│   │   ├── blogs/
│   │   │   ├── page.tsx             # Blog listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Blog detail
│   │   ├── subscribe/
│   │   │   ├── confirm/[token]/page.tsx
│   │   │   └── unsubscribe/[token]/page.tsx
│   │   └── layout.tsx               # Public layout
│   ├── admin/
│   │   ├── layout.tsx               # Admin layout with auth
│   │   ├── page.tsx                 # Dashboard
│   │   ├── login/page.tsx
│   │   ├── blogs/
│   │   │   ├── page.tsx             # Blog list
│   │   │   ├── new/page.tsx         # Create blog
│   │   │   └── [id]/edit/page.tsx   # Edit blog
│   │   ├── generate/page.tsx        # AI generator
│   │   ├── subscribers/page.tsx
│   │   └── email/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── gmail/callback/route.ts
│   │   ├── blogs/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── subscribe/route.ts
│   │   ├── generate/route.ts
│   │   └── email/route.ts
│   ├── globals.css
│   └── layout.tsx                   # Root layout
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogContent.tsx          # Markdown renderer
│   │   ├── TableOfContents.tsx
│   │   └── RelatedPosts.tsx
│   ├── forms/
│   │   ├── NewsletterForm.tsx
│   │   ├── BlogEditor.tsx
│   │   └── AIGeneratorForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── admin/
│       ├── StatCard.tsx
│       ├── BlogTable.tsx
│       └── EmailPreview.tsx
├── lib/
│   ├── utils.ts                     # Helper functions
│   ├── validators.ts                # Zod schemas
│   ├── auth.ts                      # JWT helpers
│   └── constants.ts
├── services/
│   ├── groqService.ts               # Groq API integration
│   ├── gmailService.ts              # Gmail API integration
│   ├── dbService.ts                 # D1 database queries
│   └── cacheService.ts              # KV caching logic
├── workers/
│   ├── api.ts                       # Main Cloudflare Worker
│   ├── email-queue.ts               # Email queue worker
│   └── wrangler.toml                # Cloudflare config
├── migrations/
│   └── 0001_initial.sql             # D1 migration
├── types/
│   ├── blog.ts
│   ├── subscriber.ts
│   └── api.ts
├── .env.local.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Setup & Deployment Guide

### 1. Gmail API Setup

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/gmail/callback` (local)
     - `https://yourdomain.com/api/auth/gmail/callback` (production)
5. Download credentials JSON
6. Copy `client_id` and `client_secret` to `.env.local`

#### OAuth Token Generation
1. Run the app locally: `npm run dev`
2. Navigate to `/admin/settings` (create this page)
3. Click "Connect Gmail"
4. Authorize the application
5. Tokens are automatically stored in Cloudflare KV

### 2. Groq API Setup
1. Sign up at [Groq Cloud](https://console.groq.com/)
2. Generate API key
3. Add to `.env.local`: `GROQ_API_KEY=your_key_here`

### 3. Cloudflare Setup

#### D1 Database
```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create ai-blog-db

# Run migrations
npx wrangler d1 migrations apply ai-blog-db
```

#### KV Namespace
```bash
# Create KV namespace
npx wrangler kv:namespace create "BLOG_CACHE"
npx wrangler kv:namespace create "BLOG_CACHE" --preview

# Copy IDs to wrangler.toml
```

#### Workers Configuration
Create `wrangler.toml`:
```toml
name = "ai-blog-api"
main = "workers/api.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "ai-blog-db"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "BLOG_CACHE"
id = "your-kv-id"

[vars]
ENVIRONMENT = "production"
```

### 4. Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Run D1 migrations locally
npm run db:migrate

# Start Next.js dev server
npm run dev

# In another terminal, start Cloudflare Workers
npm run worker:dev
```

### 5. Production Deployment

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

#### Deploy Cloudflare Workers
```bash
# Deploy workers
npm run worker:deploy

# Publish D1 migrations
npx wrangler d1 migrations apply ai-blog-db --remote
```

#### Environment Variables (Production)
Add these to Vercel:
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GROQ_API_KEY`
- `JWT_SECRET` (generate with: `openssl rand -base64 32`)
- `ADMIN_PASSWORD_HASH` (bcrypt hash of admin password)
- `NEXT_PUBLIC_CLOUDFLARE_WORKER_URL`

Add these to Cloudflare Workers (secrets):
```bash
npx wrangler secret put GMAIL_REFRESH_TOKEN
npx wrangler secret put GROQ_API_KEY
```

---

## Bonus Features

### 1. Email Preview
- **Location**: `/admin/email/preview`
- **Functionality**: 
  - Render email template with sample data
  - Toggle between desktop/mobile views
  - Send preview to admin email before bulk send

### 2. Blog Scheduling
- **Database**: Add `scheduled_at` column to blogs table
- **Implementation**: 
  - Cron trigger (Cloudflare Workers Cron)
  - Check every hour for blogs with `status = 'scheduled'` and `scheduled_at <= NOW()`
  - Automatically publish and send emails
- **UI**: DateTime picker in blog editor

### 3. Draft Mode
- **Status**: Add `draft` status to blogs
- **Functionality**: 
  - Drafts not visible on public site
  - Admin can preview drafts via secret URL: `/blog/[slug]?preview=true&token=xyz`
  - Generate preview token for sharing with stakeholders

### 4. Advanced Analytics
- **Metrics**: 
  - Blog views (track with middleware or client-side event)
  - Email open rate (track pixel in emails)
  - Click-through rate (track link clicks)
- **Storage**: Store in D1 analytics table
- **Dashboard**: Charts with ApexCharts or Recharts

### 5. Multi-Author Support
- **Database**: Add `authors` table and `blog_authors` junction table
- **Functionality**: 
  - Multiple admin accounts
  - Author profiles with bio, avatar
  - Filter blogs by author

### 6. Content Versioning
- **Database**: `blog_versions` table
- **Functionality**: 
  - Save version on every edit
  - Restore previous versions
  - Compare versions side-by-side

---

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component with Cloudflare Images
2. **Code Splitting**: Lazy load admin components
3. **Static Generation**: Use `generateStaticParams` for blog pages
4. **Database Indexing**: Indexes on frequently queried columns
5. **Caching Strategy**: 
   - Static pages: 1 year cache
   - Blog content: 5 min cache with stale-while-revalidate
   - API responses: 2 min cache with KV

---

## Testing Checklist

- [ ] Unit tests for services (Jest)
- [ ] API endpoint testing (integration tests)
- [ ] Email sending flow (use Gmail test mode)
- [ ] OAuth flow end-to-end
- [ ] Rate limiting validation
- [ ] Security headers verification
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance testing (Lighthouse score >90)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

---

## Monitoring & Logging

1. **Error Tracking**: Sentry or Cloudflare Workers analytics
2. **Performance Monitoring**: Vercel Analytics
3. **Uptime Monitoring**: UptimeRobot or Pingdom
4. **Logs**: Cloudflare Workers logs for API calls
5. **Alerts**: Set up alerts for:
   - Failed email sends
   - API errors (>5% error rate)
   - Database connection issues

---

## Documentation Deliverables

1. **README.md**: Project overview, quick start guide
2. **SETUP.md**: Detailed setup instructions (Gmail, Groq, Cloudflare)
3. **API.md**: API documentation with request/response examples
4. **DEPLOYMENT.md**: Step-by-step deployment guide
5. **CONTRIBUTING.md**: Guidelines for contributors (if open source)
6. **ARCHITECTURE.md**: System architecture diagram and explanations

---

## Estimated Timeline

- **Week 1**: Setup, database schema, basic Next.js structure
- **Week 2**: Public pages (home, blog listing, detail)
- **Week 3**: Admin dashboard, authentication, blog CRUD
- **Week 4**: AI integration (Groq API), email system (Gmail API)
- **Week 5**: Email automation, worker deployment
- **Week 6**: Testing, bug fixes, performance optimization
- **Week 7**: Documentation, deployment, final QA

---

## Success Criteria

- [ ] Users can browse and read blogs with syntax highlighting
- [ ] Admins can create, edit, delete blogs
- [ ] AI generates quality blog content based on inputs
- [ ] Newsletter subscribers receive emails when blogs publish
- [ ] Email unsubscribe works correctly
- [ ] Admin dashboard shows analytics
- [ ] Site loads in <2 seconds (LCP)
- [ ] Mobile responsive and accessible
- [ ] No security vulnerabilities (run audit)
- [ ] 99.9% uptime in production

---

## License & Credits

- **Framework**: Next.js (MIT)
- **AI Model**: Groq (Commercial license required)
- **Email**: Gmail API (Google Terms of Service)
- **Hosting**: Cloudflare (Commercial plan recommended for production)
