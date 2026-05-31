/**
 * Site content — typed source of truth.
 * Replaces the legacy `window.MARS_DATA` from the static design.
 *
 * F3 closed 2026-06-01: all sections populated with content decided in design sessions.
 */

import type { Locale } from '@/i18n/routing';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type NowItem = { icon: string; text: string };

export type HeroContent = {
  overline: string;
  name: string;
  headline: string[];
  sub: string;
  cta1: string;
  cta2: string;
  now: NowItem[];
};

export type AboutFact = { k: string; v: string };
export type AboutRole = { year: string; role: string; detail: string };

export type AboutContent = {
  title: string;
  paragraphs: string[];
  facts: AboutFact[];
  roles: AboutRole[];
};

export type SkillGroup = { title: string; items: string[] };
export type SkillsContent = { groups: SkillGroup[] };

export type ProjectItem = {
  code: string;
  name: string;
  tag: string;
  summary: string;
  tech: string[];
  role: string;
};

export type TalkItem = {
  year: string;
  type: string;
  title: string;
  venue: string;
};

export type LabExperiment = {
  tag: string;
  title: string;
  desc: string;
  stack: string;
};

export type LabContent = {
  intro: string;
  experiments: LabExperiment[];
};

export type SocialLink = {
  label: string;
  url: string;
};

export type ContactContent = {
  title: string;
  sub: string;
  email: string;
  placeholders: { name: string; email: string; message: string };
  send: string;
  sent: string;
  ai: string;
  aiPh: string;
  social: SocialLink[];
};

export type Content = {
  hero: HeroContent;
  about: AboutContent;
  skills: SkillsContent;
  projects: ProjectItem[];
  talks: TalkItem[];
  lab: LabContent;
  contact: ContactContent;
};

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

