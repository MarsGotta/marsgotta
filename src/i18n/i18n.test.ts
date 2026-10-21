import { describe, expect, it } from 'vitest';
import { getMessages, languages, otherLang } from './index';
import { localizedPath, routeKeys } from './routes';

/**
 * Lists the leaf paths of a JSON value, e.g. `about.roles[].when`.
 * Array items share one path because lists may differ in length between languages (the headline words).
 */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => leafPaths(item, `${prefix}[]`)))];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('messages', () => {
  it('have the same keys in Spanish and English', () => {
    expect(leafPaths(getMessages('en'))).toEqual(leafPaths(getMessages('es')));
  });

  it('never use long dashes', () => {
    for (const lang of languages) {
      expect(JSON.stringify(getMessages(lang))).not.toContain('—');
    }
  });
});

describe('routes', () => {
  it('keep Spanish without a prefix and English under /en', () => {
    for (const route of routeKeys) {
      expect(localizedPath(route, 'es').startsWith('/en')).toBe(false);
      expect(localizedPath(route, 'en').startsWith('/en')).toBe(true);
    }
  });

  it('match the agreed URLs', () => {
    expect(routeKeys.map((route) => localizedPath(route, 'es'))).toEqual([
      '/',
      '/sobre-mi',
      '/proyectos',
      '/charlas',
      '/contacto',
    ]);
    expect(routeKeys.map((route) => localizedPath(route, 'en'))).toEqual([
      '/en',
      '/en/about',
      '/en/projects',
      '/en/talks',
      '/en/contact',
    ]);
  });

  it('append anchors', () => {
    expect(localizedPath('projects', 'en', 'kimen')).toBe('/en/projects#kimen');
  });

  it('switch to the other language', () => {
    expect(otherLang('es')).toBe('en');
    expect(otherLang('en')).toBe('es');
  });
});
