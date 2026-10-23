# Signals by Mars · guía de implementación

El blog de Marcela Gotta, con newsletter, en **signals.marsgotta.com**. Tiene su propia home para que se pueda encontrar sin pasar por el portfolio.

Vive en este mismo repo como **una app Astro aparte** en `signals/`, con su propio Worker y despliegue independiente. Comparte con el portfolio la marca, las fuentes, el logo y la física.

Siguen mandando `CLAUDE.md` (código legible, accesibilidad, rendimiento, despliegue con OK) y las reglas de marca. Este documento solo añade lo propio del blog.

## 0. Fuentes de verdad

- **Diseño y comportamiento:** `prototype/Signals.dc.html`. La prop `route` tiene dos valores: `inicio` y `articulo`. El prototipo trae temas claro y oscuro, ES y EN, y se adapta a móvil.
- **Separado del prototipo:** `extracted/` contiene `styles.css`, `markup.html` y `logic.js`. Copia de ahí medidas, colores y tiempos; no los estimes. Las clases llevan el prefijo `sg-`, que se quita al pasarlas a componentes con estilos con scope.
- **Copy de la interfaz:** `messages/es.json` y `messages/en.json`. Es el copy definitivo: no lo reescribas.
- **Lógica pura, ya en TypeScript y comprobada contra el prototipo:**
  - `lib/light-time.ts`: tiempo de luz Tierra–Marte.
  - `lib/covers.ts`: portadas generadas.
- **Bloques de código:** el tema de colores `shiki/signals-code.json`.
- **Assets:** `assets/fonts/`, con Newsreader variable (OFL, subconjuntos latin y latin-ext, normal e itálica), y `assets/signals-glyph.svg` y `assets/favicon.svg`.
- **Contenido de ejemplo:** `content/ejemplos/`. Lee primero su `indice-prototipo.md`.

## 1. Decisiones ya tomadas

- **Dominio:** `signals.marsgotta.com`, con Worker propio y dominio personalizado. Lo decidió Mars el 23 oct 2026; antes decía `signals.marcelagotta.com`, y donde el prototipo enseñe ese dominio (por ejemplo, la URL del RSS) va el nuevo.
  - El Worker de redirección de marsgotta.com solo cubre el dominio raíz y `www`, así que el subdominio está libre. Ninguna redirección de marsgotta.com debe tocarlo.
  - Producción y DNS, solo con el OK explícito de Mars; primero se prueba en `*.workers.dev`.
- **Código:** carpeta `signals/` en este repo, con su propio `astro.config.ts` y `wrangler.jsonc`.
  - Usa el mismo `package.json` y las mismas dependencias: nada de workspaces ni de un segundo `node_modules`.
  - Scripts nuevos: `signals:dev`, `signals:build`, `signals:preview:cf`, `signals:deploy:preview` y `signals:deploy`, todos con `--root signals` o `-c signals/wrangler.jsonc`.
  - `lint`, `typecheck` y `test` cubren las dos apps.
- **Código compartido:** se importa del portfolio, sin copiarlo.
  - Desde `src/lib/`: `mars-clock.ts`, `motion.ts` y `language.ts` si aplica.
  - Desde `src/styles/tokens.css`: solo lo que sirva.
  - Open Sauce Two de `public/fonts/`, JetBrains Mono de `@fontsource` y el logo.
  - Si algo compartido necesita cambiar, que no rompa el portfolio: los tests de las dos apps tienen que seguir en verde.
- **Idiomas:** es por defecto sin prefijo y en con `/en`, como el portfolio.
  - Un artículo puede existir en un solo idioma: el `hreflang` solo se pone cuando hay traducción.
  - Si no la hay, el selector de idioma lleva a la home del otro idioma.
- **Newsletter:** un email por cada artículo nuevo, con doble confirmación. **El proveedor está sin decidir** (ver §6).
- **Tema:** por defecto el del sistema, con un botón para cambiarlo y la preferencia guardada. Claro es «papel» y oscuro, «noche marciana». Reutiliza `src/scripts/theme.ts` si encaja. El subdominio es otro origen, así que la preferencia no se comparte con el portfolio, y está bien así.
- **Dependencias:** ninguna nueva sin preguntar. Se puede todo sin ellas:
  - Markdown con content collections, Shiki y la sitemap ya incluidas en Astro.
  - RSS con un endpoint propio.
  - Newsreader como ficheros locales.

