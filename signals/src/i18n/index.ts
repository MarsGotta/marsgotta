import type { Lang } from '@portfolio/i18n';
import en from './en.json';
import es from './es.json';

export { languages, locales, type Lang } from '@portfolio/i18n';

export type Messages = typeof es;

const messages: Record<Lang, Messages> = { es, en };

/** The blog's own copy, from design/signals/messages: the portfolio's copy stays apart. */
export function getMessages(lang: Lang): Messages {
  return messages[lang];
}
