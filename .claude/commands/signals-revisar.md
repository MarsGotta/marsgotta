---
description: Revisa Signals by Mars contra el diseño, la marca, la física y los criterios de aceptación
---

Revisa el estado de Signals by Mars sin cambiar código, salvo que te lo pida:

1. **Criterios de aceptación:** `design/signals/LEEME.md`, sección 11. Marca cada uno como cumplido, parcial o pendiente.
2. **Diseño:** compara la home, un tema, el archivo y un artículo con `design/signals/prototype/Signals.dc.html` y `extracted/styles.css`. Busca colores, tamaños, espaciados o tiempos que no coincidan.
3. **Marca:**
   - Busca rayas largas (—), contenido inventado publicado y borradores que se cuelen en el build, el RSS o el sitemap.
   - Comprueba que el copy coincide con `design/signals/messages/*.json`.
4. **Física:** el tiempo de luz contra los vectores de `light-time.ts`, el sol y la LMST con `marsClock`, y las portadas contra la instantánea.
5. **Accesibilidad:** axe sin violaciones, teclado, foco visible, contraste, animaciones de menos de 5 s, `prefers-reduced-motion` y formularios sin JS.
6. **Rendimiento:** LCP y CLS en móvil, peso de las fuentes y JS enviado por página.

Devuelve una lista priorizada de problemas, con fichero y línea, y una propuesta de arreglo para cada uno.
