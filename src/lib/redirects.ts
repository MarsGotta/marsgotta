import type { Lang } from '../i18n';
import { localizedPath, routeKeys } from '../i18n/routes';

/**
 * Addresses of the previous site (Next.js, Spanish under /es) that may still be linked or indexed.
 * Without a language it sent visitors to Spanish, its default; the Worker then picks theirs. The
 * sitemap's old names under @astrojs/sitemap were already sent to Google and Bing.
 */
const legacy: Record<string, string> = {
  '/es': '/',
  '/es/about': '/sobre-mi',
  '/es/projects': '/proyectos',
  '/es/talks': '/charlas',
  '/es/contact': '/contacto',
  '/es/lab': '/proyectos',
  '/en/lab': '/en/projects',
  '/about': '/sobre-mi',
  '/projects': '/proyectos',
  '/talks': '/charlas',
  '/contact': '/contacto',
  '/lab': '/proyectos',
  '/sitemap-index.xml': '/sitemap.xml',
  '/sitemap-0.xml': '/sitemap.xml',
};

const languages = ['es', 'en'] as const satisfies readonly Lang[];

/**
 * Other spellings of each page: with a trailing slash or as the built file. Static assets would
 * answer them with a temporary 307; a 301 tells search engines which address is the page.
 */
function pageVariants(): Record<string, string> {
  const variants: Record<string, string> = { '/index': '/', '/index.html': '/' };
  for (const route of routeKeys) {
    for (const lang of languages) {
      const path = localizedPath(route, lang);
      if (path === '/') continue;
      variants[`${path}/`] = path;
      variants[`${path}.html`] = path;
    }
  }
  variants['/en/index'] = '/en';
  variants['/en/index.html'] = '/en';
  return variants;
}

const permanentRedirects: Readonly<Record<string, string>> = { ...legacy, ...pageVariants() };

/** Where an old or alternative address of the site lives now, or null if it is not one. */
export function redirectTarget(pathname: string): string | null {
  return permanentRedirects[pathname] ?? null;
}

/**
 * The _redirects file of the static assets, written at build time from the same table that the
 * redirect Worker of the other domains uses, so an old address takes a single hop from anywhere.
 */
export function redirectsFile(): string {
  const lines = Object.entries(permanentRedirects).map(([from, to]) => `${from} ${to} 301`);
  return `${lines.join('\n')}\n`;
}
