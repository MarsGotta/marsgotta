import { formatHoursMinutes, marsClock } from '@portfolio/lib/mars-clock';
import type { Lang } from '../i18n';
import { earthMarsLightTime, formatLightTime } from './light-time';

/** «Hoy tarda 12 min 29 s · 224,7 millones de km»: the light-time strip, at a given moment. */
export function lightTimeText(ms: number, lang: Lang): { time: string; distance: string } {
  const { km, seconds } = earthMarsLightTime(ms);
  const millions = (km / 1e6).toFixed(1);
  return {
    time: formatLightTime(seconds),
    distance: lang === 'es' ? millions.replace('.', ',') : millions,
  };
}

/** «Sol 2017 · 14:09 LMST en Jezero», in the footer. */
export function jezeroTime(ms: number): { sol: string; lmst: string } {
  const clock = marsClock(ms);
  return { sol: String(clock.sol), lmst: formatHoursMinutes(clock.lmst) };
}
