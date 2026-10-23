import { expect, test } from '@playwright/test';
import { article, indexed, unindexed } from './pages';

const SITE = 'https://signals.marsgotta.com';

for (const path of indexed) {
  test(`${path} has its title, description, canonical and card`, async ({ page, request }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(/Signals by Mars/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    const card = await page.locator('meta[property="og:image"]').getAttribute('content');
    const image = await request.get(new URL(card ?? '').pathname);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/jpeg');
  });
}

for (const path of unindexed) {
  test(`${path} stays out of search results`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
}

test('a signal links its translation and describes itself as a BlogPosting', async ({ page }) => {
  await page.goto(article.en);
  const hreflang = page.locator('link[rel="alternate"][hreflang]');
  await expect(hreflang).toHaveCount(3);
  await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', `${SITE}${article.es}`);
  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
  );
  expect(data['@type']).toBe('BlogPosting');
  expect(data.headline).toBe(await page.getByRole('heading', { level: 1 }).textContent());
  expect(data.author['@id']).toBe('https://marsgotta.com/#person');
});

test('the home describes the blog', async ({ page }) => {
  await page.goto('/en');
  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
  );
  expect(data).toMatchObject({ '@type': 'Blog', name: 'Signals by Mars', inLanguage: 'en' });
});

test('each language has its feed, whole, and every item is a page', async ({ request }) => {
  for (const [feed, home] of [
    ['/rss.xml', '/'],
    ['/en/rss.xml', '/en'],
  ]) {
    const xml = await (await request.get(feed)).text();
    const links = [...xml.matchAll(/<item><title>.*?<\/title><link>([^<]+)<\/link>/g)].map(
      (match) => new URL(match[1]).pathname,
    );
    expect(links).toHaveLength(6);
    expect(xml).toContain('<content:encoded><![CDATA[');
    expect(xml).not.toContain('data-copy-code');
    for (const link of links) expect((await request.get(link)).status()).toBe(200);
    expect(xml).toContain(`<link>${new URL(home, SITE).href}</link>`);
  }
});

test('the site map lists the pages and signals, not the confirmation', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const path of indexed) expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
  expect(xml).not.toContain('suscripcion');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

test('llms.txt indexes the signals of both languages', async ({ request }) => {
  const text = await (await request.get('/llms.txt')).text();
  expect(text).toContain(`(${SITE}${article.es})`);
  expect(text).toContain(`(${SITE}${article.en})`);
});

test('pages carry the security headers', async ({ request }) => {
  const response = await request.get('/archivo');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
});
