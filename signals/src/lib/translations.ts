import { languages } from '../i18n';
import { pagePath, signalPath, switchPath, type Page } from './routes';
import { topics, type SignalData } from './signal-schema';

type Paired = Pick<SignalData, 'number' | 'lang'>;

/** The same signal in the other language: translations share their number (§3). */
export function translationOf<T extends Paired>(
  signal: Paired,
  signals: readonly T[],
): T | undefined {
  return signals.find((other) => other.number === signal.number && other.lang !== signal.lang);
}

/** The pages of each language besides the signals, as the site map lists them. */
export const listedPages: readonly Page[] = [
  { kind: 'home' },
  ...topics.map((topic) => ({ kind: 'topic', topic }) as const),
  { kind: 'archive' },
];

/**
 * Every page of the blog with the same page in the other language, for the Worker's language on
 * arrival (signals/workers/language.ts). A signal written in one language only has none: a reader
 * who follows a link to it gets that signal, not the other home.
 */
export function translationPaths(
  signals: readonly Pick<SignalData, 'number' | 'lang' | 'slug'>[],
): Record<string, string> {
  const pages: Page[] = [...listedPages, { kind: 'subscribed' }];
  const paths: Record<string, string> = {};
  for (const lang of languages) {
    for (const page of pages) paths[pagePath(page, lang)] = switchPath(page, lang);
  }
  for (const signal of signals) {
    const translation = translationOf(signal, signals);
    if (translation) {
      paths[signalPath(signal.slug, signal.lang)] = signalPath(translation.slug, translation.lang);
    }
  }
  return paths;
}
