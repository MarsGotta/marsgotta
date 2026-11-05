import { describe, expect, it } from 'vitest';
import { redirectTarget, redirectsFile } from './redirects';

describe('redirects', () => {
  it('sends the addresses of the previous site to their pages', () => {
    expect(redirectTarget('/es/about')).toBe('/sobre-mi');
    expect(redirectTarget('/lab')).toBe('/proyectos');
    expect(redirectTarget('/en/lab')).toBe('/en/projects');
    expect(redirectTarget('/sitemap-0.xml')).toBe('/sitemap.xml');
  });

  it('sends the other spellings of a page to the page', () => {
    expect(redirectTarget('/sobre-mi/')).toBe('/sobre-mi');
    expect(redirectTarget('/sobre-mi.html')).toBe('/sobre-mi');
    expect(redirectTarget('/en/')).toBe('/en');
    expect(redirectTarget('/en.html')).toBe('/en');
    expect(redirectTarget('/en/about/')).toBe('/en/about');
    expect(redirectTarget('/index.html')).toBe('/');
  });

  it('leaves the pages themselves and unknown paths alone', () => {
    expect(redirectTarget('/')).toBeNull();
    expect(redirectTarget('/sobre-mi')).toBeNull();
    expect(redirectTarget('/no-existe')).toBeNull();
  });

  it('writes every rule as a permanent redirect for static assets', () => {
    const lines = redirectsFile().trim().split('\n');
    expect(lines).toContain('/es/about /sobre-mi 301');
    expect(lines).toContain('/proyectos/ /proyectos 301');
    expect(lines.every((line) => / 301$/.test(line))).toBe(true);
  });
});
