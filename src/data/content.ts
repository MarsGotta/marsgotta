/**
 * Site content — typed source of truth.
 * Replaces the legacy `window.MARS_DATA` from the static design.
 *
 * Filled progressively as we close each section (F3).
 */

import type { Locale } from '@/i18n/routing';

export type Stat = { v: string; l: string };
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

export type Content = {
  hero: HeroContent;
};

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
  },
};