- **Copy que falta en `messages/*.json`:** lo redacta Claude con la voz de Mars, como borrador para que ella lo revise. Lo decidió Mars el 23 oct 2026.
  - Incluye las cabeceras de tema y archivo, «Ver archivo», la 404 y las páginas de suscripción confirmada y baja.
  - También los títulos y descripciones de cada página en los dos idiomas, la descripción del JSON-LD `Blog`, los errores del formulario sin copy, las etiquetas de compartir y el estado vacío.
  - Cada fase lista en su resumen los textos nuevos que ha redactado. Nada llega a producción sin que Mars los haya visto.
  - No se usan marcadores `[PENDIENTE]` para estos textos.

### 1.1 Decisiones de Claude, revisables por Mars

Salieron de la revisión del documento. Mars puede cambiar cualquiera.

- **Contenido de los tests:** los builds de prueba (e2e, axe y comparación con el prototipo) usan señales de ejemplo con los títulos del prototipo, en `signals/tests/fixtures/content/`.
  - Solo entran cuando una variable de entorno apunta la colección a esa carpeta.
  - Un test comprueba que el build de producción no contiene ninguna.
  - En producción solo sale lo que Mars publica. Si no hay nada, la home enseña el estado vacío.
- **Idioma al llegar:** igual que en el portfolio, como quiso Mars allí.
  - El Worker lleva a cada visitante a su idioma por la cookie `lang` o por `Accept-Language`, con la negociación de `src/lib/language.ts`.
  - En la home, al `/` o al `/en`. En un artículo, a su traducción si existe, con un mapa de traducciones generado en el build.
  - Nunca redirige a buscadores ni en la navegación interna.
- **Reglas de marca en las señales:**
  - El copy de la interfaz y los componentes cumplen todas las prohibiciones del portfolio: `brand.test.ts` pasa a cubrir también `signals/src`.
  - En el texto de las señales solo se aplica la regla de la raya larga, fuera de los bloques de código. `signals:import` se detiene si encuentra una y dice en qué línea está.
  - Las demás prohibiciones (OpenClaw, «16 años», niveles MCER…) eran sobre el perfil de Mars y no se aplican a lo que escribe en el blog: una noticia puede nombrar OpenClaw.
- **Páginas sin diseño propio:** tema, archivo, 404 y las de suscripción confirmada y baja se montan con las piezas y medidas de la home (cabecera más pequeña, la misma lista y la misma columna lateral). Que «coincidan con el prototipo» quiere decir eso.

## 2. Rutas

| Página               | ES                                                   | EN                                                  |
| -------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| Home                 | `/`                                                  | `/en`                                               |
| Artículo             | `/{slug}`                                            | `/en/{slug}`                                        |
| Tema                 | `/temas/noticias-ia`, `/temas/practica`, `/temas/tutoriales` | `/en/topics/ai-news`, `/en/topics/practice`, `/en/topics/tutorials` |
| Archivo (todo)       | `/archivo`                                           | `/en/archive`                                       |
| RSS                  | `/rss.xml`                                           | `/en/rss.xml`                                       |
| Suscripción (API)    | `POST /api/subscribe`                                | igual                                               |
| Confirmación y baja  | `/suscripcion/confirmada`, `/suscripcion/baja`       | `/en/subscription/confirmed`, `/en/subscription/unsubscribed` |
| 404                  | la del blog, con el mismo tono                       |                                                     |

Las pestañas de temas de la home son **enlaces** a las páginas de tema, con `aria-current` en la página actual. En el prototipo son botones que filtran, pero así funcionan sin JS, se pueden indexar y se pueden compartir. El aspecto es el mismo.

## 3. Contenido

**Content collection** `signals`, en `signals/src/content/signals/*.md`, con el `glob` loader de Astro. Un fichero por idioma:

