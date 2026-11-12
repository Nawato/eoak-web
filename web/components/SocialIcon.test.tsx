import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  siInstagram,
  siYoutube,
  siX,
  siFacebook,
  siTiktok,
  siSpotify,
  siApplemusic,
  siBandcamp,
  siSoundcloud,
  siBluesky,
  siThreads,
  siDiscord,
  siPatreon,
  siTwitch,
} from 'simple-icons';
import SocialIcon from './SocialIcon';
import { socialPlatforms, type SocialPlatform } from '@/sanity/types';

const expectedPaths: Record<SocialPlatform, string> = {
  instagram: siInstagram.path,
  youtube: siYoutube.path,
  twitter: siX.path,
  facebook: siFacebook.path,
  tiktok: siTiktok.path,
  spotify: siSpotify.path,
  applemusic: siApplemusic.path,
  bandcamp: siBandcamp.path,
  soundcloud: siSoundcloud.path,
  bluesky: siBluesky.path,
  threads: siThreads.path,
  discord: siDiscord.path,
  patreon: siPatreon.path,
  twitch: siTwitch.path,
};

describe('social brand logos', () => {
  it.each(socialPlatforms.map((platform) => ({ ...platform, path: expectedPaths[platform.value] })))(
    'renders the correct $label brand silhouette',
    ({ value, path }) => {
      const html = renderToStaticMarkup(createElement(SocialIcon, { platform: value, className: 'h-5 w-5' }));
      expect(html).toContain(`d="${path}"`);
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('aria-hidden="true"');
    },
  );
});
