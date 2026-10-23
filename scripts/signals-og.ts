/*
 * Draws the Open Graph cards of Signals (1200 × 630) into signals/dist/og/, after the build: one per
 * signal, with its cover, topic, number and title, and one per language for the other pages. Each
 * card is put together from its own built page, so it shows what the page shows. Runs inside
 * `npm run signals:build`; it finds which cards to draw in the og:image of every page.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { chromium } from '@playwright/test';
import { preview } from 'astro';
import { ogCards } from './signals-og-cards.ts';

const PORT = 4331;
const ROOT = new URL('../signals/', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');

// The article card: text on the left, the cover on the right, on the light theme («papel»).
// The home card: the masthead's headline over the night of the newsletter band.
const CARD_CSS = `
  body > :not(.og) { display: none !important; }
  .og { position: fixed; inset: 0; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) 470px;
    gap: 56px; padding: 56px 60px; background: var(--bg); color: var(--ink); }
  .og-text { display: flex; flex-direction: column; min-width: 0; }
  .og-brand { display: flex; align-items: center; gap: 12px; }
  .og-brand svg { width: 34px; height: 34px; color: var(--accent); }
  .og-word { font: 600 32px/1 var(--serif); letter-spacing: -0.02em; font-variation-settings: 'opsz' 48; }
  .og-by { font: 500 12px/1 var(--mono); letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); }
  .og-meta { display: flex; gap: 18px; margin-top: auto; font: 500 15px/1 var(--mono); letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--muted); }
  .og-topic { display: inline-flex; align-items: center; gap: 9px; color: var(--tc); }
  .og-topic::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: currentColor; }
  .og-title { margin: 22px 0 0; font: 600 var(--size, 58px)/1.06 var(--serif); letter-spacing: -0.03em;
    font-variation-settings: 'opsz' 60; text-wrap: balance; }
  .og-url { margin-top: 30px; font: 500 15px/1 var(--mono); color: var(--muted); }
  .og-cover { overflow: hidden; border-radius: 18px; background: #1c1418; }
  .og-cover svg { display: block; width: 100%; height: 100%; }
  .og.night { grid-template-columns: 1fr; overflow: hidden; isolation: isolate; background: #120b12; color: #f5ece6; }
  .og.night .og-title { margin-top: auto; font: 500 112px/0.92 var(--serif); letter-spacing: -0.045em; font-variation-settings: 'opsz' 72; }
  .og.night .og-title em { display: block; font-style: italic; font-weight: 400; color: #ff9a6e; }
  .og.night .og-url { color: #b3a39a; }
  .og.night .og-brand svg, .og.night .og-by { color: #ff7f4a; }
  .og-limb { position: absolute; z-index: -1; right: -420px; bottom: -980px; width: 1400px; height: 1400px; border-radius: 50%;
    background: radial-gradient(circle at 50% 8%, #3c1420 0%, #24101e 30%, #160b16 60%);
    box-shadow: 0 -1px 0 rgba(255, 127, 74, 0.7), 0 -10px 40px rgba(233, 96, 58, 0.25), 0 -60px 160px rgba(209, 23, 114, 0.14); }
`;

/** Every built page, as the path it is served at. */
async function builtPages(dir: string): Promise<{ path: string; html: string }[]> {
  const entries = await readdir(dir, { recursive: true });
  const pages = entries.filter((entry) => entry.endsWith('.html'));
  return Promise.all(
    pages.map(async (file) => ({
      path: `/${relative('.', file)
        .replace(/\.html$/, '')
        .replace(/(^|\/)index$/, '')}`,
      html: await readFile(join(dir, file), 'utf8'),
    })),
  );
}

const cards = ogCards(await builtPages(DIST));
const server = await preview({ root: ROOT, server: { port: PORT } });
const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  for (const card of cards) {
    await page.goto(`http://localhost:${PORT}${card.from}`, { waitUntil: 'networkidle' });
    // Built from DOM nodes: titles are text, and the cover and the logo are the page's own SVG.
    await page.evaluate((night) => {
      const el = (tag: string, className: string, text?: string) => {
        const node = document.createElement(tag);
        node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
      };
      const glyph = document.querySelector('#signals-glyph');
      const mark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mark.setAttribute('viewBox', glyph?.getAttribute('viewBox') ?? '0 0 24 24');
      mark.append(...Array.from(glyph?.children ?? [], (child) => child.cloneNode(true)));
      const brand = el('p', 'og-brand');
      brand.append(mark, el('span', 'og-word', 'Signals'), el('span', 'og-by', 'by Mars'));
      const text = el('div', 'og-text');
      const card = el('div', 'og');

      if (night) {
        const headline = el('h1', 'og-title');
        const source = document.querySelector('#home-title');
        headline.append(...Array.from(source?.childNodes ?? [], (node) => node.cloneNode(true)));
        text.append(brand, headline, el('p', 'og-url', 'signals.marsgotta.com'));
        card.classList.add('night');
        card.append(el('i', 'og-limb'), text);
      } else {
        const topic = document.querySelector('.meta-top .topic');
        const title = document.querySelector('#article-title')?.textContent?.trim() ?? '';
        const meta = el('p', 'og-meta');
        meta.append(
          el('span', 'og-topic', topic?.textContent?.trim() ?? ''),
          el('span', '', document.querySelector('.meta-top span')?.textContent ?? ''),
        );
        text.append(
          brand,
          meta,
          el('h1', 'og-title', title),
          el('p', 'og-url', 'signals.marsgotta.com'),
        );
        const cover = el('div', 'og-cover');
        const svg = document.querySelector('.figure .cover svg');
        if (svg) cover.append(svg.cloneNode(true));
        const topicClass = Array.from(topic?.classList ?? []).find((name) => name.startsWith('t-'));
        if (topicClass) card.classList.add(topicClass);
        // Long titles step down a size so they never run past five lines.
        card.style.setProperty('--size', title.length > 70 ? '48px' : '58px');
        card.append(text, cover);
      }
      document.body.append(card);
    }, card.night);
    await page.addStyleTag({ content: CARD_CSS });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(DIST, card.image), type: 'jpeg', quality: 86 });
  }
  console.log(`Drew ${cards.length} Open Graph cards.`);
} finally {
  await browser.close();
  await server.stop();
}
