import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Checks that hold whatever is published, the empty blog included, so they can run against a
 * deployment: npm run signals:test:deployed. Locally they run with the rest of the suite.
 */
test.describe('@smoke', () => {
  const pages = ['/', '/en', '/archivo', '/en/archive', '/temas/practica', '/en/topics/practice'];

  for (const path of pages) {
    test(`${path} answers with the security headers`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
      expect(response.headers()['x-content-type-options']).toBe('nosniff');
      expect(response.headers()['x-frame-options']).toBe('DENY');
      expect(response.headers()['strict-transport-security']).toBe('max-age=31536000');
    });
  }

  test('a missing page answers 404 in the language of its address', async ({ page }) => {
    expect((await page.goto('/no-existe'))?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta señal no ha llegado');
    expect((await page.goto('/en/no-such-page'))?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This signal never arrived');
  });

  test('a copy on workers.dev stays out of search results', async ({ request, baseURL }) => {
    test.skip(!baseURL?.includes('.workers.dev'), 'only workers.dev copies carry noindex');
    const response = await request.get('/');
    expect(response.headers()['x-robots-tag']).toBe('noindex');
  });

  test('an English reader arriving from elsewhere lands on the English home', async ({
    request,
  }) => {
    const response = await request.get('/', {
      headers: {
        Referer: 'https://www.linkedin.com/',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
      },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(new URL(response.headers()['location']).pathname).toBe('/en');
  });

  test('robots.txt, the site map, the feeds and llms.txt are served', async ({ request }) => {
    expect(await (await request.get('/robots.txt')).text()).toContain(
      'Sitemap: https://signals.marsgotta.com/sitemap.xml',
    );
    expect(await (await request.get('/sitemap.xml')).text()).toContain(
      '<loc>https://signals.marsgotta.com/</loc>',
    );
    for (const feed of ['/rss.xml', '/en/rss.xml']) {
      const xml = await (await request.get(feed)).text();
      expect(xml).toMatch(/^<\?xml[\s\S]*<channel>[\s\S]*<\/channel>\s*<\/rss>\s*$/);
    }
    expect(await (await request.get('/llms.txt')).text()).toMatch(/^# Signals by Mars\n/);
  });

  test('the subscription endpoint only takes POST and checks the address', async ({ request }) => {
    expect((await request.get('/api/subscribe')).status()).toBe(405);
    // An address the Worker rejects never reaches the provider, so this signs nobody up.
    const response = await request.post('/api/subscribe', {
      form: { email: 'ana@', lang: 'es', source: 'band', page: '/' },
      headers: { Accept: 'application/json' },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ ok: false });
  });

  for (const theme of ['light', 'dark']) {
    for (const path of ['/', '/en', '/archivo', '/no-existe']) {
      test(`${path} has no axe violations in the ${theme} theme`, async ({ page }) => {
        await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
