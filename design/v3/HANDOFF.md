# marcelagotta.com v3 · Handoff para Claude Code

Este paquete contiene el diseño aprobado en Claude Design y todo lo necesario para construir la v3 como **proyecto nuevo, desde cero**, en esta carpeta (`Projects/marcelagotta`), con **Astro** (salida estática) y despliegue en **Cloudflare** mediante `wrangler`, en los dominios marcelagotta.com y marsgotta.com. Está escrito para que Claude Code lo lea y trabaje por fases.

La web actual (repo `MarsGotta/marsgotta`) solo sirve de referencia: no se copia su código. Todo lo necesario de ella (logo, fuentes y colores) ya está aquí.

> Fuente de verdad visual y de comportamiento: `prototype/Main.dc.html`.
> Fuente de verdad del contenido: `brief.pdf` y `messages/*.json`.

---

## 1. Qué hay en el paquete

| Ruta | Qué es |
|---|---|
| `prototype/Main.dc.html` | El prototipo completo: 5 páginas, tema oscuro y claro, ES/EN, móvil. Un único fichero. |
| `prototype/*.dc.html` (resto) | Envoltorios del canvas: solo importan `Main` con `theme`, `lang` y `route`. No tienen diseño propio. |
| `prototype/canvas.json` | Disposición del canvas (tamaños de cada vista). |
| `extracted/styles.css` | Todo el CSS del prototipo (tokens, componentes, keyframes, container queries). |
| `extracted/markup.html` | La plantilla HTML del prototipo, con sus bindings. |
| `extracted/logic.js` | La lógica: copy ES/EN, reloj marciano (Mars24), planeta WebGL, estados e interacciones. |
| `messages/es.json`, `messages/en.json` | El copy extraído tal cual, listo para el i18n de Astro. |
| `brief.pdf` | El brief de marca de Mars: contenido, voz, reglas y lo que no puede aparecer. |
| `claude-commands/` | Comandos `/v3 <fase>` y `/v3-revisar` para Claude Code. Se instalan en `.claude/commands/` en la fase 0. |
| `assets/logo.svg` | El logo actual (planeta con franjas y dos lunas), sin cambios. |
| `assets/fonts/*.woff2` | Open Sauce Two 400, 400 itálica, 500, 600 y 700 (licencia OFL), tomadas de la web actual. |
| `assets/grain.png` | Textura de grano (220×220, se repite). |

Todas las fuentes se autoalojan. Open Sauce Two va con `@font-face` sobre los woff2 de `assets/fonts`, copiados a `public/fonts/`. Sora y JetBrains Mono van con `@fontsource/sora` y `@fontsource/jetbrains-mono` (o sus variantes `-variable`), cargando solo los pesos que se usan. Ninguna fuente se pide a Google en tiempo de ejecución. Todas usan `font-display: swap` y solo se precarga la del titular (Sora 700, subconjunto latino).

### Cómo leer el formato del prototipo

El prototipo es un "Design Component" de Claude Design: HTML con un `<style>` dentro de `<helmet>` y una clase JS `Component` cuyo `renderVals()` alimenta la plantilla.

| En el prototipo | En Astro |
|---|---|
| `{{ t.hero.sub }}` | `t('hero.sub')`, un helper propio en `src/i18n/` que lee los JSON |
| `<sc-if value="{{ isDark }}">` | `{isDark && (...)}` en la plantilla, o CSS con `[data-theme]` si depende del tema |
| `<sc-for list="{{ nav }}" as="n">` | `{nav.map((n) => ...)}` |
| `onClick="{{ go.proyectos }}"` | `<a href={localizedPath('proyectos', lang)}>`: navegación real entre páginas estáticas |
| `class="mg-stage {{ stage.home }}"` | `class:list={['stage', active]}`. El `is-play` lo pone un script con IntersectionObserver. |
| `ref="{{ planetRef }}"` y estado de la clase | `<script>` del componente: TypeScript que se ejecuta en el cliente, sin framework |
| `state.route` | rutas reales de `src/pages/` |
| `/_blob/…` en `@font-face` y en `.mg-grain` | rutas de `public/` (`/fonts/…` y `/grain.png`) |

Casi todo es HTML y CSS estático renderizado en build. Solo llevan script la interactividad y lo que depende de la hora: tema, idioma, menú, pestañas, demos, constelación, formulario y planeta.

El prefijo `mg-` existe solo para aislar estilos en el canvas. Con los estilos con scope de Astro puede desaparecer.

