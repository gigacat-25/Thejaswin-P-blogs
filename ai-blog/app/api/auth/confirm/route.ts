import { NextResponse } from 'next/server';
import { confirmSubscriber } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
  }

  const success = confirmSubscriber(token);
  if (!success) {
    return NextResponse.json({ success: false, error: 'Invalid or expired confirmation token' }, { status: 400 });
  }

  // Redirect to success page or return success message
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?subscribed=true`);
}
