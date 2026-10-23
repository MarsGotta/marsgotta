import type { SignalData } from './signal-schema';

type Paired = Pick<SignalData, 'number' | 'lang'>;

/** The same signal in the other language: translations share their number (§3). */
export function translationOf<T extends Paired>(
  signal: Paired,
  signals: readonly T[],
): T | undefined {
  return signals.find((other) => other.number === signal.number && other.lang !== signal.lang);
}