---

## 2. Arquitectura propuesta

Estructura del proyecto nuevo: Astro con `output: 'static'` y TypeScript estricto. Los tokens viven en `src/styles/tokens.css` (sección 3) y cada componente lleva sus estilos con scope.

```
astro.config.mjs          site: 'https://marcelagotta.com', i18n (es por defecto sin prefijo, en con /en), sitemap
wrangler.jsonc            Worker con static assets (dist/) y custom domains (ver «Despliegue»)
public/
  fonts/                  Open Sauce Two (woff2)
  grain.png, logo.svg, favicon, robots.txt, og/
src/
  i18n/
    es.json, en.json      copiados de design/v3/messages
    index.ts              t(lang, key), getLangFromUrl(), localizedPath(route, lang), tabla de rutas
  styles/
    tokens.css            tokens de los dos temas (sección 3)
    global.css            reset, tipografía base y keyframes compartidos
  layouts/
    Base.astro            <html lang data-theme>, head (SEO, hreflang, canonical, JSON-LD), Nav, Footer,
                          Grain, DawnOverlay y el script inline del tema
  pages/
    index.astro, sobre-mi.astro, proyectos.astro, charlas.astro, contacto.astro
    en/index.astro, en/about.astro, en/projects.astro, en/talks.astro, en/contact.astro
                          Cada página es fina: elige idioma y compone secciones de src/components.
    404.astro
  components/
    nav/        Nav, Brand (logo.svg + "marcela.gotta"), LangSwitch, ThemeToggle, MobileMenu
    hero/       Hero, Headline (palabra a palabra), Starfield, Warp, PlanetSystem, Moons, JezeroMarker,
                Legend, SurfaceScene (tema claro)
    now/        NowBand (lee src/content/now.ts)
    system/     ProjectSystem, Orrery, ProjectTabs, DemoStage, KimenDemo, JezeroDemo, OrbitDemo
    trajectory/ TransferOrbit (inicio, 3 órbitas) y TransferTimeline (sobre mí, 6 órbitas)
    about/      Intro, QuickFacts, Leadership, Constellation (+ TechList en móvil)
    projects/   ProjectChapter, OnmarsBand
    talks/      TalkList
    contact/    Channels, ContactForm
    footer/     Footer
  scripts/                TypeScript de cliente, sin framework, importado desde los <script> de los componentes
    theme.ts, menu.ts, project-tabs.ts, demos.ts, constellation.ts, contact-form.ts, parallax.ts
  lib/
    mars-clock.ts         Mars24 (porta mgMarsClock tal cual) + tests en Vitest
    planet/               shaders.ts (MG_VS, MG_BAKE_FS, MG_FS) y planet.ts (mgPlanet como clase con dispose())
    motion.ts             prefersReducedMotion() y el estado de pausa compartido (botón SIM)
  content/
    now.ts                "Ahora mismo": 4 líneas + updatedAt, fácil de editar
worker/
  index.ts                Solo si hace falta: /api/contact y redirección de dominios (ver «Despliegue»)
```

Notas de implementación:

- **Tema.**
  - `data-theme="dark|light"` en `<html>`, guardado en `localStorage`.
  - Un script inline y bloqueante en el `<head>` aplica el tema antes de pintar, para evitar el parpadeo. Sin preferencia guardada, el tema es oscuro.
  - El cambio de tema reproduce el amanecer: overlay a pantalla completa, cambio a los 560 ms y retirada a los 1300 ms (ver `.mg-dawn` y `toggleTheme`). Con reduced-motion, cambio instantáneo.
- **Idioma.**
  - i18n nativo de Astro: cada idioma son páginas estáticas propias, y el selector ES/EN enlaza a la ruta equivalente del otro idioma.
  - Los arrays (`now.items`, `about.roles`, `talks.items`…) se leen directamente del JSON tipado.
- **HUD.** Decidido con Mars: la web no lleva el recuadro de telemetría del prototipo (coordenadas, hora de Madrid, sol y LMST de Jezero). No aportaba información y en móvil empujaba el hero hacia abajo. El botón SIM vive en el pie.
- **Hero en escritorio.** Decidido con Mars: el titular y el planeta suben entre 40 y 56 px respecto al prototipo (`--hero-lift`). El hero mide lo mismo: ese espacio pasa a quedar bajo los botones.
- **Planeta.**
  - La esfera CSS (`.mg-orb`) va en el HTML como fallback.
  - `planet.ts` se importa de forma dinámica unos 140 ms después del primer pintado, para no competir con el LCP del titular, y se funde al canvas cuando WebGL está listo (`data-gl="on"`).
  - Se pausa fuera de pantalla y con el botón SIM.
  - En producción, `preserveDrawingBuffer: false` (en el prototipo es `true` para que el canvas salga en las exportaciones).
