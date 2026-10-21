import { describe, expect, it } from 'vitest';
import { alternates, ogLocale, pageUrl, personSchema } from './seo';

const site = new URL('https://marcelagotta.com');

describe('seo', () => {
  it('builds canonical URLs on marcelagotta.com without a trailing slash', () => {
    expect(pageUrl(site, 'home', 'es')).toBe('https://marcelagotta.com/');
    expect(pageUrl(site, 'home', 'en')).toBe('https://marcelagotta.com/en');
    expect(pageUrl(site, 'about', 'es')).toBe('https://marcelagotta.com/sobre-mi');
    expect(pageUrl(site, 'talks', 'en')).toBe('https://marcelagotta.com/en/talks');
  });

  it('links each page to its translation and to the Spanish default', () => {
    expect(alternates(site, 'projects')).toEqual([
      { hreflang: 'es', href: 'https://marcelagotta.com/proyectos' },
      { hreflang: 'en', href: 'https://marcelagotta.com/en/projects' },
      { hreflang: 'x-default', href: 'https://marcelagotta.com/proyectos' },
    ]);
  });

  it('uses Open Graph locales', () => {
    expect(ogLocale('es')).toBe('es_ES');
    expect(ogLocale('en')).toBe('en_GB');
  });

  it('describes Marcela as a Person with LinkedIn, GitHub and X', () => {
    const person = personSchema(site, 'Construyo software que piensa contigo.');
    expect(person['@type']).toBe('Person');
    expect(person.sameAs).toEqual([
      'https://github.com/MarsGotta',
      'https://www.linkedin.com/in/marcelagotta',
      'https://x.com/marcelagotta',
    ]);
  });
});
