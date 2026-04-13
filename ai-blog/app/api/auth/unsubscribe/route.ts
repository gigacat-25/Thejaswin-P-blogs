export const runtime = 'edge';
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
  }

  const success = await unsubscribeByToken(token);
  if (!success) {
    return NextResponse.json({ success: false, error: 'Invalid unsubscribe token' }, { status: 400 });
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?unsubscribed=true`);
}
