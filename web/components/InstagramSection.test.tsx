import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getInstagramPostUrl } from '@/lib/embeds';
import type { InstagramFeed } from '@/lib/instagram';

const state = vi.hoisted(() => ({ consent: false }));
vi.mock('@/components/ConsentEmbed', () => ({
  default: ({ children }: { children: ReactNode }) => (state.consent ? children : 'Consent required'),
}));
import InstagramSection from './InstagramSection';

const feed: InstagramFeed = {
  status: 'ready',
  posts: Array.from({ length: 6 }, (_, index) => ({
    id: `${index}`,
    imageUrl: `https://scontent.cdninstagram.com/photo${index}.jpg`,
    permalink: `https://www.instagram.com/p/Post${index}/`,
    caption: `Band photo ${index}`,
    timestamp: '2026-10-31T12:00:00Z',
  })),
};

describe('Instagram post validation', () => {
  it('normalizes posts and reels, stripping tracking parameters', () => {
    expect(getInstagramPostUrl('https://instagram.com/p/ABC_123/?igsh=abc')).toBe(
      'https://www.instagram.com/p/ABC_123/',
    );
    expect(getInstagramPostUrl('https://www.instagram.com/reel/abc-123')).toBe(
      'https://www.instagram.com/reel/abc-123/',
    );
  });
  it.each([
    'javascript:alert(1)',
    'http://instagram.com/p/ABC/',
    'https://evil.com/p/ABC/',
    'https://instagram.com.evil.com/p/ABC/',
    'https://www.instagram.com/band/',
    'invalid',
  ])('rejects invalid URLs: %s', (url) => expect(getInstagramPostUrl(url)).toBeNull());
});

describe('latest Instagram photos', () => {
  beforeEach(() => {
    state.consent = false;
  });

  it('hides when not configured', () => {
    expect(
      renderToStaticMarkup(
        createElement(InstagramSection, {
          feed: { status: 'unconfigured', posts: [] },
        }),
      ),
    ).toBe('');
  });

  it('does not render third-party images before consent', () => {
    const html = renderToStaticMarkup(createElement(InstagramSection, { feed }));
    expect(html).toContain('Consent required');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('cdninstagram.com');
    expect(html).not.toContain('<iframe');
  });

  it('renders six complete photos without Instagram UI after consent', () => {
    state.consent = true;
    const html = renderToStaticMarkup(
      createElement(InstagramSection, {
        feed,
        heading: 'Band updates',
        followLabel: 'Join us',
        profileUrl: 'https://instagram.com/band/',
      }),
    );
    expect(html.match(/<img/g)).toHaveLength(6);
    expect(html).toContain('https://scontent.cdninstagram.com/photo0.jpg');
    expect(html).toContain('https://www.instagram.com/p/Post0/');
    expect(html).toContain('object-contain');
    expect(html).toContain('Band updates');
    expect(html).toContain('Join us');
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('embed/');
  });

  it('keeps the follow link available during API outages', () => {
    const html = renderToStaticMarkup(
      createElement(InstagramSection, {
        feed: { status: 'unavailable', posts: [] },
        profileUrl: 'https://instagram.com/band/',
      }),
    );
    expect(html).toContain('Instagram photos are currently unavailable.');
    expect(html).toContain('Follow on Instagram');
    expect(html).not.toContain('<img');
  });

  it('distinguishes an empty account from an unavailable feed', () => {
    const html = renderToStaticMarkup(createElement(InstagramSection, { feed: { status: 'ready', posts: [] } }));
    expect(html).toContain('No Instagram posts yet.');
  });
});
