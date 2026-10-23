import { getMessages, type Lang } from '../i18n';

/** «Señal 007»: three digits, as on the prototype's QSL-style labels. */
export function formatSignalNumber(signalNumber: number): string {
  return String(signalNumber).padStart(3, '0');
}

/** «21 oct 2026» / "Oct 21, 2026", with the month names of the blog's copy. Dates are calendar days. */
export function formatSignalDate(date: Date, lang: Lang): string {
  const month = getMessages(lang).months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return lang === 'en' ? `${month} ${day}, ${year}` : `${day} ${month} ${year}`;
}
