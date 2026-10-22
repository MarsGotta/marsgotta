import { describe, expect, it } from 'vitest';
import type { Env } from './env';
import site from './index';

const env: Env = {
  ASSETS: { fetch: async () => new Response('page', { headers: { 'Content-Type': 'text/html' } }) },
  CONTACT_EMAIL: { send: async () => ({ messageId: 'id' }) },
  CONTACT_LIMIT: { limit: async () => ({ success: true }) },
};

function visit(path: string, headers: Record<string, string> = {}) {
  return site.fetch(new Request(`https://marcelagotta.com${path}`, { headers }), env);
}

// What a browser sends when it opens a page.
const OPENS_PAGE = { 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };
const ENGLISH = { ...OPENS_PAGE, 'Accept-Language': 'en-GB,en;q=0.9' };
const SPANISH = { ...OPENS_PAGE, 'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8' };

describe('language on arrival', () => {
  it('sends an English browser to the same page in English, keeping the query', async () => {
    const response = await visit('/proyectos?ref=x', ENGLISH);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://marcelagotta.com/en/projects?ref=x');
    expect(response.headers.get('Vary')).toBe('Accept-Language, Cookie');
  });

  it('sends a Spanish browser to the Spanish page', async () => {
    const response = await visit('/en', SPANISH);
    expect(response.headers.get('Location')).toBe('https://marcelagotta.com/');
  });

  it('serves the page when it is already in the wanted language', async () => {
    const response = await visit('/en/about', ENGLISH);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('page');
    expect(response.headers.get('Vary')).toBe('Accept-Language, Cookie');
  });

  it('prefers an earlier choice to the browser language', async () => {
    const response = await visit('/', { ...SPANISH, Cookie: 'theme=x; lang=en' });
    expect(response.headers.get('Location')).toBe('https://marcelagotta.com/en');
  });

  it('never redirects crawlers, fetchers or browsers that state no language', async () => {
    expect((await visit('/', OPENS_PAGE)).status).toBe(200);
    const fetcher = {
      'Accept-Language': 'en',
      'User-Agent': 'Mozilla/5.0 (compatible; Claude-User/1.0)',
    };
    expect((await visit('/', fetcher)).status).toBe(200);
    const crawler = { ...ENGLISH, 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' };
    expect((await visit('/', crawler)).status).toBe(200);
  });
});

describe('language inside the site', () => {
  it('does not redirect, and remembers a switch to the other language', async () => {
    const response = await visit('/en/about', {
      ...SPANISH,
      Referer: 'https://marcelagotta.com/sobre-mi',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toBe(
      'lang=en; Path=/; Max-Age=31536000; SameSite=Lax; Secure',
    );
  });

  it('remembers nothing while the visitor stays in one language', async () => {
    const response = await visit('/charlas', { ...SPANISH, Referer: 'https://marcelagotta.com/' });
    expect(response.headers.get('Set-Cookie')).toBeNull();
  });

  it('treats a link from another site as an arrival', async () => {
    const response = await visit('/', { ...ENGLISH, Referer: 'https://www.linkedin.com/' });
    expect(response.headers.get('Location')).toBe('https://marcelagotta.com/en');
  });
});
