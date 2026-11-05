import type { Lang } from '../i18n';
import type { topics } from './signal-schema';

export type Topic = (typeof topics)[number];

/** The pages of the blog (design/signals/LEEME.md §2). */
export type Page =
  | { kind: 'home' }
  | { kind: 'topic'; topic: Topic }
  | { kind: 'archive' }
  | { kind: 'signal'; slug: string }
  | { kind: 'subscribed' };

const topicSlugs: Record<Topic, Record<Lang, string>> = {
  ia: { es: 'noticias-ia', en: 'ai-news' },
  practica: { es: 'practica', en: 'practice' },
  tutorial: { es: 'tutoriales', en: 'tutorials' },
};

export function topicSlug(topic: Topic, lang: Lang): string {
  return topicSlugs[topic][lang];
}

export function homePath(lang: Lang): string {
  return lang === 'en' ? '/en' : '/';
}

/** Marcela's portfolio, in the reader's language. */
export function portfolioUrl(lang: Lang): string {
  return new URL(homePath(lang), 'https://marsgotta.com').href;
}

export function topicPath(topic: Topic, lang: Lang): string {
  return lang === 'en'
    ? `/en/topics/${topicSlug(topic, 'en')}`
    : `/temas/${topicSlug(topic, 'es')}`;
}

export function archivePath(lang: Lang): string {
  return lang === 'en' ? '/en/archive' : '/archivo';
}

export function signalPath(slug: string, lang: Lang): string {
  return lang === 'en' ? `/en/${slug}` : `/${slug}`;
}

/** Where Buttondown sends a reader who has just confirmed the subscription. */
export function subscribedPath(lang: Lang): string {
  return lang === 'en' ? '/en/subscription/confirmed' : '/suscripcion/confirmada';
}

export function rssPath(lang: Lang): string {
  return lang === 'en' ? '/en/rss.xml' : '/rss.xml';
}

export function pagePath(page: Page, lang: Lang): string {
  switch (page.kind) {
    case 'home':
      return homePath(lang);
    case 'topic':
      return topicPath(page.topic, lang);
    case 'archive':
      return archivePath(lang);
    case 'signal':
      return signalPath(page.slug, lang);
    case 'subscribed':
      return subscribedPath(lang);
  }
}

/** The language of a path on the blog: English under /en, Spanish everywhere else. */
export function pathLang(path: string): Lang {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'es';
}

/**
 * The same page in the other language. Every page has one but a signal written in one language
 * only (§1).
 */
export function translationPath(
  page: Page,
  lang: Lang,
  translationSlug?: string,
): string | undefined {
  const other: Lang = lang === 'es' ? 'en' : 'es';
  if (page.kind !== 'signal') return pagePath(page, other);
  return translationSlug ? signalPath(translationSlug, other) : undefined;
}

/**
 * Where the ES/EN switch leads: the translation, or the other home when there is none, as on a
 * single-language signal or the 404 (no page).
 */
export function switchPath(page: Page | null, lang: Lang, translationSlug?: string): string {
  return (
    (page && translationPath(page, lang, translationSlug)) ?? homePath(lang === 'es' ? 'en' : 'es')
  );
}
