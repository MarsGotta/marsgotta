/*
 * Tells the search engines that share IndexNow (Bing, Yandex, Seznam, Naver…) that the site changed,
 * so they crawl it again soon. `npm run deploy` runs it after `wrangler deploy`. It only warns on
 * failure: by then the deploy is already live.
 */
import { readFile } from 'node:fs/promises';
import { indexNowKey } from '../src/content/indexnow.ts';

const site = new URL('https://marcelagotta.com');
const sitemap = await readFile(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');
const urlList = [
  ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]),
  new URL('/llms.txt', site).href,
];

try {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: site.host, key: indexNowKey, urlList }),
  });
  console.log(`IndexNow: ${response.status} ${response.statusText}, ${urlList.length} URLs`);
} catch (error) {
  console.warn('IndexNow could not be reached:', error);
}
