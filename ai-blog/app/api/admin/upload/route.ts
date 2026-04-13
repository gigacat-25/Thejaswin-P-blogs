import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';

async function auth() {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  return token ? verifyToken(token) : null;
}

export async function POST(req: Request) {
  if (!await auth()) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Use the uploadFile utility which handles R2 or local
    const fileUrl = await uploadFile(file, 'featured');

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
