import { describe, expect, it } from 'vitest';
import { ogCards } from './signals-og-cards';

const page = (path: string, image: string) => ({
  path,
  html: `<head><meta property="og:image" content="https://signals.marsgotta.com${image}"></head>`,
});

describe('ogCards', () => {
  it('draws each signal from its own page', () => {
    expect(ogCards([page('/en/give-memory', '/og/en/give-memory.jpg')])).toEqual([
      { image: '/og/en/give-memory.jpg', from: '/en/give-memory', night: false },
    ]);
  });

  it('draws the generic card of each language once, from its home', () => {
    const cards = ogCards([
      page('/archivo', '/og/signals-es.jpg'),
      page('/temas/practica', '/og/signals-es.jpg'),
      page('/en/archive', '/og/signals-en.jpg'),
    ]);
    expect(cards).toEqual([
      { image: '/og/signals-es.jpg', from: '/', night: true },
      { image: '/og/signals-en.jpg', from: '/en', night: true },
    ]);
  });

  it('skips pages without a card', () => {
    expect(ogCards([{ path: '/x', html: '<head></head>' }])).toEqual([]);
  });
});
