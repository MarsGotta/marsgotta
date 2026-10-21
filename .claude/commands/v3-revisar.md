---
description: Revisa la web v3 contra el diseño, la marca, la física y los criterios de aceptación
---

Revisa el estado actual del proyecto sin cambiar código, salvo que te lo pida:

1. **Criterios de aceptación:** `design/v3/HANDOFF.md`, sección 8. Marca cada uno como cumplido, parcial o pendiente.
2. **Diseño:** compara cada página con `design/v3/prototype/Main.dc.html` y `design/v3/extracted/styles.css`. Busca colores, tamaños, espaciados o tiempos que no coincidan.
3. **Marca** (sección 6 y `design/v3/brief.pdf`):
   - Busca rayas largas (—), cifras en el hero o en las tarjetas, enlaces al repo de Orbit y términos prohibidos.
   - Comprueba que el copy coincide con `design/v3/messages/*.json`.
4. **Física** (sección 4): compara las constantes del código con las del prototipo (periodos, radios, cámara a 13°, eclipses, Kepler, Hohmann y Mars24) y ejecuta los tests de `mars-clock`.
5. **Accesibilidad:** axe sin violaciones, teclado, foco visible, contraste, botón de pausa SIM y `prefers-reduced-motion`.
6. **Rendimiento:** LCP y CLS en móvil, planeta inicializado tras el primer pintado y pausado fuera de pantalla.

Devuelve una lista priorizada de problemas, con fichero y línea, y una propuesta de arreglo para cada uno.