```ts
z.object({
  number: z.number().int().positive(), // la «Señal 007»: la misma en ES y EN, así se emparejan las traducciones
  lang: z.enum(['es', 'en']),
  slug: z.string(),
  title: z.string(),
  deck: z.string(), // la entradilla: el extracto de la home y el párrafo bajo el título
  topic: z.enum(['ia', 'practica', 'tutorial']),
  cover: z.enum(['strata', 'dunes', 'orbits', 'signal']),
  coverCaption: z.string().optional(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  startHere: z.number().int().min(1).max(3).optional(), // posición en «Empieza por aquí»
  draft: z.boolean().default(false), // los borradores se ven en dev y nunca entran en build, RSS ni sitemap
});
```

**Datos que se calculan en el build,** cada uno en `signals/src/lib` con su test:

- **Número:** se pinta con 3 cifras, «007».
- **Lectura:** palabras ÷ 230, redondeado hacia arriba, «9 min de lectura».
- **Sol:** el sol de Jezero del día de publicación, `marsClock(Date.parse(fecha + 'T10:00:00Z')).sol`, como en el prototipo. Test: 21 oct 2026 da el sol 2015.
- **Fecha:** «21 oct 2026» / "Oct 21, 2026". Usa `formatShortDate` del portfolio si coincide el formato.
- **Portada:** `generateCover(cover, topic, number)` de `lib/covers.ts`, que se pinta como SVG en línea con `aria-hidden`.

**Destacados:** el destacado de la home es el último artículo publicado en ese idioma. «Siguientes señales», al final del artículo, son los dos más recientes del mismo tema y, si no hay, los dos más recientes en general.

**Lo que hay en `content/ejemplos/`:**

- Los artículos del prototipo **son de ejemplo y no se publican**.
- El 007, el tutorial de SQLite FTS5, está escrito entero en ES y EN y va con `draft: true` para que Mars lo revise. Cópialo a la colección como borrador.
- Los demás títulos solo enseñan el diseño: no crees esos artículos.
- Si la colección está vacía, la home muestra un estado vacío digno con la suscripción: «Las primeras señales están en camino.» Pide el copy definitivo a Mars; mientras tanto, deja `[PENDIENTE: copy estado vacío]`.

### 3.1 Escribir en Obsidian y publicar

Decidido con Mars el 23 oct 2026: las señales se escriben en su vault de Obsidian, no en el repo. El vault es la fuente; la colección del repo es una copia que se regenera.

- **Dónde:** el vault está en el Mac, en `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/mars-vault` (iCloud). Las señales van en una carpeta `Signals/`.
  - La ruta del vault se lee de `SIGNALS_VAULT_DIR`, con esa ruta como valor por defecto.
- **Formato:** un fichero por idioma, `NNN-slug.es.md` o `NNN-slug.en.md`, con el mismo frontmatter que el esquema de §3. Obsidian lo muestra como propiedades.
  - Deja en el vault una plantilla de Obsidian (`Signals/_plantilla.md`) con todos los campos.
- **Importar:** `npm run signals:import` es un script de Node sin dependencias (`scripts/signals-import.ts`).
  - Copia todas las notas de `Signals/` a `signals/src/content/signals/`. Los borradores también se copian, para verlos con `signals:dev`; su campo `draft` decide si se publican.
  - Si una nota no cumple el esquema, el script se detiene antes de copiar nada y dice qué fichero falla y por qué.
  - Si dos notas comparten número e idioma, o si una nota del repo ya no está en el vault, lo avisa y no borra nada sin `--prune`.
  - Lleva test, con un vault de ejemplo en un fixture.
- **Lo propio de Obsidian que se convierte al importar:**
  - Un enlace `[[007-slug.es]]` (con o sin alias) a otra señal pasa a ser un enlace a su URL.
  - Un enlace `[[...]]` a una nota que no es una señal se queda como texto, sin enlace: el vault es privado.
  - Una imagen `![[captura.png]]` se busca en el vault, se copia a `signals/src/content/signals/media/NNN/` y se reescribe como imagen Markdown relativa, para que Astro la optimice.
  - El texto alternativo sale del alias de la imagen (`![[captura.png|texto]]`). Si falta, el script lo avisa.
  - Los callouts `> [!TIP]` se quedan tal cual: ya son la sintaxis que convierte `rehype-tip` (§3).
  - Los comentarios de Obsidian `%% … %%` se eliminan.
