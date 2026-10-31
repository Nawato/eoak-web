import 'server-only';
import { cache } from 'react';
import { getInstagramPostUrl } from '@/lib/embeds';

export interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink: string;
  caption: string;
  timestamp: string;
}

export interface InstagramFeed {
  status: 'ready' | 'unconfigured' | 'unavailable';
  posts: InstagramPost[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      ['cdninstagram.com', 'fbcdn.net'].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function parsePost(value: unknown): InstagramPost | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.permalink !== 'string' ||
    typeof value.timestamp !== 'string' ||
    !Number.isFinite(Date.parse(value.timestamp))
  )
    return null;
  if (!['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(String(value.media_type))) return null;
  const imageUrl = getImageUrl(value.media_type === 'VIDEO' ? value.thumbnail_url : value.media_url);
  const permalink = getInstagramPostUrl(value.permalink);
  if (!imageUrl || !permalink) return null;
  return {
    id: value.id,
    imageUrl,
    permalink,
    caption: typeof value.caption === 'string' ? value.caption.trim().slice(0, 300) : '',
    timestamp: value.timestamp,
  };
}

export const getInstagramFeed = cache(async (): Promise<InstagramFeed> => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  if (!token && !userId) return { status: 'unconfigured', posts: [] };
  if (!token || !userId || !/^\d+$/.test(userId)) {
    console.error('Instagram feed requires INSTAGRAM_ACCESS_TOKEN and a numeric INSTAGRAM_USER_ID.');
    return { status: 'unavailable', posts: [] };
  }

  const url = new URL(`https://graph.instagram.com/v26.0/${userId}/media`);
  url.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp');
  url.searchParams.set('limit', '6');
  let payload: unknown;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    });
    if (!response.ok) {
      // Do not log response bodies or exceptions that could contain credentials.
      console.error(
        `Instagram feed request failed (HTTP ${response.status}). Check the token and account permissions.`,
      );
      return { status: 'unavailable', posts: [] };
    }
    payload = await response.json();
  } catch {
    console.error('Instagram feed request failed: network error, timeout, or invalid JSON.');
    return { status: 'unavailable', posts: [] };
  }

  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    console.error('Instagram feed returned an invalid response.');
    return { status: 'unavailable', posts: [] };
  }
  const parsed = payload.data.map(parsePost);
  const posts = parsed.filter((post): post is InstagramPost => post !== null);
  // Skip single unsupported items (e.g. videos without a thumbnail) instead of hiding the whole feed.
  if (posts.length < parsed.length) {
    console.error(`Instagram feed skipped ${parsed.length - posts.length} invalid or unsupported media item(s).`);
    if (posts.length === 0) return { status: 'unavailable', posts: [] };
  }
  return {
    status: 'ready',
    posts: posts
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .filter((post, index, all) => all.findIndex((other) => other.id === post.id) === index)
      .slice(0, 6),
  };
});
