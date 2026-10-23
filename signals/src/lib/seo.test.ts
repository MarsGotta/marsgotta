import { describe, expect, it } from 'vitest';
import { alternates, blogData, jsonLd, ogImagePath, ogLocale, postingData } from './seo';

const site = new URL('https://signals.marsgotta.com');

const signal = {
  slug: 'dale-memoria',
  lang: 'es' as const,
  title: 'Dale memoria a tus agentes',
  deck: 'Con un solo fichero SQLite.',
  publishedAt: new Date('2026-10-21'),
  topic: 'tutorial' as const,
  tags: ['SQLite', 'Agentes'],
};

describe('alternates', () => {
  it('pairs a page with its translation, with x-default on the Spanish one', () => {
    expect(alternates(site, 'en', '/en/archive', '/archivo')).toEqual([
      { hreflang: 'es', href: 'https://signals.marsgotta.com/archivo' },
      { hreflang: 'en', href: 'https://signals.marsgotta.com/en/archive' },
      { hreflang: 'x-default', href: 'https://signals.marsgotta.com/archivo' },
    ]);
  });

  it('gives none to a page without a translation', () => {
    expect(alternates(site, 'es', '/solo-en-espanol', undefined)).toEqual([]);
  });
});

describe('Open Graph', () => {
  it('names the locale and the card of each page', () => {
    expect(ogLocale('es')).toBe('es_ES');
    expect(ogLocale('en')).toBe('en_GB');
    expect(ogImagePath('en', 'give-memory')).toBe('/og/en/give-memory.jpg');
    expect(ogImagePath('es')).toBe('/og/signals-es.jpg');
  });
});

describe('structured data', () => {
  it('describes each home as a Blog by Mars', () => {
    expect(blogData(site, 'en')).toMatchObject({
      '@type': 'Blog',
      '@id': 'https://signals.marsgotta.com/en#blog',
      name: 'Signals by Mars',
      inLanguage: 'en',
      author: { '@id': 'https://marsgotta.com/#person' },
    });
  });

  it('describes a signal as a BlogPosting of the Blog in its language', () => {
    expect(postingData(site, signal)).toMatchObject({
      '@type': 'BlogPosting',
      url: 'https://signals.marsgotta.com/dale-memoria',
      headline: 'Dale memoria a tus agentes',
      description: 'Con un solo fichero SQLite.',
      datePublished: '2026-10-21',
      inLanguage: 'es',
      image: 'https://signals.marsgotta.com/og/es/dale-memoria.jpg',
      articleSection: 'Tutoriales',
      keywords: ['SQLite', 'Agentes'],
      isPartOf: { '@id': 'https://signals.marsgotta.com/#blog' },
    });
  });

  it('cannot close its script element early', () => {
    const json = jsonLd(postingData(site, { ...signal, title: 'Adiós a </script>' }));
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).headline).toBe('Adiós a </script>');
  });
});
