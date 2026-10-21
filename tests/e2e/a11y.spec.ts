import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { routes } from './routes';

for (const theme of ['dark', 'light']) {
  for (const route of routes) {
    test(`${route} has no axe violations in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      // The static, final state: intro animations would otherwise be mid-fade while axe checks contrast.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        // The rejected line in the Kimen demo is dimmed on purpose. The demo is an illustration with
        // a text alternative (role="img"), so its text is incidental under WCAG 1.4.3.
        .exclude('.kd-l.bad')
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
