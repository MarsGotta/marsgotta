/*
 * Renders the Open Graph images (1200 × 630, one per language) from the real hero, WebGL planet
 * included, and the 180 × 180 Apple touch icon. Run after `npm run build`: `npm run og`.
 */
import { platform } from 'node:os';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { preview } from 'astro';

const PORT = 4330;
const OUT = new URL('../public/', import.meta.url);

// The hero recomposed for a 1200 × 630 card: headline on the left, planet on the right.
const CARD_CSS = `
  .nav__bar > :not(.brand), .legend, .hero__sub, .hero__ctas, .skip,
  main > :not(.hero), footer { display: none !important; }
  .nav__bg { display: none; }
  .hero { min-height: 630px; height: 630px; }
  .hero__in { padding-top: 64px; }
  .title { font-size: 104px; }
  .sys { --R: 196px !important; left: 724px !important; top: 128px !important; }
`;

const server = await preview({
  root: new URL('..', import.meta.url).pathname,
  server: { port: PORT },
});
// A real GPU on macOS draws the planet as visitors see it; elsewhere the CSS sphere stands in.
const args =
  platform() === 'darwin' ? ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] : [];
const browser = await chromium.launch({ args });

try {
  for (const [lang, path] of [
    ['es', '/'],
    ['en', '/en'],
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      reducedMotion: 'reduce',
      // The card is the dark hero, whatever the system theme of the machine running this.
      colorScheme: 'dark',
    });
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: CARD_CSS });
    await page
      .locator('[data-planet-system][data-gl="on"]')
      .waitFor({ timeout: 5000 })
      .catch(() => console.warn('No hardware WebGL: the card shows the CSS sphere.'));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: new URL(`og/marcela-gotta-${lang}.jpg`, OUT).pathname,
      type: 'jpeg',
      quality: 86,
    });
    await page.close();
  }

  const mark = await readFile(new URL('favicon.svg', OUT), 'utf8');
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await icon.setContent(
    `<body style="margin:0;display:grid;place-items:center;height:180px;background:#0A0614">` +
      `<div style="width:132px;height:132px">${mark.replace('<svg', '<svg width="132" height="132"')}</div></body>`,
  );
  await icon.screenshot({ path: new URL('apple-touch-icon.png', OUT).pathname });
} finally {
  await browser.close();
  await server.stop();
}
