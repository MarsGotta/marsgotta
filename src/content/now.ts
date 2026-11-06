import type { ProjectKey } from './projects';
import type { Lang } from '../i18n';

/*
 * Where each project stands. It shows up as the «Ahora» / "Now" line in the project tabs on the home page.
 * To update it, edit these three lines and set `updatedAt` to today's date.
 */

export const now: { updatedAt: string; items: Record<ProjectKey, Record<Lang, string>> } = {
  updatedAt: '2026-11-06',
  items: {
    kimen: {
      es: 'Superficies vivas: la interfaz cambia mientras el agente trabaja',
      en: 'Live surfaces: the interface changes while the agent works',
    },
    jezero: {
      es: 'Ya se instala: la versión 0.1.0 está en PyPI',
      en: 'Ready to install: version 0.1.0 is on PyPI',
    },
    orbit: {
      es: 'La 0.15.0 convierte tus reuniones en notas',
      en: 'Version 0.15.0 turns your meetings into notes',
    },
  },
};
