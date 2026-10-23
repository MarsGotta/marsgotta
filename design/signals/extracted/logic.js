/* ---------- Physics: real values, same as the portfolio ---------- */
var SG_JEZ_LON = 77.4508; /* Perseverance landing site, Jezero crater (deg E) */
function sgMarsClock(ms) {
  var jdTT = 2440587.5 + ms / 86400000 + (37 + 32.184) / 86400;
  var msd = (jdTT - 2451549.5) / 1.0274912517 + 44796.0 - 0.0009626;
  var d = jdTT - 2451545.0, R = Math.PI / 180;
  var M = ((19.3871 + 0.52402073 * d) % 360) * R;
  var A = [0.0071, 0.0057, 0.0039, 0.0037, 0.0021, 0.0020, 0.0018];
  var T = [2.2353, 2.7543, 1.1177, 15.7866, 2.1354, 2.4694, 32.8493];
  var P = [49.409, 168.173, 191.837, 21.736, 15.704, 95.528, 49.095];
  var pbs = 0;
  for (var i = 0; i < 7; i++) pbs += A[i] * Math.cos((0.985626 * d / T[i] + P[i]) * R);
  var nuM = (10.691 + 3.0e-7 * d) * Math.sin(M) + 0.623 * Math.sin(2 * M) + 0.050 * Math.sin(3 * M) + 0.005 * Math.sin(4 * M) + 0.0005 * Math.sin(5 * M) + pbs;
  var ls = (((270.3871 + 0.524038496 * d) % 360 + nuM) % 360 + 360) % 360, L = ls * R;
  var eot = 2.861 * Math.sin(2 * L) - 0.071 * Math.sin(4 * L) + 0.002 * Math.sin(6 * L) - nuM;
  var mtc = ((24 * msd) % 24 + 24) % 24;
  return { lmst: ((mtc + SG_JEZ_LON / 15) % 24 + 24) % 24, sol: Math.floor(msd + SG_JEZ_LON / 360) - 52304, eot: eot };
}
/* Earth and Mars from JPL's approximate Keplerian elements (Standish, valid 1800 to 2050):
   a, da, e, de, I, dI, L, dL, long. perihelion, d, long. node, d. Rates per Julian century. */
var SG_EL = {
  earth: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0],
  mars: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343]
};
function sgHelio(el, T) {
  var R = Math.PI / 180;
  var a = el[0] + el[1] * T, e = el[2] + el[3] * T, I = (el[4] + el[5] * T) * R, L = el[6] + el[7] * T, wb = el[8] + el[9] * T, O = el[10] + el[11] * T;
  var M = (((L - wb) % 360) + 540) % 360 - 180, w = (wb - O) * R;
  O *= R; M *= R;
  var E = M + e * Math.sin(M);
  for (var i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); /* Kepler's equation */
  var x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(E);
  var cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  return [(cw * cO - sw * sO * cI) * x + (-sw * cO - cw * sO * cI) * y, (cw * sO + sw * cO * cI) * x + (-sw * sO + cw * cO * cI) * y, sw * sI * x + cw * sI * y];
}
/* How long a signal takes from Earth to Mars right now: distance / c. */
function sgLight(ms) {
  var T = (ms / 86400000 + 2440587.5 - 2451545.0) / 36525;
  var p = sgHelio(SG_EL.earth, T), q = sgHelio(SG_EL.mars, T);
  var km = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) * 149597870.7;
  return { km: km, s: km / 299792.458 };
}
function sgPad(n) { return (n < 10 ? '0' : '') + n; }
function sgHM(h) { var H = Math.floor(h), m = Math.floor((h - H) * 60); return sgPad(H) + ':' + sgPad(m); }

