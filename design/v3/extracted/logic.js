/* marcelagotta.com v3 · lógica del prototipo: copy ES/EN (MG_T), reloj marciano Mars24 (mgMarsClock),
   planeta procedural WebGL (MG_VS, MG_BAKE_FS, MG_FS, mgPlanet) y la clase Component (estado e interacciones).
   DCLogic es la clase base del canvas: en React, sustitúyela por componentes funcionales y hooks. */
/* ---------- Physics constants (real values) ---------- */
var MG_JEZ = { lat: 18.4447, lon: 77.4508 };   /* Perseverance landing site, Jezero crater (deg N, deg E) */
var MG_ROT_H = 24.6229;                          /* Mars sidereal rotation, hours. 1 h of Mars = 1 s on screen */
var MG_SUN_AZ = -50;                             /* sun azimuth vs the meridian facing the camera (deg, west < 0) */
var MG_TILT = 13;                                /* camera elevation over Mars' equator (deg) = orbit ellipses ry/rx 0.225 */

function mgPad(n) { return (n < 10 ? '0' : '') + n; }
function mgReduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }

/* Mars24 algorithm (Allison and McEwen 2000; NASA GISS) */
function mgMarsClock(ms) {
  var jdTT = 2440587.5 + ms / 86400000 + (37 + 32.184) / 86400;
  var d = jdTT - 2451545.0, R = Math.PI / 180;
  var M = ((19.3871 + 0.52402073 * d) % 360) * R;
  var aFMS = (270.3871 + 0.524038496 * d) % 360;
  var A = [0.0071, 0.0057, 0.0039, 0.0037, 0.0021, 0.0020, 0.0018];
  var T = [2.2353, 2.7543, 1.1177, 15.7866, 2.1354, 2.4694, 32.8493];
  var P = [49.409, 168.173, 191.837, 21.736, 15.704, 95.528, 49.095];
  var pbs = 0;
  for (var i = 0; i < 7; i++) pbs += A[i] * Math.cos((0.985626 * d / T[i] + P[i]) * R);
  var nuM = (10.691 + 3.0e-7 * d) * Math.sin(M) + 0.623 * Math.sin(2 * M) + 0.050 * Math.sin(3 * M) + 0.005 * Math.sin(4 * M) + 0.0005 * Math.sin(5 * M) + pbs;
  var ls = ((aFMS + nuM) % 360 + 360) % 360, L = ls * R;
  var eot = 2.861 * Math.sin(2 * L) - 0.071 * Math.sin(4 * L) + 0.002 * Math.sin(6 * L) - nuM;
  var msd = (jdTT - 2451549.5) / 1.0274912517 + 44796.0 - 0.0009626;
  var mtc = ((24 * msd) % 24 + 24) % 24;
  var subW = ((mtc * 15 + eot + 180) % 360 + 360) % 360;
  return {
    msd: msd, ls: ls, eot: eot,
    subLonE: (360 - subW) % 360,
    subLat: Math.asin(0.42565 * Math.sin(L)) / R + 0.25 * Math.sin(L),
    lmst: ((mtc + MG_JEZ.lon / 15) % 24 + 24) % 24,
    sol: Math.floor(msd + MG_JEZ.lon / 360) - 52304   /* Perseverance mission sol (sol 0 = 18 Feb 2021) */
  };
}
var MG_FMT = null;
function mgMadrid(ms) {
  try {
    if (!MG_FMT) MG_FMT = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return MG_FMT.format(new Date(ms));
  } catch (e) { var d = new Date(ms); return mgPad(d.getHours()) + ':' + mgPad(d.getMinutes()) + ':' + mgPad(d.getSeconds()); }
}

/* ---------- Seeded decoration ---------- */
function mgRand(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function mgField(seed, n, spread, blur, a0, a1) {
  var r = mgRand(seed), out = [], tints = ['255,245,238', '255,245,238', '255,245,238', '178,155,228', '255,196,168'];
  for (var i = 0; i < n; i++) {
    out.push(Math.round(r() * 2600) + 'px ' + Math.round(r() * 1300) + 'px ' + blur + 'px ' + spread + 'px rgba(' + tints[Math.floor(r() * tints.length)] + ',' + (a0 + r() * (a1 - a0)).toFixed(2) + ')');
  }
  return out.join(',');
}
var MG_STARS = null;
function mgStars() { if (!MG_STARS) MG_STARS = { far: mgField(11, 380, 0, 0, 0.22, 0.7), mid: mgField(23, 150, 0.45, 0, 0.35, 0.85), near: mgField(37, 46, 0.9, 0.8, 0.5, 0.95) }; return MG_STARS; }
var MG_TWINKLES = [{ x: '12%', y: '18%', d: '-.4s' }, { x: '31%', y: '64%', d: '-1.6s' }, { x: '46%', y: '12%', d: '-2.9s' }, { x: '58%', y: '36%', d: '-.9s' }, { x: '88%', y: '20%', d: '-3.4s' }, { x: '95%', y: '72%', d: '-2.2s' }, { x: '22%', y: '88%', d: '-1.1s' }];
var MG_BARS = (function () { var r = mgRand(91), out = []; for (var i = 0; i < 40; i++) { var env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.42) * Math.cos(i * 0.13 + 1)); out.push({ h: Math.round(18 + 62 * env * (0.6 + 0.4 * r())) + 'px', d: (-r() * 0.55).toFixed(2) + 's' }); } return out; })();
var MG_TECH = [
  { l: 'TypeScript', x: 7, y: 20, g: 0, p: 'k' }, { l: 'JavaScript', x: 18, y: 15, g: 0 }, { l: 'Node.js', x: 24, y: 28, g: 0 }, { l: 'HTML', x: 5, y: 34, g: 0 }, { l: 'CSS', x: 14, y: 41, g: 0 },
  { l: 'Python', x: 22, y: 49, g: 0, p: 'jo', learn: 1 }, { l: 'Rust', x: 6, y: 52, g: 0, p: 'o', learn: 1 },
  { l: 'React', x: 40, y: 19, g: 1, p: 'ko' }, { l: 'Next.js', x: 51, y: 14, g: 1 }, { l: 'Angular', x: 36, y: 33, g: 1, p: 'k' }, { l: 'Vue', x: 47, y: 29, g: 1, p: 'k' }, { l: 'Lit', x: 59, y: 22, g: 1 },
  { l: 'Stencil', x: 55, y: 37, g: 1, p: 'k' }, { l: 'Web Components', x: 40, y: 46, g: 1, p: 'k' }, { l: 'microfrontends', x: 54, y: 50, g: 1 }, { l: 'Tauri', x: 63, y: 42, g: 1, p: 'o' },
  { l: 'design systems', x: 73, y: 20, g: 2 }, { l: 'design tokens', x: 84, y: 31, g: 2, p: 'k' }, { l: '@a11y', x: 74, y: 41, g: 2, p: 'k' },
  { l: 'Vitest', x: 6, y: 73, g: 3 }, { l: 'Jest', x: 17, y: 70, g: 3 }, { l: 'Playwright', x: 26, y: 78, g: 3 }, { l: 'Testing Library', x: 7, y: 87, g: 3 }, { l: 'Storybook', x: 22, y: 91, g: 3 }, { l: 'TDD', x: 33, y: 86, g: 3 },
  { l: 'MCP', x: 59, y: 73, g: 4, p: 'kj' }, { l: 'AGENTS.md', x: 71, y: 70, g: 4 }, { l: 'harness engineering', x: 83, y: 77, g: 4 }, { l: 'SQLite', x: 68, y: 81, g: 4, p: 'j' },
  { l: 'Linux', x: 52, y: 83, g: 4 }, { l: '@rag', x: 58, y: 91, g: 4 }, { l: 'Docker', x: 76, y: 89, g: 4 }, { l: 'PostgreSQL', x: 87, y: 88, g: 4 }
];

