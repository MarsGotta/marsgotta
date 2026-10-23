# Anexo v3.1 · La home como historia

Este anexo trae **solo lo que cambia** respecto a lo que ya está desplegado. Todo lo demás (hero, páginas interiores, física, despliegue, reglas de marca) sigue igual y sigue mandando `CLAUDE.md` y `design/v3/HANDOFF.md`.

**Alcance:** la home, de debajo del hero al cierre. Ninguna otra página cambia.

## 1. Por qué cambia

La home desplegada repetía Kimen, Jezero y Orbit dos veces seguidas (la banda «Ahora mismo» y el sistema) y las secciones no se hablaban entre sí. La nueva home cuenta una historia en cuatro actos numerados, alternando el ritmo: solo tipografía, muy visual, índice, cierre grande.

| Antes (desplegado)           | Después (este anexo)                                                       |
| ---------------------------- | -------------------------------------------------------------------------- |
| Hero                         | Hero, sin cambios, más un enlace «Siguiente parada» abajo a la izquierda   |
| `NowBand` «Ahora mismo»      | **Se elimina de la home.** Su contenido pasa a las pestañas del sistema    |
| `ProjectSystem`              | **(02) Qué construyo**: mismo sistema, cada pestaña dice cómo va           |
| `TransferOrbit`              | **(03) Con quién**: lema, trayectoria y un índice Lidero / Enseño / Comparto |
| `Closing`                    | **(04) Contigo**: subtítulo nuevo y la hora de Madrid y de Jezero en vivo  |
| (no existía)                 | **(01) Por qué**: manifiesto que se ilumina palabra a palabra con el scroll |

Orden final de `src/views/HomeView.astro`:

```astro
<Hero />          <!-- + enlace «Siguiente parada · (01) Por qué» -->
<Manifesto />     <!-- nuevo: (01) Por qué -->
<ProjectSystem /> <!-- (02) Qué construyo -->
<People />        <!-- nuevo, sustituye a TransferOrbit en la home: (03) Con quién -->
<Closing />       <!-- (04) Contigo -->
```

## 2. Qué hay en esta carpeta

- `secciones/00-hero-siguiente.html` a `secciones/04-contigo.html`: el marcado de cada sección, ya con los nombres de clase del proyecto (sin el prefijo `mg-` del prototipo). Es HTML de referencia: conviértelo en componentes `.astro` y saca el texto de i18n.
- `secciones/home.css`: todos los estilos nuevos, ya en `vw` y `@media` como el resto del proyecto. Cada bloque dice a qué componente va.
- `secciones/comportamiento.md`: los tres trocitos de comportamiento (troceado del manifiesto, píldoras que eligen proyecto, relojes en vivo) y cómo encajan sin framework.
- `messages/es.patch.json` y `messages/en.patch.json`: solo las claves nuevas o cambiadas, más la lista de claves que sobran.
- `content/now.ts`: la nueva versión de `src/content/now.ts` (tres líneas, una por proyecto).
- `claude-commands/v3-anexo.md`: el comando para lanzarlo. Cópialo a `.claude/commands/`.
- `prototype/Main.dc.html`: el prototipo completo actualizado, por si necesitas comprobar una medida o un comportamiento. La home está en la ruta `inicio`.

## 3. Detalle por sección

### Hero: enlace «Siguiente parada»

Abajo a la izquierda, alineado con el contenido: flecha que bota, «SIGUIENTE PARADA» y «(01) POR QUÉ». Lleva a `#por-que`. Se oculta por debajo de 980 px. Si choca con la leyenda o con algo que hayáis movido en el hero desde el prototipo, pregunta antes de recolocar nada.

### (01) Por qué · `Manifesto.astro` (nuevo)

- Un único párrafo grande en Sora 600, `clamp(30px, 4.35vw, 66px)`, interlineado 1.12, ancho máximo 22.5em. El `<h2>` es solo para lectores de pantalla.
- El texto viene de `home.manifesto.text`: frases normales y tres fichas `@kimen`, `@jezero` y `@orbit`. Al construir la página, cada palabra va en su `<span class="w">` y cada ficha se convierte en una píldora con el color de su órbita.
- **Scroll:** cada palabra pasa de opacidad .14 a 1 al cruzar la pantalla, solo con CSS (`animation-timeline: view()`). Sin soporte, con `prefers-reduced-motion` o con SIM en pausa, el texto se ve entero desde el principio. Cero JS para esto.
- **Píldoras:** son enlaces a `#sistema`. Con JS, además eligen ese proyecto en el sistema (pestaña, órbita y demo) antes de hacer scroll. Sin JS, solo llevan al sistema.
- Firma: el logo a 34 px y «MARCELA GOTTA, DESDE MADRID» en mono.

### (02) Qué construyo · `ProjectSystem.astro` y `ProjectTabs.astro`

Solo cambian tres cosas; el orrery, las demos y la lógica de pestañas siguen igual.

