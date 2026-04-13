export const runtime = 'edge';
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'thejaswinps@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Aarcha@2005*';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as any;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // In production, ADMIN_PASSWORD should be a bcrypt hash stored in env
    const isValid = password === ADMIN_PASSWORD; // Simple comparison for dev

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const { signToken } = await import('@/lib/auth');
    const token = await signToken({ sub: '1', email, role: 'admin' });

    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  return NextResponse.json({ success: true });
}
