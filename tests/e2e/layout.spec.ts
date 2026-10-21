import { expect, test } from '@playwright/test';

test.describe('theme', () => {
  test('switches with a sunrise and is remembered', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.locator('.nav [data-theme-toggle]').click();
    await expect(page.locator('.dawn')).toHaveCount(1);
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('.dawn')).toHaveCount(0);
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('switches instantly with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.nav [data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('.dawn')).toHaveCount(0);
  });
});

test.describe('navigation', () => {
  test('marks the current page and links to the same page in the other language', async ({
    page,
  }) => {
    await page.goto('/sobre-mi');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    const lang = page.locator('.nav [role="group"] a[lang="en"]');
    if (await lang.isVisible()) {
      await lang.click();
    } else {
      await page.locator('[data-menu-open]').click();
      await page.locator('[data-menu] a[lang="en"]').click();
    }
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('skip link jumps to the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('mobile menu', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) > 980,
    'The menu only exists on narrow screens',
  );

  test('opens as a modal dialog, focuses close and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const open = page.locator('[data-menu-open]');
    const dialog = page.locator('[data-menu]');
    await open.click();
    await expect(dialog).toBeVisible();
    await expect(open).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-menu-close]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toHaveAttribute('aria-expanded', 'false');
    await expect(open).toBeFocused();
  });
});
