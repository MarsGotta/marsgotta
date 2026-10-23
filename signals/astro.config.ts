import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

/** The portfolio's src/, shared without copying: the Mars clock, motion, language negotiation. */
const portfolio = fileURLToPath(new URL('../src', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://signals.marsgotta.com',
  // Pages build to `archivo.html` and Workers static assets serve them at `/archivo`, as in the portfolio.
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
  vite: {
    resolve: { alias: { '@portfolio': portfolio } },
    // The dev server only serves files inside its root unless told otherwise.
    server: { fs: { allow: ['..'] } },
  },
});
