import { locales, type Lang } from '../i18n';

/** A calendar date such as `2026-10-21`, formatted as "21 oct 2026" or "21 Oct 2026". */
export function formatShortDate(isoDate: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locales[lang], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
