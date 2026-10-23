import { describe, expect, it } from 'vitest';
import { isPublished, signalSchema } from './signal-schema';

const valid = {
  number: 7,
  lang: 'es',
  slug: 'dale-memoria-a-tus-agentes-con-sqlite',
  title: 'Dale memoria a tus agentes con un solo fichero SQLite',
  deck: 'Búsqueda de texto completo con FTS5.',
  topic: 'tutorial',
  cover: 'strata',
  publishedAt: '2026-10-21',
};

describe('signalSchema', () => {
  it('accepts a signal and fills in the defaults', () => {
    const signal = signalSchema.parse(valid);
    expect(signal.publishedAt).toEqual(new Date('2026-10-21'));
    expect(signal.tags).toEqual([]);
    expect(signal.draft).toBe(false);
  });

  it('rejects an unknown topic, cover or language', () => {
    expect(signalSchema.safeParse({ ...valid, topic: 'news' }).success).toBe(false);
    expect(signalSchema.safeParse({ ...valid, cover: 'photo' }).success).toBe(false);
    expect(signalSchema.safeParse({ ...valid, lang: 'fr' }).success).toBe(false);
  });

  it('only takes slugs that work as URLs', () => {
    expect(signalSchema.safeParse({ ...valid, slug: 'Dale memoria' }).success).toBe(false);
  });

  it('keeps «Empieza por aquí» to three places', () => {
    expect(signalSchema.safeParse({ ...valid, startHere: 4 }).success).toBe(false);
  });
});

describe('isPublished', () => {
  it('shows drafts in development only', () => {
    expect(isPublished({ draft: true }, false)).toBe(false);
    expect(isPublished({ draft: true }, true)).toBe(true);
    expect(isPublished({ draft: false }, false)).toBe(true);
  });
});
