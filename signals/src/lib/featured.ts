import type { Lang } from '../i18n';
import type { SignalData } from './signal-schema';

type Listed = Pick<SignalData, 'number' | 'lang' | 'topic' | 'publishedAt' | 'startHere'>;

/** Newest first; signals of the same day go by number. */
export function byRecency<T extends Listed>(signals: readonly T[]): T[] {
  return [...signals].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime() || b.number - a.number,
  );
}

/** The home's featured signal: the latest one published in that language. */
export function featuredSignal<T extends Listed>(signals: readonly T[], lang: Lang): T | undefined {
  return byRecency(signals.filter((signal) => signal.lang === lang))[0];
}

/**
 * «Siguientes señales» at the end of an article: the two latest of its topic, topped up with the
 * latest of any topic when the topic has fewer than two others.
 */
export function nextSignals<T extends Listed>(current: Listed, signals: readonly T[]): T[] {
  const others = byRecency(
    signals.filter((signal) => signal.lang === current.lang && signal.number !== current.number),
  );
  const sameTopic = others.filter((signal) => signal.topic === current.topic);
  const rest = others.filter((signal) => signal.topic !== current.topic);
  return [...sameTopic, ...rest].slice(0, 2);
}

/** «Empieza por aquí»: the signals Mars picked, in her order. */
export function startHere<T extends Listed>(signals: readonly T[], lang: Lang): T[] {
  return signals
    .filter((signal) => signal.lang === lang && signal.startHere !== undefined)
    .sort((a, b) => (a.startHere ?? 0) - (b.startHere ?? 0));
}
