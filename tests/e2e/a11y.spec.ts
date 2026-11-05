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
        // The project demos are illustrations with a text alternative (role="img"): the text drawn
        // inside them is incidental under WCAG 1.4.3 and hidden from assistive tech (checked below).
        // The role="img" element itself is still checked.
        .exclude('[data-demo-stage] [role="img"] > *')
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test(`${route} reads its illustrations by their label alone in the ${theme} theme`, async ({
      page,
    }) => {
      test.skip(theme === 'light', 'The markup is the same in both themes');
      await page.goto(route);
      // Everything drawn inside a role="img" is hidden, so screen readers do not read it after the label.
      const exposed = await page.$$eval('[role="img"]', (images) =>
        images.flatMap((image) =>
          [...image.children]
            .filter((child) => child.getAttribute('aria-hidden') !== 'true')
            .map(
              (child) => `${image.getAttribute('aria-label')?.slice(0, 30)}: <${child.tagName}>`,
            ),
        ),
      );
      expect(exposed).toEqual([]);
    });
  }
}

for (const project of ['Kimen', 'Jezero', 'Orbit']) {
  test(`the constellation filtered by ${project} keeps every label legible`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/sobre-mi');
    await page.getByRole('button', { name: project, exact: true }).click();
    const results = await new AxeBuilder({ page }).include('[data-constellation]').analyze();
    expect(results.violations).toEqual([]);
  });
}
