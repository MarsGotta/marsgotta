import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { signalSchema } from './lib/signal-schema';

/**
 * Signals are imported from Mars's Obsidian vault (npm run signals:import). Test builds point
 * SIGNALS_CONTENT at sample signals that never reach production.
 */
const base = process.env.SIGNALS_CONTENT ?? './src/content/signals';

export const collections = {
  signals: defineCollection({
    loader: glob({ pattern: '*.md', base }),
    schema: signalSchema,
  }),
};
