# marcelagotta.com

Web personal de Marcela Gotta, versión 3. Astro 7 con salida estática, desplegada como Worker de Cloudflare con static assets.

## Requisitos

- Node 26 (ver `.node-version`). Astro 7 necesita Node 22.23.4 o superior.
- npm.

## Comandos

| Comando                  | Qué hace                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | Servidor de desarrollo en `localhost:4321`.                                                                           |
| `npm run build`          | Genera el sitio estático en `dist/`.                                                                                  |
| `npm run preview`        | Sirve `dist/` con Astro.                                                                                              |
| `npm run preview:cf`     | Construye y sirve `dist/` con `wrangler dev`, como en producción.                                                     |
| `npm run lint`           | ESLint y Prettier en modo comprobación.                                                                               |
| `npm run format`         | Formatea con Prettier.                                                                                                |
| `npm run typecheck`      | `astro check`.                                                                                                        |
| `npm run test`           | Tests unitarios con Vitest.                                                                                           |
| `npm run test:e2e`       | Tests e2e y de accesibilidad con Playwright sobre `dist/`, servido por el Worker con `wrangler dev`.                  |
| `npm run deploy`         | Construye y despliega con `wrangler deploy`.                                                                          |
| `npm run deploy:preview` | Construye y sube una versión de prueba a https://preview-marcelagotta.marcelagotta.workers.dev, sin tocar producción. |

## Diseño y contenido

La fuente de verdad está en `design/v3/`: el prototipo, el CSS y la lógica extraídos, los textos y el brief. La guía de implementación es `design/v3/HANDOFF.md`.

## Despliegue en Cloudflare

El sitio es un Worker con static assets (`wrangler.jsonc`, directorio `dist/`): Cloudflare sirve los ficheros directamente, con brotli y las cabeceras de `public/_headers`. El código del Worker (`workers/site/`) solo corre en las páginas, para elegir el idioma; en la ruta del formulario, `/api/contact`; y en las rutas sin fichero, que reciben la página 404. Scripts, estilos, fuentes e imágenes se sirven sin pasar por él.

| Worker                  | Dominios                                                 | Qué hace                                                  |
| ----------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `marcelagotta`          | marcelagotta.com y marcelagotta.marcelagotta.workers.dev | Sirve la web.                                             |
| `marcelagotta-redirect` | www.marcelagotta.com, marsgotta.com y www.marsgotta.com  | 301 a https://marcelagotta.com con la misma ruta y query. |

Las redirecciones van en un Worker aparte (`workers/redirect/`) para que el sitio principal no ejecute código en cada petición.

### Desplegar

1. Comprueba la sesión: `npx wrangler whoami`.
2. `npm run deploy` construye y publica el sitio, y avisa por IndexNow a Bing y a los demás buscadores que lo usan (`scripts/indexnow.ts`). La clave es pública por diseño y vive en `public/<clave>.txt`.
3. `npm run deploy:redirect`, solo si cambia `workers/redirect/`.
4. Verifica el despliegue con los tests e2e: `BASE_URL=https://marcelagotta.com npm run test:e2e`.

Para probar antes de publicar:

- `npm run preview:cf` sirve `dist/` en local con `wrangler dev`.
- `npm run deploy:preview` sube una versión sin activarla y la deja en https://preview-marcelagotta.marcelagotta.workers.dev. Producción sigue con la versión anterior hasta el siguiente `npm run deploy`.

Cada despliegue a producción queda también en https://marcelagotta.marcelagotta.workers.dev. Todas las direcciones de workers.dev llevan `noindex`.

### Dominios

Los Custom Domains de Workers no pueden ocupar un nombre que ya tenga registros A, AAAA o CNAME. Para el primer paso a producción, el 22 de octubre de 2026, se borraron estos registros de la web anterior, y solo estos:

| Zona             | Registro                                     |
| ---------------- | -------------------------------------------- |
| marcelagotta.com | `A marcelagotta.com → 216.198.79.1` (Vercel) |
| marcelagotta.com | `CNAME www → marcelagotta.com`               |
| marsgotta.com    | `CNAME www → marsgotta.com`                  |

Los MX (Google Workspace e iCloud) y los TXT (SPF y verificaciones) no se tocaron.

