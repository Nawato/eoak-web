import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { SANITY_CACHE_TAG } from '@/lib/sanity';

// Sanity sends a single document per webhook; anything larger is abuse. The
// limit is enforced before the HMAC check because parseBody() buffers the body.
export const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;

async function readBodyWithLimit(request: NextRequest, maxBytes: number): Promise<string | null> {
  const declaredLength = request.headers.get('content-length')?.trim();
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > maxBytes) {
    return null;
  }
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8');
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'Revalidation secret is not configured.' }, { status: 503 });
  }

  const body = await readBodyWithLimit(request, MAX_WEBHOOK_BODY_BYTES);
  if (body === null) {
    return NextResponse.json({ message: 'Payload too large.' }, { status: 413 });
  }

  try {
    // Rebuild the request from the capped body so parseBody() never buffers an
    // unbounded client-controlled stream before validating the signature.
    const headers = new Headers(request.headers);
    headers.delete('content-length');
    headers.delete('transfer-encoding');
    // The body is already decoded when it reaches a route handler.
    headers.delete('content-encoding');
    const cappedRequest = new NextRequest(request.url, { method: 'POST', headers, body });

    const { isValidSignature } = await parseBody(cappedRequest, secret);
    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }
    revalidateTag(SANITY_CACHE_TAG, 'max');
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error('Sanity webhook failed:', error);
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }
}
