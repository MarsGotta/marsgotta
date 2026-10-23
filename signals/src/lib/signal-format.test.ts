import { describe, expect, it } from 'vitest';
import { formatSignalDate, formatSignalNumber } from './signal-format';

describe('formatSignalNumber', () => {
  it('pads the number to three digits', () => {
    expect(formatSignalNumber(7)).toBe('007');
    expect(formatSignalNumber(123)).toBe('123');
  });
});

describe('formatSignalDate', () => {
  it('writes the day as in the prototype, in both languages', () => {
    const date = new Date('2026-10-21');
    expect(formatSignalDate(date, 'es')).toBe('21 oct 2026');
    expect(formatSignalDate(date, 'en')).toBe('Oct 21, 2026');
  });

  it('keeps the calendar day whatever the time zone', () => {
    expect(formatSignalDate(new Date('2026-01-01'), 'es')).toBe('1 ene 2026');
  });
});
