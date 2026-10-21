import { describe, expect, it } from 'vitest';
import worker from './index';
import { canonicalLocation } from './redirect';

describe('canonicalLocation', () => {
  it('keeps the path and the query string', () => {
    expect(canonicalLocation('https://marsgotta.com/en/about?ref=cv#top')).toBe(
      'https://marcelagotta.com/en/about?ref=cv',
    );
    expect(canonicalLocation('https://www.marcelagotta.com/')).toBe('https://marcelagotta.com/');
    expect(canonicalLocation('http://www.marsgotta.com/sobre-mi')).toBe(
      'https://marcelagotta.com/sobre-mi',
    );
  });
});

describe('redirect worker', () => {
  it('answers with a 301', () => {
    const response = worker.fetch(new Request('https://marsgotta.com/proyectos?x=1'));
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://marcelagotta.com/proyectos?x=1');
  });
});