/* ---------- Copy (mirrors next-intl messages: es / en) ---------- */
var MG_T = {
  es: {
    ui: { skip: 'Saltar al contenido', home: 'marcela.gotta, inicio', navLabel: 'Principal', lang: 'Idioma', menu: 'Menú', close: 'Cerrar menú', toLight: 'Cambiar al tema claro: la superficie de Marte', toDark: 'Cambiar al tema oscuro: el espacio', pause: 'Pausar animaciones', play: 'Reanudar animaciones' },
    nav: { inicio: 'Inicio', sobre: 'Sobre mí', proyectos: 'Proyectos', charlas: 'Charlas', contacto: 'Contacto' },
    hero: {
      over: 'Senior Software Engineer · Building agent infrastructure',
      l1: ['Construyo', 'software'], l2: ['que', 'piensa'], l3: ['contigo.'],
      sub: '12 años construyendo software, especializada en frontend de producto y arquitectura de sistemas de componentes. Desde 2024 también construyo, en abierto, la infraestructura que hace que los agentes de IA dejen de ser una demo y trabajen de verdad con las personas.',
      cta1: 'Ver proyectos', cta2: 'Hablemos',
      phobos: 'Fobos', deimos: 'Deimos', mars: 'Marte', aPh: '9 376 km', aDe: '23 463 km', rot: 'rot. 24 h 37 min', scale: '1 h → 1 s',
      view: 'Vista desde Jezero', viewDir: 'mirando al sur', phRise: 'sale por el oeste', deRise: 'sale por el este'
    },
    hud: { aria: 'Telemetría en vivo', mad: 'Madrid' },
    now: {
      title: 'Ahora mismo', updated: 'Actualizado el', date: '21 oct 2026',
      items: [
        { icon: 'planet', cls: 'c-jezero', text: 'Jezero ya es público: la memoria compartida de mis agentes' },
        { icon: 'sat', cls: 'c-orbit', text: 'Puliendo la beta de Orbit para abrirla' },
        { icon: 'puzzle', cls: 'c-kimen', text: 'Llevando Kimen hacia su versión 1.0' },
        { icon: 'cap', cls: 'c-team', text: 'Head Frontend Developer en Sngular' }
      ]
    },
    sys: {
      kicker: 'El sistema', title: 'Tres piezas, una idea.', lead: 'Lo que un agente te enseña, lo que recuerda y dónde vive contigo.',
      ringK: 'Kimen · lo que te enseña', ringJ: 'Jezero · lo que recuerda', ringO: 'Orbit · dónde vive contigo',
      kepler: 'Periodos orbitales según Kepler: T² ∝ a³',
      items: {
        kimen: { name: 'Kimen', line: 'Las interfaces que generan los agentes.', chips: ['pre-1.0', 'Apache-2.0'], cta: 'Ver Kimen', stack: 'StencilJS · TypeScript · design tokens', alt: 'Animación: un agente escribe un JSON, Kimen lo valida contra su catálogo, rechaza el componente no declarado y ensambla el resto en componentes reales.' },
        jezero: { name: 'Jezero', line: 'La memoria compartida del trabajo de tus agentes.', chips: ['pre-alpha', 'Apache-2.0'], cta: 'Ver Jezero', stack: 'Python · SQLite FTS5 · MCP', alt: 'Animación: las sesiones de los agentes se depositan como capas de sedimento y una búsqueda las atraviesa para rescatar una decisión de hace semanas.' },
        orbit: { name: 'Orbit', line: 'Tu asistente, en tu Mac.', chips: ['beta', 'MIT', 'macOS'], cta: 'Ver Orbit', stack: 'Tauri 2 · React · Rust · Python', alt: 'Animación: la onda de audio de una reunión se convierte en notas escritas.' }
      }
    },
    demo: {
      k: { file: 'agente.json', agent: 'agente → catálogo', cardTitle: 'Resumen del sprint', badge: 'En curso', ok: 'declarado', no: 'rechazado', render: 'Render', sum: '3 componentes · 1 rechazado' },
      j: {
        bar: 'memoria', q: '¿por qué elegimos SQLite?', qn: 25,
        layers: [
          { a: 'sesión · claude-code', b: 'hace 5 sem' },
          { a: 'decisión · SQLite FTS5, sin GPU', b: 'hace 3 sem', hit: true },
          { a: 'error · ENOSPC en CI', b: 'hace 2 sem' },
          { a: 'arreglo · limpiar la caché de uv', b: 'hace 12 d' },
          { a: 'comando · uv run pytest -k mcp', b: 'hace 4 d' },
          { a: 'sesión · codex', b: 'hoy' }
        ],
        rk: 'Decisión · hace 3 semanas', rt: 'Búsqueda de texto completo en un único fichero SQLite: milisegundos, sin GPU.', rs: 'Origen · sesión de claude-code'
      },
      o: { meeting: 'Sync de producto', title: 'Notas · Sync de producto', k1: 'Acuerdos', b1: 'Priorizar la accesibilidad del catálogo', b2: 'Abrir la beta cuando esté estable', k2: 'Pendiente', b3: 'Preparar la demo del jueves' }
    },
    traj: { kicker: 'Trayectoria', text: 'De full-stack a liderar frontend en Sngular, y de ahí a la infraestructura de agentes.', cta: 'Conóceme', m1: 'Full-stack', m2: 'Sngular', m3: 'Agentes', alt: 'Diagrama de órbitas de transferencia: 2014, full-stack; 2019, Sngular; 2024, infraestructura de agentes.' },
    close: { kicker: 'Contacto', q1: '¿Hablamos', q2: 'un rato?', cta: 'Escríbeme' },
    foot: { line: 'Hecho en Madrid, pensado en Marte.' },
    about: {
      kicker: 'Sobre mí', h1a: 'Hola, soy', h1b: 'Mars.',
      p1: 'Soy Marcela Gotta, ingeniera de software en Madrid. Llevo 12 años construyendo software: empecé full-stack, me enamoré del frontend y acabé liderando equipos y arquitectura.',
      p2: 'Desde 2019 estoy en Sngular, donde hoy soy Head Frontend Developer y participo en la dirección del chapter de frontend: formaciones, seguimiento técnico de cada persona y entrevistas técnicas. He liderado equipos de producto para grandes empresas de banca, moda, energía y sostenibilidad.',
      p3: 'Creo que la IA es la herramienta más potente que hemos tenido, siempre que las personas sigamos del lado que la dirige. Mi trabajo propio intenta construir esa parte, en abierto: Kimen, Jezero y Orbit.',
      p4: 'Vivo en Madrid con un pequeño zoológico. Me gustan la física, los videojuegos, escribir y convertir ideas raras en algo que funciona.',
      factsT: 'Datos rápidos',
      facts: [{ k: 'Ubicación', v: 'Madrid, España' }, { k: 'Idiomas', v: 'Español nativo · inglés profesional, en uso diario' }, { k: 'Rol', v: 'Head Frontend Developer en Sngular' }, { k: 'Enfoque', v: 'Frontend de producto, sistemas de componentes e infraestructura de agentes' }],
      leadT: 'Cómo lidero', motto1: 'Firme con la calidad,', motto2: 'flexible con las personas.',
      axes: [{ n: '01', t: 'Socia del negocio.', d: 'Entender el porqué detrás del código, no solo transmitir requisitos.' }, { n: '02', t: 'Excelencia para el usuario.', d: 'La calidad es una forma de respeto: un producto que falla es una promesa rota.' }, { n: '03', t: 'Crecimiento del equipo.', d: 'Detrás de cada commit hay una persona. Mi éxito se mide por cuánto crece el equipo.' }],
      trajK: '2014 → hoy', trajT: 'Trayectoria', trajCap: 'Órbitas de transferencia · 2014 → hoy', trajAlt: 'Diagrama: una trayectoria que salta de órbita en órbita, una por etapa, de 2014 a 2026.',
      roles: [
        { when: '2014 – 2018', what: 'Primeros años', detail: 'Desarrollo frontend y full-stack para banca, seguros, telecomunicaciones y energía.' },
        { when: '2018 – 2019', what: 'Arquitecta Frontend · Paradigma Digital', detail: 'Aplicaciones web para banca y retail.' },
        { when: 'abr 2019 – feb 2022', what: 'Senior Frontend Developer · Sngular', detail: 'Web Components, microfrontends y librerías de componentes corporativas.' },
        { when: 'feb 2022 – feb 2026', what: 'Frontend Developer Expert · Sngular', detail: 'Liderazgo técnico de equipos de producto y arquitectura frontend.' },
        { when: '2024 – hoy', what: 'Infraestructura de agentes, en abierto', detail: 'Kimen, Jezero y Orbit.' },
        { when: 'feb 2026 – hoy', what: 'Head Frontend Developer · Sngular', detail: 'Participa en la dirección del chapter de frontend desde diciembre de 2025.' }
      ],
      eduT: 'Formación', edu: 'Grado en Ingeniería Informática · UOC', eduState: 'en curso',
      techK: 'Constelación técnica', techT: 'Tecnologías', techLead: 'Elige un proyecto: se encienden las tecnologías que usa de verdad.',
      filterLabel: 'Filtrar por proyecto', all: 'Todo', learning: 'aprendiendo', rag: 'RAG autoalojado', a11y: 'Accesibilidad WCAG 2.2',
      groups: [{ label: 'Lenguajes', x: '4%', y: '7%' }, { label: 'Frontend', x: '36%', y: '7%' }, { label: 'Sistemas de diseño', x: '72%', y: '7%' }, { label: 'Calidad', x: '4%', y: '62%' }, { label: 'Infraestructura de agentes', x: '52%', y: '62%' }]
    },
    pj: {
      kicker: 'Proyectos', h1a: 'Tres piezas,', h1b: 'una idea.',
      lead: 'Lo que un agente te enseña, lo que recuerda y dónde vive contigo. Kimen y Jezero ya son open source; Orbit lo será al abrir su beta.',
      navLabel: 'Proyectos de esta página', soon: 'Repo público al abrir la beta',
      onmarsA: 'También hago productos pequeños y honestos en', onmarsB: ', mi estudio independiente: KitGestor, That Day y Sapphik.',
      items: {
        kimen: {
          role: 'Lo que te enseña', sub: 'Las interfaces que generan los agentes.',
          links: [{ label: 'kimen.dev', href: 'https://kimen.dev' }, { label: 'github.com/kimen-dev/kimen', href: 'https://github.com/kimen-dev/kimen' }],
          desc: 'La base de componentes para interfaces generativas: Web Components que funcionan en cualquier framework y que los agentes pueden leer y usar con un contrato claro.',
          bullets: ['29 componentes ki-* sin depender de ningún framework, con envoltorios para React, Vue y Angular.', 'Catálogo vigilado: un agente solo puede pintar componentes y acciones declarados; lo desconocido se rechaza.', 'Adaptadores para A2UI y MCP Apps.', 'Accesibilidad como puerta dura: cero violaciones de axe en CI y objetivo WCAG 2.2 AA. Menos de 10 KB por componente.'],
          stack: 'StencilJS · TypeScript · design tokens'
        },
        jezero: {
          role: 'Lo que recuerda', sub: 'La memoria compartida de tus agentes.',
          links: [{ label: 'github.com/MarsGotta/jezero', href: 'https://github.com/MarsGotta/jezero' }],
          desc: 'Tus agentes olvidan. Jezero reúne sus sesiones, las resume y deja que cualquier agente pregunte qué se decidió, qué falló o qué comando funcionó, aunque lo hiciera otro agente hace semanas.',
          bullets: ['Conectores incrementales y de solo lectura para Hermes Agent, Claude Code, Codex, OpenCode, Antigravity y Paperclip.', 'Cada sesión se resume en «átomos»: decisiones, porqués, arreglos, errores exactos, comandos, datos y riesgos.', 'Un único fichero SQLite con búsqueda de texto completo: milisegundos, sin GPU.', 'Servidor MCP de solo lectura: todos los agentes consultan, ninguno escribe. Los secretos se redactan antes de guardar.'],
          noteK: 'El nombre:', note: 'el cráter de Marte que fue un lago. Sus sedimentos guardan lo que pasó, y allí Perseverance aparta muestras para recogerlas más tarde.',
          stack: 'Python · SQLite FTS5 · MCP'
        },
        orbit: {
          role: 'Dónde vive contigo', sub: 'Tu asistente, en tu Mac.', links: [], soon: true,
          desc: 'Una app para el Mac que da a tu asistente un sitio en tu día: graba y transcribe tus reuniones, escribe las notas y te deja hablar con el agente que elijas.',
          bullets: ['Trae tu propio agente: por un API gateway o con tu sesión de Claude o de Codex.', 'Incluye su propio hub autoalojado: tú decides dónde viven tus reuniones.', 'En beta, y dicho así.'],
          stack: 'Tauri 2 · React · Rust · Python'
        }
      }
    },
    talks: {
      kicker: 'Charlas y docencia', h1a: 'Charlas', h1b: 'y docencia.', caption: 'De lo más reciente a lo más antiguo',
      items: [
        { year: '2025 – hoy', type: 'Docencia', title: 'Procesamiento de Lenguaje Natural · Ética y Regulación de la IA (máster)', where: 'Instituto Europeo de Posgrado' },
        { year: '2022', type: 'Curso', title: 'Web Components desde 0', where: 'Codemotion' },
        { year: '2021', type: 'Charla', title: 'Web Components en producción', where: 'Devcast Codemotion' },
        { year: '2019 – 2021', type: 'Docencia', title: 'Cursos de Vue, React, Redux, Angular y RxJS', where: 'Fictizia' },
        { year: '2019', type: 'Charla', title: 'Progressive Web Apps', where: 'Salmorejo Tech, Córdoba' }
      ]
    },
    contact: { kicker: 'Contacto', h1: 'Hablemos.', lead: '¿Quieres hablar de agentes, de frontend o de cómo se lidera un equipo técnico sin quemarlo? Escríbeme.', chanT: 'Escríbeme', formLabel: 'Formulario de contacto', name: 'Tu nombre', email: 'Tu email', msg: 'Cuéntame', send: 'Enviar', sent: 'Recibido. Te contesto en unos días.' }
  },
  en: {
    ui: { skip: 'Skip to content', home: 'marcela.gotta, home', navLabel: 'Main', lang: 'Language', menu: 'Menu', close: 'Close menu', toLight: 'Switch to the light theme: the surface of Mars', toDark: 'Switch to the dark theme: space', pause: 'Pause animations', play: 'Resume animations' },
    nav: { inicio: 'Home', sobre: 'About', proyectos: 'Projects', charlas: 'Talks', contacto: 'Contact' },
    hero: {
      over: 'Senior Software Engineer · Building agent infrastructure',
      l1: ['I', 'build', 'software'], l2: ['that', 'thinks'], l3: ['with', 'you.'],
      sub: '12 years building software, focused on product frontend and component system architecture. Since 2024 I also build, in the open, the infrastructure that turns AI agents from demos into real teammates for people.',
      cta1: 'See projects', cta2: "Let's talk",
      phobos: 'Phobos', deimos: 'Deimos', mars: 'Mars', aPh: '9,376 km', aDe: '23,463 km', rot: 'rot. 24 h 37 min', scale: '1 h → 1 s',
      view: 'View from Jezero', viewDir: 'facing south', phRise: 'rises in the west', deRise: 'rises in the east'
    },
    hud: { aria: 'Live telemetry', mad: 'Madrid' },
    now: {
      title: 'Right now', updated: 'Updated', date: '21 Oct 2026',
      items: [
        { icon: 'planet', cls: 'c-jezero', text: 'Jezero is public: the shared memory of my agents' },
        { icon: 'sat', cls: 'c-orbit', text: 'Polishing the Orbit beta before opening it up' },
        { icon: 'puzzle', cls: 'c-kimen', text: 'Taking Kimen towards 1.0' },
        { icon: 'cap', cls: 'c-team', text: 'Head Frontend Developer at Sngular' }
      ]
    },
    sys: {
      kicker: 'The system', title: 'Three pieces, one idea.', lead: 'What an agent shows you, what it remembers, and where it lives with you.',
      ringK: 'Kimen · what it shows you', ringJ: 'Jezero · what it remembers', ringO: 'Orbit · where it lives with you',
      kepler: 'Orbital periods follow Kepler: T² ∝ a³',
      items: {
        kimen: { name: 'Kimen', line: 'The interfaces agents generate.', chips: ['pre-1.0', 'Apache-2.0'], cta: 'See Kimen', stack: 'StencilJS · TypeScript · design tokens', alt: 'Animation: an agent writes JSON, Kimen validates it against its catalog, rejects the undeclared component and assembles the rest into real components.' },
        jezero: { name: 'Jezero', line: "The shared memory of your agents' work.", chips: ['pre-alpha', 'Apache-2.0'], cta: 'See Jezero', stack: 'Python · SQLite FTS5 · MCP', alt: 'Animation: agent sessions settle like layers of sediment, and a search cuts through them to recover a decision from weeks ago.' },
        orbit: { name: 'Orbit', line: 'Your assistant, on your Mac.', chips: ['beta', 'MIT', 'macOS'], cta: 'See Orbit', stack: 'Tauri 2 · React · Rust · Python', alt: 'Animation: the audio wave of a meeting turns into written notes.' }
      }
    },
    demo: {
      k: { file: 'agent.json', agent: 'agent → catalog', cardTitle: 'Sprint summary', badge: 'In progress', ok: 'declared', no: 'rejected', render: 'Render', sum: '3 components · 1 rejected' },
      j: {
        bar: 'memory', q: 'why did we pick SQLite?', qn: 23,
        layers: [
          { a: 'session · claude-code', b: '5 wk ago' },
          { a: 'decision · SQLite FTS5, no GPU', b: '3 wk ago', hit: true },
          { a: 'error · ENOSPC in CI', b: '2 wk ago' },
          { a: 'fix · clear the uv cache', b: '12 d ago' },
          { a: 'command · uv run pytest -k mcp', b: '4 d ago' },
          { a: 'session · codex', b: 'today' }
        ],
        rk: 'Decision · 3 weeks ago', rt: 'Full-text search in a single SQLite file: milliseconds, no GPU.', rs: 'Source · claude-code session'
      },
      o: { meeting: 'Product sync', title: 'Notes · Product sync', k1: 'Agreed', b1: 'Prioritise catalog accessibility', b2: 'Open the beta once it is stable', k2: 'To do', b3: "Prepare Thursday's demo" }
    },
    traj: { kicker: 'Path', text: 'From full-stack to leading frontend at Sngular, and from there to agent infrastructure.', cta: 'Get to know me', m1: 'Full-stack', m2: 'Sngular', m3: 'Agents', alt: 'Transfer orbit diagram: 2014, full-stack; 2019, Sngular; 2024, agent infrastructure.' },
    close: { kicker: 'Contact', q1: 'Shall we talk', q2: 'for a bit?', cta: 'Write to me' },
    foot: { line: 'Made in Madrid, designed on Mars.' },
    about: {
      kicker: 'About', h1a: "Hi, I'm", h1b: 'Mars.',
      p1: "I'm Marcela Gotta, a software engineer in Madrid. I've spent 12 years building software: I started full-stack, fell in love with frontend and ended up leading teams and architecture.",
      p2: "Since 2019 I've been at Sngular, where I'm Head Frontend Developer and part of the team that runs the frontend chapter: training, technical follow-up for each person, and technical interviews. I've led product teams for large companies in banking, fashion, energy and sustainability.",
      p3: "I believe AI is the most powerful tool we've had, as long as people stay on the side that steers it. My own work tries to build that part, in the open: Kimen, Jezero and Orbit.",
      p4: 'I live in Madrid with a small zoo. I love physics, video games, writing and turning odd ideas into things that work.',
      factsT: 'Quick facts',
      facts: [{ k: 'Location', v: 'Madrid, Spain' }, { k: 'Languages', v: 'Spanish, native · English, professional and in daily use' }, { k: 'Role', v: 'Head Frontend Developer at Sngular' }, { k: 'Focus', v: 'Product frontend, component systems and agent infrastructure' }],
      leadT: 'How I lead', motto1: 'Firm on quality,', motto2: 'flexible with people.',
      axes: [{ n: '01', t: 'Business partner.', d: 'Understanding the why behind the code, not just passing on requirements.' }, { n: '02', t: 'Excellence for the user.', d: 'Quality is a form of respect: a product that fails is a broken promise.' }, { n: '03', t: 'Team growth.', d: 'Behind every commit there is a person. I measure my success by how much the team grows.' }],
      trajK: '2014 → today', trajT: 'Path', trajCap: 'Transfer orbits · 2014 → today', trajAlt: 'Diagram: a trajectory that jumps from orbit to orbit, one per stage, from 2014 to 2026.',
      roles: [
        { when: '2014 – 2018', what: 'Early years', detail: 'Frontend and full-stack development for banking, insurance, telecoms and energy.' },
        { when: '2018 – 2019', what: 'Frontend Architect · Paradigma Digital', detail: 'Web applications for banking and retail.' },
        { when: 'Apr 2019 – Feb 2022', what: 'Senior Frontend Developer · Sngular', detail: 'Web Components, micro-frontends and corporate component libraries.' },
        { when: 'Feb 2022 – Feb 2026', what: 'Frontend Developer Expert · Sngular', detail: 'Technical leadership of product teams and frontend architecture.' },
        { when: '2024 – today', what: 'Agent infrastructure, in the open', detail: 'Kimen, Jezero and Orbit.' },
        { when: 'Feb 2026 – today', what: 'Head Frontend Developer · Sngular', detail: 'Part of the team that runs the frontend chapter since December 2025.' }
      ],
      eduT: 'Education', edu: 'BSc in Computer Engineering · UOC', eduState: 'in progress',
      techK: 'Tech constellation', techT: 'Technologies', techLead: 'Pick a project: the technologies it really uses light up.',
      filterLabel: 'Filter by project', all: 'All', learning: 'learning', rag: 'self-hosted RAG', a11y: 'WCAG 2.2 accessibility',
      groups: [{ label: 'Languages', x: '4%', y: '7%' }, { label: 'Frontend', x: '36%', y: '7%' }, { label: 'Design systems', x: '72%', y: '7%' }, { label: 'Quality', x: '4%', y: '62%' }, { label: 'Agent infrastructure', x: '52%', y: '62%' }]
    },
    pj: {
      kicker: 'Projects', h1a: 'Three pieces,', h1b: 'one idea.',
      lead: 'What an agent shows you, what it remembers, and where it lives with you. Kimen and Jezero are already open source; Orbit will be once its beta opens.',
      navLabel: 'Projects on this page', soon: 'Public repo when the beta opens',
      onmarsA: 'I also make small, honest products at', onmarsB: ', my independent studio: KitGestor, That Day and Sapphik.',
      items: {
        kimen: {
          role: 'What it shows you', sub: 'The interfaces agents generate.',
          links: [{ label: 'kimen.dev', href: 'https://kimen.dev' }, { label: 'github.com/kimen-dev/kimen', href: 'https://github.com/kimen-dev/kimen' }],
          desc: 'The component base for generative interfaces: Web Components that work in any framework, and that agents can read and use through a clear contract.',
          bullets: ['29 ki-* components with no framework dependency, plus wrappers for React, Vue and Angular.', 'Guarded catalog: an agent can only render declared components and actions; anything unknown is rejected.', 'Adapters for A2UI and MCP Apps.', 'Accessibility as a hard gate: zero axe violations in CI and a WCAG 2.2 AA target. Under 10 KB per component.'],
          stack: 'StencilJS · TypeScript · design tokens'
        },
        jezero: {
          role: 'What it remembers', sub: 'The shared memory of your agents.',
          links: [{ label: 'github.com/MarsGotta/jezero', href: 'https://github.com/MarsGotta/jezero' }],
          desc: 'Your agents forget. Jezero gathers their sessions, summarises them and lets any agent ask what was decided, what failed or which command worked, even if another agent did it weeks ago.',
          bullets: ['Incremental, read-only connectors for Hermes Agent, Claude Code, Codex, OpenCode, Antigravity and Paperclip.', 'Each session is summarised into “atoms”: decisions, reasons, fixes, exact errors, commands, data and risks.', 'A single SQLite file with full-text search: milliseconds, no GPU.', 'A read-only MCP server: every agent can query, none can write. Secrets are redacted before saving.'],
          noteK: 'The name:', note: 'the Martian crater that used to be a lake. Its sediments keep what happened, and that is where Perseverance sets samples aside to be collected later.',
          stack: 'Python · SQLite FTS5 · MCP'
        },
        orbit: {
          role: 'Where it lives with you', sub: 'Your assistant, on your Mac.', links: [], soon: true,
          desc: 'A Mac app that gives your assistant a place in your day: it records and transcribes your meetings, writes the notes and lets you talk to the agent of your choice.',
          bullets: ['Bring your own agent: through an API gateway or with your Claude or Codex session.', 'Includes its own self-hosted hub: you decide where your meetings live.', 'In beta, and labelled as such.'],
          stack: 'Tauri 2 · React · Rust · Python'
        }
      }
    },
    talks: {
      kicker: 'Talks and teaching', h1a: 'Talks', h1b: 'and teaching.', caption: 'Most recent first',
      items: [
        { year: '2025 – today', type: 'Teaching', title: "Natural Language Processing · AI Ethics and Regulation (master's)", where: 'Instituto Europeo de Posgrado' },
        { year: '2022', type: 'Course', title: 'Web Components from scratch', where: 'Codemotion' },
        { year: '2021', type: 'Talk', title: 'Web Components in production', where: 'Devcast Codemotion' },
        { year: '2019 – 2021', type: 'Teaching', title: 'Vue, React, Redux, Angular and RxJS courses', where: 'Fictizia' },
        { year: '2019', type: 'Talk', title: 'Progressive Web Apps', where: 'Salmorejo Tech, Córdoba' }
      ]
    },
    contact: { kicker: 'Contact', h1: "Let's talk.", lead: 'Want to talk about agents, frontend, or how to lead a technical team without burning it out? Write to me.', chanT: 'Write to me', formLabel: 'Contact form', name: 'Your name', email: 'Your email', msg: 'Tell me', send: 'Send', sent: "Received. I'll get back to you in a few days." }
  }
};

