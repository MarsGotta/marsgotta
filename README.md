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

## Despliegue en Cloudflare

El sitio es un Worker con static assets (`wrangler.jsonc`, directorio `dist/`), sin código propio: Cloudflare sirve los ficheros directamente, con brotli y las cabeceras de `public/_headers`.

| Worker                  | Dominios                                                 | Qué hace                                                  |
| ----------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `marcelagotta`          | marcelagotta.com y marcelagotta.marcelagotta.workers.dev | Sirve la web.                                             |
| `marcelagotta-redirect` | www.marcelagotta.com, marsgotta.com y www.marsgotta.com  | 301 a https://marcelagotta.com con la misma ruta y query. |

Las redirecciones van en un Worker aparte (`workers/redirect/`) para que el sitio principal no ejecute código en cada petición.

### Desplegar

1. Comprueba la sesión: `npx wrangler whoami`.
2. `npm run deploy` construye y publica el sitio.
3. `npm run deploy:redirect`, solo si cambia `workers/redirect/`.
4. Verifica el despliegue con los tests e2e: `BASE_URL=https://marcelagotta.com npm run test:e2e`.

Para probar antes de publicar, `npm run preview:cf` sirve `dist/` con `wrangler dev`, y cada despliegue queda también en https://marcelagotta.marcelagotta.workers.dev.

### Primer paso a producción

Los Custom Domains de Workers no pueden ocupar un nombre que ya tenga registros A, AAAA o CNAME. Antes del primer despliegue con dominios hay que borrar en el panel de Cloudflare (DNS de cada zona) estos registros, y solo estos:

| Zona             | Registro                                     |
| ---------------- | -------------------------------------------- |
| marcelagotta.com | `A marcelagotta.com → 216.198.79.1` (Vercel) |
| marcelagotta.com | `CNAME www → marcelagotta.com`               |
| marsgotta.com    | `CNAME www → marsgotta.com`                  |

Los MX (Google Workspace e iCloud) y los TXT (SPF y verificaciones) no se tocan. Después, `npm run deploy && npm run deploy:redirect` crea los registros del Worker y los certificados.

Para volver a la web anterior: quita los Custom Domains de los dos Workers (panel → Workers → Settings → Domains & Routes) y recrea los registros de la tabla, sin proxy.

### Secretos

Ahora no hay ninguno. Si el formulario de contacto pasa a enviar por un proveedor de email, la clave irá con `npx wrangler secret put NOMBRE`, nunca en el repo.

## Fuentes

Open Sauce Two (`public/fonts/`) está recortada a los caracteres latinos que usa la web, desde los originales de `design/v3/assets/fonts/`:

```sh
uvx --from 'fonttools[woff]' pyftsubset design/v3/assets/fonts/<fichero>.woff2 \
  --unicodes='U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013,U+2014,U+2018-201E,U+2022,U+2026,U+2030,U+2032,U+2033,U+2039,U+203A,U+20AC,U+2122,U+2190-2193,U+2197,U+2212,U+221D' \
  --flavor=woff2 --layout-features='*' --output-file=public/fonts/<fichero>.woff2
```

Sora y JetBrains Mono llegan de `@fontsource`. Las fuentes de reserva con `size-adjust` de `src/styles/global.css` evitan saltos de maquetación mientras cargan.
