import { prefersReducedMotion } from '../lib/motion';

/**
 * A pill in the manifesto picks its project in the system, then scrolls there. Without JS it is
 * still a plain link to #sistema. Focus stays on the pill: the section is not a focus target.
 */
export function initManifestoPills(): void {
  const system = document.querySelector<HTMLElement>('[data-project-system]');
  if (!system) return;
  document.querySelectorAll<HTMLAnchorElement>('[data-pick-project]').forEach((pill) => {
    pill.addEventListener('click', (event) => {
      event.preventDefault();
      system.dispatchEvent(new CustomEvent('project:select', { detail: pill.dataset.pickProject }));
      system.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
      history.replaceState(null, '', `#${system.id}`);
    });
  });
}