Para volver a la web anterior: quita los Custom Domains de los dos Workers (panel → Workers → Settings → Domains & Routes) y recrea los registros de la tabla, sin proxy.

### Idioma automático

Cada idioma es una URL propia (español sin prefijo e inglés bajo `/en`). El Worker decide al llegar a la web, nunca mientras se navega por ella:

- **Al llegar desde fuera** (un enlace externo, un buscador o la URL tecleada), si la página está en el otro idioma redirige (302) a la misma página en el suyo. El idioma es el que el visitante eligió antes, si lo hizo, o el de su navegador (`Accept-Language`). El catalán, el gallego y el euskera cuentan como español, y cualquier otro idioma, como inglés.
- **Dentro de la web** no redirige nunca. Cambiar de idioma con el selector ES/EN guarda la elección en la cookie `lang` durante un año.
- **Buscadores, agentes y previsualizaciones de enlaces** reciben siempre la URL que piden, igual que los navegadores que no indican idioma. Cada página enlaza su traducción con `hreflang`.

### Formulario de contacto

`POST /api/contact` envía el mensaje con el Email Service de Cloudflare, a través del binding `send_email` de `wrangler.jsonc`: sin dependencias ni claves.

- **Remitente y destino.** El binding solo puede escribir desde `web@mail.marcelagotta.com` a `me@marcelagotta.com`. Responder al correo contesta a quien escribió (`Reply-To`).
- **Subdominio de envío.** `mail.marcelagotta.com` lleva sus propios registros (MX y SPF en `cf-bounce.mail`, DKIM y DMARC), así que el correo del dominio principal no cambia.
- **Antispam.** Validación en el Worker, un campo trampa oculto y un límite de 5 envíos por minuto e IP (binding `ratelimits`).
- **Sin JavaScript.** El navegador envía el formulario y el Worker redirige a `/contacto#contact-sent` o `#contact-error`, que muestran el resultado con CSS. Con JavaScript, el envío va por `fetch` y la página no se recarga.

Configuración, hecha una sola vez:

1. `npx wrangler email sending enable mail.marcelagotta.com` da de alta el subdominio y crea sus registros DNS.
2. `npx wrangler email routing addresses create me@marcelagotta.com` añade el destino. Hay que confirmarlo desde el enlace del correo que llega. Los envíos a direcciones verificadas son gratis en cualquier plan de Workers.

En local, `npm run preview:cf` simula el envío: cada correo queda en `.wrangler/tmp/email/`. Para ver los errores en producción: `npx wrangler tail marcelagotta`.

### Secretos

Ahora no hay ninguno. Si algún día hacen falta, van con `npx wrangler secret put NOMBRE`, nunca en el repo.

## Signals by Mars

El blog vive en `signals/`, con su propio Worker. Comparte con el portfolio el `package.json` y las dependencias. La guía está en `design/signals/LEEME.md`.

| Comando                          | Qué hace                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run signals:dev`            | Servidor de desarrollo del blog.                                                        |
| `npm run signals:build`          | Construye el blog en `signals/dist/`.                                                   |
| `npm run signals:preview:cf`     | Construye y sirve el blog con `wrangler dev`, como en producción.                       |
| `npm run signals:deploy:preview` | Sube una versión de prueba a workers.dev, con el alias `preview`, sin tocar producción. |
| `npm run signals:deploy`         | Construye y despliega el blog. Solo con el OK de Mars.                                  |

`npm run lint`, `npm run typecheck` y `npm run test` cubren las dos apps.

## Fuentes

Open Sauce Two (`public/fonts/`) está recortada a los caracteres latinos que usa la web, desde los originales de `design/v3/assets/fonts/`:

```sh
uvx --from 'fonttools[woff]' pyftsubset design/v3/assets/fonts/<fichero>.woff2 \
  --unicodes='U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013,U+2014,U+2018-201E,U+2022,U+2026,U+2030,U+2032,U+2033,U+2039,U+203A,U+20AC,U+2122,U+2190-2193,U+2197,U+2212,U+221D' \
  --flavor=woff2 --layout-features='*' --output-file=public/fonts/<fichero>.woff2
```

Sora y JetBrains Mono llegan de `@fontsource`. Las fuentes de reserva con `size-adjust` de `src/styles/global.css` evitan saltos de maquetación mientras cargan.
