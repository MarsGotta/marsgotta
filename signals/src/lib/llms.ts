import { getMessages, languages } from '../i18n';
import { byRecency } from './featured';
import { homePath, rssPath, signalPath } from './routes';
import { BLOG_NAME } from './seo';
import type { SignalData } from './signal-schema';

type Listed = Pick<
  SignalData,
  'number' | 'lang' | 'slug' | 'title' | 'deck' | 'publishedAt' | 'startHere' | 'topic'
>;

const headings = { es: 'Señales en español', en: 'Signals in English' } as const;

/**
 * /llms.txt (llmstxt.org): the blog as a short Markdown index for AI agents, built from the
 * approved copy and the published signals, so it never drifts from the pages.
 */
export function llmsTxt(site: URL, signals: readonly Listed[]): string {
  const t = getMessages('en');
  const url = (path: string) => new URL(path, site).href;
  const lists = languages.map((lang) => {
    const inLang = byRecency(signals.filter((signal) => signal.lang === lang));
    const items = inLang.map(
      (signal) => `- [${signal.title}](${url(signalPath(signal.slug, lang))}): ${signal.deck}`,
    );
    return [`## ${headings[lang]}`, items.join('\n') || `- ${getMessages(lang).empty.h}`].join(
      '\n\n',
    );
  });
  return `${[
    `# ${BLOG_NAME}`,
    `> ${t.home.sub}`,
    t.side.aboutP,
    '## Feeds',
    languages
      .map((lang) => `- [RSS: ${getMessages(lang).meta.rss}](${url(rssPath(lang))})`)
      .join('\n'),
    ...lists,
    '## Optional',
    [
      `- [Español](${url(homePath('es'))})`,
      `- [Marcela Gotta, portfolio](https://marcelagotta.com/llms.txt)`,
    ].join('\n'),
  ].join('\n\n')}\n`;
}
