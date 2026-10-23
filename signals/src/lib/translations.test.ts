import { describe, expect, it } from 'vitest';
import { translationOf, translationPaths } from './translations';

const signals = [
  { number: 7, lang: 'es' as const, slug: 'dale-memoria' },
  { number: 7, lang: 'en' as const, slug: 'give-memory' },
  { number: 8, lang: 'es' as const, slug: 'solo-en-espanol' },
];

describe('translationOf', () => {
  it('pairs the two languages of a signal by its number', () => {
    expect(translationOf({ number: 7, lang: 'es' }, signals)?.slug).toBe('give-memory');
    expect(translationOf({ number: 7, lang: 'en' }, signals)?.slug).toBe('dale-memoria');
  });

  it('finds nothing for a signal written in one language only', () => {
    expect(translationOf({ number: 8, lang: 'es' }, signals)).toBeUndefined();
  });
});

describe('translationPaths', () => {
  const paths = translationPaths(signals);

  it('pairs every page with the same page in the other language', () => {
    expect(paths['/']).toBe('/en');
    expect(paths['/en']).toBe('/');
    expect(paths['/temas/noticias-ia']).toBe('/en/topics/ai-news');
    expect(paths['/en/archive']).toBe('/archivo');
    expect(paths['/suscripcion/confirmada']).toBe('/en/subscription/confirmed');
  });

  it('pairs a signal with its translation, and leaves out one written in one language', () => {
    expect(paths['/dale-memoria']).toBe('/en/give-memory');
    expect(paths['/en/give-memory']).toBe('/dale-memoria');
    expect(paths['/solo-en-espanol']).toBeUndefined();
  });
});
