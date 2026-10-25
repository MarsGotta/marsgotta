import { expect, test } from '@playwright/test';
import { formatHoursMinutes, marsClock } from '../../src/lib/mars-clock';

test.describe('the home as a story', () => {
  for (const home of ['/', '/en']) {
    test(`${home} tells its acts in order, without the old Now band`, async ({ page }) => {
      await page.goto(home);
      const acts = await page
        .locator('main section[aria-labelledby]')
        .evaluateAll((sections) =>
          sections.map((section) => section.getAttribute('aria-labelledby')),
        );
      expect(acts).toEqual(['hero-title', 'system-title', 'people-title', 'close-title']);
      await expect(page.locator('section.now')).toHaveCount(0);
    });
  }

  for (const [home, targets] of [
    ['/', ['/sobre-mi', '/charlas', '/charlas']],
    ['/en', ['/en/about', '/en/talks', '/en/talks']],
  ] as const) {
    test(`${home} links each row of the index to its page, 44 px tall or more`, async ({
      page,
    }) => {
      await page.goto(home);
      const rows = page.locator('#con-quien ol a');
      await expect(rows).toHaveCount(targets.length);
      for (const [index, target] of targets.entries()) {
        await expect(rows.nth(index)).toHaveAttribute('href', target);
        expect((await rows.nth(index).boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
    });
  }

  test('the closing clocks show Madrid and Jezero as marsClock says', async ({ page }) => {
    const clocks = () => {
      const now = Date.now();
      const mars = marsClock(now);
      const madrid = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(now);
      return `${madrid} ${mars.sol} ${formatHoursMinutes(mars.lmst)}`;
    };
    const before = clocks();
    await page.goto('/');
    const live = page.locator('[data-live-clocks]');
    await expect(live).toHaveAttribute('data-ready', '');
    const shown = await live.evaluate((el) =>
      ['[data-clock-madrid]', '[data-clock-sol]', '[data-clock-lmst]']
        .map((selector) => el.querySelector(selector)?.textContent)
        .join(' '),
    );
    // A minute may tick over while the page loads.
    expect([before, clocks()]).toContain(shown);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('the clocks keep their place but stay out of sight', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-live-clocks]')).toBeHidden();
      await expect(page.locator('#system-title')).toBeVisible();
    });
  });

  test('the next stop leads to the projects on wide screens only', async ({ page, viewport }) => {
    await page.goto('/');
    const next = page.locator('.hero a[href="#sistema"]');
    if ((viewport?.width ?? 0) > 980) {
      await expect(next).toHaveText(/\(01\) Qué construyo/);
      await next.click();
      await expect(page.locator('#sistema')).toBeInViewport();
    } else {
      await expect(next).toBeHidden();
    }
  });
});