- **El ejemplo 007:** sus dos ficheros de `content/ejemplos/` se copian a `Signals/` en el vault con `draft: true`. Así el flujo se prueba de punta a punta. Al importarlos entran en la colección como borradores.

### 3.2 Traducir

Mars escribe cada señal en un solo idioma, el que le salga. La otra versión la prepara Claude y ella la revisa.

- **Comando:** `/signals-traducir <número>`, en `.claude/commands/signals-traducir.md`.
  - Lee la señal del vault y escribe la otra versión **en el vault**, junto a la original, con el mismo número, el `lang` contrario, el slug y el título traducidos y `draft: true`.
  - No toca la original. Si la traducción ya existe, no la pisa sin preguntar.
- **Cómo se traduce:**
  - No es una traducción literal. Respeta la voz de §9: «tú» peninsular sin voseo, inglés sencillo en voz activa, frases cortas y ninguna raya larga.
  - Los ejemplos y los guiños se adaptan a quien lee. El código, los comandos y los nombres propios no se traducen; los comentarios del código, sí.
  - Al español, usa las skills `marcela-prose` y `spanish-prose-craft`.
- **Publicar:** Mars revisa la traducción en Obsidian, cambia `draft` a `false` e importa. Una señal también puede publicarse en un solo idioma (§1, `hreflang` solo con traducción).

**Markdown sin dependencias:**

