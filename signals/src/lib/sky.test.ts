import { describe, expect, it } from 'vitest';
import { jezeroTime, lightTimeText } from './sky';

const october21 = Date.parse('2026-10-21T00:00:00Z');

describe('lightTimeText', () => {
  it('writes the distance with the decimal mark of each language', () => {
    expect(lightTimeText(october21, 'es').distance).toBe('227,3');
    expect(lightTimeText(october21, 'en').distance).toBe('227.3');
  });

  it('gives the light time in minutes and seconds', () => {
    expect(lightTimeText(october21, 'es').time).toBe('12 min 38 s');
  });
});

describe('jezeroTime', () => {
  it('reads the sol and the local mean solar time from the shared Mars clock', () => {
    expect(jezeroTime(Date.parse('2026-10-21T10:00:00Z')).sol).toBe('2015');
    expect(jezeroTime(october21).lmst).toMatch(/^\d{2}:\d{2}$/);
  });
});
