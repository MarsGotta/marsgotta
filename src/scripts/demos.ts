import { isMotionPaused } from '../lib/motion';

/**
 * Plays each project demo once, when at least 30 % of its stage is on screen. A demo runs for up to
 * six seconds, so SIM skips it, or stops it mid-play, at the static final state: what the markup
 * shows without is-play (WCAG 2.2.2).
 */
export function initDemoStages(): void {
  const stages = document.querySelectorAll('[data-demo-stage]');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || isMotionPaused()) continue;
        entry.target.classList.add('is-play');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );
  stages.forEach((stage) => observer.observe(stage));
  document.addEventListener('motionchange', () => {
    if (isMotionPaused()) stages.forEach((stage) => stage.classList.remove('is-play'));
  });
}
