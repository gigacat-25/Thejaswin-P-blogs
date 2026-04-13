export const runtime = 'edge';
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/services/gmailService';
import { getAllSubscribersAdmin } from '@/lib/db';

async function auth() {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  return token ? verifyToken(token) : null;
}

export async function POST(req: Request) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { type, subject, html } = await req.json() as any;

    if (!subject || !html) {
      return NextResponse.json({ success: false, error: 'Missing subject or content' }, { status: 400 });
    }

    if (type === 'test') {
      const adminEmail = process.env.ADMIN_EMAIL || 'thejaswinps@gmail.com';
      const result = await sendEmail({ to: adminEmail, subject: `[TEST] ${subject}`, html });
      return NextResponse.json(result);
    } 
    
    if (type === 'broadcast') {
      // Fetch all active subscribers
      const result = await getAllSubscribersAdmin(1, 10000); // Hack for now to get all
      const activeSubs = result.data?.filter(s => s.status === 'active') || [];
      
      if (activeSubs.length === 0) {
        return NextResponse.json({ success: false, error: 'No active subscribers found' });
      }

      // Important: In a real production app, this should be done in a background job queue
      // For this implementation, we will send them sequentially or in batches
      let successCount = 0;
      let failCount = 0;

      for (const sub of activeSubs) {
        try {
          const unsubscribeLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/unsubscribe?token=${sub.unsubscribe_token}`;
          const personalizedHtml = `${html}<hr><p style="font-size: 11px; color: #888;">You are receiving this because you subscribed. <a href="${unsubscribeLink}">Unsubscribe</a></p>`;
          
          await sendEmail({ to: sub.email, subject, html: personalizedHtml });
          successCount++;
        } catch (e) {
          console.error(`Failed to send to ${sub.email}`, e);
          failCount++;
        }
      }

      return NextResponse.json({ 
        success: true, 
        count: successCount, 
        failed: failCount, 
        message: `Broadcast complete. Sent: ${successCount}, Failed: ${failCount}` 
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
