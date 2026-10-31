import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { siInstagram, siYoutube, siX, siFacebook, siTiktok } from 'simple-icons';
import SocialIcon from './SocialIcon';
import { socialPlatforms } from '@/sanity/types';

const expectedPaths = [siInstagram.path, siYoutube.path, siX.path, siFacebook.path, siTiktok.path];

describe('social brand logos', () => {
  it.each(socialPlatforms.map((platform, index) => ({ ...platform, path: expectedPaths[index] })))(
    'renders the correct $label brand silhouette',
    ({ value, path }) => {
      const html = renderToStaticMarkup(createElement(SocialIcon, { platform: value, className: 'h-5 w-5' }));
      expect(html).toContain(`d="${path}"`);
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('aria-hidden="true"');
    },
  );
});