- **Demos de proyectos.**
  - Su estado por defecto es el estado final, estático y completo.
  - `demos.ts` añade `is-play` cuando el escenario entra en pantalla (IntersectionObserver, umbral 0.3) y la animación se reproduce una vez.
  - Las pestañas de proyectos cambian el panel sin recargar.
- **Formulario.**
  - Envía a `/api/contact` en el Worker (`workers/site/`, ver «Despliegue»), con el Email Service de Cloudflare: desde `web@mail.marcelagotta.com` a `me@marcelagotta.com`, con `Reply-To` a quien escribe.
  - Funciona como mejora progresiva: sin JS, el Worker redirige a `#contact-sent` o `#contact-error` y `:target` muestra el resultado; con JS, `fetch` y el resultado en el sitio.
  - Confirmación: «Recibido. Te contesto en unos días.», con la animación del paquete del prototipo. El mensaje de error está pendiente de copy.

### Despliegue en Cloudflare

- **Herramienta.** `wrangler`, ya instalado en la máquina. Antes de nada, comprueba la sesión con `wrangler whoami` y que las zonas **marcelagotta.com** y **marsgotta.com** están en esa cuenta. Si falta algo, para y avisa.
- **Modelo.** Worker con static assets: `wrangler.jsonc` con `assets.directory: "./dist"`, `not_found_handling: "404-page"` y `compatibility_date` actual.
  - `/api/contact` va en `main: "workers/site/index.ts"`, con `assets.run_worker_first: ["/api/*"]`: el resto de rutas no ejecuta código.
- **Dominios.**
  - Rutas con `custom_domain: true` para marcelagotta.com, www.marcelagotta.com, marsgotta.com y www.marsgotta.com.
  - El canónico es **https://marcelagotta.com**: los otros tres redirigen con 301 conservando ruta y query.
  - Decidido: un Worker aparte (`workers/redirect/`) con los tres dominios secundarios. El sitio principal sigue sin ejecutar código y la redirección queda versionada y con tests. Las Redirect Rules no eran viables: el token de wrangler no tiene permisos de reglas ni de DNS.
- **Secretos.** Con `wrangler secret put`, nunca en el repo.
- **Scripts.** `npm run deploy` (build + `wrangler deploy`) y `npm run preview:cf` (`wrangler dev` sobre `dist/`).
- **Producción.** No se despliega sin el OK explícito de Mars. Antes, prueba en la URL `*.workers.dev`. Documenta el despliegue en el README.

---

## 3. Tokens

Copia los valores exactos de `.mg-app` y `.mg-app[data-theme="light"]` en `extracted/styles.css`. Resumen:

| Token | Oscuro (el espacio) | Claro (la superficie) |
|---|---|---|
| `--bg` | `#0A0614` Vacío | `#F6E4D3` Cielo polvoriento |
| `--bg-alt` | `#130B24` Fondo alt | `#F1DAC5` (derivado) |
| `--bg-deep` | `#1F1331` Deep space | `#E8C9AA` Arena |
| `--card` | `rgba(255,245,238,.035)` | `#FBEFE1` Pergamino |
| `--fg` | `#FFF5EE` Texto | `#3A1A0E` Óxido oscuro |
| `--fg-muted` | `#A99CB8` Texto suave | `#7A3D24` Siena |
| `--fg-subtle` | `#8A7D9A` (derivado, 5.2:1) | `#8A5238` (derivado, 5.1:1) |
| `--accent` / `--italic` | `#B29BE4` Lila | `#845ABE` Violeta (solo texto grande) |
| `--warm` | `#FF7F4A` Naranja vivo | `#C54A2E` Rojo acento |
| `--warm-text` | `#FF7F4A` | `#9B3718` (secondary-700, 5.7:1) |
| `--grad` («contigo.») | `#E9603A → #E64241 → #D11772` | `#C54A2E → #D93B3A → #D11772` |
| `--btn-bg` / `--btn-fg` | `#FFF5EE` / `#0A0614` | `#3A1A0E` / `#FBEFE1` |
| `--kimen` / `--jezero` / `--orbit` | `#FF7F4A` / `#B29BE4` / `#FFF5EE` | `#C54A2E` / `#6F46A4` / `#3A1A0E` |

