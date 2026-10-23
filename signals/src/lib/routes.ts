import type { Lang } from '../i18n';
import type { topics } from './signal-schema';

export type Topic = (typeof topics)[number];

/** The pages of the blog (design/signals/LEEME.md §2). */
export type Page =
  | { kind: 'home' }
  | { kind: 'topic'; topic: Topic }
  | { kind: 'archive' }
  | { kind: 'signal'; slug: string };

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
  }
}

/**
 * Where the ES/EN switch leads: the same page in the other language. A signal leads to its
 * translation, or to the other home when it has none (§1).
 */
export function switchPath(page: Page, lang: Lang, translationSlug?: string): string {
  const other: Lang = lang === 'es' ? 'en' : 'es';
  if (page.kind !== 'signal') return pagePath(page, other);
  return translationSlug ? signalPath(translationSlug, other) : homePath(other);
}
