import { describe, expect, it } from 'vitest';
import { solOf } from './sol';

describe('solOf', () => {
  it('gives the sol of Jezero on the day of publication, through the shared Mars clock', () => {
    // The vector in design/signals/LEEME.md §3.
    expect(solOf(new Date('2026-10-21'))).toBe(2015);
  });

  it('depends on the day only, not on the hour the date was written', () => {
    expect(solOf(new Date('2026-10-21T23:59:00Z'))).toBe(solOf(new Date('2026-10-21T00:00:00Z')));
  });
});
