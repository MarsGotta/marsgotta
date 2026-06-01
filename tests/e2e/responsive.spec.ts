import { expect, test } from '@playwright/test';

/**
 * Responsive smoke tests — guard against regressions of the mobile/tablet
 * polish landed in fix(responsive): comprehensive mobile + tablet polish.
 *
 * Covers:
 *   1. Mobile (360×800):  no horizontal overflow, hero h1 visible,
 *                         hamburger present and opens drawer with nav links.
 *   2. Tablet (768×1024): no horizontal overflow, hamburger visible
 *                         (CSS source-order bug regression test).
 */
test.describe('Responsive', () => {
  test('mobile 360: no horizontal scroll, hero visible, drawer works', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/es');

    // Page must not overflow horizontally.
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const s = document.documentElement.scrollWidth;
      return { client: w, scroll: s };
    });
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);

    // Hero heading is visible (not hidden behind something or off-screen).
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Hamburger button is visible and operable on mobile.
    const burger = page.getByRole('button', { name: /open menu|abrir menú/i });
    await expect(burger).toBeVisible();
    await burger.click();

    // Drawer reveals nav links (use the in-drawer one, picked by visibility).
    const drawerHomeLink = page.getByRole('link', { name: /^inicio$/i }).first();
    await expect(drawerHomeLink).toBeVisible();
  });

  test('tablet 768: no horizontal scroll + hamburger visible (regression)', async ({ page }) => {
    // Regression guard for the source-order bug where `.mars-mobile-nav`
    // base `display: none` (defined late in the stylesheet) was overriding
    // the `display: flex` declared inside `@media (max-width: 900px)`.
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/es');

    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const s = document.documentElement.scrollWidth;
      return { client: w, scroll: s };
    });
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);

    const burger = page.getByRole('button', { name: /open menu|abrir menú/i });
    await expect(burger).toBeVisible();
  });
});