/* ---------- Procedural Mars (WebGL 1, no textures to download) ---------- */
var MG_VS = 'attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }';
var MG_BAKE_FS = [
  'precision highp float;',
  'varying vec2 vUv;',
  'float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453123); }',
  'vec3 h33(vec3 p){ return fract(sin(vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))))*43758.5453); }',
  'float vn(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); vec3 u=f*f*f*(f*(f*6.0-15.0)+10.0);',
  '  float a=h3(i), b=h3(i+vec3(1.,0.,0.)), c=h3(i+vec3(0.,1.,0.)), d=h3(i+vec3(1.,1.,0.));',
  '  float e=h3(i+vec3(0.,0.,1.)), f1=h3(i+vec3(1.,0.,1.)), g=h3(i+vec3(0.,1.,1.)), h=h3(i+vec3(1.,1.,1.));',
  '  return mix(mix(mix(a,b,u.x),mix(c,d,u.x),u.y), mix(mix(e,f1,u.x),mix(g,h,u.x),u.y), u.z)*2.0-1.0; }',
  'float fbm(vec3 p){ float s=0.0, a=0.5; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }',
  'float fbm3(vec3 p){ float s=0.0, a=0.5; for(int i=0;i<3;i++){ s+=a*vn(p); p=p*2.03+vec3(4.1,2.7,7.3); a*=0.5; } return s; }',
  'vec3 sph(float la, float lo){ la=radians(la); lo=radians(lo); return vec3(cos(la)*sin(lo), sin(la), cos(la)*cos(lo)); }',
  'float adist(vec3 p, float la, float lo){ return degrees(acos(clamp(dot(p,sph(la,lo)),-1.0,1.0))); }',
  'float blob(vec3 p, float la, float lo, float r){ float d=adist(p,la,lo)/r; return exp(-d*d); }',
  'float ring(vec3 p, float la, float lo, float r, float w){ float d=adist(p,la,lo); return exp(-pow((d-r)/w,2.0)); }',
  'float craters(vec3 p, float seed, float dens){ vec3 i=floor(p); vec3 f=fract(p); float h=0.0;',
  '  for(int z=-1;z<=1;z++) for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){',
  '    vec3 g=vec3(float(x),float(y),float(z)); vec3 o=h33(i+g+seed); vec3 r=g+o-f; float d=length(r);',
  '    float rad=0.14+0.24*o.x*o.x; float t=d/rad; float ex=step(1.0-dens,o.y);',
  '    float bowl=(t<1.0)?(t*t-1.0)*0.5:0.0; float rim=exp(-pow((t-1.0)*4.0,2.0))*0.30;',
  '    h+=ex*(bowl+rim)*smoothstep(1.9,1.0,t); }',
  '  return h; }',
  'vec3 ramp(float a){',
  '  vec3 c0=vec3(0.15,0.06,0.06), c1=vec3(0.32,0.11,0.09), c2=vec3(0.60,0.18,0.12), c3=vec3(0.84,0.29,0.18), c4=vec3(0.92,0.44,0.27), c5=vec3(0.96,0.64,0.45);',
  '  a=clamp(a,0.0,1.0);',
  '  if(a<0.18) return mix(c0,c1,a/0.18);',
  '  if(a<0.38) return mix(c1,c2,(a-0.18)/0.20);',
  '  if(a<0.58) return mix(c2,c3,(a-0.38)/0.20);',
  '  if(a<0.78) return mix(c3,c4,(a-0.58)/0.20);',
  '  return mix(c4,c5,(a-0.78)/0.22); }',
  'void main(){',
  '  float lon=(vUv.x-0.5)*6.2831853; float lat=(vUv.y-0.5)*3.1415926;',
  '  vec3 p=vec3(cos(lat)*sin(lon), sin(lat), cos(lat)*cos(lon));',
  '  float latd=degrees(lat), lond=degrees(lon);',
  '  vec3 w=vec3(fbm3(p*2.1+1.3), fbm3(p*2.1+7.9), fbm3(p*2.1+4.6));',
  '  vec3 q=normalize(p+0.13*w);',
  '  float n1=fbm(q*3.0), n2=fbm(q*8.5), n3=vn(q*30.0), n4=vn(q*70.0);',
  '  float streak=fbm3(vec3(q.x*6.0,q.y*26.0,q.z*6.0));',
  '  float df=0.0;',
  '  df+=1.15*blob(q,10.0,69.0,9.0)+0.75*blob(q,22.0,66.0,5.5)+0.6*blob(q,0.0,74.0,7.0);',
  '  df+=0.95*blob(q,-3.0,-1.0,7.0)+0.95*blob(q,-9.0,22.0,8.0)+0.7*blob(q,-12.0,42.0,8.0);',
  '  df+=0.85*blob(q,-16.0,104.0,11.0)+0.95*blob(q,-24.0,140.0,13.0)+0.75*blob(q,-28.0,170.0,11.0);',
  '  df+=0.85*blob(q,-32.0,-152.0,13.0)+0.6*blob(q,-38.0,-125.0,9.0);',
  '  df+=0.95*blob(q,-24.0,-38.0,13.0)+0.75*blob(q,-14.0,-52.0,7.0)+0.8*blob(q,-26.0,-89.0,4.5);',
  '  df+=1.05*blob(q,46.0,-28.0,12.0)+0.55*blob(q,58.0,-10.0,10.0);',
  '  df+=0.55*blob(q,47.0,118.0,15.0)+0.40*blob(q,63.0,-160.0,20.0)+0.35*blob(q,55.0,40.0,16.0);',
  '  float belt=exp(-pow((latd+19.0)/14.0,2.0))*(0.60+0.55*n1+0.25*streak);',
  '  belt*=(1.0-0.85*blob(p,0.0,-112.0,24.0))*(1.0-0.95*blob(p,-42.0,70.0,16.0))*(1.0-0.9*blob(p,-50.0,-44.0,10.0));',
  '  df+=0.70*belt;',
  '  float dm=smoothstep(0.12,1.05,df+0.42*n1+0.24*n2+0.16*streak);',
  '  float inner=0.70+0.38*n2+0.18*n3+0.12*streak;',
  '  float bf=0.0;',
  '  bf+=1.0*blob(p,-42.0,70.0,12.0)+0.9*blob(p,-50.0,-44.0,7.0)+0.75*blob(p,21.0,5.0,16.0);',
  '  bf+=0.9*blob(p,4.0,-112.0,19.0)+0.9*blob(p,16.0,-160.0,17.0)+0.6*blob(p,25.0,147.0,9.0)+0.45*blob(p,13.0,88.0,7.0);',
  '  float a=0.66+0.12*n1+0.07*n2+0.03*n3+0.015*n4+0.05*streak;',
  '  a-=0.34*dm*inner+0.07*df;',
  '  a+=0.12*smoothstep(0.2,0.9,bf+0.2*n1);',
  '  float vl=smoothstep(-103.0,-94.0,lond)*(1.0-smoothstep(-46.0,-38.0,lond));',
  '  float vc=-9.0+0.07*(lond+75.0)+0.9*sin(radians(lond*8.0))+0.7*n2;',
  '  float dv=(latd-vc);',
  '  float vw=2.0+0.7*n3+1.2*blob(p,-7.0,-72.0,6.0);',
  '  float valles=vl*exp(-pow(dv/(vw*1.1),2.0))*(0.80+0.30*n3);',
  '  float vall2=vl*smoothstep(-80.0,-70.0,lond)*(1.0-smoothstep(-58.0,-52.0,lond))*smoothstep(1.0,0.0,abs(dv-3.2)/1.3);',
  '  float noctis=smoothstep(0.35,0.85,blob(q,-7.0,-102.0,3.2)*(0.7+0.9*vn(q*60.0)));',
  '  float vv=max(max(valles,vall2*0.8),noctis*0.7);',
  '  a-=0.28*vv;',
  '  float oly=ring(p,18.65,-133.8,2.9,0.7); float olyC=blob(p,18.65,-133.8,0.7);',
  '  float th=ring(p,-8.3,-120.1,1.5,0.5)+ring(p,1.5,-113.0,1.4,0.5)+ring(p,11.8,-104.5,1.4,0.5)+ring(p,24.8,147.2,1.2,0.5);',
  '  a+=0.06*blob(p,18.65,-133.8,7.0)-0.10*oly-0.08*olyC-0.06*th;',
  '  float hl=smoothstep(12.0,-22.0,latd+9.0*n1);',
  '  float cr=craters(p*11.0,0.0,0.42)*hl+craters(p*27.0,7.0,0.55)*(0.30+0.70*hl)*0.7+craters(p*60.0,3.0,0.5)*0.35*hl;',
  '  a+=0.05*cr;',
  '  vec3 col=ramp(a);',
  '  col*=vec3(1.0,0.97+0.04*n2,0.95);',
  '  col=mix(col, col*vec3(0.80,0.86,0.95), 0.45*dm);',
  '  float capN=smoothstep(77.5,81.5,latd+2.6*n2+1.6*sin(radians(lond*3.0+30.0))+1.5*n3);',
  '  float capS=smoothstep(84.0,87.5,-latd+1.6*n2-2.0*cos(radians(lond+45.0)));',
  '  float frost=smoothstep(66.0,80.0,latd+6.0*n1)*0.35;',
  '  float trough=smoothstep(0.25,0.75,vn(q*22.0)+0.5*n2);',
  '  vec3 ice=mix(vec3(0.98,0.95,0.93), vec3(0.78,0.62,0.60), 0.55*trough*capN);',
  '  col=mix(col, mix(col,vec3(0.93,0.84,0.80),0.6), frost);',
  '  col=mix(col, ice, max(capN,capS));',
  '  float hgt=0.50+0.09*smoothstep(15.0,-20.0,latd+10.0*n1)+0.05*n1+0.02*n2;',
  '  hgt+=0.28*blob(p,18.65,-133.8,3.0)+0.10*blob(p,4.0,-112.0,13.0)+0.12*(blob(p,-8.3,-120.1,1.3)+blob(p,1.5,-113.0,1.2)+blob(p,11.8,-104.5,1.2));',
  '  hgt-=0.16*blob(p,-42.0,70.0,10.0)+0.24*vv;',
  '  hgt+=0.08*cr;',
  '  gl_FragColor=vec4(col, clamp(hgt,0.0,1.0));',
  '}'
].join('\n');
var MG_FS = [
  'precision highp float;',
  'varying vec2 vUv;',
  'uniform vec2 uRes; uniform sampler2D uTex; uniform vec2 uTexel;',
  'uniform float uLon0; uniform float uTilt; uniform vec3 uSunP; uniform float uR; uniform float uBump;',
  'void main(){',
  '  vec2 p=vUv*2.0-1.0; vec2 q=p/uR; float r=length(q);',
  '  float pix=2.0/(uRes.x*uR);',
  '  float ct=cos(uTilt), st=sin(uTilt);',
  '  vec3 col=vec3(0.0); float alpha=0.0;',
  '  if(r<1.0+pix){',
  '    float z=sqrt(max(0.0,1.0-min(r*r,1.0)));',
  '    vec3 nV=vec3(q,z);',
  '    vec3 nP=vec3(nV.x, ct*nV.y+st*nV.z, -st*nV.y+ct*nV.z);',
  '    float lam=atan(nP.x,nP.z); float phi=asin(clamp(nP.y,-1.0,1.0));',
  '    vec2 uv=vec2(fract((lam+uLon0)/6.2831853+0.5), phi/3.1415926+0.5);',
  '    vec4 tx=texture2D(uTex,uv);',
  '    float hE=texture2D(uTex,uv+vec2(uTexel.x,0.0)).a-texture2D(uTex,uv-vec2(uTexel.x,0.0)).a;',
  '    float hN=texture2D(uTex,uv+vec2(0.0,uTexel.y)).a-texture2D(uTex,uv-vec2(0.0,uTexel.y)).a;',
  '    vec3 E=vec3(cos(lam),0.0,-sin(lam)); vec3 N=vec3(-sin(phi)*sin(lam),cos(phi),-sin(phi)*cos(lam));',
  '    float cphi=max(cos(phi),0.2);',
  '    vec3 n=normalize(nP-uBump*(hE/cphi*E+hN*N));',
  '    float ndl=dot(n,uSunP); float ndl0=dot(nP,uSunP);',
  '    float term=smoothstep(-0.035,0.10,ndl0);',
  '    float diff=clamp(ndl,0.0,1.0); diff=pow(diff,0.78)*term;',
  '    vec3 alb=tx.rgb;',
  '    vec3 c=alb*1.18*diff;',
  '    c+=alb*vec3(0.30,0.20,0.42)*0.045;',
  '    float tw=smoothstep(-0.16,-0.01,ndl0)*(1.0-smoothstep(0.0,0.20,ndl0));',
  '    c+=vec3(0.82,0.09,0.45)*tw*0.085;',
  '    float fr=pow(1.0-z,2.4);',
  '    float dayL=smoothstep(-0.10,0.35,ndl0);',
  '    c=mix(c, vec3(1.0,0.56,0.40)*(0.35+0.75*clamp(ndl0,0.0,1.0)), fr*0.50*dayL);',
  '    c+=vec3(1.0,0.45,0.42)*pow(1.0-z,7.0)*0.55*dayL;',
  '    c=c/(1.0+0.12*c);',
  '    float cov=clamp((1.0-r)/pix+0.5,0.0,1.0);',
  '    col=c*cov; alpha=cov;',
  '  }',
  '  if(r>1.0-pix*2.0){',
  '    vec2 dir=q/max(r,1e-4);',
  '    vec3 lV=vec3(dir,0.0); vec3 lP=vec3(lV.x, ct*lV.y+st*lV.z, -st*lV.y+ct*lV.z);',
  '    float sl=dot(lP,uSunP);',
  '    float lit=smoothstep(-0.45,0.75,sl);',
  '    float dr=max(r-1.0,0.0);',
  '    float g1=exp(-dr*80.0), g2=exp(-dr*16.0), g3=exp(-dr*5.0);',
  '    vec3 hc=mix(mix(vec3(0.52,0.35,0.75),vec3(0.82,0.09,0.45),smoothstep(0.0,0.45,lit)), vec3(1.0,0.50,0.29), smoothstep(0.45,1.0,lit));',
  '    float I=(g1*0.95+g2*0.30+g3*0.07)*(0.10+0.90*lit);',
  '    I*=1.0-smoothstep(1.0/uR-0.07,1.0/uR,r);',
  '    float ha=clamp(I,0.0,1.0)*(1.0-alpha);',
  '    col+=hc*I*(1.0-alpha); alpha=alpha+ha*0.85;',
  '  }',
  '  float dith=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;',
  '  gl_FragColor=vec4(col+dith*alpha, clamp(alpha,0.0,1.0));',
  '}'
].join('\n');

