/* Shared motion state. The SIM button pauses every looping animation and the planet (WCAG 2.2.2);
   the choice is remembered across pages, and the inline script in Base.astro applies it before painting. */

const STORAGE_KEY = 'motion';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isMotionPaused(): boolean {
  return document.documentElement.dataset.motion === 'off';
}

export function setMotionPaused(paused: boolean): void {
  const root = document.documentElement;
  if (paused) root.dataset.motion = 'off';
  else delete root.dataset.motion;
  try {
    if (paused) localStorage.setItem(STORAGE_KEY, 'off');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the pause still applies to this page.
  }
  document.dispatchEvent(new CustomEvent<boolean>('motionchange', { detail: paused }));
}

/** True when animations should run: neither paused with SIM nor reduced by the system. */
export function isMotionAllowed(): boolean {
  return !isMotionPaused() && !prefersReducedMotion();
}
