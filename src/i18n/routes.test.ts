import { describe, expect, it } from 'vitest';
import { getMessages, languages } from './index';
import { findPage, localizedPath, toRouteKey } from './routes';

describe('routes', () => {
  it('finds the page and language of every route path', () => {
    expect(findPage('/')).toEqual({ route: 'home', lang: 'es' });
    expect(findPage('/en')).toEqual({ route: 'home', lang: 'en' });
    expect(findPage('/sobre-mi')).toEqual({ route: 'about', lang: 'es' });
    expect(findPage('/en/contact')).toEqual({ route: 'contact', lang: 'en' });
  });

  it('ignores paths that are not pages', () => {
    expect(findPage('/api/contact')).toBeNull();
    expect(findPage('/favicon.svg')).toBeNull();
    expect(findPage('/en/sobre-mi')).toBeNull();
  });

  it('builds localized paths with an optional fragment', () => {
    expect(localizedPath('projects', 'en')).toBe('/en/projects');
    expect(localizedPath('contact', 'es', 'contact-sent')).toBe('/contacto#contact-sent');
  });

  it('names a real page for every row of the home index', () => {
    for (const lang of languages) {
      for (const row of getMessages(lang).home.people) {
        expect(() => toRouteKey(row.to)).not.toThrow();
      }
    }
    expect(() => toRouteKey('lab')).toThrow(/lab/);
  });
});
