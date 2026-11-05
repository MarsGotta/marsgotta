import { describe, expect, it } from 'vitest';
import type { Env } from './env';
import signals from './index';

const TRANSLATIONS: Record<string, string> = {
  '/': '/en',
  '/en': '/',
  '/archivo': '/en/archive',
  '/en/archive': '/archivo',
  '/dale-memoria': '/en/give-memory',
  '/en/give-memory': '/dale-memoria',
};

const env: Env = {
  ASSETS: {
    fetch: async (request) => {
      const { pathname } = new URL(request instanceof URL ? request : request.url);
      if (pathname === '/translations.json') return Response.json(TRANSLATIONS);
      if (pathname.endsWith('.xml')) {
        return new Response('<rss/>', { headers: { 'Content-Type': 'application/xml' } });
      }
      return new Response('page', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    },
  },
  SUBSCRIBE_LIMIT: { limit: async () => ({ success: true }) },
};

function visit(path: string, headers: Record<string, string> = {}) {
  return signals.fetch(new Request(`https://signals.marsgotta.com${path}`, { headers }), env);
}

// What a browser sends when it opens a page.
const OPENS_PAGE = { 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };
const ENGLISH = { ...OPENS_PAGE, 'Accept-Language': 'en-GB,en;q=0.9' };
const SPANISH = { ...OPENS_PAGE, 'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8' };

describe('language on arrival', () => {
  it('sends an English browser to the translation of the signal, keeping the query', async () => {
    const response = await visit('/dale-memoria?ref=x', ENGLISH);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(
      'https://signals.marsgotta.com/en/give-memory?ref=x',
    );
    expect(response.headers.get('Vary')).toBe('Accept-Language, Cookie');
  });

  it('sends a Spanish browser to the Spanish home, or to an earlier choice', async () => {
    expect((await visit('/en', SPANISH)).headers.get('Location')).toBe(
      'https://signals.marsgotta.com/',
    );
    const chosen = await visit('/archivo', { ...SPANISH, Cookie: 'lang=en' });
    expect(chosen.headers.get('Location')).toBe('https://signals.marsgotta.com/en/archive');
  });

  it('serves a signal written in one language only, whatever the browser asks for', async () => {
    const response = await visit('/solo-en-espanol', ENGLISH);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('page');
  });

  it('never redirects crawlers or browsers that state no language', async () => {
    expect((await visit('/', OPENS_PAGE)).status).toBe(200);
    const crawler = { ...ENGLISH, 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' };
    expect((await visit('/', crawler)).status).toBe(200);
  });
});

describe('language inside the blog', () => {
  it('does not redirect, and remembers a switch to the other language', async () => {
    const response = await visit('/en/archive', {
      ...SPANISH,
      Referer: 'https://signals.marsgotta.com/archivo',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toBe(
      'lang=en; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly',
    );
  });

  it('remembers nothing while the visitor stays in one language', async () => {
    const response = await visit('/archivo', {
      ...SPANISH,
      Referer: 'https://signals.marsgotta.com/',
    });
    expect(response.headers.get('Set-Cookie')).toBeNull();
  });

  it('leaves files that are not pages as they are', async () => {
    const response = await visit('/en/rss.xml', { Referer: 'https://signals.marsgotta.com/' });
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(response.headers.get('Vary')).toBeNull();
  });
});
