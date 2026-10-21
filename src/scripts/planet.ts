import { isMotionAllowed } from '../lib/motion';
import type { MarsPlanet } from '../lib/planet/planet';
import { currentTheme } from './theme';

/** Wait after the first paint, so the headline (the LCP) paints before the planet compiles and bakes. */
const START_DELAY_MS = 140;

/** Loads the WebGL planet on demand: only in the dark theme, and never before the first paint. */
export function initPlanet(): void {
  const system = document.querySelector<HTMLElement>('[data-planet-system]');
  const canvas = system?.querySelector<HTMLCanvasElement>('[data-planet-canvas]');
  if (!system || !canvas) return;
  let planet: MarsPlanet | null = null;
  let requested = false;

  const start = async () => {
    if (requested || currentTheme() !== 'dark') return;
    requested = true;
    const { MarsPlanet } = await import('../lib/planet/planet');
    planet = await MarsPlanet.create({
      canvas,
      marker: system.querySelector('[data-jezero-marker]'),
      markerTime: system.querySelector('[data-jezero-time]'),
      shouldAnimate: isMotionAllowed,
      onReady: () => {
        system.dataset.gl = 'on';
      },
    });
  };

  requestAnimationFrame(() => window.setTimeout(start, START_DELAY_MS));
  document.addEventListener('themechange', () => {
    void start();
    planet?.kick();
  });
  document.addEventListener('motionchange', () => planet?.kick());
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', () => planet?.kick());
  canvas.addEventListener('webglcontextlost', () => {
    // Back to the CSS sphere if the GPU drops the context.
    planet?.dispose();
    planet = null;
    delete system.dataset.gl;
  });
}
