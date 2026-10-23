import { describe, expect, it } from 'vitest';
import { earthMarsLightTime, formatLightTime } from './light-time';

const millionKm = (iso: string) => earthMarsLightTime(Date.parse(`${iso}T00:00:00Z`)).km / 1e6;

describe('earthMarsLightTime', () => {
  it('matches the vectors of the model, within 0.1 million km', () => {
    // Real references: closest approaches of 12 Jan 2025 and 20 Feb 2027, conjunction of 9 Jan 2026.
    expect(millionKm('2025-01-12')).toBeCloseTo(96.1, 0);
    expect(Math.abs(millionKm('2025-01-12') - 96.1)).toBeLessThan(0.1);
    expect(Math.abs(millionKm('2026-01-09') - 359.6)).toBeLessThan(0.1);
    expect(Math.abs(millionKm('2026-10-21') - 227.3)).toBeLessThan(0.1);
    expect(Math.abs(millionKm('2027-02-19') - 101.4)).toBeLessThan(0.1);
  });

  it('divides the distance by the speed of light', () => {
    const { seconds } = earthMarsLightTime(Date.parse('2026-10-21T00:00:00Z'));
    expect(Math.round(seconds)).toBe(758);
  });
});

describe('formatLightTime', () => {
  it('shows whole minutes and seconds', () => {
    expect(formatLightTime(749.6)).toBe('12 min 29 s');
    expect(formatLightTime(59)).toBe('0 min 59 s');
  });
});
