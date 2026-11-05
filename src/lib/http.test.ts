import { describe, expect, it } from 'vitest';
import { HSTS, weakenEtag, withSecurityHeaders } from './http';

describe('withSecurityHeaders', () => {
  it('adds HSTS and nosniff to a response the Worker builds, keeping the rest', () => {
    const secured = withSecurityHeaders(Response.redirect('https://marsgotta.com/en', 301));
    expect(secured.status).toBe(301);
    expect(secured.headers.get('Location')).toBe('https://marsgotta.com/en');
    expect(secured.headers.get('Strict-Transport-Security')).toBe(HSTS);
    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});

describe('weakenEtag', () => {
  it('makes a strong ETag weak and leaves a weak one alone', () => {
    const strong = new Headers({ ETag: '"abc"' });
    weakenEtag(strong);
    expect(strong.get('ETag')).toBe('W/"abc"');
    const weak = new Headers({ ETag: 'W/"abc"' });
    weakenEtag(weak);
    expect(weak.get('ETag')).toBe('W/"abc"');
  });
});
