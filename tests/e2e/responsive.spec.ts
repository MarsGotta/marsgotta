import { expect, test } from '@playwright/test';
import { routes } from './routes';

test.describe('responsive', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 600, 'One run of the width sweep is enough');

  for (const route of routes) {
    test(`${route} never scrolls sideways, from 320 to 1920 px`, async ({ page }) => {
      await page.goto(route);
      for (const width of [320, 540, 768, 1024, 1180, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `at ${width} px`).toBeLessThanOrEqual(0);
      }
    });
  }
});
