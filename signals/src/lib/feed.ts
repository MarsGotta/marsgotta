import type { Lang } from '../i18n';
import { byRecency, featuredSignal } from './featured';
import type { Topic } from './routes';
import { topics, type SignalData } from './signal-schema';

/** The home lists the latest ten under the featured one; the rest are in the archive. */
export const HOME_FEED_SIZE = 10;

type Listed = Pick<SignalData, 'number' | 'lang' | 'topic' | 'publishedAt' | 'startHere'>;

export function homeFeed<T extends Listed>(signals: readonly T[], lang: Lang): T[] {
  const featured = featuredSignal(signals, lang);
  return byRecency(
    signals.filter((signal) => signal.lang === lang && signal.number !== featured?.number),
  ).slice(0, HOME_FEED_SIZE);
}

/** How many signals each topic has in that language, for the topic chips. */
export function topicCounts(signals: readonly Listed[], lang: Lang): Record<Topic, number> {
  const inLang = signals.filter((signal) => signal.lang === lang);
  return Object.fromEntries(
    topics.map((topic) => [topic, inLang.filter((signal) => signal.topic === topic).length]),
  ) as Record<Topic, number>;
}
