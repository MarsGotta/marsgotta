// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://marcelagotta.com',
  // Pages build to `sobre-mi.html` and Workers static assets serve them at `/sobre-mi`, without a trailing slash.
  trailingSlash: 'never',
  build: { format: 'file' },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
