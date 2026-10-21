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

/** Titles and descriptions reuse the approved copy, so no SEO text is written by hand. */
export function pageMeta(route: RouteKey, lang: Lang): PageMeta {
  const t = getMessages(lang);
  switch (route) {
    case 'home': {
      const firstSentence = t.hero.sub.split('. ')[0] ?? t.hero.sub;
      return {
        title: `${NAME} · Senior Software Engineer`,
        description: `${headline(lang)} ${firstSentence}.`,
      };
    }
    case 'about':
      return { title: `${t.nav.sobre} · ${NAME}`, description: t.about.p1 };
    case 'projects':
      return { title: `${t.nav.proyectos} · ${NAME}`, description: t.pj.lead };
    case 'talks':
      return {
        title: `${t.talks.kicker} · ${NAME}`,
        description: `${t.talks.kicker}: ${t.talks.items.map((talk) => talk.title).join(' · ')}.`,
      };
    case 'contact':
      return { title: `${t.nav.contacto} · ${NAME}`, description: t.contact.lead };
  }
}
