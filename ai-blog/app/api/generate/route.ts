import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  // Verify auth
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return NextResponse.json({ success: false, error: 'GROQ_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { topic, tone, keywords, length } = await request.json() as any;

    const wordCount = { short: 500, medium: 1000, long: 2000 }[length as string] ?? 1000;
    const toneMap: Record<string, string> = {
      professional: 'professional and authoritative',
      casual: 'friendly and conversational',
      technical: 'highly technical and detailed',
      creative: 'creative and engaging',
      persuasive: 'persuasive and compelling',
    };
    const toneDesc = toneMap[tone] || 'professional';

    const systemPrompt = `You are an expert technical blogger. Write compelling, well-researched blog posts in Markdown format. Include a clear structure with H2 and H3 headings, code examples when relevant, and actionable insights.`;

    const userPrompt = `Write a ${toneDesc} blog post about "${topic}".
${keywords ? `Include these keywords naturally: ${keywords}` : ''}
Target length: approximately ${wordCount} words.
Format: Markdown with proper headings (## for main sections, ### for subsections).
Include practical examples or code snippets where relevant.
Do NOT include a title (H1) — just the body content starting from the first H2.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${err}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
