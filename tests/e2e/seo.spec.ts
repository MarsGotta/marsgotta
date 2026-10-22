import { expect, test } from '@playwright/test';
import { routes } from './routes';

test.describe('seo', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 600, 'The head is the same on every device');

  for (const route of routes) {
    test(`${route} has its title, canonical, hreflang, Open Graph and structured data`, async ({
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
      const { '@graph': graph } = JSON.parse(jsonLd ?? '{}') as {
        '@graph': { '@type': string; url?: string; sameAs?: string[] }[];
      };
      expect(graph.find((node) => node['@type'] === 'Person')?.sameAs).toHaveLength(3);
      expect(graph.some((node) => node.url === canonical)).toBe(true);
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

  test('llms.txt indexes the site for AI agents', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.headers()['content-type']).toContain('text/plain');
    expect(await response.text()).toMatch(/^# Marcela Gotta\n\n> /);
  });

  test('addresses of the previous site redirect to their pages', async ({ request }) => {
    for (const [from, to] of [
      ['/es', '/'],
      ['/es/about', '/sobre-mi'],
      ['/es/contact', '/contacto'],
      ['/es/lab', '/proyectos'],
      ['/en/lab', '/en/projects'],
    ]) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(301);
      expect(new URL(response.headers().location, 'https://x').pathname, from).toBe(to);
    }
  });

  test('unknown pages show the 404 page, kept out of search results', async ({ page }) => {
    await page.goto('/no-existe');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Ups… Señal no encontrada.' }),
    ).toBeVisible();
  });

  test('unknown English pages show the 404 page in English', async ({ page }) => {
    await page.goto('/en/no-such-page');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Oops… Signal not found.' }),
    ).toBeVisible();
  });
});
