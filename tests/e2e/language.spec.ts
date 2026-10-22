import { expect, test, type Page } from '@playwright/test';

async function switchTo(page: Page, lang: 'es' | 'en') {
  const link = page.locator(`.nav [role="group"] a[lang="${lang}"]`);
  if (await link.isVisible()) {
    await link.click();
  } else {
    await page.locator('[data-menu-open]').click();
    await page.locator(`[data-menu] a[lang="${lang}"]`).click();
  }
}

test.describe('an English browser', () => {
  // Arriving from outside: no Referer from the site, and the browser's language.
  test.use({ locale: 'en-GB', extraHTTPHeaders: {} });

  test('arriving at a Spanish page lands on the same page in English', async ({ page }) => {
    await page.goto('/sobre-mi');
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('can switch to Spanish, and the choice is remembered', async ({ page }) => {
    await page.goto('/en/talks');
    await switchTo(page, 'es');
    await expect(page).toHaveURL(/\/charlas$/);
    await page.goto('/en/contact');
    await expect(page).toHaveURL(/\/contacto$/);
  });
});

test.describe('a Spanish browser', () => {
  test.use({ locale: 'es-ES', extraHTTPHeaders: {} });

  test('arriving at the English home page lands on the Spanish one', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});
