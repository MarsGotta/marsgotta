---
description: Aplica el anexo v3.1 (la home como historia) sobre la web ya desplegada
---

Vamos a aplicar el anexo `design/v3/anexo-home/` sobre la web v3 que ya está desplegada. Solo cambia la home, de debajo del hero al cierre.

1. Lee `CLAUDE.md` y entero `design/v3/anexo-home/LEEME.md`. Usa `secciones/`, `messages/*.patch.json` y `content/now.ts` como fuente de verdad. Abre `prototype/Main.dc.html` (ruta `inicio`) solo si necesitas comprobar una medida.
2. Antes de escribir código, enséñame un plan breve:
   - los componentes a crear (`Manifesto`, `People`), cambiar (`Hero`, `ProjectSystem`, `ProjectTabs`, `Closing`, `HomeView`, `now.ts`, i18n) y borrar (`NowBand`, `NowIcon`, `TransferOrbit` si quedan sin uso);
   - los tests que añades o ajustas.
   Espera mi OK.
3. Implementa el anexo sin tocar nada fuera de su alcance. Si algo del anexo choca con lo que hay desplegado (por ejemplo, el enlace «Siguiente parada» con el hero actual), pregúntame.
4. Verifica:
   - `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` sin errores.
   - Los e2e y axe en `/` y `/en`.
   - En el navegador: 1440 y 390 px, tema oscuro y claro, ES y EN, reduced-motion y SIM en pausa.
5. Repasa los criterios de aceptación del LEEME (sección 6) uno a uno.
6. Haz un commit, en español y en imperativo, y despliega solo a `*.workers.dev`. Termina con un resumen y la URL de previsualización. Producción, solo con mi OK.