Contraste validado (WCAG 2.2 AA): fg 18.6:1 y 12.7:1, muted 7.75:1 y 6.73:1, subtle por encima de 5:1. El violeta claro y el degradado solo se usan en texto grande (3:1 como mínimo).

**Tipografía.** Sora 700 para titulares (tracking −0.045em en display, `line-height` 0.93). «que piensa» va en cursiva sintetizada (Sora no tiene itálica), como en la web actual. Open Sauce Two 400/500/600 para texto e interfaz, a 17 px de base y 1.6 de interlineado. JetBrains Mono 500 a 10.5–11 px, en mayúsculas y con tracking 0.1–0.16em, para etiquetas y datos.

**Escala.** Display `clamp(46px, 9cqi, 150px)`, H1 `clamp(48px, 8.4cqi, 132px)`, H2 `clamp(38px, 5.4cqi, 80px)`, H3 `clamp(26px, 2.7cqi, 40px)`. El prototipo usa unidades `cqi` sobre un contenedor raíz `.mg` (`container-type: inline-size`). En la web real puedes cambiarlas por `vw` y las container queries por media queries.

**Layout.** Contenedor de 1344 px con un margen lateral de `clamp(20px, 4.4cqi, 64px)`. Los botones miden 54 px de alto con radio de 14 px (radius-lg de MarsUI). Los chips son pastillas.

---

## 4. Física: valores que no se tocan

Todo lo espectacular es además correcto. Si algo se ajusta por estética, que sea sin romper estas relaciones.

**Escala temporal.** 1 h de Marte equivale a 1 s en pantalla (×3600):

- Rotación de Marte: 24.6229 s (24 h 37 min).
- Fobos: 7.654 s (7 h 39 min).
- Deimos: 30.312 s (30 h 18 min).

**Distancias reales en radios de Marte.** Fobos a = 2.766 R (9 376 km) y Deimos a = 6.922 R (23 463 km), con R = 3 389,5 km. Así se cumple la tercera ley de Kepler y Fobos adelanta a la superficie.

**Cámara.** Está 13° por encima del ecuador marciano: las elipses tienen ry/rx = sin 13° = 0.225. En CSS se usa `scaleY(.225)` en el plano de la órbita y `scaleY(4.4444)` en la luna para contrarrestarlo. El polo norte se inclina hacia el espectador también en el shader (`uTilt`).

**Órbitas.** Son progradas: en pantalla, giro antihorario (`rotate(-360deg)`). La mitad superior de cada elipse queda detrás del planeta (z-index 1) y la inferior delante (z-index 4); el cambio ocurre al 50 % de la animación.

**Fases iniciales.** Fobos arranca con un delay de −5.315 s (θ = 250°) y Deimos con −19.787 s (θ = 235°).

**Eclipses.** Cada luna se oscurece al cruzar la sombra de Marte:

- Fobos: del 5.3 % al 16.9 % de su periodo.
- Deimos: del 8.8 % al 13.4 %.

**Sol.**

- Azimut −50° respecto al meridiano central (al oeste).
- Latitud subsolar y longitud subsolar reales al cargar la página, calculadas con Mars24 (Allison y McEwen 2000, NASA GISS).
- A partir de ahí, time-lapse ×3600.

**Jezero.**

- Coordenadas: 18.4447°N, 77.4508°E.
- Sol de la misión: `floor(MSD + 77.4508/360) − 52304`. Verificado: el sol 1000 cae el 13 de diciembre de 2023.
- Hora: el marcador sobre el planeta muestra la LMST simulada, que coincide con la real (`marsClock`) en el momento de cargar.

**Tema claro.** Es la vista desde Jezero mirando al sur:

- El sol sale por el este, a la izquierda, con el halo azul.
- Fobos cruza de derecha a izquierda (sale por el oeste) en 255 s, con un ciclo de 666 s.
- Deimos cruza de izquierda a derecha en 3 936 s.
- Escala ×60.

**Orrery de proyectos.** Radios de 118, 188 y 258 y periodos de 40 s, 80.4 s y 129.3 s (T² ∝ a³).

**Trayectoria.** Semielipses de Hohmann reales, con a = (r1 + r2)/2 y b = √(r1·r2). Los `d` de los paths SVG ya están calculados en el prototipo.

