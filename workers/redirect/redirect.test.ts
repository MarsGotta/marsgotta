import { describe, expect, it } from 'vitest';
import worker from './index';
import { canonicalLocation } from './redirect';

describe('canonicalLocation', () => {
  it('keeps the path and the query string', () => {
    expect(canonicalLocation('https://marcelagotta.com/en/about?ref=cv#top')).toBe(
      'https://marsgotta.com/en/about?ref=cv',
    );
    expect(canonicalLocation('https://www.marsgotta.com/')).toBe('https://marsgotta.com/');
    expect(canonicalLocation('http://www.marcelagotta.com/sobre-mi')).toBe(
      'https://marsgotta.com/sobre-mi',
    );
  });

  it('takes an address of the previous site straight to its page', () => {
    expect(canonicalLocation('https://marcelagotta.com/es/about?ref=cv')).toBe(
      'https://marsgotta.com/sobre-mi?ref=cv',
    );
    expect(canonicalLocation('https://marcelagotta.com/sitemap-0.xml')).toBe(
      'https://marsgotta.com/sitemap.xml',
    );
  });
});

describe('redirect worker', () => {
  it('answers with a 301', () => {
    const response = worker.fetch(new Request('https://marcelagotta.com/proyectos?x=1'));
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://marsgotta.com/proyectos?x=1');
  });
});
