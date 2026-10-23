import { getMessages, locales, type Lang } from '../i18n';
import { homePath, signalPath } from './routes';
import type { SignalData } from './signal-schema';

export const BLOG_NAME = 'Signals by Mars';

/**
 * Mars, with the @id of her Person on the portfolio (src/lib/seo.ts): search engines join the blog's
 * posts to the profile they already know.
 */
export const author = {
  '@type': 'Person',
  '@id': 'https://marcelagotta.com/#person',
  name: 'Marcela Gotta',
  alternateName: 'Mars',
  url: 'https://marcelagotta.com/',
} as const;

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * hreflang links between a page and its translation, plus x-default on the Spanish one. A page
 * without a translation gets none: hreflang only pairs real translations (§7).
 */
export function alternates(
  site: URL,
  lang: Lang,
  path: string,
  translation: string | undefined,
): Alternate[] {
  if (!translation) return [];
  const es = new URL(lang === 'es' ? path : translation, site).href;
  const en = new URL(lang === 'en' ? path : translation, site).href;
  return [
    { hreflang: 'es', href: es },
    { hreflang: 'en', href: en },
    { hreflang: 'x-default', href: es },
  ];
}

/** Open Graph locale, such as es_ES. */
export function ogLocale(lang: Lang): string {
  return locales[lang].replace('-', '_');
}

/** The card for social networks: one per signal, one per language for the other pages. */
export function ogImagePath(lang: Lang, slug?: string): string {
  return slug ? `/og/${lang}/${slug}.jpg` : `/og/signals-${lang}.jpg`;
}

type Posting = Pick<
  SignalData,
  'slug' | 'lang' | 'title' | 'deck' | 'publishedAt' | 'topic' | 'tags'
>;

function blogId(site: URL, lang: Lang): string {
  return `${new URL(homePath(lang), site).href}#blog`;
}

/** schema.org Blog for each language's home. */
export function blogData(site: URL, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': blogId(site, lang),
    url: new URL(homePath(lang), site).href,
    name: BLOG_NAME,
    description: getMessages(lang).home.sub,
    inLanguage: lang,
    author,
    publisher: author,
  };
}

/** schema.org BlogPosting for a signal, part of the Blog of its language. */
export function postingData(site: URL, signal: Posting) {
  const url = new URL(signalPath(signal.slug, signal.lang), site).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    url,
    mainEntityOfPage: url,
    headline: signal.title,
    description: signal.deck,
    datePublished: signal.publishedAt.toISOString().slice(0, 10),
    inLanguage: signal.lang,
    image: new URL(ogImagePath(signal.lang, signal.slug), site).href,
    articleSection: getMessages(signal.lang).topics[signal.topic],
    keywords: signal.tags,
    author,
    publisher: author,
    isPartOf: { '@id': blogId(site, signal.lang) },
  };
}

/**
 * JSON for a <script type="application/ld+json">: a title that mentions «</script>» must not close
 * the element early.
 */
export function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
