import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getBlogByIdAdmin, updateBlog, deleteBlog } from '@/lib/db';
import { now } from '@/lib/utils';
import { sendEmail } from '@/lib/services/gmailService';
import { getAllSubscribersAdmin } from '@/lib/db';

async function auth() {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  return token ? verifyToken(token) : null;
}

interface Params { params: Promise<{ id: string }> }

async function triggerBlogEmails(blog: any) {
  const result = await getAllSubscribersAdmin(1, 10000);
  const activeSubs = result.data?.filter(s => s.status === 'active') || [];
  if (activeSubs.length === 0) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const blogUrl = `${appUrl}/blog/${blog.slug}`;
  const html = `<h2>New Post: ${blog.title}</h2>
  <p>${blog.excerpt || 'Read our latest post on the AI blog...'}</p>
  <a href="${blogUrl}" style="display:inline-block;background:#00FFC8;color:#000;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">Read Full Article</a>`;

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

export async function GET(req: Request, { params }: Params) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const blog = await getBlogByIdAdmin(parseInt(id));
  if (!blog) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: blog });
}

export async function PUT(req: Request, { params }: Params) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as any;
  const ts = now();
  
  const original = await getBlogByIdAdmin(parseInt(id));
  if (!original) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  const updated = await updateBlog(parseInt(id), {
    ...body,
    updated_at: ts,
    published_at: body.status === 'published' && !body.published_at ? ts : body.published_at,
  });

  if (original.status === 'draft' && body.status === 'published' && updated) {
    triggerBlogEmails(updated).catch(console.error);
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await deleteBlog(parseInt(id));
  return NextResponse.json({ success: true });
}
