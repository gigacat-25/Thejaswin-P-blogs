import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAdminStats } from '@/lib/db';

export async function GET() {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const stats = await getAdminStats();
  return NextResponse.json({ success: true, data: stats });
}
