import { getMessages, type Lang } from './index';
import type { RouteKey } from './routes';

export interface PageMeta {
  title: string;
  description: string;
}

const NAME = 'Marcela Gotta';

/** The headline as plain text: "Construyo software que piensa contigo." */
export function headline(lang: Lang): string {
  const { l1, l2, l3 } = getMessages(lang).hero;
  return [...l1, ...l2, ...l3].join(' ');
}

/** Search results cut descriptions at about 160 characters. */
const DESCRIPTION_MAX = 160;

/**
 * As many whole sentences as fit in a search result. A sentence that does not fit is kept up to its
 * colon, where the rest only expands on it.
 */
function sentencesThatFit(text: string): string {
  if (text.length <= DESCRIPTION_MAX) return text;
  let description = '';
  for (const sentence of text.split(/(?<=\.)\s+/)) {
    const next = description ? `${description} ${sentence}` : sentence;
    if (next.length <= DESCRIPTION_MAX) {
      description = next;
      continue;
    }
    const lead = sentence.split(':')[0];
    if (lead && lead !== sentence) {
      const shortened = `${description} ${lead}.`.trim();
      if (shortened.length <= DESCRIPTION_MAX) description = shortened;
    }
    break;
  }
  return description || text;
}

/** "Label: a · b." with as many items as fit in a search result, and always the first one. */
function listThatFits(label: string, items: string[]): string {
  const fitting = items.filter(
    (_, index) => `${label}: ${items.slice(0, index + 1).join(' · ')}.`.length <= DESCRIPTION_MAX,
  );
  return `${label}: ${(fitting.length > 0 ? fitting : items.slice(0, 1)).join(' · ')}.`;
}

/** Titles and descriptions reuse the approved copy, so no SEO text is written by hand. */
export function pageMeta(route: RouteKey, lang: Lang): PageMeta {
  const t = getMessages(lang);
  switch (route) {
    case 'home': {
      const firstSentence = t.hero.sub.split('. ')[0] ?? t.hero.sub;
      return {
        title: `${NAME} · Software Engineer`,
        description: `${headline(lang)} ${firstSentence}.`,
      };
    }
    case 'about':
      return { title: `${t.nav.sobre} · ${NAME}`, description: sentencesThatFit(t.about.p1) };
    case 'projects':
      return { title: `${t.nav.proyectos} · ${NAME}`, description: t.pj.lead };
    case 'talks':
      return {
        title: `${t.talks.kicker} · ${NAME}`,
        description: listThatFits(
          t.talks.kicker,
          t.talks.items.map((talk) => talk.title),
        ),
      };
    case 'contact':
      return { title: `${t.nav.contacto} · ${NAME}`, description: t.contact.lead };
  }
}
