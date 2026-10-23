import type { SatteriAstroData, SatteriProcessorOptions } from '@astrojs/markdown-satteri';
import type { AstroUserConfig } from 'astro';
import type { Lang } from '../../i18n';

type PluginEntry = NonNullable<SatteriProcessorOptions['hastPlugins']>[number];

/** A plugin for the HTML tree of Sätteri, Astro's Markdown processor (see astro.config). */
export type HastPlugin = Exclude<
  PluginEntry,
  ((...args: never[]) => unknown) | readonly unknown[] | null | undefined | false
>;

type ShikiConfig = NonNullable<NonNullable<AstroUserConfig['markdown']>['shikiConfig']>;

/** A Shiki transformer, the way Astro's shikiConfig takes it. */
export type ShikiTransformer = NonNullable<ShikiConfig['transformers']>[number];

/** A Shiki theme, the way Astro's shikiConfig takes it. */
export type ShikiTheme = NonNullable<ShikiConfig['theme']>;

/** The language of the signal being rendered, from its frontmatter. */
export function signalLang(data: Record<string, unknown>): Lang {
  const astro = data.astro as SatteriAstroData | undefined;
  return astro?.frontmatter.lang === 'en' ? 'en' : 'es';
}