/* ---------- Generated covers: each signal gets its own transmission ---------- */
function sgRand(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
var SG_PAL = {
  ia: { bg: '#2A1218', c: ['#E9603A', '#D11772', '#FFB08A', '#5E1A2A'] },
  practica: { bg: '#1C1530', c: ['#B29BE4', '#7C5CC4', '#FFE9DC', '#2E2350'] },
  tutorial: { bg: '#10202F', c: ['#7FB2E5', '#E9A27A', '#FFF1E6', '#1C3550'] }
};
function sgF(n) { return Math.round(n * 10) / 10; }
function sgCircle(cx, cy, r) { return 'M' + sgF(cx - r) + ' ' + sgF(cy) + 'a' + sgF(r) + ' ' + sgF(r) + ' 0 1 0 ' + sgF(2 * r) + ' 0a' + sgF(r) + ' ' + sgF(r) + ' 0 1 0 ' + sgF(-2 * r) + ' 0Z'; }
function sgShape(d, fill, stroke, sw, op) { return { d: d, fill: fill || 'none', stroke: stroke || 'none', sw: sw || 0, op: op == null ? 1 : op }; }
function sgCover(kind, topic, seed) {
  var r = sgRand(seed * 7919 + 13), P = SG_PAL[topic], c = P.c, out = [], i, x, k;
  if (kind === 'dunes') {
    var sx = 300 + r() * 600, sy = 250 + r() * 120;
    out.push(sgShape(sgCircle(sx, sy, 210), c[2], null, 0, 0.06));
    out.push(sgShape(sgCircle(sx, sy, 120), c[2], null, 0, 0.1));
    out.push(sgShape(sgCircle(sx, sy, 46), c[2], null, 0, 0.92));
    for (k = 0; k < 4; k++) {
      var base = 430 + k * 85, amp = 26 + r() * 30, f1 = 0.004 + r() * 0.004, ph = r() * 6.28, d = 'M0 750L0 ' + sgF(base);
      for (x = 0; x <= 1200; x += 40) d += 'L' + x + ' ' + sgF(base + Math.sin(x * f1 + ph) * amp + Math.sin(x * f1 * 2.7 + ph) * amp * 0.35);
      d += 'L1200 750Z';
      out.push(sgShape(d, k === 0 ? c[3] : k === 1 ? c[1] : k === 2 ? c[0] : P.bg, null, 0, k === 3 ? 1 : 0.9 - k * 0.12));
    }
  } else if (kind === 'orbits') {
    var cx = 600 + (r() - 0.5) * 200, cy = 375 + (r() - 0.5) * 80, tilt = (-14 + r() * 8) * Math.PI / 180;
    for (k = 1; k <= 5; k++) {
      var rx = 90 + k * 96, ry = rx * 0.3, d2 = '';
      for (i = 0; i <= 72; i++) { var t = i / 72 * Math.PI * 2, ex = Math.cos(t) * rx, ey = Math.sin(t) * ry; d2 += (i ? 'L' : 'M') + sgF(cx + ex * Math.cos(tilt) - ey * Math.sin(tilt)) + ' ' + sgF(cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)); }
      out.push(sgShape(d2 + 'Z', null, k === 3 ? c[0] : c[2], k === 3 ? 2.6 : 1.4, k === 3 ? 0.95 : 0.22));
      var a = r() * Math.PI * 2, px = Math.cos(a) * rx, py = Math.sin(a) * ry;
      out.push(sgShape(sgCircle(cx + px * Math.cos(tilt) - py * Math.sin(tilt), cy + px * Math.sin(tilt) + py * Math.cos(tilt), k === 3 ? 11 : 5), k === 3 ? c[0] : c[2], null, 0, k === 3 ? 1 : 0.7));
    }
    out.push(sgShape(sgCircle(cx, cy, 64), c[1], null, 0, 0.95));
    out.push(sgShape(sgCircle(cx - 18, cy - 20, 40), c[0], null, 0, 0.55));
  } else if (kind === 'signal') {
    var ox = 140 + r() * 160, oy = 600 - r() * 80;
    for (k = 1; k <= 11; k++) {
      var rr = k * 92;
      out.push(sgShape('M' + sgF(ox) + ' ' + sgF(oy - rr) + 'A' + rr + ' ' + rr + ' 0 0 1 ' + sgF(ox + rr) + ' ' + sgF(oy), null, k % 4 === 2 ? c[0] : c[2], k % 4 === 2 ? 3 : 1.4, k % 4 === 2 ? 0.95 : 0.5 - k * 0.035));
    }
    out.push(sgShape(sgCircle(ox, oy, 34), c[1], null, 0, 1));
    var wy = 210 + r() * 60, w = 'M0 ' + sgF(wy);
    for (x = 0; x <= 1200; x += 8) { var env = Math.exp(-Math.pow((x - 820) / 240, 2)); w += 'L' + x + ' ' + sgF(wy + Math.sin(x * 0.09 + r() * 0.6) * (4 + 70 * env)); }
    out.push(sgShape(w, null, c[2], 2, 0.85));
  } else {
    var y = 120, band = 0, hit = 2 + Math.floor(r() * 4);
    while (y < 750) {
      var h = 46 + r() * 52, amp2 = 6 + r() * 12, ph2 = r() * 6.28, top = 'M0 750L0 ' + sgF(y);
      for (x = 0; x <= 1200; x += 60) top += 'L' + x + ' ' + sgF(y + Math.sin(x * 0.006 + ph2) * amp2);
      top += 'L1200 750Z';
      out.push(sgShape(top, band === hit ? c[0] : band % 2 ? c[3] : c[1], null, 0, band === hit ? 0.95 : 0.35 + (band % 3) * 0.12));
      y += h; band++;
    }
    var scan = 140 + hit * 70;
    out.push(sgShape('M0 ' + scan + 'L1200 ' + scan, null, c[2], 1.6, 0.8));
    out.push(sgShape(sgCircle(900, scan, 7), c[2], null, 0, 1));
  }
  return { bg: P.bg, shapes: out };
}

