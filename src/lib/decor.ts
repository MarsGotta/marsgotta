/* Seeded decoration, computed at build time so every visit sees the same sky as the prototype. */

/** Mulberry32: a tiny deterministic PRNG returning floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_TINTS = ['255,245,238', '255,245,238', '255,245,238', '178,155,228', '255,196,168'];

interface StarFieldOptions {
  seed: number;
  count: number;
  spread: number;
  blur: number;
  minAlpha: number;
  maxAlpha: number;
}

/** A field of stars as one box-shadow list over a 2600 × 1300 px area. */
export function starField({ seed, count, spread, blur, minAlpha, maxAlpha }: StarFieldOptions) {
  const random = seededRandom(seed);
  const stars: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(random() * 2600);
    const y = Math.round(random() * 1300);
    const tint = STAR_TINTS[Math.floor(random() * STAR_TINTS.length)];
    const alpha = (minAlpha + random() * (maxAlpha - minAlpha)).toFixed(2);
    stars.push(`${x}px ${y}px ${blur}px ${spread}px rgba(${tint},${alpha})`);
  }
  return stars.join(',');
}

/** Three depths of stars: the nearer the layer, the fewer, brighter and larger its stars. */
export const starFields = {
  far: starField({ seed: 11, count: 380, spread: 0, blur: 0, minAlpha: 0.22, maxAlpha: 0.7 }),
  mid: starField({ seed: 23, count: 150, spread: 0.45, blur: 0, minAlpha: 0.35, maxAlpha: 0.85 }),
  near: starField({ seed: 37, count: 46, spread: 0.9, blur: 0.8, minAlpha: 0.5, maxAlpha: 0.95 }),
};

export const twinkles = [
  { x: '12%', y: '18%', delay: '-.4s' },
  { x: '31%', y: '64%', delay: '-1.6s' },
  { x: '46%', y: '12%', delay: '-2.9s' },
  { x: '58%', y: '36%', delay: '-.9s' },
  { x: '88%', y: '20%', delay: '-3.4s' },
  { x: '95%', y: '72%', delay: '-2.2s' },
  { x: '22%', y: '88%', delay: '-1.1s' },
];

export interface WaveBar {
  height: string;
  delay: string;
}

/** The meeting's audio wave in the Orbit demo: a speech-like envelope with seeded jitter. */
export function waveform(count = 40, seed = 91): WaveBar[] {
  const random = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const envelope = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.42) * Math.cos(i * 0.13 + 1));
    const height = Math.round(18 + 62 * envelope * (0.6 + 0.4 * random()));
    const delay = (-random() * 0.55).toFixed(2);
    return { height: `${height}px`, delay: `${delay}s` };
  });
}
