/*
 * Generated covers: each signal gets its own "transmission", deterministic from its number and topic,
 * rendered as inline SVG at build time (no images to make, no JS in the browser).
 * Port of sgCover() in the prototype: same seeds, same shapes, so covers match the design pixel for pixel.
 */

export type CoverKind = 'strata' | 'dunes' | 'orbits' | 'signal';
export type Topic = 'ia' | 'practica' | 'tutorial';

export interface CoverShape {
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}
export interface Cover {
  background: string;
  shapes: CoverShape[];
}

/** 1200 × 750 viewBox; the <svg> uses preserveAspectRatio="xMidYMid slice" so any crop works. */
export const COVER_VIEWBOX = '0 0 1200 750';

const PALETTES: Record<Topic, { bg: string; c: [string, string, string, string] }> = {
  ia: { bg: '#2A1218', c: ['#E9603A', '#D11772', '#FFB08A', '#5E1A2A'] },
  practica: { bg: '#1C1530', c: ['#B29BE4', '#7C5CC4', '#FFE9DC', '#2E2350'] },
  tutorial: { bg: '#10202F', c: ['#7FB2E5', '#E9A27A', '#FFF1E6', '#1C3550'] },
};

/** mulberry32: a tiny seeded PRNG, the same one the portfolio uses for its stars. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n: number) => Math.round(n * 10) / 10;
const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
const shape = (
  d: string,
  fill?: string | null,
  stroke?: string | null,
  strokeWidth = 0,
  opacity = 1,
): CoverShape => ({
  d,
  fill: fill || 'none',
  stroke: stroke || 'none',
  strokeWidth,
  opacity,
});

export function generateCover(kind: CoverKind, topic: Topic, signalNumber: number): Cover {
  const r = seeded(signalNumber * 7919 + 13);
  const { bg, c } = PALETTES[topic];
  const out: CoverShape[] = [];

  if (kind === 'dunes') {
    // A small, pale sun over layered dunes: the blue Martian sunset seen from Jezero.
    const sx = 300 + r() * 600;
    const sy = 250 + r() * 120;
    out.push(shape(circle(sx, sy, 210), c[2], null, 0, 0.06));
    out.push(shape(circle(sx, sy, 120), c[2], null, 0, 0.1));
    out.push(shape(circle(sx, sy, 46), c[2], null, 0, 0.92));
    for (let k = 0; k < 4; k++) {
      const base = 430 + k * 85;
      const amp = 26 + r() * 30;
      const f1 = 0.004 + r() * 0.004;
      const ph = r() * 6.28;
      let d = `M0 750L0 ${f(base)}`;
      for (let x = 0; x <= 1200; x += 40)
        d += `L${x} ${f(base + Math.sin(x * f1 + ph) * amp + Math.sin(x * f1 * 2.7 + ph) * amp * 0.35)}`;
      d += 'L1200 750Z';
      out.push(
        shape(
          d,
          k === 0 ? c[3] : k === 1 ? c[1] : k === 2 ? c[0] : bg,
          null,
          0,
          k === 3 ? 1 : 0.9 - k * 0.12,
        ),
      );
    }
  } else if (kind === 'orbits') {
    // Tilted orbits with one highlighted, like the orrery.
    const cx = 600 + (r() - 0.5) * 200;
    const cy = 375 + (r() - 0.5) * 80;
    const tilt = ((-14 + r() * 8) * Math.PI) / 180;
    const rot = (px: number, py: number): [number, number] => [
      cx + px * Math.cos(tilt) - py * Math.sin(tilt),
      cy + px * Math.sin(tilt) + py * Math.cos(tilt),
    ];
    for (let k = 1; k <= 5; k++) {
      const rx = 90 + k * 96;
      const ry = rx * 0.3;
      let d = '';
      for (let i = 0; i <= 72; i++) {
        const t = (i / 72) * Math.PI * 2;
        const [x, y] = rot(Math.cos(t) * rx, Math.sin(t) * ry);
        d += `${i ? 'L' : 'M'}${f(x)} ${f(y)}`;
      }
      out.push(
        shape(`${d}Z`, null, k === 3 ? c[0] : c[2], k === 3 ? 2.6 : 1.4, k === 3 ? 0.95 : 0.22),
      );
      const a = r() * Math.PI * 2;
      const [mx, my] = rot(Math.cos(a) * rx, Math.sin(a) * ry);
      out.push(
        shape(circle(mx, my, k === 3 ? 11 : 5), k === 3 ? c[0] : c[2], null, 0, k === 3 ? 1 : 0.7),
      );
    }
    out.push(shape(circle(cx, cy, 64), c[1], null, 0, 0.95));
    out.push(shape(circle(cx - 18, cy - 20, 40), c[0], null, 0, 0.55));
  } else if (kind === 'signal') {
    // Wavefronts leaving a source, and a received waveform.
    const ox = 140 + r() * 160;
    const oy = 600 - r() * 80;
    for (let k = 1; k <= 11; k++) {
      const rr = k * 92;
      const strong = k % 4 === 2;
      out.push(
        shape(
          `M${f(ox)} ${f(oy - rr)}A${rr} ${rr} 0 0 1 ${f(ox + rr)} ${f(oy)}`,
          null,
          strong ? c[0] : c[2],
          strong ? 3 : 1.4,
          strong ? 0.95 : 0.5 - k * 0.035,
        ),
      );
    }
    out.push(shape(circle(ox, oy, 34), c[1], null, 0, 1));
    const wy = 210 + r() * 60;
    let w = `M0 ${f(wy)}`;
    for (let x = 0; x <= 1200; x += 8) {
      const env = Math.exp(-Math.pow((x - 820) / 240, 2));
      w += `L${x} ${f(wy + Math.sin(x * 0.09 + r() * 0.6) * (4 + 70 * env))}`;
    }
    out.push(shape(w, null, c[2], 2, 0.85));
  } else {
    // strata: sediment layers of Jezero crater, one highlighted and crossed by a scan line.
    let y = 120;
    let band = 0;
    const hit = 2 + Math.floor(r() * 4);
    while (y < 750) {
      const h = 46 + r() * 52;
      const amp = 6 + r() * 12;
      const ph = r() * 6.28;
      let d = `M0 750L0 ${f(y)}`;
      for (let x = 0; x <= 1200; x += 60) d += `L${x} ${f(y + Math.sin(x * 0.006 + ph) * amp)}`;
      d += 'L1200 750Z';
      out.push(
        shape(
          d,
          band === hit ? c[0] : band % 2 ? c[3] : c[1],
          null,
          0,
          band === hit ? 0.95 : 0.35 + (band % 3) * 0.12,
        ),
      );
      y += h;
      band++;
    }
    const scan = 140 + hit * 70;
    out.push(shape(`M0 ${scan}L1200 ${scan}`, null, c[2], 1.6, 0.8));
    out.push(shape(circle(900, scan, 7), c[2], null, 0, 1));
  }
  return { background: bg, shapes: out };
}
