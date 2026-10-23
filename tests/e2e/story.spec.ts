import { expect, test, type Locator } from '@playwright/test';
import { formatHoursMinutes, marsClock } from '../../src/lib/mars-clock';

const opacity = (element: Locator) => element.evaluate((el) => getComputedStyle(el).opacity);

test.describe('the home as a story', () => {
  for (const home of ['/', '/en']) {
    test(`${home} tells its acts in order, without the old Now band`, async ({ page }) => {
      await page.goto(home);
      const acts = await page
        .locator('main section[aria-labelledby]')
        .evaluateAll((sections) =>
          sections.map((section) => section.getAttribute('aria-labelledby')),
        );
      expect(acts).toEqual([
        'hero-title',
        'why-title',
        'system-title',
        'people-title',
        'close-title',
      ]);
      await expect(page.locator('section.now')).toHaveCount(0);
    });
  }

  test('the Jezero pill picks Jezero in the system and takes you there', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-pick-project="jezero"]').click();
    const system = page.locator('#sistema');
    await expect(system.locator('[data-project-tab="jezero"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(system.locator('[data-orrery-ring="jezero"]')).toHaveClass(/is-on/);
    await expect(system.locator('.demo.p-jezero')).toBeVisible();
    await expect(system).toBeInViewport();
    expect(new URL(page.url()).hash).toBe('#sistema');
  });

  test('the pills work from the keyboard', async ({ page }) => {
    await page.goto('/en');
    const pill = page.locator('[data-pick-project="orbit"]');
    await pill.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-project-tab="orbit"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('#sistema')).toBeInViewport();
    await expect(pill).toBeFocused();
  });

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
      await expect(page.locator('#por-que .text')).toBeVisible();
    });
  });

  test('each word of the manifesto lights up as it crosses the screen', async ({ page }) => {
    await page.goto('/');
    const word = page.locator('#por-que .w').last();
    expect(Number(await opacity(word))).toBeLessThan(1);
    await word.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(() => opacity(word)).toBe('1');
  });

  test('with reduced motion the manifesto reads whole from the start', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(await opacity(page.locator('#por-que .w').last())).toBe('1');
  });

  test('with SIM paused the manifesto reads whole from the start', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('motion', 'off'));
    await page.goto('/');
    expect(await opacity(page.locator('#por-que .w').last())).toBe('1');
  });

  test('the next stop leads to the manifesto on wide screens only', async ({ page, viewport }) => {
    await page.goto('/');
    const next = page.locator('.hero a[href="#por-que"]');
    if ((viewport?.width ?? 0) > 980) {
      await expect(next).toBeVisible();
      await next.click();
      await expect(page.locator('#por-que')).toBeInViewport();
    } else {
      await expect(next).toBeHidden();
    }
  });
});
