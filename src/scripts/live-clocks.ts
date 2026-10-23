import { formatHoursMinutes, marsClock } from '../lib/mars-clock';

const REFRESH_MS = 30_000;

/**
 * «En Madrid son las 21:59. En Jezero, sol 2017, 04:39 LMST.» Refreshes every 30 s, only while the
 * page is visible. Not an aria-live region on purpose: it must not be announced every 30 s.
 */
export function initLiveClocks(): void {
  const root = document.querySelector<HTMLElement>('[data-live-clocks]');
  if (!root) return;
  const madrid = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const set = (selector: string, text: string) => {
    const element = root.querySelector(selector);
    if (element) element.textContent = text;
  };
  const tick = () => {
    const now = Date.now();
    const mars = marsClock(now);
    set('[data-clock-madrid]', madrid.format(now));
    set('[data-clock-sol]', String(mars.sol));
    set('[data-clock-lmst]', formatHoursMinutes(mars.lmst));
    root.dataset.ready = '';
  };
  let timer = 0;
  const start = () => {
    window.clearInterval(timer);
    tick();
    timer = window.setInterval(tick, REFRESH_MS);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(timer);
    else start();
  });
  start();
}
