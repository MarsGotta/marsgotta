import { describe, expect, it } from 'vitest';
import { hohmannPath, transferPoints } from './hohmann';

describe('hohmannPath', () => {
  it('reproduces the home trajectory of the prototype', () => {
    expect(hohmannPath(280, 190, [56, 112, 180])).toBe(
      'M224 190 A84 79.2 0 0 1 392 190 A146 141.99 0 0 1 100 190',
    );
  });

  it('reproduces the about trajectory of the prototype', () => {
    expect(hohmannPath(320, 320, [44, 84, 128, 176, 228, 284])).toBe(
      'M276 320 A64 60.79 0 0 1 404 320 A106 103.69 0 0 1 192 320 A152 150.09 0 0 1 496 320 A202 200.32 0 0 1 92 320 A256 254.46 0 0 1 604 320',
    );
  });

  it('alternates sides of the sun', () => {
    expect(transferPoints(0, 0, [1, 2, 3]).map((point) => point.x)).toEqual([-1, 2, -3]);
  });
});
