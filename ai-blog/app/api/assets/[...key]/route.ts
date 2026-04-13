import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const fullKey = key.join('/');

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const bucket = (context.env as any).BUCKET as R2Bucket;

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket not found' }, { status: 500 });
    }

    const object = await bucket.get(fullKey);

    if (!object) {
      return new Response('Object Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
