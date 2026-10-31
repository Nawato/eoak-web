import { expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getReleaseSlugs: vi.fn() }));
vi.mock('@/lib/sanity', () => mocks);
import sitemap from './sitemap';

it('includes release URLs beyond the homepage list limit', async () => {
  mocks.getReleaseSlugs.mockResolvedValue(Array.from({ length: 60 }, (_, index) => ({ slug: `release-${index}` })));
  const entries = await sitemap();
  expect(entries).toHaveLength(63);
  expect(entries[62].url).toContain('/releases/release-59');
});