export const content: Record<Locale, Content> = {
  es: {
    hero: {
      overline: 'Senior Product Engineer · Building agent harnesses',
      name: 'Marcela Gotta',
      headline: ['Construyo software', 'que piensa contigo.'],
      sub: '16 años construyendo software, especializada en product craft y arquitectura. Desde 2024 también construyo agent harnesses open source — la infraestructura que hace que los agentes de IA dejen de ser demo y se vuelvan parte real del equipo.',
      cta1: 'Ver el laboratorio',
      cta2: 'Mis proyectos',
      now: [
        {
          icon: '🔭',
          text: 'Construyendo Orbit, un harness builder para agentes que viaja entre runtimes',
        },
        { icon: '🦀', text: 'Aprendiendo Rust de la mano de Lunar, mi TUI cliente ACP' },
        {
          icon: '📚',
          text: 'Demasiado tiempo leyendo sobre agent infrastructure, MCP, harness engineering',
        },
        { icon: '🗣️', text: 'Activando mi inglés cada día con un equipo cross-cultural' },
      ],
    },
    about: {
      title: 'Hola, soy Mars',
      paragraphs: [
        'Llevo 16 años construyendo software. Empecé como full-stack, me enamoré del frontend, lideré equipos durante años entregando producto y arquitectura, y desde 2024 me he obsesionado con la infraestructura que va a sostener los agentes de IA cuando dejen de ser demo.',
        'Creo que la IA es la herramienta más potente que hemos tenido nunca — pero solo si los humanos quedamos del lado que la dirige, no del que la sufre. Mi trabajo open source (Deimos, Orbit, Lunar) intenta construir esa parte: harnesses agnósticos, identidad y memoria para agentes que sirvan al equipo, no al revés.',
        'Vivo en Madrid con un pequeño zoológico. Me gusta la física, los videojuegos, escribir, y convertir ideas raras en código que funciona.',
      ],
      facts: [
        { k: 'Ubicación', v: 'Madrid, España' },
        { k: 'Idiomas', v: 'Español (nativo) · English (B2 activo, práctica diaria)' },
        { k: 'Rol actual', v: 'Senior Product Engineer · OSS Agent Harness' },
        { k: 'Enfoque', v: 'Local-first AI ops · Agent infrastructure' },
      ],
      roles: [
        {
          year: '2024 — hoy',
          role: 'OSS Agent Infrastructure',
          detail:
            'Construyo Deimos, Orbit y Lunar. Investigación aplicada a producción: harness engineering, MCP/ACP, local-first AI ops.',
        },
        {
          year: '2019 — hoy',
          role: 'Senior Product Engineer · Tech Lead',
          detail:
            'Arquitectura, liderazgo, mentoría. IA como herramienta del equipo, no como gimmick.',
        },
        {
          year: '2017 — 2019',
          role: 'Senior Engineer',
          detail: 'Aplicaciones complejas en banca y sostenibilidad.',
        },
        {
          year: '2008 — 2017',
          role: 'Software Engineer · Full-stack',
          detail: 'Desde e-commerce hasta universidades y ONGs.',
        },
      ],
    },
    skills: {
      groups: [
        {
          title: 'Lenguajes',
          items: ['TypeScript', 'JavaScript', 'Rust (learning)', 'Python', 'HTML / CSS'],
        },
        {
          title: 'Frameworks',
          items: ['React', 'Next.js', 'Lit', 'Angular', 'Vue'],
        },
        {
          title: 'Arquitectura',
          items: ['Microfrontends', 'Web Components', 'Design Systems', 'Monorepos', 'Testing'],
        },
        {
          title: 'Agent infrastructure',
          items: ['MCP', 'ACP', 'AGENTS.md', 'Harness engineering', 'Local-first AI ops'],
        },
      ],
    },
    projects: [
      {
        code: '01',
        name: 'Deimos',
        tag: 'Agent persistente · OSS',
        summary:
          'Mi agente personal con memoria persistente, identidad propia y presencia continua. Vive en un servidor 24/7, accesible desde Discord, Zed y CLI. Construido sobre OpenClaw + ACP + Brain Postgres.',
        tech: ['TypeScript', 'Node', 'ACP', 'MCP', 'Postgres', 'OpenClaw'],
        role: 'Solo · OSS',
      },
      {
        code: '02',
        name: 'Orbit',
        tag: 'Harness builder · OSS',
        summary:
          'Builder de harnesses portables y agnósticos del runtime. Define skills, MCPs, AGENTS.md y memoria una sola vez; cualquier runtime (Claude Code, Cursor, Codex, Gemini CLI) los carga. Gobernanza en pirámide org → cliente → developer.',
        tech: ['TypeScript', 'AGENTS.md', 'SKILL.md', 'MCP', 'ACP'],
        role: 'Solo · OSS',
      },
      {
        code: '03',
        name: 'Lunar',
        tag: 'ACP TUI client · Rust',
        summary:
          'Cliente ACP terminal escrito en Rust. Fork ligero de Nori. Pensado para multidevice y para exponer tools locales del Mac (screenshot, clipboard, audio, osascript) al agente vía métodos `onmars/*`.',
        tech: ['Rust', 'ACP', 'sacp', 'Ratatui'],
        role: 'Solo · OSS',
      },
    ],
    talks: [
      {
        year: '2026',
        type: 'En preparación',
        title: 'Agent harness engineering desde cero',
        venue: 'TBD',
      },
      { year: '2022', type: 'Curso', title: 'Web Components desde 0', venue: 'Codemotion' },
      {
        year: '2021',
        type: 'Charla',
        title: 'WebComponents en producción',
        venue: 'Devcast Codemotion',
      },
      {
        year: '2019—2021',
        type: 'Profesora',
        title: 'Diversos cursos de desarrollo web',
        venue: 'Academia',
      },
      {
        year: '2019',
        type: 'Charla',
        title: 'Progressive Web Apps',
        venue: 'Salmojero Tech, Córdoba',
      },
    ],
    lab: {
      intro:
        'Aquí guardo lo que voy probando fuera del trabajo principal: experimentos chiquitos, ideas a medio cocer, posts en preparación. No son demos comerciales — son cosas que me dan curiosidad.',
      experiments: [
        {
          tag: 'WIP',
          title: 'Harness 101',
          desc: '4-5 posts cortos explicando qué es agent harness engineering para devs que vienen de Cursor o Claude Code sin conocer el espacio. Sin curso largo, sin academic — voz directa y diagramas honestos.',
          stack: 'Markdown · /lab/posts',
        },
        {
          tag: 'WIP',
          title: 'Agent plays Snake',
          desc: 'Un agente jugando Snake en el navegador con su razonamiento mostrándose en directo en una columna lateral. Educativo y accesible — el clásico "agente juega un juego" bien hecho.',
          stack: 'Canvas · ACP · streaming chunks',
        },
        {
          tag: 'WIP',
          title: 'Agents.md Linter',
          desc: 'CLI que valida tu `.agents/AGENTS.md` contra el estándar Linux Foundation. Apunta errores y sugiere skills y MCPs que faltan según el contexto del repo. Para que escribir un harness portable deje de ser arqueología.',
          stack: 'Rust · Tree-sitter · AGENTS.md spec',
        },
        {
          tag: 'WIP',
          title: 'Laboratorio físico para agentes',
          desc: 'Un agente que opera dentro de una simulación física simple: "mueve la pelota azul al área verde sin tocar la roja". Cruce entre mi obsesión por la física y la pregunta de qué tan bien razona un agente en el espacio.',
          stack: 'Babylon.js · ACP · Vision tools',
        },
        {
          tag: 'IDEA',
          title: 'Skill Browser',
          desc: 'Interfaz para navegar repos de Agent Skills (Anthropic). Filtros por categoría, preview del `SKILL.md`, copy-to-clipboard. Como un package registry, pero para skills modulares.',
          stack: 'Lit · TypeScript · Búsqueda en cliente',
        },
      ],
    },
    contact: {
      title: 'Hablemos',
      sub: '¿Algo que construir? ¿Una pregunta sobre agentes? ¿Ganas de comparar notas sobre product craft? Escríbeme.',
      email: 'me@marcelagotta.com',
      placeholders: {
        name: 'Tu nombre',
        email: 'Tu email',
        message: 'Cuéntame tu idea...',
      },
      send: 'Enviar mensaje',
      sent: '¡Mensaje recibido! Te contesto en breve.',
      ai: 'O habla con Deimos, mi agente personal',
      aiPh: 'Pregúntale a Deimos sobre mi trabajo, mis proyectos o lo que se te ocurra…',
      social: [
        { label: 'GitHub', url: 'https://github.com/marsgotta' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/marcelagotta' },
      ],
    },
  },
  en: {
    hero: {
      overline: 'Senior Product Engineer · Building agent harnesses',
      name: 'Marcela Gotta',
      headline: ['I build software', 'that thinks with you.'],
      sub: '16 years shipping software, with a focus on product craft and architecture. Since 2024 I also build open source agent harnesses — the infrastructure that turns AI agents from demos into real teammates.',
      cta1: 'See the lab',
      cta2: 'My projects',
      now: [
        {
          icon: '🔭',
          text: 'Building Orbit, an agent harness builder that travels across runtimes',
        },
        { icon: '🦀', text: 'Learning Rust alongside Lunar, my ACP TUI client' },
        {
          icon: '📚',
          text: 'Spending too much time reading about agent infrastructure, MCP, harness engineering',
        },
        { icon: '🗣️', text: 'Activating my English daily with a cross-cultural team' },
      ],
    },
    about: {
      title: "Hi, I'm Mars",
      paragraphs: [
        "I've spent 16 years building software. Started full-stack, fell in love with frontend, led teams for years shipping product and architecture, and since 2024 I've been obsessed with the infrastructure that will hold AI agents up when they stop being demos.",
        'I believe AI is the most powerful tool we’ve ever had — but only if humans stay on the side that drives it, not the one that suffers it. My open source work (Deimos, Orbit, Lunar) tries to build that part: runtime-agnostic harnesses, identity and memory for agents that serve the team, not the other way around.',
        'I live in Madrid with a small zoo. I like physics, videogames, writing, and turning weird ideas into working code.',
      ],
      facts: [
        { k: 'Location', v: 'Madrid, Spain' },
        { k: 'Languages', v: 'Spanish (native) · English (B2 active, daily practice)' },
        { k: 'Current role', v: 'Senior Product Engineer · OSS Agent Harness' },
        { k: 'Focus', v: 'Local-first AI ops · Agent infrastructure' },
      ],
      roles: [
        {
          year: '2024 — today',
          role: 'OSS Agent Infrastructure',
          detail:
            'Building Deimos, Orbit and Lunar. Research applied to production: harness engineering, MCP/ACP, local-first AI ops.',
        },
        {
          year: '2019 — today',
          role: 'Senior Product Engineer · Tech Lead',
          detail: 'Architecture, leadership, mentoring. AI as a team tool, not as a gimmick.',
        },
        {
          year: '2017 — 2019',
          role: 'Senior Engineer',
          detail: 'Complex applications in banking and sustainability.',
        },
        {
          year: '2008 — 2017',
          role: 'Software Engineer · Full-stack',
          detail: 'From e-commerce to universities and NGOs.',
        },
      ],
    },
    skills: {
      groups: [
        {
          title: 'Languages',
          items: ['TypeScript', 'JavaScript', 'Rust (learning)', 'Python', 'HTML / CSS'],
        },
        {
          title: 'Frameworks',
          items: ['React', 'Next.js', 'Lit', 'Angular', 'Vue'],
        },
        {
          title: 'Architecture',
          items: ['Microfrontends', 'Web Components', 'Design Systems', 'Monorepos', 'Testing'],
        },
        {
          title: 'Agent infrastructure',
          items: ['MCP', 'ACP', 'AGENTS.md', 'Harness engineering', 'Local-first AI ops'],
        },
      ],
    },
    projects: [
      {
        code: '01',
        name: 'Deimos',
        tag: 'Persistent agent · OSS',
        summary:
          'My personal agent with persistent memory, identity and continuous presence. Lives on a server 24/7, accessible from Discord, Zed and CLI. Built on top of OpenClaw + ACP + Brain Postgres.',
        tech: ['TypeScript', 'Node', 'ACP', 'MCP', 'Postgres', 'OpenClaw'],
        role: 'Solo · OSS',
      },
      {
        code: '02',
        name: 'Orbit',
        tag: 'Harness builder · OSS',
        summary:
          'Builder for portable, runtime-agnostic harnesses. Define skills, MCPs, AGENTS.md and memory once; any runtime (Claude Code, Cursor, Codex, Gemini CLI) loads them. Governance pyramid org → client → developer.',
        tech: ['TypeScript', 'AGENTS.md', 'SKILL.md', 'MCP', 'ACP'],
        role: 'Solo · OSS',
      },
      {
        code: '03',
        name: 'Lunar',
        tag: 'ACP TUI client · Rust',
        summary:
          'ACP terminal client written in Rust. Lightweight fork of Nori. Designed for multidevice and for exposing local Mac tools (screenshot, clipboard, audio, osascript) to the agent via `onmars/*` methods.',
        tech: ['Rust', 'ACP', 'sacp', 'Ratatui'],
        role: 'Solo · OSS',
      },
    ],
    talks: [
      {
        year: '2026',
        type: 'In the oven',
        title: 'Agent harness engineering from scratch',
        venue: 'TBD',
      },
      { year: '2022', type: 'Course', title: 'Web Components from scratch', venue: 'Codemotion' },
      {
        year: '2021',
        type: 'Talk',
        title: 'WebComponents in production',
        venue: 'Devcast Codemotion',
      },
      {
        year: '2019—2021',
        type: 'Teacher',
        title: 'Various web development courses',
        venue: 'Academy',
      },
      {
        year: '2019',
        type: 'Talk',
        title: 'Progressive Web Apps',
        venue: 'Salmojero Tech, Córdoba',
      },
    ],
    lab: {
      intro:
        'This is where I keep what I tinker with outside my main work: tiny experiments, half-baked ideas, posts in the oven. Not commercial demos — just things that spark my curiosity.',
      experiments: [
        {
          tag: 'WIP',
          title: 'Harness 101',
          desc: '4-5 short posts explaining what agent harness engineering is, for devs coming from Cursor or Claude Code without knowing the space. No long course, no academic tone — just direct voice and honest diagrams.',
          stack: 'Markdown · /lab/posts',
        },
        {
          tag: 'WIP',
          title: 'Agent plays Snake',
          desc: 'An agent playing Snake in the browser with its reasoning streaming live in a side column. Educational and accessible — the classic "agent plays game" done well.',
          stack: 'Canvas · ACP · streaming chunks',
        },
        {
          tag: 'WIP',
          title: 'Agents.md Linter',
          desc: 'CLI that validates your `.agents/AGENTS.md` against the Linux Foundation standard. Spots errors and suggests missing skills and MCPs based on repo context. So that writing a portable harness stops being archaeology.',
          stack: 'Rust · Tree-sitter · AGENTS.md spec',
        },
        {
          tag: 'WIP',
          title: 'Physics playground for agents',
          desc: 'An agent operating inside a simple physics sim: "move the blue ball into the green zone without touching the red one." A crossover between my obsession with physics and the question of how well an agent reasons in space.',
          stack: 'Babylon.js · ACP · Vision tools',
        },
        {
          tag: 'IDEA',
          title: 'Skill Browser',
          desc: 'UI to browse Agent Skills repos (Anthropic). Filter by category, preview the `SKILL.md`, copy-to-clipboard. Like a package registry, but for modular skills.',
          stack: 'Lit · TypeScript · Client-side search',
        },
      ],
    },
    contact: {
      title: "Let's talk",
      sub: 'Something to build? A question about agents? Want to compare notes on product craft? Drop me a line.',
      email: 'me@marcelagotta.com',
      placeholders: {
        name: 'Your name',
        email: 'Your email',
        message: 'Tell me your idea...',
      },
      send: 'Send message',
      sent: "Got it! I'll get back to you soon.",
      ai: 'Or talk to Deimos, my personal agent',
      aiPh: 'Ask Deimos about my work, my projects, or whatever crosses your mind…',
      social: [
        { label: 'GitHub', url: 'https://github.com/marsgotta' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/marcelagotta' },
      ],
    },
  },
};
