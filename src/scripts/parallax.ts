import { prefersReducedMotion } from '../lib/motion';

/** Moves the star fields against the pointer: --mx and --my go from −1 to 1 across the hero. */
export function initParallax(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  let frame = 0;

  hero.addEventListener('pointermove', (event) => {
    if (frame || event.pointerType !== 'mouse' || prefersReducedMotion()) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      if (!rect.width) return;
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      hero.style.setProperty('--mx', (-x).toFixed(3));
      hero.style.setProperty('--my', (-y).toFixed(3));
    });
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--mx', '0');
    hero.style.setProperty('--my', '0');
  });
}
