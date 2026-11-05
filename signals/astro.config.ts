import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { contentSecurityPolicyHeader } from '../src/integrations/content-security-policy';
import { codeFigure } from './src/lib/markdown/code-figure';
import { rehypeLinks } from './src/lib/markdown/rehype-links';
import { rehypeTip } from './src/lib/markdown/rehype-tip';
import type { ShikiTheme } from './src/lib/markdown/satteri';
import codeTheme from './src/lib/markdown/signals-code.json';

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
  markdown: {
    // The code theme of the design (design/signals/shiki), with a file bar on every block.
    // The JSON is a VS Code theme, which Shiki reads as is: its literal types need the cast.
    shikiConfig: { theme: codeTheme as ShikiTheme, transformers: [codeFigure()] },
    // Sätteri is Astro's own Markdown processor: Obsidian's tips and the external links.
    processor: satteri({ hastPlugins: [rehypeTip, rehypeLinks] }),
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [contentSecurityPolicyHeader()],
  vite: {
    resolve: { alias: { '@portfolio': portfolio } },
    // The dev server only serves files inside its root unless told otherwise.
    server: { fs: { allow: ['..'] } },
  },
});
