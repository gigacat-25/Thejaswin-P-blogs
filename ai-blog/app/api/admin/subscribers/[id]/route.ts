export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { deleteSubscriber } from '@/lib/db';

interface Params { params: Promise<{ id: string }> }

export async function DELETE(req: Request, { params }: Params) {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await deleteSubscriber(parseInt(id));
  return NextResponse.json({ success: true });
}
