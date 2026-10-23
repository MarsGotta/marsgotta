# marcelagotta.com v3

Web personal de Marcela Gotta («Mars»): ingeniera de software en Madrid, Head Frontend Developer en Sngular, autora de Kimen, Jezero y Orbit. Es un proyecto nuevo, construido desde cero en esta carpeta, con **Astro** y desplegado en **Cloudflare** con `wrangler` en marcelagotta.com (canónico) y marsgotta.com. La web actual (repo `MarsGotta/marsgotta`, en Next.js) solo sirve de referencia.

## Fuentes de verdad

- **Guía de implementación:** `design/v3/HANDOFF.md`. Léela entera antes de la primera fase. Incluye la arquitectura Astro, el despliegue en Cloudflare, el plan por fases y los criterios de aceptación.
- **Diseño y comportamiento:** `design/v3/prototype/Main.dc.html`, el prototipo navegable de Claude Design. Incluye las 5 páginas, los temas oscuro y claro, ES/EN y la versión móvil.
- **CSS, plantilla y lógica ya separados:** `design/v3/extracted/`. Medidas, colores y tiempos se copian de ahí, no se estiman.
- **Contenido:** `design/v3/messages/es.json` y `design/v3/messages/en.json`. Son el copy definitivo: no lo reescribas.
- **Marca, voz y límites:** `design/v3/brief.pdf`.
- **Assets:** `design/v3/assets/`: logo, Open Sauce Two y textura de grano.

## Stack (decidido)

- **Base:** Astro 7 (última versión estable), `output: 'static'` y TypeScript estricto. Gestor de paquetes: npm.
  - Node 26, fijado en `.node-version`: Astro 7 pide Node 22.23.4 o superior.
  - TypeScript 6: `astro check` y `typescript-eslint` aún no admiten TypeScript 7.
- **Idiomas:** i18n nativo de Astro, con es por defecto sin prefijo y en con `/en`. Rutas:
  - `/`, `/sobre-mi`, `/proyectos`, `/charlas`, `/contacto`
  - `/en`, `/en/about`, `/en/projects`, `/en/talks`, `/en/contact`
  - El idioma se elige solo: al llegar, el Worker lleva al visitante a su idioma (el de su navegador o el que eligió antes en el selector, guardado en una cookie). El tema sigue al del sistema hasta que el visitante lo cambia.
- **Estilos:** componentes `.astro` con estilos con scope y tokens globales en `src/styles/tokens.css`. Sin Tailwind ni frameworks de UI (nada de React, Vue o Svelte).
- **Interactividad:** TypeScript de cliente pequeño en `src/scripts/`, sin framework.
  - Cubre el tema y el amanecer, el menú, las pestañas, las demos, la constelación, el formulario y la parallax.
  - El planeta WebGL va en `src/lib/planet/`, con carga diferida tras el primer pintado.
- **Fuentes:** autoalojadas, con `font-display: swap`.
  - Open Sauce Two desde `public/fonts/`.
  - Sora y JetBrains Mono con `@fontsource`.
  - Solo se precarga la fuente del titular (Sora 700, subconjunto latino).
- **Calidad:**
  - ESLint (`eslint-plugin-astro` y `eslint-plugin-jsx-a11y`), Prettier (`prettier-plugin-astro`) y `astro check`.
  - Vitest para `src/lib` y Playwright con `@axe-core/playwright` para e2e y accesibilidad.
- **Despliegue:** Cloudflare Worker con static assets (`wrangler.jsonc`, directorio `dist/`). El `wrangler` ya está instalado. Detalle en HANDOFF §2, «Despliegue en Cloudflare».
- **Formulario:** `POST /api/contact` en el mismo Worker (`workers/site/`), con el Email Service de Cloudflare (binding `send_email`), sin dependencias ni secretos.
- **Dependencias:** las de esta lista, sin más. Cualquier otra, pregúntame antes.

## Código legible (no negociable)

- **Componentes:** pequeños, con una responsabilidad y un nombre claro. Las páginas solo componen secciones.
- **Nombres:** en inglés para el código. El copy vive en `src/i18n/*.json`, nunca escrito a mano en los componentes.
- **Comentarios:** solo para explicar un porqué. Ejemplos: la física, una decisión de accesibilidad, un truco de rendimiento.
- **Lógica:** la lógica pura va en `src/lib`, con tests. Sin código muerto, sin `any` y sin estilos inline salvo valores dinámicos.

## Cómo trabajamos

