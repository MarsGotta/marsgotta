---
description: Ejecuta una fase del plan de Signals by Mars (0 a 6)
argument-hint: <número de fase>
---

Vamos a trabajar la **fase $ARGUMENTS** de Signals by Mars, el blog en signals.marsgotta.com.

1. Lee `CLAUDE.md` y `design/signals/LEEME.md`: la sección 10 para el alcance de la fase y el resto para el detalle que necesite.
2. Abre del prototipo solo lo que haga falta: `design/signals/prototype/Signals.dc.html` y `design/signals/extracted/`. Copia de ahí las medidas, los colores y los tiempos exactos. La lógica pura ya está en `design/signals/lib/`: úsala, no la reescribas.
3. Antes de escribir código, enséñame un plan breve: qué vas a crear o cambiar, en qué orden y qué tests añades. Espera mi OK.
4. Implementa solo esta fase. Si algo del prototipo no se puede trasladar tal cual, o hace falta una dependencia nueva, pregúntame.
5. Verifica que el portfolio no se rompe:
   - `npm run lint`, `npm run typecheck`, `npm run test` y los builds de las dos apps, sin errores.
   - Si la fase toca la interfaz, revísala en el navegador a 1440 y 390 px, en tema claro y oscuro, en ES y EN, y con `prefers-reduced-motion`.
6. Haz un commit de la fase y termina con un resumen: lo hecho, lo pendiente y las decisiones que necesiten mi visto bueno. Nada a producción sin mi OK.