1. La etiqueta sale de la cabecera y va encima, con margen inferior propio: «(02) Qué construyo».
2. La entradilla cambia por `home.sysLead` y la fecha de `now.updatedAt`: «Encajan como un sistema, y cada una va a su ritmo. Estado del 21 oct 2026.» Usa `<time>` con `formatShortDate`.
3. Cada pestaña lleva una tercera línea bajo `tab__line`: «AHORA» en mono más el texto de `now.ts` de ese proyecto. En la pestaña activa, «AHORA» toma `--pc-text` y el texto `--fg-muted`.

### (03) Con quién · `People.astro` (nuevo, sustituye a `TransferOrbit` en la home)

- Arriba, en dos columnas (1.1fr y 1fr): a la izquierda el `<h2>` con el lema «Firme con la calidad, *flexible con las personas.*» (`about.motto1` y `about.motto2`) y debajo `traj.text` como entradilla. A la derecha el `TransferDiagram` con los mismos datos que tenía `TransferOrbit`.
- Debajo, un índice `<ol>` de tres filas enlazadas (`home.people`). Cada fila tiene etiqueta (Lidero, Enseño, Comparto), título, descripción, años y un círculo con flecha.
  - Al pasar el ratón o con el foco, el fondo sube desde abajo y la flecha gira −45° sobre fondo `--fg`.
  - Por debajo de 980 px, la fila se apila en una columna y la flecha queda a la derecha.
- Destinos: Lidero lleva a Sobre mí; Enseño y Comparto llevan a Charlas, siempre con `localizedPath`.
- `TransferOrbit.astro` se queda sin uso: bórralo si nada más lo importa.

### (04) Contigo · `Closing.astro`

1. Etiqueta «(04) Contigo».
2. Subtítulo nuevo bajo la pregunta: `close.sub`, «De agentes, de frontend o de equipos.»
3. El botón y, a su lado, una línea en mono que se rellena en vivo: «En Madrid son las **21:59**. En Jezero, sol 2017, **04:39** LMST.»
   - Madrid sale de `Intl.DateTimeFormat` con `Europe/Madrid`; el sol y la LMST, de `marsClock()` y `formatHoursMinutes()` de `src/lib/mars-clock.ts`.
   - Se actualiza cada 30 s y solo mientras la página es visible.
   - La línea ocupa su sitio desde el principio pero está invisible hasta que el script pone `data-ready`. Así no salta (CLS 0) y, sin JS, no se ve. Las cifras son tabulares.

## 4. Copy

El copy definitivo está en `messages/*.patch.json`: no lo reescribas. Las claves de `home` son nuevas.

- **Cambian de valor:** `sys.kicker` («Qué construyo»), `traj.kicker` («Con quién») y `close.kicker` («Contigo»). Hoy solo se usan en la home; si algo más las usa, crea claves nuevas en vez de cambiarlas.
- **Se añaden:** `close.sub` y la etiqueta del manifiesto, `home.manifesto.kicker` («Por qué»).
- **Sobran,** si nada más las usa: `now.title`, `now.updated` y `traj.cta`.
- **Números:** «(01)» a «(04)» van en el marcado, no en el copy.

## 5. Lo que se elimina

- `NowBand` sale de la home. Borra `components/now/NowBand.astro` y `NowIcon.astro` si no se usan en otro sitio.
- `now.ts` pierde los iconos y la línea de Sngular, que ahora vive en el índice de «Con quién».
- Ajusta los e2e que buscaban la banda o los textos antiguos.

## 6. Criterios de aceptación

- [ ] El orden de la home es hero, (01) Por qué, (02) Qué construyo, (03) Con quién y (04) Contigo, en ES y EN, en los dos temas.
- [ ] Kimen, Jezero y Orbit no aparecen como bloque repetido: solo en las píldoras del manifiesto y en el sistema.
- [ ] El manifiesto se ilumina con el scroll en Chrome. En Safari y Firefox sin soporte se ve entero. Con reduced-motion o SIM en pausa, también entero.
- [ ] La píldora «Jezero» deja Jezero activo en el sistema (pestaña, anillo y demo) y hace scroll hasta él. Con teclado, Enter hace lo mismo.
- [ ] Las filas del índice son enlaces de 44 px o más, con foco visible y su destino localizado.
- [ ] Los relojes del cierre coinciden con `marsClock()`: tests de `mars-clock` en verde. Sin JS, la línea no se ve, y CLS sigue en 0.
- [ ] Ninguna raya larga (—) en el copy nuevo; los rangos de años usan la raya corta (–), como ya hacíamos.
- [ ] axe sin violaciones en `/` y `/en`. `npm run lint`, `typecheck`, `test` y `build` sin errores.
- [ ] Revisado en el navegador a 1440 y 390 px.
- [ ] Despliegue primero a `*.workers.dev`; a producción, solo con mi OK.
