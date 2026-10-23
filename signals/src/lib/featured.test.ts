import { describe, expect, it } from 'vitest';
import { featuredSignal, nextSignals, startHere } from './featured';
import type { SignalData } from './signal-schema';

type Listed = Pick<SignalData, 'number' | 'lang' | 'topic' | 'publishedAt' | 'startHere'>;

const signal = (
  number: number,
  topic: SignalData['topic'],
  day: string,
  extra: Partial<Listed> = {},
): Listed => ({ number, lang: 'es', topic, publishedAt: new Date(day), ...extra });

const signals = [
  signal(3, 'tutorial', '2026-09-23', { startHere: 1 }),
  signal(4, 'practica', '2026-09-30', { startHere: 2 }),
  signal(5, 'ia', '2026-10-07'),
  signal(6, 'practica', '2026-10-14', { startHere: 3 }),
  signal(7, 'tutorial', '2026-10-21'),
  signal(8, 'ia', '2026-10-28', { lang: 'en' }),
];

/** One of the sample signals, by number. */
function pick(number: number): Listed {
  const found = signals.find((s) => s.number === number);
  if (!found) throw new Error(`No sample signal ${number}`);
  return found;
}

describe('featuredSignal', () => {
  it('is the latest signal in that language', () => {
    expect(featuredSignal(signals, 'es')?.number).toBe(7);
    expect(featuredSignal(signals, 'en')?.number).toBe(8);
  });

  it('is undefined when nothing is published yet', () => {
    expect(featuredSignal([], 'es')).toBeUndefined();
  });
});

describe('nextSignals', () => {
  it('suggests the two latest of the same topic', () => {
    expect(nextSignals(pick(6), signals).map((s) => s.number)).toEqual([4, 7]);
  });

  it('tops up with the latest of any topic when the topic runs short', () => {
    expect(nextSignals(pick(7), signals).map((s) => s.number)).toEqual([3, 6]);
  });

  it('stays in the same language and never suggests the current signal', () => {
    const next = nextSignals(pick(5), signals).map((s) => s.number);
    expect(next).not.toContain(5);
    expect(next).not.toContain(8);
  });
});

describe('startHere', () => {
  it('keeps the order Mars picked', () => {
    expect(startHere(signals, 'es').map((s) => s.number)).toEqual([3, 4, 6]);
  });
});
