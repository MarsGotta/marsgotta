import { getCollection, type CollectionEntry } from 'astro:content';
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

/** The published entries, both languages: drafts too while developing, never in the build. */
async function publishedEntries(): Promise<CollectionEntry<'signals'>[]> {
  return getCollection('signals', ({ data }) => isPublished(data, import.meta.env.DEV));
}

function toSignal({ id, data, body }: CollectionEntry<'signals'>): Signal {
  return {
    ...data,
    id,
    href: signalPath(data.slug, data.lang),
    numberLabel: formatSignalNumber(data.number),
    dateLabel: formatSignalDate(data.publishedAt, data.lang),
    sol: solOf(data.publishedAt),
    minutes: readingMinutes(body ?? ''),
  };
}

export async function getSignals(): Promise<Signal[]> {
  return (await publishedEntries()).map(toSignal);
}

export async function getSignalsIn(lang: Lang): Promise<Signal[]> {
  return (await getSignals()).filter((signal) => signal.lang === lang);
}

/** Each signal of a language with its entry, which the article page renders. */
export async function getArticles(
  lang: Lang,
): Promise<{ signal: Signal; entry: CollectionEntry<'signals'> }[]> {
  return (await publishedEntries())
    .filter((entry) => entry.data.lang === lang)
    .map((entry) => ({ signal: toSignal(entry), entry }));
}