function mgPlanet(canvas, host) {
  var gl = null;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true }); } catch (e) { gl = null; }
  if (!gl) return null;
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(fs) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, MG_VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  var small = (canvas.clientWidth || 400) < 420;
  var TW = Math.min(small ? 1024 : 2048, gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048), TH = TW / 2;
  var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TW, TH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  var fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  var bake = prog(MG_BAKE_FS); gl.useProgram(bake); gl.viewport(0, 0, TW, TH); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb); gl.deleteProgram(bake);
  var rp = prog(MG_FS); gl.useProgram(rp);
  var U = {};
  ['uRes', 'uTex', 'uTexel', 'uLon0', 'uTilt', 'uSunP', 'uR', 'uBump'].forEach(function (n) { U[n] = gl.getUniformLocation(rp, n); });
  var D = Math.PI / 180, tilt = MG_TILT * D, ce = Math.cos(tilt), se = Math.sin(tilt);
  gl.uniform1i(U.uTex, 0); gl.uniform2f(U.uTexel, 1 / TW, 1 / TH); gl.uniform1f(U.uR, 0.86); gl.uniform1f(U.uBump, TW > 1024 ? 2.6 : 1.8); gl.uniform1f(U.uTilt, tilt);
  /* Real sky at page load: today's subsolar latitude (season) and longitude, then ×3600 time-lapse */
  var mc = mgMarsClock(Date.now());
  var la = mc.subLat * D, az = MG_SUN_AZ * D;
  gl.uniform3f(U.uSunP, Math.cos(la) * Math.sin(az), Math.sin(la), Math.cos(la) * Math.cos(az));
  var lon0 = mc.subLonE - MG_SUN_AZ, rate = 360 / MG_ROT_H;
  var reduce = mgReduced();
  var sys = canvas.closest ? canvas.closest('.mg-sys') : null;
  var alive = true, raf = 0, visible = true, simT = 0, last = 0, ready = false, lastLabel = -1;
  function size() {
    var cw = canvas.clientWidth; if (!cw) return;
    var dpr = Math.min(window.devicePixelRatio || 1, cw > 420 ? 2 : 1.5), w = Math.max(64, Math.round(cw * dpr));
    if (canvas.width !== w) { canvas.width = w; canvas.height = w; }
  }
  function marker(lonC) {
    var el = host._jzEl; if (!el || !el.parentNode) return;
    var lam = (MG_JEZ.lon - lonC) * D, phi = MG_JEZ.lat * D;
    var px = Math.cos(phi) * Math.sin(lam), py = Math.sin(phi), pz = Math.cos(phi) * Math.cos(lam);
    var vy = py * ce - pz * se, vz = py * se + pz * ce;
    var R = el.parentNode.clientWidth / 2; if (!R) return;
    el.style.transform = 'translate(' + (R + px * R).toFixed(1) + 'px,' + (R - vy * R).toFixed(1) + 'px) translateY(-50%)';
    el.style.opacity = vz > 0 ? Math.min(1, vz / 0.22).toFixed(2) : '0';
    var lt = 12 + (MG_JEZ.lon - (lonC + MG_SUN_AZ)) / 15 - mc.eot / 15; lt = ((lt % 24) + 24) % 24;
    var hh = Math.floor(lt), mm = Math.floor((lt - hh) * 60), key = hh * 60 + mm;
    if (key !== lastLabel) { lastLabel = key; var b = el.querySelector('b'); if (b) b.textContent = mgPad(hh) + ':' + mgPad(mm); }
  }
  function draw() {
    size();
    var lonC = lon0 - rate * simT;
    gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(rp); gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform1f(U.uLon0, lonC * D);
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    marker(lonC);
    if (!ready && sys) { ready = true; sys.setAttribute('data-gl', 'on'); }
  }
  function frame(now) {
    raf = 0; if (!alive) return;
    var running = host.mgMotionOn() && !reduce && visible;
    if (running) { if (last) simT += Math.min(0.1, (now - last) / 1000); last = now; } else last = 0;
    draw();
    if (running) raf = requestAnimationFrame(frame);
  }
  function kick() { if (alive && !raf) raf = requestAnimationFrame(frame); }
  var io = null, ro = null;
  if (typeof IntersectionObserver !== 'undefined') { io = new IntersectionObserver(function (es) { visible = es.length ? es[es.length - 1].isIntersecting : true; if (visible) kick(); }, { threshold: 0 }); io.observe(canvas); }
  if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(function () { kick(); }); ro.observe(canvas); }
  kick();
  return {
    kick: kick,
    dispose: function () { alive = false; if (raf) cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect(); try { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (e) {} }
  };
}

