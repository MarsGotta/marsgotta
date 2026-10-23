import type { ProjectKey } from './projects';
import type { Lang } from '../i18n';

/*
 * Where each project stands. It shows up as the «Ahora» / "Now" line in the project tabs on the home page.
 * To update it, edit these three lines and set `updatedAt` to today's date.
 */

export const now: { updatedAt: string; items: Record<ProjectKey, Record<Lang, string>> } = {
  updatedAt: '2026-10-21',
  items: {
    kimen: {
      es: 'Llevando Kimen hacia su versión 1.0',
      en: 'Taking Kimen towards 1.0',
    },
    jezero: {
      es: 'Ya es público: la memoria compartida de mis agentes',
      en: 'Now public: the shared memory of my agents',
    },
    orbit: {
      es: 'Puliendo la beta para abrirla',
      en: 'Polishing the beta before opening it up',
    },
  },
};
