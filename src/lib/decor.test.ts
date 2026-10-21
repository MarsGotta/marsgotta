import { describe, expect, it } from 'vitest';
import { seededRandom, starField, starFields, waveform } from './decor';

describe('seededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = seededRandom(11);
    const b = seededRandom(11);
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
    for (const value of first) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('starField', () => {
  it('matches the prototype output for its first star', () => {
    // First value of mgField(11, 380, 0, 0, 0.22, 0.7) in design/v3/extracted/logic.js.
    const random = seededRandom(11);
    const x = Math.round(random() * 2600);
    const y = Math.round(random() * 1300);
    expect(starFields.far.startsWith(`${x}px ${y}px 0px 0px rgba(`)).toBe(true);
  });

  it('produces one shadow per star', () => {
    expect(starFields.far.split('rgba').length - 1).toBe(380);
    expect(starFields.mid.split('rgba').length - 1).toBe(150);
    expect(starFields.near.split('rgba').length - 1).toBe(46);
    expect(
      starField({ seed: 1, count: 3, spread: 0, blur: 0, minAlpha: 0, maxAlpha: 1 }).split('rgba'),
    ).toHaveLength(4);
  });
});

describe('waveform', () => {
  it('keeps bars between 18 and 80 px with negative delays', () => {
    const bars = waveform();
    expect(bars).toHaveLength(40);
    for (const bar of bars) {
      const height = Number.parseInt(bar.height, 10);
      expect(height).toBeGreaterThanOrEqual(18);
      expect(height).toBeLessThanOrEqual(80);
      expect(Number.parseFloat(bar.delay)).toBeLessThanOrEqual(0);
    }
  });
});
