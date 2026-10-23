import { describe, expect, it } from 'vitest';
import { HOME_FEED_SIZE, homeFeed, topicCounts } from './feed';
import type { SignalData } from './signal-schema';

const topicsInTurn: SignalData['topic'][] = ['ia', 'practica', 'tutorial'];
const signals = Array.from({ length: 14 }, (_, index) => ({
  number: index + 1,
  lang: 'es' as const,
  topic: topicsInTurn[index % 3] ?? 'ia',
  publishedAt: new Date(Date.UTC(2026, 0, index + 1)),
}));

describe('homeFeed', () => {
  it('lists the latest ten under the featured signal', () => {
    const feed = homeFeed(signals, 'es').map((signal) => signal.number);
    expect(feed).toHaveLength(HOME_FEED_SIZE);
    expect(feed[0]).toBe(13);
    expect(feed).not.toContain(14);
  });

  it('only lists the signals of that language', () => {
    expect(homeFeed(signals, 'en')).toEqual([]);
  });
});

describe('topicCounts', () => {
  it('counts the signals of each topic in that language', () => {
    expect(topicCounts(signals, 'es')).toEqual({ ia: 5, practica: 5, tutorial: 4 });
    expect(topicCounts(signals, 'en')).toEqual({ ia: 0, practica: 0, tutorial: 0 });
  });
});
