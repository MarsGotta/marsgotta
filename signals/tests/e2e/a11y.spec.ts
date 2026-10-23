import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { indexed, unindexed } from './pages';

for (const theme of ['light', 'dark']) {
  for (const path of [...indexed, ...unindexed]) {
    test(`${path} has no axe violations in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      // The static, final state: entrance animations would otherwise be mid-fade while axe checks.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test('with reduced motion nothing moves', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
});
