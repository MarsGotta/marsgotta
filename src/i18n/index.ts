import en from './en.json';
import es from './es.json';

export const languages = ['es', 'en'] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = 'es';

export type Messages = typeof es;

const messages: Record<Lang, Messages> = { es, en };

export function getMessages(lang: Lang): Messages {
  return messages[lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}

/** BCP 47 tags for Intl formatting and Open Graph locales. */
export const locales: Record<Lang, string> = { es: 'es-ES', en: 'en-GB' };
