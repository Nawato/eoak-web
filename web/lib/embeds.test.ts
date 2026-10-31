import { describe, expect, it } from 'vitest';
import { getSpotifyEmbedUrl, getYouTubeVideoId, toHttpsUrl } from './embeds';

describe('getYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=3', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('parses %s', (url, id) => {
    expect(getYouTubeVideoId(url)).toBe(id);
  });

  it('rejects lookalike hosts and garbage', () => {
    expect(getYouTubeVideoId('https://notyoutube.com/watch?v=dQw4w9WgXcQ')).toBe('');
    expect(getYouTubeVideoId('not a url')).toBe('');
    expect(getYouTubeVideoId('')).toBe('');
  });
});

describe('getSpotifyEmbedUrl', () => {
  it('handles query strings, playlists and locale prefixes', () => {
    expect(getSpotifyEmbedUrl('https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv?si=xyz')).toBe(
      'https://open.spotify.com/embed/album/4LH4d3cOWNNsVw41Gqt2kv',
    );
    expect(getSpotifyEmbedUrl('https://open.spotify.com/intl-de/playlist/37i9dQZF1DXcBWIGoYBM5M')).toBe(
      'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
    );
  });

  it('rejects other hosts and unknown kinds', () => {
    expect(getSpotifyEmbedUrl('https://evil.example/album/abc')).toBe('');
    expect(getSpotifyEmbedUrl('https://open.spotify.com/user/abc')).toBe('');
    expect(getSpotifyEmbedUrl('')).toBe('');
  });
});

describe('toHttpsUrl', () => {
  it('allows only https', () => {
    expect(toHttpsUrl('https://instagram.com/x')).toBe('https://instagram.com/x');
    expect(toHttpsUrl('javascript:alert(1)')).toBeNull();
    expect(toHttpsUrl('http://example.com')).toBeNull();
    expect(toHttpsUrl(undefined)).toBeNull();
  });
});
