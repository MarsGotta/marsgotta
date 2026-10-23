import { getCollection } from 'astro:content';
import type { Lang } from '../i18n';
import { readingMinutes } from '../lib/reading';
import { signalPath } from '../lib/routes';
import { formatSignalDate, formatSignalNumber } from '../lib/signal-format';
import { isPublished, type SignalData } from '../lib/signal-schema';
import { solOf } from '../lib/sol';

/** A signal with everything the pages show about it, computed once at build time (§3). */
export interface Signal extends SignalData {
  id: string;
  href: string;
  numberLabel: string;
  dateLabel: string;
  sol: number;
  minutes: number;
}

/** The published signals, both languages: drafts too while developing, never in the build. */
export async function getSignals(): Promise<Signal[]> {
  const entries = await getCollection('signals', ({ data }) =>
    isPublished(data, import.meta.env.DEV),
  );
  return entries.map(({ id, data, body }) => ({
    ...data,
    id,
    href: signalPath(data.slug, data.lang),
    numberLabel: formatSignalNumber(data.number),
    dateLabel: formatSignalDate(data.publishedAt, data.lang),
    sol: solOf(data.publishedAt),
    minutes: readingMinutes(body ?? ''),
  }));
}

export async function getSignalsIn(lang: Lang): Promise<Signal[]> {
  return (await getSignals()).filter((signal) => signal.lang === lang);
}
