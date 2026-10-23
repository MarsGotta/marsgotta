import { z } from 'astro/zod';

export const topics = ['ia', 'practica', 'tutorial'] as const;
export const coverKinds = ['strata', 'dunes', 'orbits', 'signal'] as const;

/**
 * A signal's frontmatter (design/signals/LEEME.md §3), one file per language. The content collection
 * and the Obsidian import share it, so a note that imports cleanly always builds.
 */
export const signalSchema = z.object({
  /** «Señal 007»: the same number in both languages pairs the translations. */
  number: z.number().int().positive(),
  lang: z.enum(['es', 'en']),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase words joined by hyphens'),
  title: z.string().min(1),
  /** The standfirst: the excerpt on the home and the paragraph under the title. */
  deck: z.string().min(1),
  topic: z.enum(topics),
  cover: z.enum(coverKinds),
  coverCaption: z.string().optional(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  /** Position in «Empieza por aquí». */
  startHere: z.number().int().min(1).max(3).optional(),
  /** Drafts show in development only: never in the build, the RSS or the sitemap. */
  draft: z.boolean().default(false),
});

export type SignalData = z.infer<typeof signalSchema>;

export function isPublished(signal: Pick<SignalData, 'draft'>, development: boolean): boolean {
  return development || !signal.draft;
}
