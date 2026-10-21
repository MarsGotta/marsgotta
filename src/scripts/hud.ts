import { formatHoursMinutes, madridTime, marsClock } from '../lib/mars-clock';

/** Live telemetry: Madrid time, Perseverance's sol and the local mean solar time at Jezero. */
export function initHud(): void {
  const madrid = document.querySelector('[data-hud-madrid]');
  const sol = document.querySelector('[data-hud-sol]');
  const lmst = document.querySelector('[data-hud-lmst]');
  if (!madrid || !sol || !lmst) return;

  const tick = () => {
    const now = Date.now();
    const clock = marsClock(now);
    madrid.textContent = madridTime(now);
    sol.textContent = String(clock.sol);
    lmst.textContent = formatHoursMinutes(clock.lmst);
  };
  tick();
  window.setInterval(tick, 1000);
}
