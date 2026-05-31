import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('renders hero in Spanish by default', async ({ page }) => {
    await page.goto('/es');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('renders hero in English on /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
