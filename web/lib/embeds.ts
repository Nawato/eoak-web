const SPOTIFY_KINDS = new Set(['album', 'track', 'artist', 'playlist', 'show', 'episode']);
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const YOUTUBE_ID = /^[\w-]{6,}$/;

export function getInstagramPostUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname)) return null;
    const match = /^\/(p|reel)\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/` : null;
  } catch {
    return null;
  }
}

export function getYouTubeVideoId(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return '';
  }

  let id = '';
  if (parsed.hostname === 'youtu.be') {
    id = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
  } else if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (parsed.pathname === '/watch') {
      id = parsed.searchParams.get('v') ?? '';
    } else if (['embed', 'shorts', 'live'].includes(segments[0] ?? '')) {
      id = segments[1] ?? '';
    }
  }
  return YOUTUBE_ID.test(id) ? id : '';
}

export function getSpotifyEmbedUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return '';
  }
  if (parsed.hostname !== 'open.spotify.com') return '';

  // Drop optional locale prefix such as /intl-de/
  const segments = parsed.pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => !s.startsWith('intl-'));
  const [kind, id] = segments;
  if (!kind || !id || !SPOTIFY_KINDS.has(kind) || !/^[A-Za-z0-9]+$/.test(id)) return '';
  return `https://open.spotify.com/embed/${kind}/${id}`;
}

export function toHttpsUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export interface LabeledLink {
  _key?: string;
  label?: string;
  url?: string;
}

export function getHttpsLinks(links?: LabeledLink[] | null): { key?: string; label: string; href: string }[] {
  return (links ?? [])
    .map((link) => ({ key: link._key, label: link.label, href: toHttpsUrl(link.url) }))
    .filter((link): link is { key: string | undefined; label: string; href: string } => !!link.label && !!link.href);
}
