import { expect, test, type Page } from '@playwright/test';

/** Software WebGL keeps the CSS sphere on purpose, so each test checks the branch that applies. */
async function hasHardwareWebGL(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    return !!gl && !/swiftshader|llvmpipe|software/i.test(renderer);
  });
}

test.describe('WebGL planet', () => {
  test('replaces the CSS sphere after the first paint, or keeps it without a GPU', async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto('/');
    await expect.poll(() => requests.some((url) => /\/planet\.[\w-]+\.js$/.test(url))).toBe(true);
    const system = page.locator('[data-planet-system]');
    if (await hasHardwareWebGL(page)) {
      await expect(system).toHaveAttribute('data-gl', 'on');
    } else {
      await page.waitForTimeout(1000);
      await expect(system).not.toHaveAttribute('data-gl', 'on');
      await expect(system.locator('.orb')).toBeVisible();
    }
  });

  test('marks Jezero with the same local time as the HUD at load', async ({ page }) => {
    // With SIM paused the planet draws a single frame at the moment of loading.
    await page.addInitScript(() => localStorage.setItem('motion', 'off'));
    await page.goto('/');
    test.skip(!(await hasHardwareWebGL(page)), 'Needs hardware WebGL');
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
    await expect.poll(() => requests.some((url) => /\/planet\.[\w-]+\.js$/.test(url))).toBe(true);
  });
});