**Textura del planeta.** Es procedural: se hornea en GPU a 2048×1024 (1024×512 en móvil). No se descarga ninguna imagen. Albedo y relieve aproximan Syrtis Major, Hellas, Valles Marineris, Tharsis y Olympus Mons en sus coordenadas reales.

---

## 5. Movimiento, accesibilidad y rendimiento

**Momento wow:**

- La intro dura menos de 3 s y nunca bloquea la lectura.
- Titular: palabras desde 0.35 s, con 0.12 s entre una y otra.
- Subtítulo a 1.25 s y botones a 1.45 s.
- Leyenda a 2.0 s.
- Llegada del sistema y de los campos de estrellas: 2.5–2.8 s.

**Calma después.** Por debajo del hero no hay animaciones de entrada. Las demos se reproducen una sola vez, al entrar en pantalla.

**Pausa (WCAG 2.2.2).** El botón «SIM ×3600» del pie, en todas las páginas, pausa todas las animaciones en bucle y el planeta, y pasa a «SIM ×0».

**`prefers-reduced-motion`.** Muestra la versión estática completa: lunas detenidas en su fase, titular visible, demos en su estado final y cambio de tema instantáneo.

**Teclado y foco.**

- Foco visible (`outline` de 2 px en `--warm`) y enlace «Saltar al contenido».
- Las pestañas de proyectos son `<button aria-pressed>`.
- El menú móvil es un `dialog`: se cierra con Escape y pone el foco en el botón de cerrar al abrirse.

**Cursor y sonido.** Sin cursor personalizado, sin sonido y sin pantallas de carga.

**Rendimiento:**

- LCP por debajo de 2.5 s en móvil.
- El LCP es el titular (texto); las fuentes van con `display: swap`.
- El WebGL arranca después del primer pintado, se pausa fuera de pantalla y limita el DPR a 2 (1.5 en móvil).
- Las animaciones usan solo `transform` y `opacity`.
- La parallax de scroll y el trazado de las trayectorias usan scroll-driven animations de CSS (`animation-timeline`) como mejora progresiva. Sin soporte, se ve el estado final.

---

## 6. Contenido y reglas de marca

- **Copy.** Todo el texto está en `messages/es.json` y `messages/en.json`. Úsalo tal cual.
- **«Ahora mismo».** Debe salir de un fichero de datos fácil de editar (`content/now.ts`), con la fecha de actualización visible.
- **Reglas de estilo:**
  - Nada de rayas largas (—) en los textos: coma, dos puntos o punto.
  - Español con «tú», sin voseo.
  - Inglés profesional sencillo, en voz activa.
- **No puede aparecer:**
  - Deimos o Lunar como proyectos, el Orbit antiguo, OpenClaw ni «Senior Product Engineer».
  - «agent harnesses» en el titular, «16 años» ni «aprendiendo Rust de la mano de Lunar».
  - Clientes de Sngular, nivel de inglés en escala MCER ni datos personales.
  - Cifras para impresionar en el hero o en las tarjetas.
  - Enlaces a repos no públicos (Orbit, hasta que se publique) ni llamar open source a algo sin repo público.
  - «Signals by Mars» ni el chat «habla con Deimos».

### Decisiones ya tomadas en el diseño

1. **Entradilla de Proyectos.** Dice «Kimen y Jezero ya son open source; Orbit lo será al abrir su beta» en lugar de «Los tres son open source», porque Orbit aún no tiene repo público. Orbit muestra «Repo público al abrir la beta», sin enlace.
2. **Iconos de «Ahora mismo».** Los emojis del brief son ahora iconos de línea propios (SVG en la plantilla).
3. **Cuarta línea de «Ahora mismo».** Dice «Head Frontend Developer en Sngular».
4. **Cierre del Inicio.** «¿Hablamos un rato?», con «un rato?» en lila cursiva; en inglés, «Shall we talk for a bit?».
5. **Microcopy añadido.** Lo escribió el diseño, así que revísalo con Mars:
   - Leyenda de física y caption de Kepler.
   - Instrucción de la constelación.
   - Contenido de ejemplo de las tres demos.

---

## 7. Plan por fases

Trabaja una fase cada vez y para al final de cada una para revisión.

