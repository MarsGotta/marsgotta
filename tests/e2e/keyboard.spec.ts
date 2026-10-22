import { expect, test } from '@playwright/test';
import { routes } from './routes';

interface Stop {
  label: string;
  visible: boolean;
  ring: boolean;
}

test.describe('keyboard', () => {
  for (const route of routes) {
    test(`${route}: every Tab stop is visible and shows a focus ring`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);
      const stops: Stop[] = [];
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab');
        const stop = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            label: `${el.tagName.toLowerCase()} ${(el.textContent ?? '').trim().slice(0, 30)}`,
            visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden',
            ring:
              (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2) ||
              style.boxShadow !== 'none',
          };
        });
        // Past the last stop, focus leaves the page.
        if (!stop) break;
        stops.push(stop);
      }
      expect(stops.length).toBeGreaterThan(8);
      for (const stop of stops) {
        expect(stop.visible, stop.label).toBe(true);
        expect(stop.ring, stop.label).toBe(true);
      }
    });
  }

  test('project tabs change only when picked, not when focus passes over them', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('[data-project-tab="kimen"]').focus();
    await page.keyboard.press('Tab');
    const jezero = page.locator('[data-project-tab="jezero"]');
    await expect(jezero).toBeFocused();
    await expect(jezero).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Enter');
    await expect(jezero).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('img', { name: /sedimento/ })).toBeVisible();
  });

  test('focus never hides under the sticky navigation', async ({ page }) => {
    await page.goto('/contacto');
    await page.locator('footer a').last().focus();
    const navBottom = await page
      .locator('.nav')
      .evaluate((nav) => nav.getBoundingClientRect().bottom);
    // Walking back up from the footer, the browser scrolls each stop into view from the top edge.
    for (let stop = 0; stop < 30; stop += 1) {
      await page.keyboard.press('Shift+Tab');
      const top = await page.evaluate(
        () => document.activeElement?.getBoundingClientRect().top ?? 0,
      );
      expect(top).toBeGreaterThanOrEqual(navBottom);
      if (await page.locator('#contact-name').evaluate((el) => el === document.activeElement))
        return;
    }
    throw new Error('Shift+Tab never reached the name field');
  });
});
