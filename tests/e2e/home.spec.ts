import { expect, test } from '@playwright/test';

test.describe('home', () => {
  test('the HUD shows live Madrid time, Perseverance sol and Jezero LMST', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-hud-madrid]')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
    await expect(page.locator('[data-hud-sol]')).toHaveText(/^\d{4}$/);
    await expect(page.locator('[data-hud-lmst]')).toHaveText(/^\d{2}:\d{2}$/);
  });

  test('the headline reads as one sentence', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Construyo software que piensa contigo.' }),
    ).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Construyo software que piensa contigo.');
  });

  test('SIM pauses every animation and is remembered', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const sim = page.locator('.hud [data-motion-toggle]');
    await expect(sim).toHaveAccessibleName(/Pausar animaciones: SIM ×3600/);
    await sim.click();
    await expect(html).toHaveAttribute('data-motion', 'off');
    await expect(sim).toHaveAccessibleName(/Reanudar animaciones: SIM ×0/);
    const state = await page
      .locator('.moon')
      .first()
      .evaluate((moon) => getComputedStyle(moon).animationPlayState);
    expect(state).toBe('paused');
    await page.goto('/sobre-mi');
    await expect(html).toHaveAttribute('data-motion', 'off');
    await page.locator('footer [data-motion-toggle]').click();
    await expect(html).not.toHaveAttribute('data-motion', 'off');
  });

  test('project tabs switch the orrery and the demo', async ({ page }) => {
    await page.goto('/');
    const system = page.locator('[data-project-system]');
    const jezero = system.locator('[data-project-tab="jezero"]');
    await jezero.click();
    await expect(jezero).toHaveAttribute('aria-pressed', 'true');
    await expect(system.locator('[data-project-tab="kimen"]')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(system.locator('[data-orrery-ring="jezero"]')).toHaveClass(/is-on/);
    await expect(system.getByRole('img', { name: /sedimento/ })).toBeVisible();
    await expect(system.locator('.demo.p-kimen')).toBeHidden();
    await expect(system.getByRole('link', { name: /Ver Jezero/ })).toHaveAttribute(
      'href',
      '/proyectos#jezero',
    );
  });

  test('demos play once when they scroll into view', async ({ page }) => {
    await page.goto('/');
    const stage = page.locator('[data-demo-stage]').first();
    await expect(stage).not.toHaveClass(/is-play/);
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveClass(/is-play/);
  });

  test('reduced motion shows the complete static state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const word = page.locator('h1 .w').first();
    expect(await word.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    const stage = page.locator('[data-demo-stage]').first();
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveClass(/is-play/);
    const card = stage.locator('.kd-card');
    expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });
});
