/* Mars24 sunclock (Allison and McEwen 2000; NASA GISS), ported unchanged from the prototype's mgMarsClock.
   These values are real: do not round them for looks. */

/** Perseverance landing site in Jezero crater, in degrees north and east. */
export const JEZERO = { lat: 18.4447, lon: 77.4508 } as const;

/** Mars sidereal rotation in hours. On screen, 1 h of Mars lasts 1 s (×3600). */
export const MARS_ROTATION_HOURS = 24.6229;

/** Sun azimuth relative to the meridian that faces the camera, in degrees (west is negative). */
export const SUN_AZIMUTH_DEG = -50;

/** Camera elevation above Mars' equator, in degrees: orbit ellipses have ry/rx = sin 13° = 0.225. */
export const CAMERA_TILT_DEG = 13;

/** Perseverance mission sol 0 is Mars Sol Date 52304 at Jezero (18 February 2021). */
const MISSION_SOL_OFFSET = 52304;

export interface MarsClock {
  /** Mars Sol Date. */
  msd: number;
  /** Areocentric solar longitude (season), in degrees. */
  ls: number;
  /** Equation of time, in degrees. */
  eot: number;
  /** Subsolar longitude, in degrees east. */
  subLonE: number;
  /** Subsolar latitude, in degrees north. */
  subLat: number;
  /** Local mean solar time at Jezero, in hours. */
  lmst: number;
  /** Perseverance mission sol. */
  sol: number;
}

const DEG = Math.PI / 180;
// Perturbations by the other planets: amplitude, period (Julian years) and phase (degrees).
const PERTURBATIONS = [
  [0.0071, 2.2353, 49.409],
  [0.0057, 2.7543, 168.173],
  [0.0039, 1.1177, 191.837],
  [0.0037, 15.7866, 21.736],
  [0.0021, 2.1354, 15.704],
  [0.002, 2.4694, 95.528],
  [0.0018, 32.8493, 49.095],
] as const;

function mod(value: number, base: number): number {
  return ((value % base) + base) % base;
}

export function marsClock(ms: number): MarsClock {
  // Terrestrial Time: UTC plus 37 leap seconds plus 32.184 s.
  const jdTT = 2440587.5 + ms / 86400000 + (37 + 32.184) / 86400;
  const d = jdTT - 2451545.0;
  const meanAnomaly = ((19.3871 + 0.52402073 * d) % 360) * DEG;
  const fictitiousMeanSun = (270.3871 + 0.524038496 * d) % 360;

  let perturbations = 0;
  for (const [amplitude, period, phase] of PERTURBATIONS) {
    perturbations += amplitude * Math.cos(((0.985626 * d) / period + phase) * DEG);
  }

  const equationOfCenter =
    (10.691 + 3.0e-7 * d) * Math.sin(meanAnomaly) +
    0.623 * Math.sin(2 * meanAnomaly) +
    0.05 * Math.sin(3 * meanAnomaly) +
    0.005 * Math.sin(4 * meanAnomaly) +
    0.0005 * Math.sin(5 * meanAnomaly) +
    perturbations;

  const ls = mod(fictitiousMeanSun + equationOfCenter, 360);
  const lsRad = ls * DEG;
  const eot =
    2.861 * Math.sin(2 * lsRad) -
    0.071 * Math.sin(4 * lsRad) +
    0.002 * Math.sin(6 * lsRad) -
    equationOfCenter;
  const msd = (jdTT - 2451549.5) / 1.0274912517 + 44796.0 - 0.0009626;
  const mtc = mod(24 * msd, 24);
  const subsolarWest = mod(mtc * 15 + eot + 180, 360);

  return {
    msd,
    ls,
    eot,
    subLonE: (360 - subsolarWest) % 360,
    subLat: Math.asin(0.42565 * Math.sin(lsRad)) / DEG + 0.25 * Math.sin(lsRad),
    lmst: mod(mtc + JEZERO.lon / 15, 24),
    sol: Math.floor(msd + JEZERO.lon / 360) - MISSION_SOL_OFFSET,
  };
}

/** Formats decimal hours as HH:MM, truncating the minutes like a clock does. */
export function formatHoursMinutes(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
