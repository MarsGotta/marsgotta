import { describe, expect, it } from 'vitest';
import { isIndexable, sitemapXml } from './sitemap';

const site = new URL('https://signals.marsgotta.com');
const practice = 'practica' as const;
const signals = [
  {
    number: 7,
    lang: 'es' as const,
    slug: 'dale-memoria',
    publishedAt: new Date('2026-10-21'),
    topic: practice,
  },
  {
    number: 7,
    lang: 'en' as const,
    slug: 'give-memory',
    publishedAt: new Date('2026-10-22'),
    topic: practice,
  },
  {
    number: 8,
    lang: 'es' as const,
    slug: 'solo-en-espanol',
    publishedAt: new Date('2026-10-23'),
    topic: practice,
  },
];

function urlOf(xml: string, loc: string): string {
  return xml.split('<url>').find((url) => url.startsWith(`<loc>${loc}</loc>`)) ?? '';
}

describe('sitemapXml', () => {
  const xml = sitemapXml(site, signals);

  it('lists the pages of both languages with their translation', () => {
    const topic = urlOf(xml, 'https://signals.marsgotta.com/temas/practica');
    expect(topic).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://signals.marsgotta.com/en/topics/practice"/>',
    );
    expect(topic).toContain(
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://signals.marsgotta.com/temas/practica"/>',
    );
    expect(urlOf(xml, 'https://signals.marsgotta.com/en')).not.toBe('');
  });

  it('dates each signal and pairs it only with a real translation', () => {
    const post = urlOf(xml, 'https://signals.marsgotta.com/en/give-memory');
    expect(post).toContain('<lastmod>2026-10-22</lastmod>');
    expect(post).toContain('hreflang="es" href="https://signals.marsgotta.com/dale-memoria"');
    expect(urlOf(xml, 'https://signals.marsgotta.com/solo-en-espanol')).not.toContain('xhtml:link');
  });

  it('leaves out the topics with nothing to list yet', () => {
    expect(urlOf(xml, 'https://signals.marsgotta.com/temas/practica')).not.toBe('');
    expect(xml).not.toContain('/temas/tutoriales');
    expect(xml).not.toContain('/en/topics/tutorials');
  });

  it('leaves out the confirmation page', () => {
    expect(xml).not.toContain('suscripcion');
    expect(xml).not.toContain('subscription');
  });
});

describe('isIndexable', () => {
  it('keeps the home in search results even while the blog is empty', () => {
    expect(isIndexable({ kind: 'home' }, 'es', [])).toBe(true);
  });

  it('keeps an empty topic or archive out until its first signal in that language', () => {
    expect(isIndexable({ kind: 'archive' }, 'en', [])).toBe(false);
    expect(isIndexable({ kind: 'topic', topic: practice }, 'es', signals)).toBe(true);
    expect(
      isIndexable({ kind: 'topic', topic: practice }, 'en', [{ lang: 'es', topic: practice }]),
    ).toBe(false);
  });
});
