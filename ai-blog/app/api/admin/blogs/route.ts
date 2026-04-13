export const runtime = 'edge';
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAllBlogsAdmin, createBlog } from '@/lib/db';
import { slugify, now } from '@/lib/utils';
import { sendEmail } from '@/lib/services/gmailService';
import { getAllSubscribersAdmin } from '@/lib/db';

async function getAuthPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(request: Request) {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const result = await getAllBlogsAdmin(page);
  return NextResponse.json({ success: true, ...result });
}

async function triggerBlogEmails(blog: any) {
  const result = await getAllSubscribersAdmin(1, 10000);
  const activeSubs = result.data?.filter(s => s.status === 'active') || [];
  if (activeSubs.length === 0) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const blogUrl = `${appUrl}/blog/${blog.slug}`;
  const html = `<h2>New Post: ${blog.title}</h2>
  <p>${blog.excerpt || 'Read our latest post on the AI blog...'}</p>
  <a href="${blogUrl}" style="display:inline-block;background:#00FFC8;color:#000;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">Read Full Article</a>`;

  // Process sequentially to respect rate limits conceptually
  for (const sub of activeSubs) {
    try {
      const unsubscribeLink = `${appUrl}/api/auth/unsubscribe?token=${sub.unsubscribe_token}`;
      const personalizedHtml = `${html}<hr><p style="font-size: 11px; color: #888;">You are receiving this because you subscribed. <a href="${unsubscribeLink}">Unsubscribe</a></p>`;
      await sendEmail({ to: sub.email, subject: `New Blog Post: ${blog.title}`, html: personalizedHtml });
    } catch (e) {
      console.error(`Failed to send email to ${sub.email}`, e);
    }
  }
}

export async function POST(request: Request) {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as any;
    const { title, content, excerpt, tags, featured_image, status } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const ts = now();
    const blog = await createBlog({
      title,
      slug: slugify(title),
      content,
      excerpt: excerpt || null,
      tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || null),
      featured_image: featured_image || null,
      status: status || 'draft',
      created_at: ts,
      updated_at: ts,
      published_at: status === 'published' ? ts : null,
    });

    if (blog.status === 'published') {
      // Fire and forget (in a real app, use a queue like Inngest/Upstash)
      triggerBlogEmails(blog).catch(console.error);
    }

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
