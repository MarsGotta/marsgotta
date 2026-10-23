/*
 * How long a signal takes to travel from Earth to Mars right now.
 * Heliocentric positions from JPL's approximate Keplerian elements (E. M. Standish, valid 1800–2050),
 * then the Earth–Mars distance divided by the speed of light. Accurate to well under 1 % of the distance.
 * Real values: do not round or tune them for looks (same rule as the portfolio physics).
 */

/** a (au), e, I, L, long. perihelion, long. node (deg), each with its rate per Julian century. */
type Elements = readonly [number, number, number, number, number, number, number, number, number, number, number, number];

const EARTH: Elements = [
  1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981,
  102.93768193, 0.32327364, 0, 0,
];
const MARS: Elements = [
  1.52371034, 0.00001847, 0.0933941, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499,
  -23.94362959, 0.44441088, 49.55953891, -0.29257343,
];

export const AU_KM = 149_597_870.7;
export const LIGHT_KM_S = 299_792.458;
const DEG = Math.PI / 180;

function heliocentric(el: Elements, T: number): [number, number, number] {
  const a = el[0] + el[1] * T;
  const e = el[2] + el[3] * T;
  const I = (el[4] + el[5] * T) * DEG;
  const L = el[6] + el[7] * T;
  const perihelion = el[8] + el[9] * T;
  const node = (el[10] + el[11] * T) * DEG;
  const w = (perihelion - el[10] - el[11] * T) * DEG;
  const M = ((((L - perihelion) % 360) + 540) % 360 - 180) * DEG;

  // Kepler's equation, M = E − e·sin E, by Newton's method.
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));

  const x = a * (Math.cos(E) - e);
  const y = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const [cw, sw, cO, sO, cI, sI] = [Math.cos(w), Math.sin(w), Math.cos(node), Math.sin(node), Math.cos(I), Math.sin(I)];
  return [
    (cw * cO - sw * sO * cI) * x + (-sw * cO - cw * sO * cI) * y,
    (cw * sO + sw * cO * cI) * x + (-sw * sO + cw * cO * cI) * y,
    sw * sI * x + cw * sI * y,
  ];
}

export interface LightTime {
  /** Earth–Mars distance, in km. */
  km: number;
  /** One-way light time, in seconds. */
  seconds: number;
}

export function earthMarsLightTime(ms: number): LightTime {
  const T = (ms / 86_400_000 + 2_440_587.5 - 2_451_545.0) / 36_525;
  const [ex, ey, ez] = heliocentric(EARTH, T);
  const [mx, my, mz] = heliocentric(MARS, T);
  const km = Math.hypot(mx - ex, my - ey, mz - ez) * AU_KM;
  return { km, seconds: km / LIGHT_KM_S };
}

/** «12 min 29 s» / "12 min 29 s". */
export function formatLightTime(seconds: number): string {
  return `${Math.floor(seconds / 60)} min ${Math.floor(seconds % 60)} s`;
}

/*
 * Test vectors (0:00 UTC), from this same model; real references in brackets:
 *   2025-01-12 → 0.6423 au · 96.1 million km · 321 s   [closest approach 12 Jan 2025: 96.1 million km]
 *   2026-01-09 → 2.4041 au · 359.6 million km · 1200 s [solar conjunction, 9 Jan 2026]
 *   2026-10-21 → 1.5196 au · 227.3 million km · 758 s
 *   2027-02-19 → 0.6780 au · 101.4 million km · 338 s  [closest approach 20 Feb 2027: about 101 million km]
 * Tolerance in tests: 0.1 million km.
 */
