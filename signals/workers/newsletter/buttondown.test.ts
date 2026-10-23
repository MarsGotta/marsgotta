import { afterEach, describe, expect, it, vi } from 'vitest';
import { buttondown, BUTTONDOWN_SUBSCRIBERS } from './buttondown';

const input = { email: 'ana@example.com', lang: 'en', source: 'band', ip: '203.0.113.10' } as const;

function answers(status: number, body: unknown = {}) {
  const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
    Response.json(body, { status }),
  );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function quietErrors() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Buttondown provider', () => {
  it('creates the subscriber tagged with their language, keeping double opt-in', async () => {
    const fetch = answers(201);
    expect(await buttondown('key').subscribe(input)).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(BUTTONDOWN_SUBSCRIBERS);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Authorization: 'Token key',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      email_address: 'ana@example.com',
      tags: ['en'],
      metadata: { source: 'band' },
      ip_address: '203.0.113.10',
    });
  });

  it('leaves out the IP when there is none', async () => {
    const fetch = answers(201);
    await buttondown('key').subscribe({ ...input, ip: null });
    expect(JSON.parse(String(fetch.mock.calls[0][1].body))).not.toHaveProperty('ip_address');
  });

  it('answers an address already on the list as a new signup', async () => {
    for (const code of [
      'email_already_exists',
      'subscriber_already_exists',
      'subscriber_suppressed',
    ]) {
      answers(400, { code, detail: '' });
      expect(await buttondown('key').subscribe(input)).toEqual({ ok: true });
    }
  });

  it('reports an address Buttondown does not accept as invalid', async () => {
    const errors = quietErrors();
    answers(400, { code: 'email_invalid', detail: '' });
    expect(await buttondown('key').subscribe(input)).toEqual({ ok: false, reason: 'invalid' });
    answers(422, { detail: [] });
    expect(await buttondown('key').subscribe(input)).toEqual({ ok: false, reason: 'invalid' });
    expect(JSON.stringify(errors.mock.calls)).not.toContain('ana@example.com');
  });

  it('reports too many signups', async () => {
    quietErrors();
    answers(429, { detail: 'Slow down' });
    expect(await buttondown('key').subscribe(input)).toEqual({ ok: false, reason: 'rate-limited' });
    answers(400, { code: 'ip_address_spammy', detail: '' });
    expect(await buttondown('key').subscribe(input)).toEqual({ ok: false, reason: 'rate-limited' });
  });

  it('is unavailable when the key, the plan or the network fails, and logs why', async () => {
    const errors = quietErrors();
    answers(401, { detail: 'Invalid token' });
    expect(await buttondown('bad').subscribe(input)).toEqual({ ok: false, reason: 'unavailable' });
    // Tags need a plan that includes them.
    answers(403, { code: 'feature_disabled', detail: '' });
    expect(await buttondown('key').subscribe(input)).toEqual({ ok: false, reason: 'unavailable' });
    expect(errors).toHaveBeenLastCalledWith('Buttondown refused a signup', 403, 'feature_disabled');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('network'))),
    );
    expect(await buttondown('key').subscribe(input)).toEqual({ ok: false, reason: 'unavailable' });
  });
});
