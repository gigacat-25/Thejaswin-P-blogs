import { now } from '@/lib/utils';
import path from 'path';
import fs from 'fs';

export async function uploadFile(file: File, folder: string = 'blogs'): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name);
  const fileName = `${now()}-${Math.random().toString(36).substring(7)}${ext}`;
  const key = `${folder}/${fileName}`;

  // Try Cloudflare R2
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const bucket = (context.env as any).BUCKET as R2Bucket;
    
    if (bucket) {
      await bucket.put(key, buffer, {
        httpMetadata: { contentType: file.type }
      });
      // In production, you'd usually have a public URL for the bucket
      // or a worker route that serves from R2.
      // For simplicity, we'll return a relative path and serve it via /api/assets/[key]
      return `/api/assets/${key}`;
    }
  } catch (e) {
    // Fallback to local
    console.log('R2 not available, falling back to local storage');
  }

  // Local storage fallback
  const publicPath = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
  
  const filePath = path.join(publicPath, fileName);
  fs.writeFileSync(filePath, buffer);
  
  return `/uploads/${folder}/${fileName}`;
}
