import { expect, test } from '@playwright/test';
import { routes } from './routes';

test.describe('seo', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 600, 'The head is the same on every device');

  for (const route of routes) {
    test(`${route} has its title, canonical, hreflang, Open Graph and Person data`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveTitle(/Marcela Gotta/);
      const head = page.locator('head');
      await expect(head.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
      const canonical = await head.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(new URL(route, 'https://marcelagotta.com').href);
      await expect(head.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
      await expect(head.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        /^https:\/\/marcelagotta\.com\/og\/marcela-gotta-(es|en)\.jpg$/,
      );
      const jsonLd = await head.locator('script[type="application/ld+json"]').textContent();
      const person = JSON.parse(jsonLd ?? '{}') as { '@type': string; sameAs: string[] };
      expect(person['@type']).toBe('Person');
      expect(person.sameAs).toHaveLength(3);
    });
  }

  test('the Open Graph images and the touch icon exist', async ({ request }) => {
    for (const path of [
      '/og/marcela-gotta-es.jpg',
      '/og/marcela-gotta-en.jpg',
      '/apple-touch-icon.png',
    ]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test('robots.txt points to the sitemap, which lists every page with its translation', async ({
    request,
  }) => {
    expect(await (await request.get('/robots.txt')).text()).toContain(
      'Sitemap: https://marcelagotta.com/sitemap-index.xml',
    );
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap.match(/<loc>/g)).toHaveLength(10);
    expect(sitemap).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://marcelagotta.com/en/about"/>',
    );
  });

  test('unknown pages show the 404 page, kept out of search results', async ({ page }) => {
    await page.goto('/no-existe');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
  });
});
