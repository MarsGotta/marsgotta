import { expect, test } from '@playwright/test';

test.describe('motion on inner pages', () => {
  test('reduced motion shows the title at once and stops the decorative moon', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/sobre-mi');
    const words = page.locator('.phead .w');
    for (const word of await words.all()) {
      expect(await word.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    }
    expect(
      await page.locator('.phead .moon').evaluate((el) => getComputedStyle(el).animationPlayState),
    ).toBe('paused');
  });

  test('the SIM button in the footer pauses the decorative moon', async ({ page }) => {
    await page.goto('/en/projects');
    const moon = page.locator('.phead .moon');
    expect(await moon.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('running');
    await page.locator('footer [data-motion-toggle]').click();
    expect(await moon.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('paused');
  });

  test('with SIM paused the project demos show their final state instead of playing', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('motion', 'off'));
    await page.goto('/proyectos');
    const stage = page.locator('[data-demo-stage]').first();
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(stage).not.toHaveClass(/is-play/);
  });
});
