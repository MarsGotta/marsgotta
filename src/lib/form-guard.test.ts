import { describe, expect, it } from 'vitest';
import { FORM_MAX_BYTES, isCrossSite, rateLimitKey, readLimitedForm } from './form-guard';

const endpoint = 'https://marsgotta.com/api/contact';

function post(headers: Record<string, string>, body?: BodyInit): Request {
  return new Request(endpoint, { method: 'POST', headers, body });
}

describe('isCrossSite', () => {
  it('lets the site post to itself', () => {
    expect(isCrossSite(post({ 'Sec-Fetch-Site': 'same-origin' }))).toBe(false);
    expect(isCrossSite(post({ Origin: 'https://marsgotta.com' }))).toBe(false);
    // Scripts and tools that state neither, like the smoke tests.
    expect(isCrossSite(post({}))).toBe(false);
  });

  it('refuses posts from any other site, the blog included', () => {
    expect(isCrossSite(post({ 'Sec-Fetch-Site': 'cross-site' }))).toBe(true);
    expect(isCrossSite(post({ 'Sec-Fetch-Site': 'same-site' }))).toBe(true);
    expect(isCrossSite(post({ Origin: 'https://evil.example' }))).toBe(true);
  });
});

describe('readLimitedForm', () => {
  it('reads a form of the site', async () => {
    const form = new FormData();
    form.set('email', 'ana@example.com');
    const read = await readLimitedForm(post({}, form));
    expect(read?.get('email')).toBe('ana@example.com');
  });

  it('refuses a body larger than any real form, whatever its Content-Length says', async () => {
    const huge = new URLSearchParams({ message: 'x'.repeat(FORM_MAX_BYTES) });
    expect(
      await readLimitedForm(post({ 'Content-Type': 'application/x-www-form-urlencoded' }, huge)),
    ).toBeNull();
    expect(
      await readLimitedForm(post({ 'Content-Length': String(FORM_MAX_BYTES + 1) }, 'x')),
    ).toBeNull();
  });

  it('turns a body that is not a form into an empty one', async () => {
    const read = await readLimitedForm(
      post({ 'Content-Type': 'application/json' }, '{"email":"a"}'),
    );
    expect([...(read?.keys() ?? [])]).toEqual([]);
  });
});

describe('rateLimitKey', () => {
  it('keys IPv4 on the address and IPv6 on its /64', () => {
    expect(rateLimitKey('203.0.113.7')).toBe('203.0.113.7');
    expect(rateLimitKey('2001:db8:aa:1:5:6:7:8')).toBe('2001:db8:aa:1::/64');
    expect(rateLimitKey('2001:0db8:00aa:0001::8')).toBe('2001:db8:aa:1::/64');
    expect(rateLimitKey('2001:db8::1')).toBe('2001:db8:0:0::/64');
    expect(rateLimitKey(null)).toBe('unknown');
  });
});
