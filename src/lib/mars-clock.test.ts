import { describe, expect, it } from 'vitest';
import { formatHoursMinutes, madridTime, marsClock } from './mars-clock';

// Perseverance touched down at 20:43:49 UTC spacecraft event time; Earth heard it 11 minutes later.
const LANDING = Date.UTC(2021, 1, 18, 20, 43, 49);

describe('marsClock', () => {
  it('puts Perseverance sol 1000 on 13 December 2023', () => {
    expect(marsClock(Date.UTC(2023, 11, 13, 0, 0)).sol).toBe(1000);
    expect(marsClock(Date.UTC(2023, 11, 13, 12, 0)).sol).toBe(1000);
  });

  it('gives the landing local mean solar time at Jezero: 15:53 on sol 0', () => {
    const clock = marsClock(LANDING);
    expect(clock.sol).toBe(0);
    expect(formatHoursMinutes(clock.lmst)).toBe('15:53');
  });

  it('keeps angles in range', () => {
    const clock = marsClock(Date.UTC(2026, 9, 21, 21, 0));
    expect(clock.ls).toBeGreaterThanOrEqual(0);
    expect(clock.ls).toBeLessThan(360);
    expect(clock.subLonE).toBeGreaterThanOrEqual(0);
    expect(clock.subLonE).toBeLessThan(360);
    // The subsolar latitude never exceeds Mars' axial tilt (25.19°).
    expect(Math.abs(clock.subLat)).toBeLessThan(25.5);
  });

  it('advances one sol every 24 h 39 min 35 s', () => {
    const solMs = 88775244;
    expect(marsClock(LANDING + solMs).sol).toBe(1);
    expect(marsClock(LANDING + solMs).lmst).toBeCloseTo(marsClock(LANDING).lmst, 3);
  });
});

describe('formatHoursMinutes', () => {
  it('pads and truncates', () => {
    expect(formatHoursMinutes(7.999)).toBe('07:59');
    expect(formatHoursMinutes(15.8906)).toBe('15:53');
  });
});

describe('madridTime', () => {
  it('follows Madrid summer and winter time', () => {
    expect(madridTime(Date.UTC(2026, 6, 1, 10, 5, 9))).toBe('12:05:09');
    expect(madridTime(Date.UTC(2026, 0, 1, 10, 5, 9))).toBe('11:05:09');
  });
});
