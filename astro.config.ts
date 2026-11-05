import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import { redirectsFile } from './src/lib/redirects';

const site = new URL('https://marsgotta.com');

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
    {
      // _redirects comes from the table the redirect Worker uses too (src/lib/redirects.ts).
      name: 'redirects',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await writeFile(new URL('_redirects', dir), redirectsFile());
        },
      },
    },
  ],
});
