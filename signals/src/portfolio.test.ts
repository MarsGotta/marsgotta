import { marsClock } from '@portfolio/lib/mars-clock';
import { describe, expect, it } from 'vitest';

describe('code shared with the portfolio', () => {
  it('gives the sol of a signal published on 21 Oct 2026', () => {
    // The vector in design/signals/LEEME.md §3: the sol of Jezero at 10:00 UTC on the day.
    expect(marsClock(Date.parse('2026-10-21T10:00:00Z')).sol).toBe(2015);
  });
});
