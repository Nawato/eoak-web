import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  container: { childElementCount: 0 },
  onReady: () => {},
  onError: () => {},
}));
vi.mock('react', async (importOriginal) => ({
  ...await importOriginal<typeof import('react')>(),
  useRef: () => ({ current: state.container }),
}));
vi.mock('next/script', () => ({
  default: (props: { onReady: () => void; onError: () => void }) => {
    state.onReady = props.onReady;
    state.onError = props.onError;
    return null;
  },
}));
import BandsintownWidget from './BandsintownWidget';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  state.container = { childElementCount: 0 };
});

describe('Bandsintown lifecycle', () => {
  it('initializes after the vendor document-ready callback', () => {
    const bit = { onReady: undefined as (() => void) | undefined, widgetInitializer: undefined as { append: ReturnType<typeof vi.fn> } | undefined };
    vi.stubGlobal('window', { BIT: bit });
    renderToStaticMarkup(createElement(BandsintownWidget, { artistName: 'End Of All Known' }));
    state.onReady();
    expect(bit.onReady).toBeTypeOf('function');
    const append = vi.fn();
    bit.widgetInitializer = { append };
    bit.onReady?.();
    expect(append).toHaveBeenCalledWith(state.container, expect.objectContaining({
      artistName: 'End Of All Known',
      displayPastDates: false,
    }));
  });

  it('initializes each new container when consent is granted again without duplicate widgets', () => {
    const append = vi.fn((element) => { element.childElementCount = 1; });
    vi.stubGlobal('window', { BIT: { widgetInitializer: { append } } });
    renderToStaticMarkup(createElement(BandsintownWidget, { artistName: 'Band' }));
    state.onReady();
    state.onReady();
    expect(append).toHaveBeenCalledTimes(1);
    state.container = { childElementCount: 0 };
    renderToStaticMarkup(createElement(BandsintownWidget, { artistName: 'Band' }));
    state.onReady();
    expect(append).toHaveBeenCalledTimes(2);
  });

  it('reports a blocked or failed script', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderToStaticMarkup(createElement(BandsintownWidget, { artistName: 'Band' }));
    state.onError();
    expect(log).toHaveBeenCalledWith('Bandsintown widget script failed to load.');
  });
});
