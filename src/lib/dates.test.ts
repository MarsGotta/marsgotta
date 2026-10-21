import { describe, expect, it } from 'vitest';
import { formatShortDate } from './dates';

describe('formatShortDate', () => {
  it('matches the prototype in both languages', () => {
    expect(formatShortDate('2026-10-21', 'es')).toBe('21 oct 2026');
    expect(formatShortDate('2026-10-21', 'en')).toBe('21 Oct 2026');
  });

  it('does not shift the day across time zones', () => {
    expect(formatShortDate('2026-01-01', 'es')).toBe('1 ene 2026');
  });
});
