import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getBlogByIdAdmin, updateBlog, deleteBlog } from '@/lib/db';
import { now } from '@/lib/utils';

async function auth() {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  return token ? verifyToken(token) : null;
}

interface Params { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const blog = getBlogByIdAdmin(parseInt(id));
  if (!blog) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: blog });
}

export async function PUT(req: Request, { params }: Params) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const ts = now();
  const updated = updateBlog(parseInt(id), {
    ...body,
    updated_at: ts,
    published_at: body.status === 'published' && !body.published_at ? ts : body.published_at,
  });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  deleteBlog(parseInt(id));
  return NextResponse.json({ success: true });
}
