import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAllBlogsAdmin, createBlog } from '@/lib/db';
import { slugify, now } from '@/lib/utils';

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
  const result = getAllBlogsAdmin(page);
  return NextResponse.json({ success: true, ...result });
}

export async function POST(request: Request) {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, content, excerpt, tags, featured_image, status } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const ts = now();
    const blog = createBlog({
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

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
