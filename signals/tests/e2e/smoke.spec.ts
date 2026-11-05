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

  test('pages run under the content security policy with nothing blocked', async ({ page }) => {
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { cspViolations: string[] }).cspViolations = seen;
      document.addEventListener('securitypolicyviolation', (event) => {
        seen.push(`${event.effectiveDirective} ${event.blockedURI}`);
      });
    });
    for (const path of ['/', '/en', '/archivo']) {
      const response = await page.goto(path);
      const headers = response?.headers() ?? {};
      expect(headers['content-security-policy'], path).toContain("frame-ancestors 'none'");
      expect(headers['cross-origin-opener-policy'], path).toBe('same-origin');
      await page.waitForLoadState('networkidle');
      expect(
        await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations),
        path,
      ).toEqual([]);
    }
  });

  test('the forms only take posts from the blog itself', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      form: { email: 'ana@example.com', lang: 'es', source: 'band', page: '/' },
      headers: { Accept: 'application/json', Origin: 'https://evil.example' },
    });
    expect(response.status()).toBe(403);
    expect(response.headers()['cache-control']).toBe('no-store');
  });

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

  test('the canonical host can be indexed', async ({ request, baseURL }) => {
    test.skip(!baseURL?.includes('signals.marsgotta.com'), 'only the canonical host');
    const response = await request.get('/');
    expect(response.headers()['x-robots-tag']).toBeUndefined();
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

  test('a topic page lists its signals or says it has none', async ({ page }) => {
    await page.goto('/temas/practica');
    const rows = page.getByRole('list', { name: 'Últimas señales' }).getByRole('listitem');
    const none = page.getByText('Todavía no hay señales en este tema.');
    await expect(rows.or(none).first()).toBeVisible();
    expect((await rows.count()) > 0 !== (await none.count()) > 0).toBe(true);
  });

  for (const theme of ['light', 'dark']) {
    for (const path of ['/', '/en', '/archivo', '/en/topics/practice', '/no-existe']) {
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
