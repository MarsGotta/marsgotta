import { describe, expect, it } from 'vitest';
import { translationOf } from './translations';

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