/* ---------- Tiny syntax colouring for the code samples ---------- */
var SG_KW = {
  sql: ['CREATE', 'VIRTUAL', 'TABLE', 'USING', 'SELECT', 'FROM', 'WHERE', 'MATCH', 'ORDER', 'BY', 'LIMIT', 'AS', 'INSERT', 'INTO', 'VALUES', 'OR', 'AND', 'UNINDEXED'],
  python: ['import', 'from', 'def', 'return', 'with', 'as', 'for', 'in', 'if', 'None', 'True', 'False']
};
function sgTok(line, lang) {
  var out = [], re = /(--.*$|#.*$)|('(?:[^']*)'|"(?:[^"]*)")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\()|([A-Za-z_][A-Za-z0-9_]*)|(\s+|.)/g, m, kw = SG_KW[lang] || [];
  while ((m = re.exec(line))) {
    if (m[1] && ((lang === 'sql' && m[1].charAt(0) === '-') || (lang === 'python' && m[1].charAt(0) === '#'))) out.push({ t: m[1], c: 'c' });
    else if (m[1]) out.push({ t: m[1], c: '' });
    else if (m[2]) out.push({ t: m[2], c: 's' });
    else if (m[3]) out.push({ t: m[3], c: 'n' });
    else if (m[4]) out.push({ t: m[4], c: kw.indexOf(m[4]) >= 0 ? 'k' : 'f' });
    else if (m[5]) out.push({ t: m[5], c: kw.indexOf(m[5]) >= 0 ? 'k' : '' });
    else out.push({ t: m[6], c: '' });
  }
  var merged = [];
  out.forEach(function (x) { var l = merged[merged.length - 1]; if (l && l.c === x.c) l.t += x.t; else merged.push({ t: x.t, c: x.c }); });
  if (!merged.length) merged.push({ t: ' ', c: '' });
  return merged;
}
/* **bold**, `code` and [text](url) inside a paragraph */
function sgParts(s) {
  var out = [], re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g, last = 0, m;
  function push(o) { out.push({ t: o.t, href: o.href || '', isT: !!o.T, isB: !!o.B, isC: !!o.C, isA: !!o.A }); }
  while ((m = re.exec(s))) {
    if (m.index > last) push({ t: s.slice(last, m.index), T: 1 });
    if (m[1]) push({ t: m[1], B: 1 }); else if (m[2]) push({ t: m[2], C: 1 }); else push({ t: m[3], href: m[4], A: 1 });
    last = re.lastIndex;
  }
  if (last < s.length) push({ t: s.slice(last), T: 1 });
  return out;
}

/* ---------- Content ---------- */
var SG_POSTS = [
  { n: '007', topic: 'tutorial', iso: '2026-10-21', min: 9, cover: 'strata', slug: { es: 'dale-memoria-a-tus-agentes-con-sqlite', en: 'give-your-agents-memory-with-sqlite' },
    title: { es: 'Dale memoria a tus agentes con un solo fichero SQLite', en: 'Give your agents memory with a single SQLite file' },
    excerpt: { es: 'Búsqueda de texto completo con FTS5, sin GPU ni servicios externos. El patrón que uso en Jezero, paso a paso.', en: 'Full-text search with FTS5, no GPU, no external services. The pattern I use in Jezero, step by step.' } },
  { n: '006', topic: 'practica', iso: '2026-10-14', min: 6, cover: 'signal', slug: { es: 'cinco-preguntas-codigo-ia', en: 'five-questions-ai-code' },
    title: { es: 'Cinco preguntas antes de aceptar código que ha escrito una IA', en: 'Five questions before you accept code an AI wrote' },
    excerpt: { es: 'Compila y pasa los tests. Eso no significa que esté bien. La lista corta que repaso en cada revisión.', en: 'It compiles and the tests pass. That does not mean it is right. The short list I go through in every review.' } },
  { n: '005', topic: 'ia', iso: '2026-10-07', min: 4, cover: 'orbits', slug: { es: 'senales-de-la-semana-12', en: 'signals-of-the-week-12' },
    title: { es: 'Señales de la semana #12', en: 'Signals of the week #12' },
    excerpt: { es: 'Lo que ha pasado esta semana en IA y en la web, filtrado: tres cosas que importan y por qué, y una que puedes ignorar.', en: 'What happened this week in AI and on the web, filtered: three things that matter and why, and one you can ignore.' } },
  { n: '004', topic: 'practica', iso: '2026-09-30', min: 7, cover: 'dunes', slug: { es: 'accesibilidad-puerta-dura-ci', en: 'accessibility-hard-gate-ci' },
    title: { es: 'La accesibilidad como puerta dura en CI', en: 'Accessibility as a hard gate in CI' },
    excerpt: { es: 'Si axe encuentra una violación, no se fusiona. Cómo lo montamos en Kimen y qué aprendimos por el camino.', en: 'If axe finds a violation, it does not merge. How we set it up in Kimen and what we learned on the way.' } },
  { n: '003', topic: 'tutorial', iso: '2026-09-23', min: 11, cover: 'orbits', slug: { es: 'web-components-para-agentes', en: 'web-components-for-agents' },
    title: { es: 'Web Components que un agente puede usar sin romper nada', en: 'Web Components an agent can use without breaking anything' },
    excerpt: { es: 'Un catálogo cerrado, un contrato claro y validación antes de pintar. El patrón detrás de Kimen, con código.', en: 'A closed catalogue, a clear contract and validation before rendering. The pattern behind Kimen, with code.' } },
  { n: '002', topic: 'ia', iso: '2026-09-16', min: 4, cover: 'signal', slug: { es: 'senales-de-la-semana-11', en: 'signals-of-the-week-11' },
    title: { es: 'Señales de la semana #11', en: 'Signals of the week #11' },
    excerpt: { es: 'Tres noticias que importan, contadas sin prisa, y qué deberían cambiar en tu forma de trabajar.', en: 'Three news items that matter, told without hurry, and what they should change in the way you work.' } }
];
var SG_PICKS = ['003', '004', '006'];
var SG_RELATED = ['003', '006'];

var SG_ARTICLE = {
  es: {
    deck: 'Búsqueda de texto completo con FTS5, sin GPU ni servicios externos. El patrón que uso en Jezero, paso a paso.',
    coverCap: 'Portada generada a partir de la señal 007: los estratos del cráter Jezero.',
    tags: ['SQLite', 'Agentes', 'MCP', 'Python'],
    blocks: [
      ['lead', 'Tus agentes olvidan. Cada sesión empieza de cero: lo que decidimos ayer, el comando que por fin funcionó, el error exacto que ya resolvimos la semana pasada. Y tú acabas repitiendo contexto, como quien explica lo mismo a un compañero nuevo cada mañana.'],
      ['p', 'La tentación es montar una base de datos vectorial, un servicio de embeddings y una GPU. Para la memoria de trabajo de un equipo, casi nunca hace falta. Empieza por algo más pequeño: **un único fichero SQLite con búsqueda de texto completo**.'],
      ['h2', 'por-que-fts5', 'Por qué texto completo y no embeddings'],
      ['p', 'Lo que más se busca en la memoria de un agente son cosas exactas: un mensaje de error, el nombre de un fichero, un flag, una decisión con sus palabras. Ahí la búsqueda léxica gana. Encuentra la coincidencia literal en milisegundos y puedes explicar por qué la ha encontrado.'],
      ['p', '`FTS5` es la extensión de búsqueda de texto completo que viene con SQLite. Ordena por relevancia con `bm25`, resalta los fragmentos que coinciden y no necesita ningún servidor.'],
      ['tip', 'Empieza con FTS5. Añade embeddings solo cuando tengas consultas reales que fallen por sinónimos, no antes.'],
      ['h2', 'la-tabla', 'Una tabla virtual, cuatro columnas'],
      ['p', 'La memoria vive en una tabla virtual. Solo se indexa lo que se busca; el origen y la fecha van en columnas sin indexar.'],
      ['code', 'sql', 'schema.sql', "CREATE VIRTUAL TABLE atoms USING fts5(\n  kind,               -- decision, error, fix, command\n  body,\n  source UNINDEXED,   -- qué agente lo escribió\n  created_at UNINDEXED,\n  tokenize = 'unicode61 remove_diacritics 2'\n);"],
      ['p', 'El tokenizador `unicode61` con `remove_diacritics 2` hace que «decisión» y «decision» encuentren lo mismo. En español, eso importa.'],
      ['h2', 'atomos', 'Guarda átomos, no sesiones enteras'],
      ['p', 'Una sesión completa es ruido: cientos de líneas para una sola decisión útil. Antes de guardar, resume cada sesión en **átomos**: una decisión, su porqué, un error exacto, el arreglo, el comando que funcionó. Un átomo, una fila.'],
      ['code', 'python', 'save.py', 'import sqlite3\n\ndb = sqlite3.connect("memory.db")\ndb.execute(\n    "INSERT INTO atoms (kind, body, source, created_at) VALUES (?, ?, ?, ?)",\n    ("decision", "Usamos SQLite FTS5: milisegundos y sin GPU.", "claude-code", "2026-10-02"),\n)\ndb.commit()'],
      ['quote', 'Una memoria que tú no puedes leer tampoco es una memoria en la que puedas confiar.'],
      ['h2', 'buscar', 'Buscar con ranking'],
      ['p', 'Para recuperar algo, `MATCH` filtra, `bm25()` ordena (cuanto más bajo, más relevante) y `snippet()` devuelve el trozo exacto que coincide, listo para meterlo en el contexto del agente.'],
      ['code', 'sql', 'search.sql', "SELECT kind,\n       snippet(atoms, 1, '[', ']', '…', 12) AS hit,\n       source\nFROM atoms\nWHERE atoms MATCH 'sqlite OR fts5'\nORDER BY bm25(atoms)\nLIMIT 5;"],
      ['p', 'Con unos miles de átomos, esta consulta tarda milisegundos en un portátil. Y el fichero entero se copia, se versiona y se borra como cualquier otro.'],
      ['h2', 'solo-lectura', 'Que lean todos, que no escriba ninguno'],
      ['p', 'El último paso es darles acceso. Yo lo expongo como un servidor MCP de **solo lectura**: cualquier agente puede preguntar qué se decidió o qué falló, pero ninguno puede reescribir la memoria. Escribe un proceso aparte, que además redacta los secretos antes de guardar nada.'],
      ['ul', ['Un fichero, sin servicios: lo entiendes, lo copias y lo borras.', 'Átomos pequeños: el agente recibe un contexto corto y preciso.', 'Lectura para todos y escritura para uno: la memoria no se corrompe sola.']],
      ['p', 'Este es el patrón que hay detrás de [Jezero](https://github.com/MarsGotta/jezero), la memoria compartida de mis agentes, que ya es open source.']
    ]
  },
  en: {
    deck: 'Full-text search with FTS5, no GPU, no external services. The pattern I use in Jezero, step by step.',
    coverCap: 'Cover generated from signal 007: the strata of Jezero crater.',
    tags: ['SQLite', 'Agents', 'MCP', 'Python'],
    blocks: [
      ['lead', 'Your agents forget. Every session starts from zero: what we decided yesterday, the command that finally worked, the exact error we fixed last week. And you end up repeating context, like explaining the same thing to a new teammate every morning.'],
      ['p', 'The temptation is to set up a vector database, an embeddings service and a GPU. For a team’s working memory, you almost never need them. Start with something smaller: **a single SQLite file with full-text search**.'],
      ['h2', 'why-fts5', 'Why full-text search and not embeddings'],
      ['p', 'What you look up most in an agent’s memory is exact: an error message, a file name, a flag, a decision in its own words. That is where lexical search wins. It finds the literal match in milliseconds, and you can explain why it found it.'],
      ['p', '`FTS5` is the full-text search extension that ships with SQLite. It ranks by relevance with `bm25`, highlights the matching fragments and needs no server at all.'],
      ['tip', 'Start with FTS5. Add embeddings only when you have real queries that fail because of synonyms, not before.'],
      ['h2', 'the-table', 'One virtual table, four columns'],
      ['p', 'Memory lives in a virtual table. Only what you search is indexed; the source and the date go in unindexed columns.'],
      ['code', 'sql', 'schema.sql', "CREATE VIRTUAL TABLE atoms USING fts5(\n  kind,               -- decision, error, fix, command\n  body,\n  source UNINDEXED,   -- which agent wrote it\n  created_at UNINDEXED,\n  tokenize = 'unicode61 remove_diacritics 2'\n);"],
      ['p', 'The `unicode61` tokenizer with `remove_diacritics 2` makes «decisión» and «decision» match the same rows. In Spanish, that matters.'],
      ['h2', 'atoms', 'Store atoms, not whole sessions'],
      ['p', 'A full session is noise: hundreds of lines for a single useful decision. Before storing, summarise each session into **atoms**: a decision, its why, an exact error, the fix, the command that worked. One atom, one row.'],
      ['code', 'python', 'save.py', 'import sqlite3\n\ndb = sqlite3.connect("memory.db")\ndb.execute(\n    "INSERT INTO atoms (kind, body, source, created_at) VALUES (?, ?, ?, ?)",\n    ("decision", "We use SQLite FTS5: milliseconds, no GPU.", "claude-code", "2026-10-02"),\n)\ndb.commit()'],
      ['quote', 'A memory you cannot read yourself is not a memory you can trust.'],
      ['h2', 'search', 'Search with ranking'],
      ['p', 'To get something back, `MATCH` filters, `bm25()` ranks (lower means more relevant) and `snippet()` returns the exact matching fragment, ready to drop into the agent’s context.'],
      ['code', 'sql', 'search.sql', "SELECT kind,\n       snippet(atoms, 1, '[', ']', '…', 12) AS hit,\n       source\nFROM atoms\nWHERE atoms MATCH 'sqlite OR fts5'\nORDER BY bm25(atoms)\nLIMIT 5;"],
      ['p', 'With a few thousand atoms, this query takes milliseconds on a laptop. And the whole file is copied, versioned and deleted like any other.'],
      ['h2', 'read-only', 'Everyone reads, nobody writes'],
      ['p', 'The last step is giving them access. I expose it as a **read-only** MCP server: any agent can ask what was decided or what failed, but none of them can rewrite the memory. A separate process writes, and it redacts secrets before storing anything.'],
      ['ul', ['One file, no services: you understand it, copy it and delete it.', 'Small atoms: the agent gets short, precise context.', 'Read for everyone, write for one: memory does not corrupt itself.']],
      ['p', 'This is the pattern behind [Jezero](https://github.com/MarsGotta/jezero), the shared memory of my agents, which is now open source.']
    ]
  }
};

var SG_T = {
  es: {
    ui: { skip: 'Saltar al contenido', homeAria: 'Signals by Mars, inicio', topics: 'Temas', about: 'Sobre Mars', lang: 'Idioma', subscribe: 'Suscribirme', toLight: 'Cambiar al tema claro', toDark: 'Cambiar al tema oscuro', signal: 'Señal', read: 'min de lectura' },
    topics: { ia: 'Noticias IA', practica: 'Práctica', tutorial: 'Tutoriales' },
    topic1: { ia: 'Noticias IA', practica: 'Práctica', tutorial: 'Tutorial' },
    home: { over: 'Transmitiendo desde Madrid', h1a: 'Señales', h1b: 'entre el ruido.', sub: 'Noticias de IA y tecnología que importan, consejos prácticos para hacer mejor software y algún tutorial. Lo escribe Mars, desde Madrid.' },
    strip: { k: 'Señal Tierra → Marte', earth: 'Tierra', mars: 'Marte', a: 'Hoy tarda', km: 'millones de km' },
    feed: { h: 'Últimas señales', all: 'Todo' },
    side: { aria: 'Más de Signals', startH: 'Empieza por aquí', topicsH: 'Temas', aboutH: 'Quién escribe', aboutP: 'Soy Marcela Gotta, Mars para casi todo el mundo. Ingeniera de software en Madrid: lidero frontend en Sngular y construyo en abierto infraestructura para agentes de IA.', aboutCta: 'Mi portfolio', rss: 'También por RSS', rssP: 'Si prefieres tu lector de siempre.' },
    nl: { over: 'Newsletter', h2a: 'Cada señal,', h2b: 'en tu correo.', sub: 'Un email cada vez que publico un artículo. Nada más: ni promociones ni resúmenes de relleno.', formLabel: 'Suscripción a la newsletter', label: 'Tu email', ph: 'tu@email.com', cta: 'Suscribirme', fine: 'Sin spam. Te das de baja con un clic.', okA: 'Casi está.', okB: 'Revisa tu correo y confirma la suscripción.', err: 'Ese email no parece válido. ¿Lo revisas?' },
    post: { follow: 'Suscribirme', share: 'Compartir', copy: 'Copiar enlace', copied: 'Enlace copiado', newTab: '(se abre en otra pestaña)', toc: 'En esta señal', tip: 'Consejo práctico', copyCode: 'Copiar', copiedCode: 'Copiado', byK: 'Escrito por', byP: 'Ingeniera de software en Madrid y Head Frontend Developer en Sngular. Construye en abierto Kimen, Jezero y Orbit.', endH: 'Te aviso de la próxima señal.', endP: 'Un email por artículo. Sin spam y sin relleno.', nextH: 'Siguientes señales' },
    foot: { line: 'Signals by Mars es el blog de Marcela Gotta: IA, tecnología y oficio, escrito con calma.', archive: 'Archivo', portfolio: 'Portfolio', made: 'Hecho en Madrid, pensado en Marte', inJezero: 'en Jezero' },
    months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
  },
  en: {
    ui: { skip: 'Skip to content', homeAria: 'Signals by Mars, home', topics: 'Topics', about: 'About Mars', lang: 'Language', subscribe: 'Subscribe', toLight: 'Switch to the light theme', toDark: 'Switch to the dark theme', signal: 'Signal', read: 'min read' },
    topics: { ia: 'AI news', practica: 'Practice', tutorial: 'Tutorials' },
    topic1: { ia: 'AI news', practica: 'Practice', tutorial: 'Tutorial' },
    home: { over: 'Transmitting from Madrid', h1a: 'Signals', h1b: 'through the noise.', sub: 'AI and tech news that matters, practical advice for building better software, and the odd tutorial. Written by Mars, from Madrid.' },
    strip: { k: 'Earth → Mars signal', earth: 'Earth', mars: 'Mars', a: 'Today it takes', km: 'million km' },
    feed: { h: 'Latest signals', all: 'All' },
    side: { aria: 'More from Signals', startH: 'Start here', topicsH: 'Topics', aboutH: 'Who writes', aboutP: 'I am Marcela Gotta, Mars to almost everyone. A software engineer in Madrid: I lead frontend at Sngular and build agent infrastructure in the open.', aboutCta: 'My portfolio', rss: 'Also on RSS', rssP: 'If you prefer your usual reader.' },
    nl: { over: 'Newsletter', h2a: 'Every signal,', h2b: 'in your inbox.', sub: 'One email each time I publish a post. Nothing else: no promotions, no filler digests.', formLabel: 'Newsletter subscription', label: 'Your email', ph: 'you@email.com', cta: 'Subscribe', fine: 'No spam. Unsubscribe in one click.', okA: 'Almost there.', okB: 'Check your inbox and confirm your subscription.', err: 'That email does not look right. Mind checking it?' },
    post: { follow: 'Subscribe', share: 'Share', copy: 'Copy link', copied: 'Link copied', newTab: '(opens in a new tab)', toc: 'In this signal', tip: 'Practical tip', copyCode: 'Copy', copiedCode: 'Copied', byK: 'Written by', byP: 'Software engineer in Madrid and Head Frontend Developer at Sngular. Builds Kimen, Jezero and Orbit in the open.', endH: 'I will let you know about the next signal.', endP: 'One email per post. No spam, no filler.', nextH: 'Next signals' },
    foot: { line: 'Signals by Mars is Marcela Gotta’s blog: AI, technology and craft, written calmly.', archive: 'Archive', portfolio: 'Portfolio', made: 'Made in Madrid, designed on Mars', inJezero: 'in Jezero' },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
};
var SG_TOPICS = ['ia', 'practica', 'tutorial'];

function sgDate(iso, lang) {
  var p = iso.split('-'), m = SG_T[lang].months[+p[1] - 1], d = +p[2];
  return lang === 'en' ? m + ' ' + d + ', ' + p[0] : d + ' ' + m + ' ' + p[0];
}
function sgReduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
var SG_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var SG_COVERS = {};
function sgCoverFor(p) { var k = p.n; if (!SG_COVERS[k]) SG_COVERS[k] = sgCover(p.cover, p.topic, +p.n); return SG_COVERS[k]; }

class Component extends DCLogic {
  componentDidMount() {
    var self = this;
    this._alive = true;
    this._tick = setInterval(function () { if (self._alive) self.setState({ now: Date.now() }); }, 10000);
  }
  componentDidUpdate(prevProps) {
    var p = this.props || {}, q = prevProps || {}, patch = null;
    ['theme', 'lang', 'route'].forEach(function (k) { if (p[k] !== q[k]) { patch = patch || {}; patch[k] = undefined; } });
    if (patch) this.setState(patch);
  }
  componentWillUnmount() { this._alive = false; clearInterval(this._tick); clearTimeout(this._ct); clearTimeout(this._cc); }
  sgView() { var s = this.state || {}, p = this.props || {}; return { theme: s.theme || p.theme || 'light', lang: s.lang || p.lang || 'es', route: s.route || p.route || 'inicio' }; }
  sgH() {
    if (this._h) return this._h;
    var self = this;
    function scrollTo(id) {
      try {
        if (!id) { if (window.scrollY > 0) window.scrollTo(0, 0); return; }
        var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: sgReduced() ? 'auto' : 'smooth', block: 'start' });
      } catch (e) {}
    }
    function go(route, anchor, patch) {
      return function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var st = { route: route }; if (patch) for (var k in patch) st[k] = patch[k];
        self.setState(st, function () { scrollTo(anchor); });
      };
    }
    var h = { go: {}, topic: {}, sub: {}, code: {} };
    h.go.home = go('inicio', null, { topic: 'all' });
    h.go.article = go('articulo', null);
    h.go.subscribe = function (e) { if (e && e.preventDefault) e.preventDefault(); scrollTo('suscribirse'); };
    h.go.archive = go('inicio', 'temas', { topic: 'all' });
    ['all'].concat(SG_TOPICS).forEach(function (k) { h.topic[k] = go('inicio', 'temas', { topic: k }); });
    h.pickTab = {};
    ['all'].concat(SG_TOPICS).forEach(function (k) { h.pickTab[k] = function () { self.setState({ topic: k }); }; });
    ['hero', 'band', 'post'].forEach(function (where) {
      h.sub[where] = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var f = e && (e.currentTarget || e.target), el = f && f.elements ? f.elements.email : null, v = el ? String(el.value || '').trim() : '';
        if (!SG_EMAIL.test(v)) { self.setState({ nlErr: where }); try { if (el) el.focus(); } catch (x) {} return; }
        self.setState({ nlSent: true, nlErr: null });
      };
    });
    h.setEs = function () { self.setState({ lang: 'es' }); };
    h.setEn = function () { self.setState({ lang: 'en' }); };
    h.toggleTheme = function () { self.setState({ theme: self.sgView().theme === 'dark' ? 'light' : 'dark' }); };
    h.copyText = function (text, key) {
      try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) {}
      self.setState({ copied: key });
      clearTimeout(self._ct);
      self._ct = setTimeout(function () { if (self._alive !== false) self.setState({ copied: null }); }, 2200);
    };
    this._h = h;
    return h;
  }
  renderVals() {
    var h = this.sgH(), s = this.state || {}, v = this.sgView();
    var lang = v.lang === 'en' ? 'en' : 'es', t = SG_T[lang], isDark = v.theme === 'dark';
    var topic = s.topic || 'all', now = s.now || Date.now();
    var r = { home: v.route !== 'articulo', article: v.route === 'articulo' };
    var base = 'https://signals.marcelagotta.com' + (lang === 'en' ? '/en/' : '/');

    function card(p) {
      return {
        num: p.n, title: p.title[lang], excerpt: p.excerpt[lang], topic: t.topic1[p.topic], tcls: 't-' + p.topic,
        date: sgDate(p.iso, lang), sol: String(sgMarsClock(Date.parse(p.iso + 'T10:00:00Z')).sol), read: p.min + ' ' + t.ui.read,
        href: base + p.slug[lang], go: h.go.article, cover: sgCoverFor(p)
      };
    }
    var byNum = {}; SG_POSTS.forEach(function (p) { byNum[p.n] = p; });
    var cards = SG_POSTS.map(card);
    var feat = cards[0];
    var feed = topic === 'all' ? cards.slice(1) : cards.filter(function (c, i) { return SG_POSTS[i].topic === topic; });

    var tabs = ['all'].concat(SG_TOPICS).map(function (k) { return { label: k === 'all' ? t.feed.all : t.topics[k], tcls: k === 'all' ? '' : 't-' + k, on: topic === k, pick: h.pickTab[k] }; });
    var navTopics = SG_TOPICS.map(function (k) { return { label: t.topics[k], go: h.topic[k], cur: r.home && topic === k ? 'true' : null }; });
    var chips = SG_TOPICS.map(function (k) { return { label: t.topics[k], tcls: 't-' + k, count: String(SG_POSTS.filter(function (p) { return p.topic === k; }).length), pick: h.topic[k] }; });
    var picks = SG_PICKS.map(function (n, i) { var c = card(byNum[n]); return { n: '0' + (i + 1), title: c.title, topic: c.topic, read: c.read, href: c.href, go: c.go }; });
    var related = SG_RELATED.map(function (n) { return card(byNum[n]); });

    /* the article */
    var P = SG_POSTS[0], A = SG_ARTICLE[lang], self = this, hn = 0, toc = [];
    var blocks = A.blocks.map(function (b, i) {
      var o = { isP: false, isH: false, isQ: false, isTip: false, isUl: false, isCode: false, cls: '', parts: [], t: '', id: '', n: '', items: [], file: '', lines: [], copy: null, copyLabel: '' };
      if (b[0] === 'p' || b[0] === 'lead') { o.isP = true; o.cls = b[0] === 'lead' ? 'sg-lead' : ''; o.parts = sgParts(b[1]); }
      else if (b[0] === 'h2') { hn++; o.isH = true; o.id = b[1]; o.t = b[2]; o.n = '0' + hn; toc.push({ id: b[1], t: b[2], n: '0' + hn }); }
      else if (b[0] === 'quote') { o.isQ = true; o.t = b[1]; }
      else if (b[0] === 'tip') { o.isTip = true; o.parts = sgParts(b[1]); }
      else if (b[0] === 'ul') { o.isUl = true; o.items = b[1].map(function (x) { return { t: x }; }); }
      else if (b[0] === 'code') {
        var key = 'code' + i;
        o.isCode = true; o.file = b[2];
        o.lines = b[3].split('\n').map(function (ln) { return { toks: sgTok(ln, b[1]) }; });
        if (!h.code[key]) h.code[key] = function () { var cur = SG_ARTICLE[self.sgView().lang === 'en' ? 'en' : 'es'].blocks[i]; h.copyText(cur[3], key); };
        o.copy = h.code[key]; o.copyLabel = s.copied === key ? t.post.copiedCode : t.post.copyCode;
      }
      return o;
    });
    var url = base + P.slug[lang];
    if (!h.copyLink) h.copyLink = function () { var l = self.sgView().lang === 'en' ? 'en' : 'es'; h.copyText('https://signals.marcelagotta.com' + (l === 'en' ? '/en/' : '/') + SG_POSTS[0].slug[l], 'link'); };
    var a = {
      num: P.n, title: P.title[lang], deck: A.deck, topic: t.topic1[P.topic], tcls: 't-' + P.topic, goTopic: h.topic[P.topic],
      iso: P.iso, date: sgDate(P.iso, lang), sol: feat.sol, read: feat.read, cover: sgCoverFor(P), coverCap: A.coverCap,
      tags: A.tags, toc: toc, blocks: blocks,
      shareLi: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
      shareX: 'https://x.com/intent/post?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(P.title[lang])
    };

    var L = sgLight(now), mins = Math.floor(L.s / 60), secs = Math.floor(L.s % 60);
    var dist = (L.km / 1e6).toFixed(1); if (lang === 'es') dist = dist.replace('.', ',');
    var mc = sgMarsClock(now);
    var nlSent = !!s.nlSent, err = s.nlErr;
    function inv(w) { return !nlSent && err === w ? 'true' : 'false'; }
    function emsg(w) { return !nlSent && err === w ? t.nl.err : ''; }

    return {
      t: t, r: r, theme: isDark ? 'dark' : 'light', lang: lang, isDark: isDark, isLight: !isDark, isEs: lang === 'es', isEn: lang === 'en',
      themeLabel: isDark ? t.ui.toLight : t.ui.toDark, setEs: h.setEs, setEn: h.setEn, toggleTheme: h.toggleTheme, go: h.go,
      navTopics: navTopics, tabs: tabs, chips: chips, picks: picks, feat: feat, feed: feed, related: related, a: a,
      lt: { time: mins + ' min ' + secs + ' s', dist: dist }, mc: { sol: String(mc.sol), lmst: sgHM(mc.lmst) },
      nl: { idle: !nlSent, sent: nlSent, inv: { hero: inv('hero'), band: inv('band'), post: inv('post') }, err: { hero: emsg('hero'), band: emsg('band'), post: emsg('post') } },
      sub: h.sub, copyLink: h.copyLink, copyIdle: s.copied !== 'link', copyDone: s.copied === 'link', copyCls: s.copied === 'link' ? 'is-done' : ''
    };
  }
}