- **Títulos:** los `##` se numeran solos con un contador de CSS («01», «02»…), así que en el Markdown van sin número. Llevan `id` y alimentan el índice lateral con `headings` de Astro.
- **Entrada del artículo:** el primer párrafo lleva letra capital, con `.prose > p:first-of-type::first-letter`.
- **Citas:** `>` normal se pinta como la cita en serif itálica.
- **Consejos:** `> [!TIP]` se convierte en el bloque «Consejo práctico» con un plugin rehype local, unas 30 líneas en `signals/src/lib/rehype-tip.ts`, con test.
- **Bloques de código:**
  - Shiki con el tema `signals-code.json` y la cabecera de fichero desde el meta: ` ```sql title="schema.sql" `. Eso se hace con un transformer local de Shiki que envuelve el bloque en `<figure class="code">` con su `<figcaption>`, el nombre y el botón «Copiar».
  - Sin JS, el botón no aparece (`hidden` hasta que el script lo activa).
- **Enlaces externos:** dentro del artículo llevan `rel="noopener noreferrer"`. No los abras en otra pestaña salvo los de compartir, que avisan con texto para lectores de pantalla.

## 4. Páginas y componentes

Cada componente es pequeño y tiene un solo trabajo. Los estilos y medidas exactos están en `extracted/styles.css`.

**Comunes**

- **`TopBar`:** pegajosa, de 64 px.
  - Contiene la marca (glifo de señal, «Signals» en Newsreader 25 px y «BY MARS» en mono, de color acento), los temas, «Sobre Mars ↗» (al portfolio), el selector ES/EN, el tema y «Suscribirme».
  - Por debajo de 900 px se ocultan los temas; por debajo de 480 px, el selector de idioma.
- **`LightTimeStrip`:** el toque marciano principal.
  - Muestra «Señal Tierra → Marte · Tierra ●┄┄┄● Marte · Hoy tarda **12 min 29 s** · 224,7 millones de km».
  - El valor se calcula en el build (sin saltos de diseño) y un script pequeño lo actualiza al cargar y cada 60 s mientras la página está visible. Cifras tabulares.
  - El pulso viaja una sola vez (4,6 s) y se queda en Marte.
- **`SubscribeForm`:** se usa en tres sitios (portada, banda nocturna y final del artículo).
  - Lleva `label` solo para lectores de pantalla, `type="email"`, `autocomplete="email"` y un campo trampa oculto.
  - Valida en el cliente con los mensajes del copy, `aria-invalid` y el error en `role="alert"`, y devuelve el foco al campo.
  - Estado de éxito «Casi está. Revisa tu correo y confirma la suscripción.» con `role="status"`.
  - Funciona sin JS: el formulario hace POST de verdad a `/api/subscribe`, que redirige de vuelta con `?suscripcion=ok` o con el error.
  - Si se envía uno, los tres pasan a éxito.
- **`NewsletterBand`:** siempre de noche en los dos temas, con estrellas estáticas y el borde de Marte asomando, igual que el cierre del portfolio. Título «Cada señal, *en tu correo.*».
- **`Footer`:** la marca, una línea, los temas, la columna «Signals» (Suscribirme, RSS, Archivo) y la columna «Mars» (Portfolio, GitHub). Abajo, «Sol 2017 · 14:09 LMST en Jezero», en vivo con `marsClock`.
- **`Cover`:** el SVG de `generateCover`, con `preserveAspectRatio="xMidYMid slice"`. Las proporciones son 16:10 en el destacado, 3:2 en las filas (1:1 en móvil), 16:8 en el artículo y 16:9 en las tarjetas.

**Home**

- **`Masthead`:**
  - **Columna izquierda:**
    - «● TRANSMITIENDO DESDE MADRID», el titular «Señales *entre el ruido.*» (Newsreader 500, `clamp(54px, 8.6vw, 112px)`) y la entradilla en serif;
    - el formulario y «Sin spam. Te das de baja con un clic.».
  - **Columna derecha:** el artículo destacado, con portada, tema, número, título, extracto y la meta «fecha · Sol · lectura».
- **`LightTimeStrip`.**
- **`SignalFeed`:** «Últimas señales», las pestañas de temas (enlaces) y la lista.
  - Cada fila lleva tema, número, título, extracto de 2 líneas, meta y portada a la derecha.
  - Las filas se separan con líneas finas, sin tarjetas.
  - En la home se muestran los 10 más recientes sin el destacado, con «Ver archivo» al final.
- **`Sidebar`:** pegajosa en escritorio. Contiene:
  - «Empieza por aquí», con los 3 de `startHere` (01, 02, 03);
  - los temas con su recuento;
  - «Quién escribe», con el logo, el texto y «Mi portfolio ↗»;
  - el RSS.
- **`NewsletterBand`** y **`Footer`**.

Las páginas de **Tema** y **Archivo** usan la misma lista y la misma columna lateral, con una cabecera más pequeña.

**Artículo**

- **Barra de progreso:** 2 px arriba con el degradado de marca, solo con CSS (`animation-timeline: scroll(root)`). Donde no hay soporte, no aparece.
- **Cabecera (columna de 728 px):**
  - tema (enlace a su página), «SEÑAL 007», título (Newsreader 600, `clamp(36px, 4.2vw, 50px)`) y entradilla;
  - autora con el logo como avatar, «Suscribirme» y «fecha · Sol · lectura»;
  - barra de compartir: «Copiar enlace» con su estado «Enlace copiado», LinkedIn y X.
- **Portada** a 1088 px de ancho como máximo, con su pie de foto.
- **Cuerpo:**
  - columna de 680 px, Newsreader a 20 px con interlineado 1.68 y `opsz` de texto;
  - índice lateral pegajoso por encima de 1180 px;
  - viñetas con forma de piedra marciana, enlaces subrayados en acento y código en línea en mono.
- **Final:**
  - etiquetas y ficha de autora;
  - la caja «Te aviso de la próxima señal.» con su formulario;
  - «Siguientes señales» (2 tarjetas), la banda nocturna y el pie.

## 5. Interactividad (TypeScript de cliente, pequeño y sin framework)

1. Tema: reutiliza el del portfolio.
2. `light-time.ts` y el reloj del pie: se actualizan cada 60 s y paran cuando la página no está visible.
3. Formularios de suscripción: mejora progresiva sobre el POST real, con `fetch`, estados y foco.
4. «Copiar enlace» y «Copiar» en el código: Clipboard API, con el estado anunciado en `aria-live="polite"`. Si el portapapeles falla, el botón dice «No se pudo copiar».

Todo lo demás es HTML y CSS: las pestañas, el índice, la barra de progreso y las portadas.

## 6. Newsletter: proveedor por decidir

Mars lo decidirá en la fase 4. Lo que ya está decidido: **cada señal publicada es un número de la newsletter**, y cada suscriptor recibe la versión de su idioma (el `lang` con el que se apuntó). Constrúyelo detrás de una interfaz para que cambiar de proveedor sea un solo fichero:

```ts
// signals/workers/newsletter/provider.ts
export interface NewsletterProvider {
  /** Starts double opt-in: the provider emails a confirmation link. */
  subscribe(input: { email: string; lang: 'es' | 'en'; source: 'masthead' | 'band' | 'post' }): Promise<
    { ok: true } | { ok: false; reason: 'invalid' | 'rate-limited' | 'unavailable' }
  >;
}
```

- **`POST /api/subscribe`:**
  - Valida el email en el servidor.
  - Usa el campo trampa y un rate limit propio (`SUBSCRIBE_LIMIT`: 5 por minuto e IP, como en el contacto).
  - Nunca guarda el email en logs.
  - Responde JSON si lo pide `fetch` y, si no, redirige.
- **Proveedor de desarrollo:** `DevProvider` responde siempre `ok` y no envía nada. Es el único que existe hasta que Mars decida.
- **En producción, mientras no haya proveedor real,** los formularios no se muestran y la banda dice `[PENDIENTE: newsletter]`. Así nunca se promete un email que no va a llegar.
- **Envío por artículo:** depende del proveedor elegido (RSS a email, webhook al desplegar…). Déjalo documentado en el README cuando se decida.
- **Opciones que valorar con Mars:**
  - un servicio con RSS a email y doble confirmación ya resuelta, como Buttondown;
  - todo en Cloudflare, con D1 y Email Service: confirmación, bajas, rebotes y envío los construimos nosotros. Ojo: en octubre de 2026, Email Service solo admite correo transaccional (sin envíos masivos ni de marketing) y como máximo 50 destinatarios por mensaje.
- **Queda por decidir con el proveedor:** si una señal solo existe en un idioma, ¿se envía también a quien se apuntó en el otro?

## 7. SEO, RSS y rendimiento

- **SEO:**
  - Título y descripción por página e idioma, `canonical` en `signals.marsgotta.com` y `hreflang` solo entre traducciones reales.
  - JSON-LD `Blog` en la home y `BlogPosting` en cada artículo, con `author` = la `Person` del portfolio (`url` marcelagotta.com).
  - Sitemap y `robots.txt` propios. `llms.txt` como en el portfolio, si aporta.
- **RSS:** un feed por idioma, con el contenido completo en HTML y sin borradores. En el `<head>`, `<link rel="alternate" type="application/rss+xml">`.
- **Imagen OG:** una por artículo, con su portada generada más el título, adaptando `scripts/og-image.ts`. Si eso exige una dependencia nueva, pregunta y usa mientras tanto una OG genérica del blog.
- **Fuentes:**
  - Newsreader en local, desde `assets/fonts/`, con `font-display: swap`.
  - Precarga solo `newsreader-latin-opsz-normal.woff2`; la itálica y latin-ext se cargan por `unicode-range` y por uso.
- **Rendimiento:** LCP por debajo de 2,5 s en móvil, CLS 0 y animaciones solo con `transform` y `opacity`. Sin JS en lo que no lo necesita.

## 8. Accesibilidad (bloqueante)

- **Nivel:** WCAG 2.2 AA, con foco visible (anillo de acento de 2 px), enlace para saltar al contenido y navegación completa con teclado.
- **Contraste:** los colores de tema en texto pequeño cumplen AA en los dos temas; están en `styles.css`, no los cambies.
- **Animaciones:** todas terminan antes de 5 s (el pulso del punto, 2 × 2,4 s; la señal de la franja, 4,6 s), así que no hace falta botón de pausa (2.2.2).
- **`prefers-reduced-motion`:** sin animaciones ni zoom de portadas, y la señal ya colocada en Marte.
- **Marcado:**
  - Las portadas son decorativas (`aria-hidden`).
  - El índice es un `<nav>` con su etiqueta.
  - Los consejos son un `<aside>` con su etiqueta.
  - Los avisos de «Enlace copiado» van en `aria-live="polite"`.
- **Prueba:** axe sin violaciones en la home, una página de tema, un artículo, el archivo y la 404, en los dos idiomas y los dos temas.

## 9. Marca

- **Voz:** la misma que el portfolio. Directa, sin venderse, en frases cortas; español peninsular con «tú»; inglés sencillo en voz activa.
- **Estilo:** nunca rayas largas (—); los rangos, con la raya corta (–).
- **Signals by Mars ya se puede nombrar:** Mars quitó la regla que lo prohibía en `CLAUDE.md`, el HANDOFF y `src/brand.test.ts` (commit `2f219da`).
  - El portfolio solo enlaza el blog cuando Mars lo pida.
  - El chat «habla con Deimos» sigue prohibido.
- **Física:** el tiempo de luz, el sol y la LMST son reales: no los redondees por estética.

## 10. Plan por fases

Cada fase empieza con un plan breve y espera el OK. Termina con `lint`, `typecheck`, `test` y `build` de **las dos apps** en verde, revisión en el navegador (1440 y 390 px, dos temas, dos idiomas, reduced-motion), un commit y un resumen.

0. **Andamiaje:** `signals/` con Astro e i18n, los scripts, `wrangler.jsonc` sin rutas de producción, los tokens y las fuentes y las importaciones compartidas.
1. **Contenido y lógica:** colección y esquema, la importación desde Obsidian (§3.1) con el ejemplo 007 como borrador, el comando `/signals-traducir`, y en `lib/`: `light-time`, `covers`, lectura, sol, fechas y destacados, todo con tests.
2. **Home, temas y archivo:** `TopBar`, `Masthead`, `LightTimeStrip`, `SignalFeed`, `Sidebar`, `NewsletterBand` (todavía sin envío), `Footer` y el estado vacío.
3. **Artículo:** prose, Shiki con su tema, `rehype-tip`, índice, compartir, progreso, autora y siguientes señales.
4. **Newsletter:** `SubscribeForm`, `/api/subscribe`, la interfaz `NewsletterProvider` con `DevProvider`, el rate limit, el campo trampa y el funcionamiento sin JS. Pregunta por el proveedor.
5. **SEO y calidad:** RSS, JSON-LD, sitemap, OG, 404, e2e con Playwright y axe, y revisión de rendimiento.
6. **Despliegue de prueba** en `*.workers.dev`. Producción y el dominio `signals.marsgotta.com`, solo con el OK de Mars.

## 11. Criterios de aceptación

- [ ] Se entra por `signals.marsgotta.com` sin pasar por el portfolio, y el portfolio no cambia: sus tests siguen en verde.
- [ ] La home, los temas, el archivo y un artículo coinciden con el prototipo a 1440 y 390 px, en los dos temas y los dos idiomas.
- [ ] El tiempo de luz coincide con los vectores de `light-time.ts` (tolerancia 0,1 millones de km) y el sol de cada artículo con `marsClock`.
- [ ] Las portadas son idénticas a las del prototipo para el mismo número, tema y tipo: hay un test que compara contra una instantánea.
- [ ] Los borradores nunca salen en el build, el RSS ni el sitemap.
- [ ] `npm run signals:import` copia las señales del vault con sus imágenes y enlaces convertidos, y se detiene si alguna no cumple el esquema.
- [ ] `/signals-traducir` deja la otra versión en el vault como borrador, sin tocar la original.
- [ ] Los formularios funcionan sin JS y con JS, y no se muestran en producción sin un proveedor real.
- [ ] axe sin violaciones, foco visible, ninguna animación de más de 5 s y reduced-motion respetado.
- [ ] LCP por debajo de 2,5 s en móvil y CLS 0.
- [ ] Ninguna dependencia nueva sin OK, ninguna raya larga en el copy y ningún contenido inventado publicado.
