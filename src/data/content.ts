/**
 * Site content — typed source of truth.
 * Replaces the legacy `window.MARS_DATA` from the static design.
 *
 * Hero shape is locked (v3 — Senior Product Engineer · agent harnesses).
 * Other sections carry TODO F3 placeholders but expose the final TS shape.
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

export type ContactContent = {
  title: string;
  sub: string;
  email: string;
  placeholders: { name: string; email: string; message: string };
  send: string;
  sent: string;
  ai: string;
  aiPh: string;
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
    // TODO F3: rewrite about copy aligned with Senior Product Engineer / agent harnesses narrative.
    about: {
      title: 'Hola, soy Marcela',
      paragraphs: [
        'Senior Product Engineer con 16 años construyendo software. Vengo del frontend profundo y la arquitectura — hoy mi obsesión es la infraestructura de agentes: cómo se conectan a sistemas reales, cómo se aprueban sus acciones, cómo se vuelven productivos sin convertirse en demos.',
        'Construyo agent harnesses open source (Deimos, Orbit, Lunar) y los uso a diario. Lo que aprendo lo traigo a producto: arquitectura, product craft, integración con equipos humanos.',
        'Vivo en Madrid. Me gusta la física, los videojuegos, y convertir ideas raras en código que se despliega.',
      ],
      facts: [
        { k: 'Ubicación', v: 'Madrid, España' },
        { k: 'Idiomas', v: 'Español (nativo) · English (B2)' },
        { k: 'Rol actual', v: 'Senior Product Engineer' },
        { k: 'Enfoque', v: 'Agent harnesses · product craft' },
      ],
      roles: [
        {
          year: '2024 — hoy',
          role: 'Agent infra engineer (paralelo)',
          detail: 'Construyendo Deimos, Orbit y Lunar — agent harnesses open source.',
        },
        {
          year: '2019 — hoy',
          role: 'Software Tech Lead',
          detail:
            'Arquitectura, liderazgo de equipos, product craft. IA aplicada al stack del equipo.',
        },
        {
          year: '2015 — 2019',
          role: 'Senior Frontend Developer',
          detail: 'Proyectos a gran escala en banca, sostenibilidad, telco.',
        },
        {
          year: '2008 — 2015',
          role: 'Full Stack Developer',
          detail: 'Desde e-commerce hasta universidades y ONGs.',
        },
      ],
    },
    // TODO F3: skill groups deberían reflejar también agent-infra (MCP, ACP, harness eng).
    skills: {
      groups: [
        {
          title: 'Lenguajes',
          items: ['TypeScript', 'JavaScript', 'Rust (learning)', 'Python', 'HTML/CSS'],
        },
        {
          title: 'Frameworks',
          items: ['React', 'Next.js', 'Angular', 'Vue', 'Lit', 'LitElement', 'Stencil'],
        },
        {
          title: 'Arquitectura',
          items: ['Microfrontends', 'Web Components', 'Design Systems', 'Monorepos', 'Testing'],
        },
        {
          title: 'Agentes & IA',
          items: ['MCP', 'ACP', 'Harness engineering', 'Prompt engineering', 'LLM integration'],
        },
      ],
    },
    // TODO F3: portafolio web — NO incluir clientes Sngular. Sustituir por proyectos OSS (Deimos/Orbit/Lunar) + side projects.
    projects: [
      {
        code: '01',
        name: 'Deimos',
        tag: 'Agent harness · OSS',
        summary:
          'Mi agent harness personal. Memoria persistente, plugin layer sobre OpenClaw, integración Discord/Slack/Zed/Mac vía ACP. Lo uso 24/7.',
        tech: ['TypeScript', 'Node', 'ACP', 'MCP', 'OpenClaw'],
        role: 'Solo',
      },
      {
        code: '02',
        name: 'Orbit',
        tag: 'Harness builder · WIP',
        summary:
          'Harness builder pensado para que un agente viaje entre runtimes (CLI, server, embedded) manteniendo identidad y memoria.',
        tech: ['TypeScript', 'ACP', 'Plugin architecture'],
        role: 'Solo',
      },
      {
        code: '03',
        name: 'Lunar',
        tag: 'ACP TUI client · Rust',
        summary:
          'Cliente ACP en Rust, fork ligero de Nori. Foco en multidevice y experiencia local del usuario.',
        tech: ['Rust', 'ACP', 'TUI'],
        role: 'Solo',
      },
      // TODO F3: añadir 2-3 side projects / talks pet projects sin clientes Sngular.
    ],
    talks: [
      // TODO F3: actualizar lista de charlas (mantener Codemotion, añadir 2026 si aplica).
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
        'Experimentos en curso. Aquí investigo cómo la infraestructura de agentes se vuelve producto real — no demos, código que se despliega.',
      experiments: [
        // TODO F3: alinear con proyectos reales (Deimos/Orbit/Lunar) y experiment notes recientes.
        {
          tag: 'EN VIVO',
          title: 'Deimos brain — memoria curada',
          desc: 'Sistema de memoria persistente con hooks de autosave/recall. Convierte conversaciones en knowledge curado por entidad.',
          stack: 'TypeScript · Postgres · OpenClaw hooks',
        },
        {
          tag: 'WIP',
          title: 'Orbit — harness portable',
          desc: 'Builder que empaqueta un agente con su identidad y memoria para correr en cualquier runtime.',
          stack: 'TypeScript · ACP · Plugin layer',
        },
        {
          tag: 'WIP',
          title: 'Lunar — TUI cliente ACP',
          desc: 'Cliente ACP en Rust, multidevice. Mi excusa para aprender Rust con un proyecto que uso.',
          stack: 'Rust · ACP · TUI',
        },
        {
          tag: 'IDEA',
          title: 'Corpus — RAG multi-vault',
          desc: 'Biblioteca profesional curada con tolerancia 0 a alucinaciones. Citas obligatorias.',
          stack: 'Vector DB · LLM · TypeScript',
        },
      ],
    },
    contact: {
      title: 'Hablemos',
      sub: '¿Tienes un proyecto complicado? ¿Quieres explorar agentes con tu equipo? Escríbeme y charlamos.',
      email: 'me@marcelagotta.com',
      placeholders: {
        name: 'Tu nombre',
        email: 'Tu email',
        message: 'Cuéntame tu idea...',
      },
      send: 'Enviar mensaje',
      sent: '¡Mensaje recibido! Te contesto en breve.',
      ai: 'O pregunta a mi IA',
      aiPh: 'Pregúntale algo sobre mí o mi trabajo...',
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
      title: "Hi, I'm Marcela",
      paragraphs: [
        "Senior Product Engineer with 16 years shipping software. I come from deep frontend and architecture — these days I'm obsessed with agent infrastructure: how agents connect to real systems, how their actions get approved, how they become productive without devolving into demos.",
        'I build open source agent harnesses (Deimos, Orbit, Lunar) and use them daily. What I learn there flows back into product work: architecture, product craft, integration with human teams.',
        'I live in Madrid. I like physics, videogames, and turning weird ideas into code that ships.',
      ],
      facts: [
        { k: 'Location', v: 'Madrid, Spain' },
        { k: 'Languages', v: 'Spanish (native) · English (B2)' },
        { k: 'Current role', v: 'Senior Product Engineer' },
        { k: 'Focus', v: 'Agent harnesses · product craft' },
      ],
      roles: [
        {
          year: '2024 — today',
          role: 'Agent infra engineer (parallel)',
          detail: 'Building Deimos, Orbit and Lunar — open source agent harnesses.',
        },
        {
          year: '2019 — today',
          role: 'Software Tech Lead',
          detail: 'Architecture, team leadership, product craft. AI applied to the team stack.',
        },
        {
          year: '2015 — 2019',
          role: 'Senior Frontend Developer',
          detail: 'Large-scale projects in banking, sustainability, telco.',
        },
        {
          year: '2008 — 2015',
          role: 'Full Stack Developer',
          detail: 'From e-commerce to universities and NGOs.',
        },
      ],
    },
    skills: {
      groups: [
        {
          title: 'Languages',
          items: ['TypeScript', 'JavaScript', 'Rust (learning)', 'Python', 'HTML/CSS'],
        },
        {
          title: 'Frameworks',
          items: ['React', 'Next.js', 'Angular', 'Vue', 'Lit', 'LitElement', 'Stencil'],
        },
        {
          title: 'Architecture',
          items: ['Microfrontends', 'Web Components', 'Design Systems', 'Monorepos', 'Testing'],
        },
        {
          title: 'Agents & AI',
          items: ['MCP', 'ACP', 'Harness engineering', 'Prompt engineering', 'LLM integration'],
        },
      ],
    },
    projects: [
      {
        code: '01',
        name: 'Deimos',
        tag: 'Agent harness · OSS',
        summary:
          'My personal agent harness. Persistent memory, plugin layer on top of OpenClaw, Discord/Slack/Zed/Mac integration via ACP. I use it 24/7.',
        tech: ['TypeScript', 'Node', 'ACP', 'MCP', 'OpenClaw'],
        role: 'Solo',
      },
      {
        code: '02',
        name: 'Orbit',
        tag: 'Harness builder · WIP',
        summary:
          'Harness builder designed so an agent can travel across runtimes (CLI, server, embedded) keeping its identity and memory intact.',
        tech: ['TypeScript', 'ACP', 'Plugin architecture'],
        role: 'Solo',
      },
      {
        code: '03',
        name: 'Lunar',
        tag: 'ACP TUI client · Rust',
        summary: 'ACP client in Rust, lightweight fork of Nori. Focus on multidevice and local UX.',
        tech: ['Rust', 'ACP', 'TUI'],
        role: 'Solo',
      },
    ],
    talks: [
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
        'Experiments in progress. This is where I research how agent infrastructure becomes real product — not demos, code that ships.',
      experiments: [
        {
          tag: 'LIVE',
          title: 'Deimos brain — curated memory',
          desc: 'Persistent memory system with autosave/recall hooks. Turns conversations into knowledge curated by entity.',
          stack: 'TypeScript · Postgres · OpenClaw hooks',
        },
        {
          tag: 'WIP',
          title: 'Orbit — portable harness',
          desc: 'Builder that packages an agent with its identity and memory so it can run in any runtime.',
          stack: 'TypeScript · ACP · Plugin layer',
        },
        {
          tag: 'WIP',
          title: 'Lunar — ACP TUI client',
          desc: 'ACP client in Rust, multidevice. My excuse to learn Rust with a project I actually use.',
          stack: 'Rust · ACP · TUI',
        },
        {
          tag: 'IDEA',
          title: 'Corpus — multi-vault RAG',
          desc: 'Curated professional library with zero tolerance for hallucinations. Citations mandatory.',
          stack: 'Vector DB · LLM · TypeScript',
        },
      ],
    },
    contact: {
      title: "Let's talk",
      sub: "Got a tricky project? Want to explore agents with your team? Write to me and let's chat.",
      email: 'me@marcelagotta.com',
      placeholders: {
        name: 'Your name',
        email: 'Your email',
        message: 'Tell me your idea...',
      },
      send: 'Send message',
      sent: "Got it! I'll get back to you soon.",
      ai: 'Or ask my AI',
      aiPh: 'Ask anything about me or my work...',
    },
  },
};
