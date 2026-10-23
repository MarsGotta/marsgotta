import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Env } from './env';
import signals from './index';

const API_KEY = 'test-key';

function fakeEnv({ allowed = true, key = API_KEY as string | null } = {}): Env {
  return {
    ASSETS: { fetch: async () => new Response('asset') },
    SUBSCRIBE_LIMIT: { limit: async () => ({ success: allowed }) },
    ...(key ? { BUTTONDOWN_API_KEY: key } : {}),
  };
}

const valid = { email: 'ana@example.com', lang: 'en', source: 'post', page: '/en/give-memory' };

function post(fields: Record<string, string>, { json = false } = {}): Request {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return new Request('https://signals.marsgotta.com/api/subscribe', {
    method: 'POST',
    body,
    headers: { 'CF-Connecting-IP': '203.0.113.10', ...(json && { Accept: 'application/json' }) },
  });
}

function buttondownAnswers(status: number, body: unknown = {}) {
  const fetch = vi.fn(async () => Response.json(body, { status }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('subscribe endpoint', () => {
  it('signs the reader up and answers the page script with JSON', async () => {
    const fetch = buttondownAnswers(201);
    const response = await signals.fetch(post(valid, { json: true }), fakeEnv());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('redirects a plain form post back to its page, on the fragment of its form', async () => {
    buttondownAnswers(201);
    const sent = await signals.fetch(post(valid), fakeEnv());
    expect(sent.status).toBe(303);
    expect(sent.headers.get('Location')).toBe(
      'https://signals.marsgotta.com/en/give-memory#nl-sent-post',
    );
    const invalid = await signals.fetch(
      post({ email: 'ana', lang: 'es', source: 'masthead', page: '/' }),
      fakeEnv(),
    );
    expect(invalid.headers.get('Location')).toBe(
      'https://signals.marsgotta.com/#nl-invalid-masthead',
    );
  });

  it('rejects an invalid address without calling the provider', async () => {
    const fetch = buttondownAnswers(201);
    const response = await signals.fetch(
      post({ ...valid, email: 'ana@' }, { json: true }),
      fakeEnv(),
    );
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('tells bots it worked without signing anyone up', async () => {
    const fetch = buttondownAnswers(201);
    const response = await signals.fetch(
      post({ ...valid, website: 'https://spam.example' }, { json: true }),
      fakeEnv(),
    );
    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('stops a visitor over the rate limit', async () => {
    const fetch = buttondownAnswers(201);
    const response = await signals.fetch(post(valid, { json: true }), fakeEnv({ allowed: false }));
    expect(response.status).toBe(429);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('says it is unavailable without an API key', async () => {
    const fetch = buttondownAnswers(201);
    const response = await signals.fetch(post(valid), fakeEnv({ key: null }));
    expect(response.headers.get('Location')).toBe(
      'https://signals.marsgotta.com/en/give-memory#nl-failed-post',
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('accepts every signup and sends nothing with the development provider', async () => {
    const fetch = buttondownAnswers(201);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const env = { ...fakeEnv(), NEWSLETTER_PROVIDER: 'dev' };
    const response = await signals.fetch(post(valid, { json: true }), env);
    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('only takes POST', async () => {
    const request = new Request('https://signals.marsgotta.com/api/subscribe');
    const response = await signals.fetch(request, fakeEnv());
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });
});
