import { expect, test } from '@playwright/test';

test.describe('WebGL planet', () => {
  test('replaces the CSS sphere after the first paint', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto('/');
    const system = page.locator('[data-planet-system]');
    await expect(system).toHaveAttribute('data-gl', 'on');
    expect(requests.some((url) => /\/planet\.[\w-]+\.js$/.test(url))).toBe(true);
  });

  test('marks Jezero with the same local time as the HUD at load', async ({ page }) => {
    // With SIM paused the planet draws a single frame at the moment of loading.
    await page.addInitScript(() => localStorage.setItem('motion', 'off'));
    await page.goto('/');
    await expect(page.locator('[data-planet-system]')).toHaveAttribute('data-gl', 'on');
    const hud = await page.locator('[data-hud-lmst]').textContent();
    await expect(page.locator('[data-jezero-time]')).toHaveText(hud ?? '');
  });

  test('is not loaded in the light theme until the theme turns dark', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(requests.some((url) => /\/planet\.[\w-]+\.js$/.test(url))).toBe(false);
    await page.locator('.nav [data-theme-toggle]').click();
    await expect(page.locator('[data-planet-system]')).toHaveAttribute('data-gl', 'on');
  });
});
