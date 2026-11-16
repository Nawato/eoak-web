// @vitest-environment happy-dom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ scripts: [] as Array<{ id: string }> }));
vi.mock('next/script', () => ({
  default: (props: { id: string }) => {
    state.scripts.push({ id: props.id });
    return null;
  },
}));

import BandsintownWidget from './BandsintownWidget';

afterEach(() => {
  cleanup();
  state.scripts = [];
  vi.unstubAllGlobals();
});

describe('Bandsintown script lifecycle', () => {
  it('uses a new script id per mount and removes vendor state on unmount', () => {
    const first = render(<BandsintownWidget artistName="Band" />);
    const firstId = state.scripts[0].id;
    const script = document.createElement('script');
    script.id = firstId;
    document.body.append(script);
    (window as Window & { BIT?: object }).BIT = { onReady: () => {} };

    first.unmount();

    expect(document.getElementById(firstId)).toBeNull();
    expect((window as Window & { BIT?: object }).BIT).toBeUndefined();

    render(<BandsintownWidget artistName="Band" />);
    // next/script caches loads by id; a fresh id lets re-consenting re-inject
    // the vendor script instead of firing onReady into a deleted global.
    expect(state.scripts[1].id).not.toBe(firstId);
  });
});
