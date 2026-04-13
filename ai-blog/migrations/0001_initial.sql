-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
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
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'unsubscribed'
  confirmation_token TEXT UNIQUE,
  unsubscribe_token TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER
);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
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
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Seed data: sample blog posts
INSERT OR IGNORE INTO blogs (title, slug, content, excerpt, tags, featured_image, status, created_at, updated_at, published_at, view_count)
VALUES 
(
  'Getting Started with AI-Powered Content Creation',
  'getting-started-ai-content-creation',
  '## Introduction

Artificial intelligence is revolutionizing how we create, curate, and distribute content. From drafting blog posts to writing marketing copy, AI tools are becoming indispensable for modern content creators.

## What You Will Learn

In this guide, we will explore:
- How large language models work
- Practical prompt engineering techniques
- Integrating AI tools into your workflow
- Quality control for AI-generated content

## The Rise of AI Writing Tools

Tools like **Groq**, **OpenAI GPT**, and **Anthropic Claude** have made it possible to generate high-quality content at scale. These models are trained on vast datasets and can mimic the tone, style, and structure of human writing.

```javascript
// Example: Calling Groq API
const response = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [{ role: "user", content: "Write a blog post about AI..." }]
});
```

## Prompt Engineering Best Practices

1. **Be specific**: Vague prompts yield vague results
2. **Set the tone**: Specify if you want formal, casual, or technical content
3. **Provide context**: Background information improves output quality
4. **Iterate**: Regenerate and refine until satisfied

## Conclusion

AI-powered content creation is not about replacing human creativity—it is about amplifying it. Use these tools to overcome writer''s block, draft faster, and scale your content operation.',
  'Learn how AI tools like Groq and LLMs are transforming content creation workflows for modern bloggers and marketers.',
  '["AI","Content Creation","Technology","LLM"]',
  NULL,
  'published',
  1712844000,
  1712844000,
  1712844000,
  127
),
(
  'Building Scalable APIs with Cloudflare Workers',
  'building-scalable-apis-cloudflare-workers',
  '## Why Cloudflare Workers?

Cloudflare Workers brings serverless computing to the edge—running your code in over 300 data centers worldwide. This means ultra-low latency, zero cold starts, and infinite scalability.

## Core Concepts

### The Worker Environment

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/hello") {
      return Response.json({ message: "Hello from the edge!" });
    }
    
    return new Response("Not Found", { status: 404 });
  }
};
```

### D1 Database Integration

Cloudflare D1 is a serverless SQLite database that integrates seamlessly with Workers:

```typescript
const result = await env.DB.prepare(
  "SELECT * FROM blogs WHERE status = ? ORDER BY published_at DESC LIMIT ?"
).bind("published", 10).all();
```

### KV for Caching

```typescript
// Cache with TTL
await env.BLOG_CACHE.put(`blog:${slug}`, JSON.stringify(blog), {
  expirationTtl: 300 // 5 minutes
});

// Read from cache
const cached = await env.BLOG_CACHE.get(`blog:${slug}`);
```

## Performance Benefits

- **Zero cold starts**: Workers start in microseconds
- **Global distribution**: Code runs close to your users
- **Cost effective**: Pay per request, not per server

## Conclusion

Cloudflare Workers represents a paradigm shift in how we build backend services. With D1, KV, and Queues, you have everything needed to build production-grade applications at the edge.',
  'Explore how Cloudflare Workers, D1, and KV enable you to build globally-distributed, high-performance APIs with zero infrastructure management.',
  '["Cloudflare","Serverless","API","Edge Computing"]',
  NULL,
  'published',
  1712930400,
  1712930400,
  1712930400,
  89
),
(
  'The Future of Newsletter Marketing in the AI Era',
  'future-newsletter-marketing-ai-era',
  '## Newsletters Are Not Dead

Despite predictions of its demise, email marketing continues to deliver the highest ROI of any digital marketing channel—returning $42 for every $1 spent. The difference now is that AI is making it smarter.

## Personalization at Scale

AI enables hyper-personalization that was previously impossible:

- **Dynamic content**: Different sections shown to different segments
- **Optimal send time**: ML models predict when each subscriber is most likely to open
- **Subject line optimization**: A/B testing with AI-suggested variants

## Automation Workflows

```typescript
// Automated workflow: Blog published → Email subscribers
async function notifySubscribers(blog: Blog) {
  const subscribers = await getActiveSubscribers();
  
  for (const batch of chunk(subscribers, 100)) {
    await sendEmailBatch(batch.map(sub => ({
      to: sub.email,
      subject: `New Post: ${blog.title}`,
      html: renderEmailTemplate(blog, sub.unsubscribeToken)
    })));
    
    // Respect rate limits
    await sleep(1000);
  }
}
```

## Measuring Success

Key metrics to track:
- **Open Rate**: Industry average 21%, aim for 30%+
- **Click-Through Rate**: 2.5% average, target 5%+
- **Unsubscribe Rate**: Keep below 0.5%
- **Deliverability Rate**: Must be above 95%

## The AI Advantage

With tools like this platform, you can:
1. Auto-generate newsletter content from your latest blogs
2. Personalize subject lines per subscriber segment
3. Schedule sends at optimal times
4. Track engagement and adjust strategy automatically

## Conclusion

The future of newsletter marketing is intelligent, automated, and deeply personalized. Platforms that integrate AI into their email workflows will outperform those that rely on manual processes.',
  'Discover how AI is transforming newsletter marketing—from automated content generation to predictive personalization and optimal send-time algorithms.',
  '["Email Marketing","Newsletter","AI","Marketing Strategy"]',
  NULL,
  'published',
  1713016800,
  1713016800,
  1713016800,
  203
);
