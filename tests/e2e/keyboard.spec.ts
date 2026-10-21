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

  test('project tabs follow keyboard focus', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-project-tab="kimen"]').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-project-tab="jezero"]')).toBeFocused();
    await expect(page.locator('[data-project-tab="jezero"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('img', { name: /sedimento/ })).toBeVisible();
  });
});
