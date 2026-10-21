# marcelagotta.com

Web personal de Marcela Gotta, versión 3. Astro 7 con salida estática, desplegada como Worker de Cloudflare con static assets.

## Requisitos

- Node 26 (ver `.node-version`). Astro 7 necesita Node 22.23.4 o superior.
- npm.

## Comandos

| Comando              | Qué hace                                                          |
| -------------------- | ----------------------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo en `localhost:4321`.                       |
| `npm run build`      | Genera el sitio estático en `dist/`.                              |
| `npm run preview`    | Sirve `dist/` con Astro.                                          |
| `npm run preview:cf` | Construye y sirve `dist/` con `wrangler dev`, como en producción. |
| `npm run lint`       | ESLint y Prettier en modo comprobación.                           |
| `npm run format`     | Formatea con Prettier.                                            |
| `npm run typecheck`  | `astro check`.                                                    |
| `npm run test`       | Tests unitarios con Vitest.                                       |
| `npm run test:e2e`   | Tests e2e y de accesibilidad con Playwright sobre `dist/`.        |
| `npm run deploy`     | Construye y despliega con `wrangler deploy`.                      |

## Diseño y contenido

La fuente de verdad está en `design/v3/`: el prototipo, el CSS y la lógica extraídos, los textos y el brief. La guía de implementación es `design/v3/HANDOFF.md`.
