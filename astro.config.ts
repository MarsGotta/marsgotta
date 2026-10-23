import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { languages } from './src/i18n/index.ts';
import { routeKeys } from './src/i18n/routes.ts';
import { alternates, pageUrl } from './src/lib/seo.ts';

const site = new URL('https://marsgotta.com');

/** Each page with its translations, for the hreflang links in the sitemap. */
const translations = new Map(
  routeKeys.flatMap((route) =>
    languages.map((lang) => [
      pageUrl(site, route, lang),
      alternates(site, route).map(({ hreflang, href }) => ({ lang: hreflang, url: href })),
    ]),
  ),
);

// https://astro.build/config
export default defineConfig({
  site: site.href,
  // Pages build to `sobre-mi.html` and Workers static assets serve them at `/sobre-mi`, without a trailing slash.
  trailingSlash: 'never',
  build: {
    format: 'file',
    // Inline CSS saves the render-blocking round trips that delay the headline (the LCP) on mobile.
    inlineStylesheets: 'always',
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // Only the pages of the site map: the 404 pages stay out, the English one included.
      filter: (page) => translations.has(page),
      serialize: (item) => ({ ...item, links: translations.get(item.url) }),
    }),
  ],
});
