import { NextResponse } from 'next/server';
import { getPublishedBlogs } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '10');
  const tag = searchParams.get('tag') || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const result = await getPublishedBlogs(page, perPage, tag, search);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
