import { describe, expect, it } from 'vitest';
import { formatHoursMinutes, JEZERO, marsClock, SUN_AZIMUTH_DEG } from '../mars-clock';
import { projectSurfacePoint, simulatedLocalTime } from './geometry';

describe('projectSurfacePoint', () => {
  it('shows the equator below the centre, because the camera is 13° above it', () => {
    const point = projectSurfacePoint(0, 0);
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(-Math.sin((13 * Math.PI) / 180));
    expect(point.depth).toBeGreaterThan(0);
  });

  it('tilts the north pole towards the viewer', () => {
    expect(projectSurfacePoint(90, 0).depth).toBeGreaterThan(0);
    expect(projectSurfacePoint(-90, 0).depth).toBeLessThan(0);
  });

  it('hides the far side', () => {
    expect(projectSurfacePoint(JEZERO.lat, 180).depth).toBeLessThan(0);
    expect(projectSurfacePoint(0, 90).x).toBeCloseTo(1);
  });
});

describe('simulatedLocalTime', () => {
  it('matches the real LMST at Jezero when the planet starts', () => {
    for (const ms of [Date.UTC(2021, 1, 18, 20, 43, 49), Date.UTC(2026, 9, 21, 21, 30)]) {
      const clock = marsClock(ms);
      const startingCentre = clock.subLonE - SUN_AZIMUTH_DEG;
      const simulated = simulatedLocalTime(JEZERO.lon, startingCentre, clock.eot);
      expect(formatHoursMinutes(simulated)).toBe(formatHoursMinutes(clock.lmst));
    }
  });

  it('is noon under the sun, before the equation of time', () => {
    expect(simulatedLocalTime(100, 100 - SUN_AZIMUTH_DEG, 0)).toBeCloseTo(12);
  });
});