- **Por fases.** El plan está en `design/v3/HANDOFF.md`, sección 7, de la fase 0 a la 7. Lanza una fase con `/v3 <n>` y revisa el conjunto con `/v3-revisar`.
- **Comandos.** Están en `.claude/commands/`, con una copia en `design/v3/claude-commands/`.
- **Antes de cada fase:** un plan breve, con los ficheros a crear o cambiar, y espera mi OK.
- **Al terminar cada fase:**
  - `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` sin errores.
  - Si hay UI, revísala en el navegador a 1440 y 390 px, en los dos temas, en los dos idiomas y con reduced-motion.
  - Un commit, un resumen y para.
- **Commits** pequeños, en español y en imperativo.
- **Si el prototipo y la realidad chocan** (un límite de Astro o del navegador), pregunta en vez de improvisar.
- **No inventes contenido.** Si falta algo, no dejes un marcador: redáctame una propuesta con mi voz y enséñamela en el resumen, marcada como propuesta. Nada de eso se publica en producción sin mi OK.
- **Despliegue:**
  - Nunca despliegues a producción ni toques DNS o dominios sin mi OK explícito. Primero, `*.workers.dev`.
  - Los secretos van con `wrangler secret put`, nunca en el repo.

## Reglas de marca (detalle en HANDOFF §6)

- **Voz:**
  - Directa, sin venderse, en frases cortas.
  - Español peninsular con «tú», sin voseo.
  - Inglés profesional sencillo, en voz activa.
- **Estilo:**
  - Nunca rayas largas (—) en los textos: coma, dos puntos o punto.
  - Ni cifras para impresionar en el hero ni en las tarjetas.
- **No puede aparecer:**
  - Deimos o Lunar como proyectos, el Orbit antiguo, OpenClaw ni «Senior Product Engineer».
  - «agent harnesses» en el titular, «16 años», clientes de Sngular, nivel de inglés en escala MCER ni datos personales.
  - Ningún enlace al repo de Orbit (hasta que sea público) ni el chat «habla con Deimos».
- **Orbit:** no se llama open source hasta que tenga repo público.

## Física: no tocar (HANDOFF §4)

Los periodos de Fobos (7 h 39 min) y Deimos (30 h 18 min), la rotación de Marte (24 h 37 min) a ×3600, las distancias en radios de Marte (2.766 y 6.922), la cámara a 13°, los eclipses, la Tercera Ley de Kepler del orrery, las elipses de Hohmann y el algoritmo Mars24 son reales. No los redondees ni los ajustes por estética. `src/lib/mars-clock.ts` lleva tests: el sol 1000 de Perseverance cae el 13 de diciembre de 2023 y la LMST del aterrizaje fue las 15:53.

## Accesibilidad, rendimiento y SEO (bloqueantes)

- **Accesibilidad:**
  - WCAG 2.2 AA, HTML semántico, foco visible y navegación completa con teclado.
  - El botón «SIM» del pie pausa todas las animaciones.
  - `prefers-reduced-motion` muestra la versión estática completa.
  - Sin cursor personalizado, sin sonido y sin pantallas de carga.
- **Rendimiento:**
  - LCP por debajo de 2.5 s en móvil y CLS 0.
  - Sin JS en lo que no lo necesita.
  - Animaciones solo con `transform` y `opacity`.
  - Sin `backdrop-filter` ni `mix-blend-mode`: cuestan pasadas de GPU en cada fotograma.
- **SEO:**
  - Título y descripción por página e idioma.
  - `hreflang`, `canonical` en marcelagotta.com, sitemap y `robots.txt`.
  - JSON-LD `Person` e imagen OG.

## Signals by Mars (blog)

- **Dónde:** el blog y la newsletter, en signals.marsgotta.com. Es una app Astro aparte en `signals/`, con su propio Worker (`signals/wrangler.jsonc`).
- **Guía:** `design/signals/LEEME.md`. Lánzalo por fases con `/signals <n>` y revísalo con `/signals-revisar`.
- **Compartido:** el `package.json`, las dependencias y el código del portfolio. Se importa con el alias `@portfolio` (por ejemplo, `@portfolio/lib/mars-clock`), sin copiarlo. Si cambias algo compartido, las dos apps tienen que seguir en verde.
- **Markdown:** lo procesa Sätteri, el procesador de Astro 7, con sus plugins en `signals/src/lib/markdown/`. `@astrojs/markdown-satteri` lo autorizó Mars el 23 oct 2026.
- **Contenido:** Mars escribe en su vault de Obsidian. Las señales se importan al repo y Claude prepara la traducción para que ella la revise.
