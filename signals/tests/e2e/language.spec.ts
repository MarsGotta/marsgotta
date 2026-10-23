import { expect, test } from '@playwright/test';
import { article } from './pages';

test.describe('an English browser', () => {
  // Arriving from outside: no Referer from the blog, and the browser's language.
  test.use({ locale: 'en-GB', extraHTTPHeaders: {} });

  test('arriving at a Spanish signal lands on its translation', async ({ page }) => {
    await page.goto(article.es);
    await expect(page).toHaveURL(new RegExp(`${article.en}$`));
  });

  test('can switch to Spanish, and the choice is remembered', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 480, 'no language switch on narrow screens');
    await page.goto('/en/archive');
    await page.getByRole('group', { name: 'Language' }).getByRole('link', { name: 'ES' }).click();
    await expect(page).toHaveURL(/\/archivo$/);
    await page.goto('/en/archive');
    await expect(page).toHaveURL(/\/archivo$/);
  });
});

test.describe('a Spanish browser', () => {
  test.use({ locale: 'es-ES', extraHTTPHeaders: {} });

  test('arriving at the English home lands on the Spanish one', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});

test('crawlers get the page they ask for', async ({ request }) => {
  const response = await request.get(article.es, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Dest': 'document',
    },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(200);
});
