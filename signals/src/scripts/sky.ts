import { jezeroTime, lightTimeText } from '../lib/sky';

const MINUTE_MS = 60_000;

/**
 * Runs `update` now and every minute while the page is visible. The values are real and slow:
 * the light time changes by seconds a day, the Jezero clock by the minute.
 */
function everyMinuteWhileVisible(update: () => void): void {
  let timer = 0;
  const start = () => {
    window.clearInterval(timer);
    update();
    timer = window.setInterval(update, MINUTE_MS);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(timer);
    else start();
  });
  start();
}

function setText(root: ParentNode, selector: string, text: string): void {
  const element = root.querySelector(selector);
  if (element && element.textContent !== text) element.textContent = text;
}

/** «Sol 2017 · 14:09 LMST en Jezero» in the footer. */
export function initJezeroClock(): void {
  const root = document.querySelector<HTMLElement>('[data-jezero-clock]');
  if (!root) return;
  everyMinuteWhileVisible(() => {
    const { sol, lmst } = jezeroTime(Date.now());
    setText(root, '[data-jezero-sol]', sol);
    setText(root, '[data-jezero-lmst]', lmst);
  });
}

/** «Hoy tarda 12 min 29 s · 224,7 millones de km» in the light-time strip. */
export function initLightTime(): void {
  const root = document.querySelector<HTMLElement>('[data-light-time]');
  if (!root) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  everyMinuteWhileVisible(() => {
    const { time, distance } = lightTimeText(Date.now(), lang);
    setText(root, '[data-light-seconds]', time);
    setText(root, '[data-light-km]', distance);
  });
}
