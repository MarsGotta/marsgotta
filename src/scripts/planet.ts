import { isMotionAllowed } from '../lib/motion';
import type { MarsPlanet } from '../lib/planet/planet';
import { currentTheme } from './theme';

/**
 * The planet waits until the browser is idle after the first paint, so the headline (the LCP) and
 * the fonts go first on a slow phone, and starts anyway after this long.
 */
const IDLE_TIMEOUT_MS = 2000;
/** Without requestIdleCallback (Safari), a short wait after the first paint does the same job. */
const START_DELAY_MS = 140;

/** A data saver or a device short of memory keeps the CSS sphere, which already looks the part. */
function wantsPlanet(): boolean {
  const device = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return !device.connection?.saveData && !((device.deviceMemory ?? Infinity) <= 2);
}

/** Loads the WebGL planet on demand: only in the dark theme, and never before the first paint. */
export function initPlanet(): void {
  const system = document.querySelector<HTMLElement>('[data-planet-system]');
  const canvas = system?.querySelector<HTMLCanvasElement>('[data-planet-canvas]');
  if (!system || !canvas) return;
  let planet: MarsPlanet | null = null;
  let requested = false;

  const start = async () => {
    if (requested || currentTheme() !== 'dark' || !wantsPlanet()) return;
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

  // The DOM types promise requestIdleCallback, but Safari does not have it.
  const whenIdle = window.requestIdleCallback as Window['requestIdleCallback'] | undefined;
  requestAnimationFrame(() => {
    if (whenIdle) window.requestIdleCallback(() => void start(), { timeout: IDLE_TIMEOUT_MS });
    else window.setTimeout(start, START_DELAY_MS);
  });
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
