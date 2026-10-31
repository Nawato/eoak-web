import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { SANITY_CACHE_TAG } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'Revalidation secret is not configured.' }, { status: 500 });
  }

  try {
    const { isValidSignature } = await parseBody(request, secret);
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
