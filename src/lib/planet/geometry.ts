import { CAMERA_TILT_DEG, SUN_AZIMUTH_DEG } from '../mars-clock';

const DEG = Math.PI / 180;

export interface ScreenPoint {
  /** Horizontal position on the disc, from −1 (left edge) to 1 (right edge). */
  x: number;
  /** Vertical position on the disc, from −1 (bottom) to 1 (top). */
  y: number;
  /** Towards the camera: the point is on the visible hemisphere when depth > 0. */
  depth: number;
}

/**
 * Projects a point of the surface onto the disc seen by the camera, which sits CAMERA_TILT_DEG
 * above the equator. `longitudeFromCenter` is measured east of the meridian facing the camera.
 */
export function projectSurfacePoint(latitude: number, longitudeFromCenter: number): ScreenPoint {
  const lambda = longitudeFromCenter * DEG;
  const phi = latitude * DEG;
  const tilt = CAMERA_TILT_DEG * DEG;
  const px = Math.cos(phi) * Math.sin(lambda);
  const py = Math.sin(phi);
  const pz = Math.cos(phi) * Math.cos(lambda);
  return {
    x: px,
    y: py * Math.cos(tilt) - pz * Math.sin(tilt),
    depth: py * Math.sin(tilt) + pz * Math.cos(tilt),
  };
}

/**
 * Local mean solar time, in hours, at `longitude` (degrees east) while the meridian `centralLongitude`
 * faces the camera and the sun shines from SUN_AZIMUTH_DEG. The planet starts with the real subsolar
 * longitude, so at page load this equals the real LMST from marsClock.
 */
export function simulatedLocalTime(
  longitude: number,
  centralLongitude: number,
  equationOfTime: number,
): number {
  const subsolarLongitude = centralLongitude + SUN_AZIMUTH_DEG;
  const hours = 12 + (longitude - subsolarLongitude) / 15 - equationOfTime / 15;
  return ((hours % 24) + 24) % 24;
}
