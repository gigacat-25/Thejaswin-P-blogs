export const runtime = 'edge';
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createSubscriber, getSubscriberByEmail } from '@/lib/db';
import { generateToken } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json() as any;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    // Duplicate check
    const existing = await getSubscriberByEmail(email);
    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ success: false, error: 'This email is already subscribed.' }, { status: 409 });
      }
      // Re-pending
    }

    const confirmToken = generateToken();
    const unsubToken = generateToken();
    const subscriber = await createSubscriber(email, name || null, confirmToken, unsubToken);

    // In production: send confirmation email via Gmail API
    // For now: auto-confirm in dev mode
    if (process.env.NODE_ENV === 'development') {
      const { confirmSubscriber } = await import('@/lib/db');
      await confirmSubscriber(confirmToken);
    }

    return NextResponse.json({
      success: true,
      message: process.env.NODE_ENV === 'development'
        ? 'Subscribed successfully! (Dev: auto-confirmed)'
        : 'Check your inbox to confirm your subscription.',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Subscription failed. Please try again.' }, { status: 500 });
  }
}
