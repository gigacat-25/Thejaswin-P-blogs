export const runtime = 'edge';
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAllSubscribersAdmin, deleteSubscriber } from '@/lib/db';

async function auth() {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(req: Request) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const result = await getAllSubscribersAdmin(page);
  return NextResponse.json({ success: true, ...result });
}
