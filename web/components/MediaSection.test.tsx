import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MediaSection from './MediaSection';
import { deniedMedia } from '@/lib/cookie-consent';

const props = {
  latestYoutubeUrl: 'https://www.youtube.com/watch?v=abc123def45',
  featuredSpotifyUrl: 'https://open.spotify.com/album/abc123',
};

describe('media embeds', () => {
  it('renders no third-party player before consent', () => {
    const html = renderToStaticMarkup(createElement(MediaSection, props));
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('youtube-nocookie.com');
    expect(html).not.toContain('open.spotify.com/embed');
    expect(html).toContain('Einmal laden');
  });

  it('loads only YouTube when that provider is allowed', () => {
    const html = renderToStaticMarkup(
      createElement(MediaSection, {
        ...props,
        initialMedia: { ...deniedMedia, youtube: true },
      }),
    );
    expect(html).toContain('https://www.youtube-nocookie.com/embed/abc123def45');
    expect(html).not.toContain('open.spotify.com/embed');
    expect(html).toContain('Einwilligung widerrufen');
  });

  it('loads only Spotify when that provider is allowed', () => {
    const html = renderToStaticMarkup(
      createElement(MediaSection, {
        ...props,
        initialMedia: { ...deniedMedia, spotify: true },
      }),
    );
    expect(html).toContain('https://open.spotify.com/embed/album/abc123');
    expect(html).not.toContain('youtube-nocookie.com');
  });

  it('loads both players when both providers are allowed', () => {
    const html = renderToStaticMarkup(
      createElement(MediaSection, {
        ...props,
        initialMedia: { ...deniedMedia, youtube: true, spotify: true },
      }),
    );
    expect(html).toContain('https://www.youtube-nocookie.com/embed/abc123def45');
    expect(html).toContain('https://open.spotify.com/embed/album/abc123');
  });
});