/* ---------- Component ---------- */
class Component extends DCLogic {
  componentDidMount() {
    var self = this;
    this._alive = true;
    this._tick = setInterval(function () { if (self._alive) self.setState({ now: Date.now() }); }, 1000);
  }
  componentDidUpdate(prevProps, prevState) {
    var p = this.props || {}, q = prevProps || {}, patch = null;
    ['theme', 'lang', 'route'].forEach(function (k) { if (p[k] !== q[k]) { patch = patch || {}; patch[k] = undefined; } });
    if (patch) this.setState(patch);
    var s = this.state || {}, ps = prevState || {};
    if (s.motion !== ps.motion && this._planet) this._planet.kick();
  }
  componentWillUnmount() {
    this._alive = false;
    clearInterval(this._tick); clearTimeout(this._dt1); clearTimeout(this._dt2); clearTimeout(this._pt);
    if (this._planet) { this._planet.dispose(); this._planet = null; }
    if (this._io) { this._io.disconnect(); this._io = null; }
  }
  mgView() { var s = this.state || {}, p = this.props || {}; return { theme: s.theme || p.theme || 'dark', lang: s.lang || p.lang || 'es', route: s.route || p.route || 'inicio' }; }
  mgMotionOn() { return (this.state || {}).motion !== false; }
  mgSeen(key) {
    var seen = (this.state || {}).seen || {}; if (seen[key]) return;
    var n = {}; for (var k in seen) n[k] = seen[k]; n[key] = true;
    this.setState({ seen: n });
  }
  mgIoRef(key) {
    var self = this;
    return function (el) {
      if (!el) return;
      if (typeof IntersectionObserver === 'undefined') { self.mgSeen(key); return; }
      if (!self._io) {
        self._io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var k = en.target.getAttribute('data-mg-io'); if (k) self.mgSeen(k);
            if (self._io) self._io.unobserve(en.target);
          });
        }, { threshold: 0.3 });
      }
      el.setAttribute('data-mg-io', key);
      self._io.observe(el);
    };
  }
  mgAttachPlanet(el) {
    var self = this;
    clearTimeout(this._pt);
    if (this._planet) { this._planet.dispose(); this._planet = null; }
    if (!el) return;
    /* let the headline paint first (LCP), then compile and bake the planet */
    this._pt = setTimeout(function () {
      if (self._alive === false || !el.isConnected) return;
      try { self._planet = mgPlanet(el, self); } catch (e) { self._planet = null; }
    }, 140);
  }
  mgH() {
    if (this._h) return this._h;
    var self = this;
    function go(route, anchor) {
      return function (e) {
        if (e && e.preventDefault) e.preventDefault();
        self.setState({ route: route, menuOpen: false }, function () {
          try {
            if (anchor) { var el = document.getElementById(anchor); if (el) el.scrollIntoView({ behavior: mgReduced() ? 'auto' : 'smooth', block: 'start' }); }
            else if (window.scrollY > 0) window.scrollTo(0, 0);
          } catch (err) {}
        });
      };
    }
    var h = { go: {}, jump: {}, pick: {}, io: {}, cfilter: {} };
    ['inicio', 'sobre', 'proyectos', 'charlas', 'contacto'].forEach(function (r) { h.go[r] = go(r); });
    ['kimen', 'jezero', 'orbit'].forEach(function (k) {
      h.jump[k] = go('proyectos', k);
      h.pick[k] = function () { if (((self.state || {}).active || 'kimen') !== k) self.setState({ active: k }); };
      h.io[k] = self.mgIoRef(k);
    });
    h.io.home = self.mgIoRef('home');
    ['all', 'kimen', 'jezero', 'orbit'].forEach(function (k) { h.cfilter[k] = function () { self.setState({ constel: k }); }; });
    h.setEs = function () { self.setState({ lang: 'es' }); };
    h.setEn = function () { self.setState({ lang: 'en' }); };
    h.toggleTheme = function () {
      var next = self.mgView().theme === 'dark' ? 'light' : 'dark';
      if (mgReduced()) { self.setState({ theme: next }); return; }
      clearTimeout(self._dt1); clearTimeout(self._dt2);
      self.setState({ dawn: next });
      self._dt1 = setTimeout(function () { if (self._alive !== false) self.setState({ theme: next }); }, 560);
      self._dt2 = setTimeout(function () { if (self._alive !== false) self.setState({ dawn: null }); }, 1300);
    };
    h.toggleMotion = function () { self.setState({ motion: !self.mgMotionOn() }); };
    h.openMenu = function () { self.setState({ menuOpen: true }); };
    h.closeMenu = function () { self.setState({ menuOpen: false }); };
    h.onMenuKey = function (e) { if (e && e.key === 'Escape') self.setState({ menuOpen: false }); };
    h.menuCloseRef = function (el) { if (el) setTimeout(function () { try { el.focus(); } catch (e) {} }, 40); };
    h.onSend = function (e) { if (e && e.preventDefault) e.preventDefault(); self.setState({ sent: true }); };
    h.planetRef = function (el) { self.mgAttachPlanet(el); };
    h.jzRef = function (el) { self._jzEl = el; };
    h.heroRef = function (el) { self._heroEl = el; };
    h.onHeroMove = function (e) {
      var el = self._heroEl; if (!el || self._mm || mgReduced()) return;
      var r = el.getBoundingClientRect(); if (!r.width) return;
      var x = ((e.clientX - r.left) / r.width) * 2 - 1, y = ((e.clientY - r.top) / r.height) * 2 - 1;
      self._mm = requestAnimationFrame(function () { self._mm = 0; el.style.setProperty('--mx', (-x).toFixed(3)); el.style.setProperty('--my', (-y).toFixed(3)); });
    };
    h.onHeroLeave = function () { var el = self._heroEl; if (el) { el.style.setProperty('--mx', '0'); el.style.setProperty('--my', '0'); } };
    this._h = h;
    return h;
  }
  renderVals() {
    var h = this.mgH(), s = this.state || {}, v = this.mgView();
    var t = MG_T[v.lang] || MG_T.es;
    var isDark = v.theme !== 'light', motionOn = this.mgMotionOn();
    var mc = mgMarsClock(s.now || Date.now());
    var active = s.active || 'kimen', seen = s.seen || {}, constel = s.constel || 'all';
    var keys = ['kimen', 'jezero', 'orbit'], routes = ['inicio', 'sobre', 'proyectos', 'charlas', 'contacto'];

    var nav = routes.map(function (r, i) { return { href: '#' + r, label: t.nav[r], idx: '0' + (i + 1), current: v.route === r ? 'page' : null, go: h.go[r] }; });
    var r = {}; routes.forEach(function (k) { r[k] = v.route === k; });

    function words(list, start) { return list.map(function (w, i) { return { t: w, d: (start + i * 0.12).toFixed(2) + 's' }; }); }
    var n1 = t.hero.l1.length, n2 = t.hero.l2.length;
    var head = { l1: words(t.hero.l1, 0.35), l2: words(t.hero.l2, 0.41 + n1 * 0.12), l3: words(t.hero.l3, 0.49 + (n1 + n2) * 0.12) };

    var lmH = Math.floor(mc.lmst), lmM = Math.floor((mc.lmst - lmH) * 60);
    var hud = { mad: mgMadrid(s.now || Date.now()), sol: String(mc.sol), lmst: mgPad(lmH) + ':' + mgPad(lmM), sim: motionOn ? '×3600' : '×0' };

    var projects = keys.map(function (k, i) { var it = t.sys.items[k]; return { idx: '0' + (i + 1), name: it.name, line: it.line, chips: it.chips, cls: 'p-' + k, on: active === k, pick: h.pick[k] }; });
    var A = t.sys.items[active];
    var jLayers = t.demo.j.layers.map(function (l, i) { return { a: l.a, b: l.b, cls: l.hit ? 'hit' : '', d: (0.2 + i * 0.3).toFixed(2) + 's' }; });
    var chapters = keys.map(function (k, i) {
      var it = t.pj.items[k], sy = t.sys.items[k];
      return {
        id: k, hid: 'mg-pj-' + k, cls: 'p-' + k, idx: '0' + (i + 1), role: it.role, name: sy.name, sub: it.sub, chips: sy.chips,
        links: it.links, soon: !!it.soon, desc: it.desc, bullets: it.bullets, hasNote: !!it.note, noteK: it.noteK || '', note: it.note || '',
        stack: it.stack, stage: 'p-' + k + (seen[k] ? ' is-play' : ''), ioRef: h.io[k], alt: sy.alt,
        isK: k === 'kimen', isJ: k === 'jezero', isO: k === 'orbit'
      };
    });
    var pk = constel === 'all' ? '' : constel.charAt(0);
    function techLabel(st) { return st.l.charAt(0) === '@' ? t.about[st.l.slice(1)] : st.l; }
    function isLit(st) { return !!(pk && st.p && st.p.indexOf(pk) >= 0); }
    var cfilters = ['all'].concat(keys).map(function (k) { return { label: k === 'all' ? t.about.all : t.sys.items[k].name, cls: k === 'all' ? '' : 'p-' + k, on: constel === k, pick: h.cfilter[k] }; });
    var cstars = MG_TECH.map(function (st) { return { label: techLabel(st), x: st.x + '%', y: st.y + '%', learn: !!st.learn, cls: (st.learn ? 'learn ' : '') + (pk ? (isLit(st) ? 'lit' : 'dim') : '') }; });
    var tgroups = t.about.groups.map(function (g, gi) {
      return { label: g.label, items: MG_TECH.filter(function (st) { return st.g === gi; }).map(function (st) { return { label: techLabel(st) + (st.learn ? ' · ' + t.about.learning : ''), cls: isLit(st) ? 'lit' : '' }; }) };
    });
    var nowItems = t.now.items.map(function (it, i) { return { idx: '0' + (i + 1), text: it.text, cls: it.cls, planet: it.icon === 'planet', sat: it.icon === 'sat', puzzle: it.icon === 'puzzle', cap: it.icon === 'cap' }; });

    return {
      theme: isDark ? 'dark' : 'light', lang: v.lang, motionAttr: motionOn ? 'on' : 'off',
      t: t, r: r, nav: nav, go: h.go, jump: h.jump, pick: h.pick, io: h.io,
      isDark: isDark, isLight: !isDark, isEs: v.lang === 'es', isEn: v.lang === 'en',
      setEs: h.setEs, setEn: h.setEn, toggleTheme: h.toggleTheme, themeLabel: isDark ? t.ui.toLight : t.ui.toDark,
      openMenu: h.openMenu, closeMenu: h.closeMenu, onMenuKey: h.onMenuKey, menuCloseRef: h.menuCloseRef, menuOpen: !!s.menuOpen,
      heroCls: isDark ? 'mg-hero--space' : 'mg-hero--surface', heroRef: h.heroRef, onHeroMove: h.onHeroMove, onHeroLeave: h.onHeroLeave,
      stars: mgStars(), twinkles: MG_TWINKLES, head: head, hud: hud,
      motionOn: motionOn, motionOff: !motionOn, toggleMotion: h.toggleMotion, motionLabel: motionOn ? t.ui.pause : t.ui.play,
      planetRef: h.planetRef, jzRef: h.jzRef,
      nowItems: nowItems, projects: projects,
      activeP: { alt: A.alt, cta: A.cta, stack: A.stack, go: h.jump[active] },
      orr: { k: active === 'kimen' ? 'is-on' : '', j: active === 'jezero' ? 'is-on' : '', o: active === 'orbit' ? 'is-on' : '' },
      demo: { kimen: active === 'kimen', jezero: active === 'jezero', orbit: active === 'orbit' },
      stage: { home: 'p-' + active + (seen.home ? ' is-play' : '') },
      jLayers: jLayers, bars: MG_BARS, chapters: chapters,
      cfilters: cfilters, cst: { cls: pk ? 'p-' + constel : '', p: constel }, cstars: cstars, tgroups: tgroups,
      formOpen: !s.sent, formSent: !!s.sent, onSend: h.onSend,
      dawnOn: !!s.dawn, dawnCls: s.dawn ? 'mg-dawn--' + s.dawn : ''
    };
  }
}
