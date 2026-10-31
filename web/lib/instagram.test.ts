import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import { getInstagramFeed } from './instagram';

function media(index: number, overrides = {}) {
  return {
    id: `${index}`,
    media_type: 'IMAGE',
    media_url: `https://scontent.cdninstagram.com/${index}.jpg`,
    permalink: `https://www.instagram.com/p/Post${index}/`,
    caption: `Photo ${index}`,
    timestamp: `2026-10-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
    ...overrides,
  };
}

describe('Instagram feed API', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'secret-test-token');
    vi.stubEnv('INSTAGRAM_USER_ID', '123456789');
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('makes a cached, authenticated server request and returns the latest six posts', async () => {
    fetchMock.mockResolvedValue(Response.json({ data: Array.from({ length: 8 }, (_, i) => media(i)) }));
    const result = await getInstagramFeed();
    expect(result.status).toBe('ready');
    expect(result.posts.map((post) => post.id)).toEqual(['7', '6', '5', '4', '3', '2']);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.origin).toBe('https://graph.instagram.com');
    expect(url.pathname).toBe('/v26.0/123456789/media');
    expect(url.searchParams.get('limit')).toBe('6');
    expect(url.searchParams.has('access_token')).toBe(false);
    expect(options.headers.Authorization).toBe('Bearer secret-test-token');
    expect(options.next.revalidate).toBe(900);
    expect(JSON.stringify(result)).not.toContain('secret-test-token');
  });

  it('uses reel thumbnails and carousel covers, not video files', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        data: [
          media(0, {
            media_type: 'VIDEO',
            media_url: 'https://scontent.cdninstagram.com/video.mp4',
            thumbnail_url: 'https://scontent.fbcdn.net/thumb.jpg',
          }),
          media(1, { media_type: 'CAROUSEL_ALBUM' }),
        ],
      }),
    );
    const { posts } = await getInstagramFeed();
    expect(posts[0].imageUrl).toContain('1.jpg');
    expect(posts[1].imageUrl).toContain('thumb.jpg');
  });

  it('does not contact Instagram when unconfigured', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', '');
    vi.stubEnv('INSTAGRAM_USER_ID', '');
    expect(await getInstagramFeed()).toEqual({ status: 'unconfigured', posts: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports incomplete configuration without making a request', async () => {
    vi.stubEnv('INSTAGRAM_USER_ID', 'bandname');
    expect((await getInstagramFeed()).status).toBe('unavailable');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('accepts an account with no posts', async () => {
    fetchMock.mockResolvedValue(Response.json({ data: [] }));
    expect(await getInstagramFeed()).toEqual({ status: 'ready', posts: [] });
  });

  it.each([
    { error: { message: 'secret-test-token' } },
    { data: [media(0, { media_url: 'https://evil.com/a.jpg' })] },
    { data: [media(0, { media_url: 'https://cdninstagram.com.evil.com/a.jpg' })] },
    { data: [media(0, { media_url: 'http://scontent.cdninstagram.com/a.jpg' })] },
    { data: [media(0, { permalink: 'javascript:alert(1)' })] },
    { data: [media(0, { timestamp: 'invalid' })] },
    { data: [media(0, { media_type: 'VIDEO' })] },
  ])('rejects invalid or unsafe API data', async (payload) => {
    fetchMock.mockResolvedValue(Response.json(payload));
    expect((await getInstagramFeed()).status).toBe('unavailable');
    expect(console.error).toHaveBeenCalled();
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).not.toContain('secret-test-token');
  });

  it('skips unsupported items but keeps the rest of the feed', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ data: [media(0), media(1, { media_type: 'VIDEO' }), media(2, { media_url: 'https://evil.com/a.jpg' })] }),
    );
    const feed = await getInstagramFeed();
    expect(feed.status).toBe('ready');
    expect(feed.posts.map((post) => post.id)).toEqual(['0']);
    expect(console.error).toHaveBeenCalled();
  });

  it('reports expired tokens without logging response bodies', async () => {
    fetchMock.mockResolvedValue(Response.json({ error: 'secret-test-token' }, { status: 401 }));
    expect((await getInstagramFeed()).status).toBe('unavailable');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('HTTP 401'));
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).not.toContain('secret-test-token');
  });

  it('handles network errors without logging credentials from exceptions', async () => {
    fetchMock.mockRejectedValue(new Error('secret-test-token'));
    expect((await getInstagramFeed()).status).toBe('unavailable');
    expect(console.error).toHaveBeenCalled();
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).not.toContain('secret-test-token');
  });
});
