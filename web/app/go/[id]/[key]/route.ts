import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from 'next-sanity';
import { toHttpsUrl } from '@/lib/embeds';

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|curl|wget/i;

type Params = { params: Promise<{ id: string; key: string }> };

// Redirects to a release link stored in Sanity (never to arbitrary URLs) and counts the click.
export async function GET(request: NextRequest, { params }: Params) {
  const { id, key } = await params;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const readToken = process.env.SANITY_API_READ_TOKEN || undefined;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset) return new NextResponse('Not configured.', { status: 500 });

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    perspective: 'published',
    token: writeToken || readToken,
  });

  const url = await client
    .fetch<string | null>(`*[_type == "release" && _id == $id][0].links[_key == $key][0].url`, { id, key })
    .catch(() => null);
  const target = toHttpsUrl(url);
  if (!target) return new NextResponse('Not found.', { status: 404 });

  const userAgent = request.headers.get('user-agent') ?? '';
  if (writeToken && userAgent && !BOT_PATTERN.test(userAgent)) {
    const path = `links[_key=="${key.replace(/[^\w-]/g, '')}"].clicks`;
    try {
      await client.patch(id).setIfMissing({ [path]: 0 }).inc({ [path]: 1 }).commit({ visibility: 'async' });
    } catch (error) {
      console.error('Counting release click failed:', error);
    }
  }

  return NextResponse.redirect(target, { status: 302, headers: { 'Cache-Control': 'no-store' } });
}
