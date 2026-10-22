import { email, socialChannels } from '../content/profile';
import { projectKeys } from '../content/projects';
import { getMessages } from '../i18n';
import { pageMeta } from '../i18n/meta';
import { localizedPath, type RouteKey } from '../i18n/routes';

/**
 * /llms.txt (llmstxt.org): the site as a short Markdown index for AI agents. It is in English and
 * built from the approved copy, so it never drifts from the pages.
 */
export function llmsTxt(site: URL): string {
  const t = getMessages('en');
  const url = (route: RouteKey, hash?: string) =>
    new URL(localizedPath(route, 'en', hash), site).href;
  const labels: Partial<Record<RouteKey, string>> = {
    about: t.nav.sobre,
    projects: t.nav.proyectos,
    talks: t.talks.kicker,
    contact: t.nav.contacto,
  };

  const projects = projectKeys.map((key) => {
    const links: { href: string }[] = t.pj.items[key].links;
    const { name, line } = t.sys.items[key];
    const repository = links.find((link) => link.href.startsWith('https://github.com/'))?.href;
    const home = links.find((link) => link.href !== repository)?.href;
    const code = repository ? ` Code: ${repository}` : '';
    return `- [${name}](${home ?? repository ?? url('projects', key)}): ${line} ${t.pj.items[key].desc}${code}`;
  });

  return `${[
    '# Marcela Gotta',
    `> ${t.hero.over}. ${t.about.p1}`,
    t.about.p2,
    t.about.p3,
    t.about.facts.map((fact) => `- ${fact.k}: ${fact.v}`).join('\n'),
    '## Pages',
    Object.entries(labels)
      .map(([route, label]) => {
        const key = route as RouteKey;
        return `- [${label}](${url(key)}): ${pageMeta(key, 'en').description}`;
      })
      .join('\n'),
    `## ${t.nav.proyectos}`,
    projects.join('\n'),
    `## ${t.talks.kicker}`,
    t.talks.items
      .map((talk) => `- ${talk.year} · ${talk.type}: ${talk.title}, ${talk.where}`)
      .join('\n'),
    `## ${t.nav.contacto}`,
    [
      `- Email: ${email}`,
      ...socialChannels.map((channel) => `- ${channel.name}: ${channel.href}`),
    ].join('\n'),
    '## Optional',
    `- [Español](${new URL(localizedPath('home', 'es'), site).href})`,
  ].join('\n\n')}\n`;
}
