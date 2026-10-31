import { createHash } from 'node:crypto';
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
    const safeKey = key.replace(/[^\w-]/g, '');
    const clicks = `links[_key=="${safeKey}"].clicks`;
    const unique = `links[_key=="${safeKey}"].uniqueClicks`;
    // Per-day hash: the IP itself is never stored and hashes cannot be linked across days.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
    const day = new Date().toISOString().slice(0, 10);
    const hash = createHash('sha256').update(`${day}|${writeToken}|${ip}|${userAgent}`).digest('hex').slice(0, 32);
    const hashId = `clickHash.${id.replace(/[^\w-]/g, '')}.${safeKey}.${hash}`;
    const base = client.patch(id).setIfMissing({ [clicks]: 0, [unique]: 0 });

    try {
      try {
        // Creating an existing document fails, which makes the whole transaction (including the unique counter) fail.
        await client
          .transaction()
          .create({ _id: hashId, _type: 'clickHash', day })
          .patch(base.inc({ [clicks]: 1, [unique]: 1 }))
          .commit({ visibility: 'async' });
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode !== 409) throw error;
        await client.patch(id).setIfMissing({ [clicks]: 0 }).inc({ [clicks]: 1 }).commit({ visibility: 'async' });
      }
      // Occasional cleanup so hash documents do not pile up.
      if (Math.random() < 0.02) {
        const cutoff = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10);
        await client.delete({ query: '*[_type == "clickHash" && day < $cutoff]', params: { cutoff } });
      }
    } catch (error) {
      console.error('Counting release click failed:', error);
    }
  }

  return NextResponse.redirect(target, { status: 302, headers: { 'Cache-Control': 'no-store' } });
}
