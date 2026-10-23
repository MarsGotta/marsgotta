# Comportamiento de la home nueva

Son tres piezas, todas sin framework y con mejora progresiva: sin JS, la página sigue completa y bien.

## 1. Troceado del manifiesto (build, cero JS)

Es lógica pura, así que va en `src/lib/manifesto.ts`, con test. Convierte `home.manifesto.text` en tokens que pinta `Manifesto.astro`.

```ts
import type { ProjectKey } from '../content/projects';

export type ManifestoToken =
  | { kind: 'word'; text: string } // la palabra ya lleva su espacio detrás
  | { kind: 'project'; key: ProjectKey };

/** Frases normales → una palabra por token. '@kimen' | '@jezero' | '@orbit' → una píldora. */
export function manifestoTokens(segments: string[]): ManifestoToken[] {
  return segments.flatMap((segment): ManifestoToken[] =>
    segment.startsWith('@')
      ? [{ kind: 'project', key: segment.slice(1) as ProjectKey }]
      : segment.split(' ').map((word) => ({ kind: 'word', text: `${word} ` })),
  );
}
```

Tests mínimos:

- Las tres fichas existen como `ProjectKey`.
- Ninguna palabra sale vacía.
- Juntando los tokens, el texto da la frase original, en ES y en EN.

## 2. Las píldoras eligen el proyecto

`initProjectSystems()` ya tiene `select()`. Expón esa selección con un evento para no acoplar el manifiesto al sistema:

```ts
// scripts/project-tabs.ts, dentro de initProjectSystems(), por cada root:
root.addEventListener('project:select', (event) => {
  select((event as CustomEvent<string>).detail);
});
```

```ts
// scripts/manifesto.ts
import { prefersReducedMotion } from '../lib/motion';

/** A pill in the manifesto picks its project in the system and scrolls to it.
 *  Without JS the pill is still a plain link to #sistema. */
export function initManifestoPills(): void {
  const system = document.querySelector<HTMLElement>('[data-project-system]');
  if (!system) return;
  document.querySelectorAll<HTMLAnchorElement>('[data-pick-project]').forEach((pill) => {
    pill.addEventListener('click', (event) => {
      event.preventDefault();
      system.dispatchEvent(new CustomEvent('project:select', { detail: pill.dataset.pickProject }));
      system.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', '#sistema');
    });
  });
}
```

Comprueba que el foco no se pierde. Si `#sistema` no tiene `tabindex="-1"`, deja el foco en la píldora: no lo muevas a la pestaña.

## 3. Relojes en vivo del cierre

```ts
// scripts/live-clocks.ts
import { formatHoursMinutes, marsClock } from '../lib/mars-clock';

/** «En Madrid son las 21:59. En Jezero, sol 2017, 04:39 LMST.» Refreshes every 30 s while visible. */
export function initLiveClocks(): void {
  const root = document.querySelector<HTMLElement>('[data-live-clocks]');
  if (!root) return;
  const madrid = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const set = (selector: string, text: string) => {
    const el = root.querySelector(selector);
    if (el) el.textContent = text;
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
  const start = () => { tick(); timer = window.setInterval(tick, 30_000); };
  const stop = () => window.clearInterval(timer);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}
```

- No es una región `aria-live`, a propósito: no debe anunciarse cada 30 s.
- Las cifras tabulares y el espacio reservado (`visibility: hidden` hasta `data-ready`) mantienen el CLS en 0.

## 4. Pausa (SIM) y reduced-motion

Añade a las reglas globales que ya tengáis:

```css
:root[data-motion='off'] .manifesto .w,
:root[data-motion='off'] .next svg { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .manifesto .w,
  .next svg { animation: none !important; }
}
```

El manifiesto queda entero y legible desde el principio, y la flecha del hero deja de botar.
