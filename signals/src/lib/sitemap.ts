import { languages } from '../i18n';
import { pagePath, signalPath, translationPath } from './routes';
import { alternates } from './seo';
import type { SignalData } from './signal-schema';
import { listedPages, translationOf } from './translations';

type Listed = Pick<SignalData, 'number' | 'lang' | 'slug' | 'publishedAt'>;

/**
 * The site map: every page that search engines should know, each with its translation as
 * hreflang. Hand-made because the slugs change with the language (/temas/practica and
 * /en/topics/practice), which @astrojs/sitemap cannot pair. The confirmation page stays out.
 */
export function sitemapXml(site: URL, signals: readonly Listed[]): string {
  const pages = languages.flatMap((lang) =>
    listedPages.map((page) => ({
      lang,
      path: pagePath(page, lang),
      translation: translationPath(page, lang),
      lastmod: undefined as Date | undefined,
    })),
  );
  const posts = signals.map((signal) => {
    const translation = translationOf(signal, signals);
    return {
      lang: signal.lang,
      path: signalPath(signal.slug, signal.lang),
      translation: translation && signalPath(translation.slug, translation.lang),
      lastmod: signal.publishedAt,
    };
  });
  const urls = [...pages, ...posts].map(({ lang, path, translation, lastmod }) =>
    [
      '<url>',
      `<loc>${new URL(path, site).href}</loc>`,
      ...(lastmod ? [`<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`] : []),
      ...alternates(site, lang, path, translation).map(
        ({ hreflang, href }) =>
          `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
      ),
      '</url>',
    ].join(''),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
