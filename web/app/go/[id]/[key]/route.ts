import { createHash, createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from 'next-sanity';
import { toHttpsUrl } from '@/lib/embeds';

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|curl|wget/i;
const NO_CACHE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const recentClicks = new Map<string, { count: number; expires: number }>();
type Params = { params: Promise<{ id: string; key: string }> };
type ReleaseLink = { url: string; clicks?: number; uniqueClicks?: number };

function mayCount(visitor: string, limit = 20): boolean {
  const now = Date.now();
  for (const [key, entry] of recentClicks) {
    if (entry.expires <= now) recentClicks.delete(key);
  }
  const entry = recentClicks.get(visitor);
  if (entry) return ++entry.count <= limit;
  if (recentClicks.size >= 5000) return false;
  recentClicks.set(visitor, { count: 1, expires: now + 60_000 });
  return true;
}

async function redirect(request: NextRequest, { params }: Params, count: boolean) {
  const { id, key } = await params;
  if (!/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,127}$/.test(id) ||
      id.startsWith('drafts.') || id.startsWith('versions.') || !/^[a-zA-Z0-9_-]{1,128}$/.test(key)) {
    return new NextResponse('Not found.', { status: 404, headers: NO_CACHE });
  }
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset) {
    console.error('Release redirect is missing Sanity configuration.');
    return new NextResponse('Not configured.', { status: 503, headers: NO_CACHE });
  }
  const client = createClient({
    projectId, dataset, apiVersion: '2024-01-01', useCdn: false,
    perspective: 'published', token: writeToken || process.env.SANITY_API_READ_TOKEN || undefined,
    timeout: 5000, maxRetries: 0,
  });
  let link: ReleaseLink | null;
  try {
    link = await client.fetch<ReleaseLink | null>(
      `*[_type == "release" && _id == $id][0].links[_key == $key][0]{url, clicks, uniqueClicks}`,
      { id, key }, { cache: 'no-store' },
    );
  } catch {
    console.error('Release link lookup failed.');
    return new NextResponse('Temporarily unavailable.', { status: 503, headers: NO_CACHE });
  }
  const target = toHttpsUrl(link?.url);
  if (!target || !link) return new NextResponse('Not found.', { status: 404, headers: NO_CACHE });

  const userAgent = request.headers.get('user-agent') ?? '';
  const prefetch = /prefetch/i.test(`${request.headers.get('purpose') ?? ''} ${request.headers.get('sec-purpose') ?? ''}`) ||
    request.headers.has('next-router-prefetch');
  if (count && userAgent && !BOT_PATTERN.test(userAgent) && !prefetch) {
    if (!writeToken) {
      console.error('Release click counting requires SANITY_API_WRITE_TOKEN.');
    } else {
      // Only trust a header explicitly configured for a proxy that overwrites it.
      const header = process.env.RELEASE_CLICK_IP_HEADER;
      const ip = header ? request.headers.get(header)?.split(',')[0]?.trim() : undefined;
      const normalizedIp = ip && isIP(ip) && !ip.includes('%')
        ? (isIP(ip) === 6 ? new URL(`http://[${ip}]/`).hostname : ip)
        : undefined;
      const secret = process.env.RELEASE_CLICK_HASH_SECRET;
      const day = new Date().toISOString().slice(0, 10);
      const visitor = normalizedIp && secret
        ? createHmac('sha256', secret).update(JSON.stringify([day, normalizedIp])).digest('hex')
        : undefined;
      if (mayCount('all-clicks', 300) && (!visitor || mayCount(visitor))) {
        const digest = createHash('sha256').update(JSON.stringify([id, key])).digest('hex');
        // Technical singleton per release/link, separate from publishable content.
        const statsId = `releaseLinkStats.${digest}`;
        const stats = {
          _id: statsId, _type: 'releaseLinkStats', releaseId: id, linkKey: key,
          clicks: link.clicks ?? 0, uniqueClicks: link.uniqueClicks ?? 0,
        };
        try {
          const transaction = () => client.transaction().createIfNotExists(stats);
          if (visitor) {
            const hashId = `clickHash.${createHash('sha256').update(`${digest}.${visitor}`).digest('hex')}`;
            try {
              await transaction()
                .create({ _id: hashId, _type: 'clickHash', day })
                .patch(statsId, (patch) => patch.inc({ clicks: 1, uniqueClicks: 1 }))
                .commit({ visibility: 'sync' });
            } catch (error) {
              if (!(typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)) throw error;
              await transaction().patch(statsId, (patch) => patch.inc({ clicks: 1 })).commit({ visibility: 'sync' });
            }
          } else {
            await transaction().patch(statsId, (patch) => patch.inc({ clicks: 1 })).commit({ visibility: 'sync' });
          }
        } catch {
          // Analytics must not prevent a visitor reaching the release.
          console.error('Counting release click failed.');
        }
      }
    }
  }
  return NextResponse.redirect(target, { status: 302, headers: NO_CACHE });
}

export async function GET(request: NextRequest, context: Params) {
  return redirect(request, context, true);
}

// Next otherwise implements HEAD by executing GET, which would count link checks.
export async function HEAD(request: NextRequest, context: Params) {
  return redirect(request, context, false);
}
