import type { Lang } from '../i18n';

/*
 * «Ahora mismo» / "Right now".
 * To update the band on the home page, edit these four lines and set `updatedAt` to today's date.
 */

export type NowIcon = 'planet' | 'satellite' | 'puzzle' | 'cap';
/** Colour of the icon: a project's colour, or muted for everything else. */
export type NowTone = 'kimen' | 'jezero' | 'orbit' | 'muted';

export interface NowItem {
  icon: NowIcon;
  tone: NowTone;
  text: Record<Lang, string>;
}

export const now: { updatedAt: string; items: NowItem[] } = {
  updatedAt: '2026-10-21',
  items: [
    {
      icon: 'planet',
      tone: 'jezero',
      text: {
        es: 'Jezero ya es público: la memoria compartida de mis agentes',
        en: 'Jezero is public: the shared memory of my agents',
      },
    },
    {
      icon: 'satellite',
      tone: 'orbit',
      text: {
        es: 'Puliendo la beta de Orbit para abrirla',
        en: 'Polishing the Orbit beta before opening it up',
      },
    },
    {
      icon: 'puzzle',
      tone: 'kimen',
      text: {
        es: 'Llevando Kimen hacia su versión 1.0',
        en: 'Taking Kimen towards 1.0',
      },
    },
    {
      icon: 'cap',
      tone: 'muted',
      text: {
        es: 'Head Frontend Developer en Sngular',
        en: 'Head Frontend Developer at Sngular',
      },
    },
  ],
};
