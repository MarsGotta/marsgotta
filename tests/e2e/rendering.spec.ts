import { expect, test, type Page } from '@playwright/test';

/** Waits for every animation that ends: the entrances, not the loops or the scroll-driven ones. */
async function entrancesFinished(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.timeline instanceof DocumentTimeline &&
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished),
    ),
  );
}

test.describe('rendering cost', () => {
  for (const route of ['/', '/sobre-mi']) {
    test(`${route} lets go of its entrance animations once they end`, async ({ page }) => {
      await page.goto(route);
      await entrancesFinished(page);
      // An animation still filling forwards keeps its element on its own GPU layer, and the
      // headline words on a blur(0) filter, for as long as the page stays open.
      const lingering = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === 'finished')
          .map((animation) => (animation as CSSAnimation).animationName),
      );
      expect(lingering).toEqual([]);
      for (const word of await page.locator('h1 .w').all()) {
        expect(await word.evaluate((el) => getComputedStyle(el).filter)).toBe('none');
      }
    });
  }

  for (const colorScheme of ['dark', 'light'] as const) {
    test(`nothing needs a backdrop blur or a blend pass on every frame (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      const costly = await page.evaluate(() =>
        [...document.querySelectorAll('*')]
          .filter((el) => {
            const style = getComputedStyle(el);
            return style.backdropFilter !== 'none' || style.mixBlendMode !== 'normal';
          })
          .map((el) => el.className),
      );
      expect(costly).toEqual([]);
    });
  }
});
