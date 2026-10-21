import { isMotionPaused, setMotionPaused } from '../lib/motion';

function syncTitles(): void {
  const key = isMotionPaused() ? 'labelOff' : 'labelOn';
  document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]').forEach((button) => {
    button.title = button.dataset[key] ?? '';
  });
}

export function initMotionToggles(): void {
  document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      setMotionPaused(!isMotionPaused());
      syncTitles();
    });
  });
  syncTitles();
}
