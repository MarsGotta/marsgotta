/** Pages of the build with the test samples (signals/tests/fixtures/content). */
export const article = {
  es: '/dale-memoria-a-tus-agentes-con-sqlite',
  en: '/en/give-your-agents-memory-with-sqlite',
} as const;

export const indexed = [
  '/',
  '/en',
  '/temas/tutoriales',
  '/en/topics/practice',
  '/archivo',
  '/en/archive',
  article.es,
  article.en,
];

export const unindexed = [
  '/suscripcion/confirmada',
  '/en/subscription/confirmed',
  '/no-existe',
  '/en/no-such-page',
];