0. **Proyecto.**
   - Instala los comandos de Claude Code: copia `design/v3/claude-commands/*.md` a `.claude/commands/`.
   - Crea el proyecto Astro (última versión estable, plantilla mínima, TypeScript `strict`). Fija Node 26 en `.node-version` y usa TypeScript 6, la última versión que admiten `astro check` y `typescript-eslint`.
   - Si `create astro` no acepta la carpeta porque no está vacía, créalo en una carpeta temporal fuera de esta y copia aquí su contenido sin pisar `CLAUDE.md`, `.claude/` ni `design/`.
   - Inicializa git con un `.gitignore` para `node_modules`, `dist`, `.astro`, `.wrangler` y `.env*`.
   - Añade ESLint (con `eslint-plugin-astro` y `eslint-plugin-jsx-a11y`), Prettier (con `prettier-plugin-astro`), `@astrojs/sitemap`, `@fontsource/sora`, `@fontsource/jetbrains-mono`, `vitest`, `@playwright/test`, `@axe-core/playwright` y `wrangler` como dependencia de desarrollo.
   - Scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck` (`astro check`), `test`, `test:e2e`, `deploy` y `preview:cf`.
   - Copia las fuentes de `assets/fonts` a `public/fonts/`, y `grain.png` y `logo.svg` a `public/`.
   - Crea `wrangler.jsonc` sin dominios todavía. Comprueba que `npm run build` pasa y que `wrangler dev` sirve `dist/`.
1. **Base.** Tokens en `src/styles/tokens.css`, fuentes autoalojadas, `Base.astro` con el script del tema y el overlay de amanecer, i18n y tabla de rutas, `Nav` (incluido el menú móvil) y `Footer`.
2. **Inicio sin WebGL.**
   - Hero: titular palabra a palabra, starfield, warp, esfera CSS, lunas y órbitas en CSS y leyenda.
   - Escena de superficie para el tema claro.
   - `NowBand`, `ProjectSystem` con las tres demos, `TransferOrbit` y el cierre.
3. **Planeta WebGL.** `src/lib/planet/` (porta `mgPlanet`, `MG_BAKE_FS`, `MG_FS` y `mgMarsClock`), carga diferida, marcador de Jezero y fallback.
4. **Páginas interiores.** Sobre mí (con `TransferTimeline` y `Constellation`), Proyectos, Charlas y Contacto. El formulario queda con `mailto:` hasta la fase 7.
5. **Móvil, tema claro y EN.** Recorre todas las páginas a 390 px y a 1440 px en los dos temas y los dos idiomas.
6. **Calidad.** axe sin violaciones, Lighthouse móvil (LCP por debajo de 2.5 s, CLS 0), navegación completa con teclado, prueba con reduced-motion y tests de `mars-clock` (sol 1000 el 13 de diciembre de 2023; LMST de aterrizaje 15:53).
7. **SEO y despliegue.**
   - Título «Marcela Gotta · Senior Software Engineer» y descripción con el titular.
   - `hreflang` y `canonical` (siempre en marcelagotta.com), sitemap y `robots.txt`.
   - Datos estructurados `Person` con `sameAs` a LinkedIn, GitHub y X.
   - Imagen OG con la estética del hero (pendiente de diseño).
   - Endpoint `/api/contact` con el Email Service de Cloudflare (elegido por Mars).
   - Despliegue a `*.workers.dev`. Con el OK de Mars: dominios propios, redirecciones 301 al canónico y despliegue a producción.

## 8. Criterios de aceptación

- [ ] Las 5 páginas en ES y EN, en tema oscuro y claro, en escritorio y móvil, coinciden con el prototipo.
- [ ] El cambio de tema reproduce el amanecer y se recuerda entre visitas.
- [ ] El botón SIM pausa todo.
- [ ] Fobos da casi 4 vueltas por cada una de Deimos, pasa por delante y por detrás de Marte y se oscurece en su sombra.
- [ ] El planeta carga con la iluminación real del momento y el marcador de Jezero coincide con la LMST real al cargar.
- [ ] Las demos arrancan al entrar en pantalla y su estado final es completo sin JS.
- [ ] Con reduced-motion, todo es estático y completo.
- [ ] Ninguna regla de la sección 6 se incumple.
- [ ] Lighthouse móvil: LCP por debajo de 2.5 s; axe: 0 violaciones.
- [ ] `lint`, `typecheck`, `test`, `test:e2e` y `build` en verde.
- [ ] https://marcelagotta.com sirve la web. www.marcelagotta.com, marsgotta.com y www.marsgotta.com redirigen con 301 conservando la ruta.

## 9. Pendiente de diseñar

- Imagen OG.
- Plantilla del Laboratorio (fuera de la navegación por ahora).
- Página 404.
