import { email, socialChannels } from '../content/profile';
import { projectKeys } from '../content/projects';
import { techStars } from '../content/tech';
import { getMessages, languages, locales, type Lang } from '../i18n';
import { localizedPath, routeKeys, type RouteKey } from '../i18n/routes';

export interface Alternate {
  hreflang: string;
  href: string;
}

/** Absolute URL of a page; the canonical host is always marsgotta.com. */
export function pageUrl(site: URL, route: RouteKey, lang: Lang): string {
  return new URL(localizedPath(route, lang), site).href;
}

/** hreflang links for a page: one per language, plus x-default on Spanish, the default locale. */
export function alternates(site: URL, route: RouteKey): Alternate[] {
  return [
    ...languages.map((lang) => ({ hreflang: lang, href: pageUrl(site, route, lang) })),
    { hreflang: 'x-default', href: pageUrl(site, route, 'es') },
  ];
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

/** The sitemap at /sitemap.xml: every page in both languages, each linked to its translations. */
export function sitemapXml(site: URL): string {
  const urls = routeKeys.flatMap((route) =>
    languages.map((lang) => {
      const links = alternates(site, route).map(
        ({ hreflang, href }) =>
          `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
      );
      return `<url><loc>${escapeXml(pageUrl(site, route, lang))}</loc>${links.join('')}</url>`;
    }),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/** Open Graph locale, such as es_ES. */
export function ogLocale(lang: Lang): string {
  return locales[lang].replace('-', '_');
}

const NAME = 'Marcela Gotta';
const SPDX_LICENSES = new Set(['Apache-2.0', 'MIT']);

export interface PageInfo {
  /** Null for pages outside the site map, such as the 404. */
  route: RouteKey | null;
  lang: Lang;
  title: string;
  description: string;
}

/**
 * schema.org graph for a page: the site, its author and the page itself, plus the projects on the
 * projects page. Every value comes from the approved copy and the content files.
 */
export function structuredData(site: URL, page: PageInfo) {
  const id = (name: string) => new URL(`/#${name}`, site).href;
  const t = getMessages(page.lang);
  const graph: object[] = [
    {
      '@type': 'WebSite',
      '@id': id('website'),
      url: site.href,
      name: NAME,
      inLanguage: [...languages],
      publisher: { '@id': id('person') },
    },
    {
      '@type': 'Person',
      '@id': id('person'),
      name: NAME,
      alternateName: 'Mars',
      url: site.href,
      description: t.about.p1,
      // Her profession; Head Frontend Developer is her position at Sngular, not her title.
      jobTitle: 'Software Engineer',
      worksFor: {
        '@type': 'EmployeeRole',
        roleName: 'Head Frontend Developer',
        startDate: '2019',
        worksFor: { '@type': 'Organization', name: 'Sngular' },
      },
      homeLocation: {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressLocality: 'Madrid', addressCountry: 'ES' },
      },
      // The constellation on the About page, without what she is still learning.
      knowsAbout: techStars.flatMap((star) =>
        !star.learning && typeof star.label === 'string' ? [star.label] : [],
      ),
      knowsLanguage: [...languages],
      email: `mailto:${email}`,
      sameAs: socialChannels.map((channel) => channel.href),
    },
  ];
  if (page.route) {
    const url = pageUrl(site, page.route, page.lang);
    const isProfile = page.route === 'about';
    graph.push({
      '@type': isProfile ? 'ProfilePage' : 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: page.lang,
      isPartOf: { '@id': id('website') },
      [isProfile ? 'mainEntity' : 'about']: { '@id': id('person') },
    });
  }
  if (page.route === 'projects') graph.push(...projectsData(site, page.lang, id('person')));
  return { '@context': 'https://schema.org', '@graph': graph };
}

function projectsData(site: URL, lang: Lang, author: string): object[] {
  const t = getMessages(lang);
  return projectKeys.map((key) => {
    const links: { href: string }[] = t.pj.items[key].links;
    const { name, chips } = t.sys.items[key];
    const repository = links.find((link) => link.href.startsWith('https://github.com/'))?.href;
    const website = links.find((link) => link.href !== repository)?.href;
    // Only a project with a public repository is shown with its licence: Orbit is not called open
    // source until its repository is public.
    const license = repository && chips.find((chip) => SPDX_LICENSES.has(chip));
    return {
      '@type': repository ? 'SoftwareSourceCode' : 'SoftwareApplication',
      '@id': new URL(`/#${key}`, site).href,
      name,
      description: t.pj.items[key].desc,
      url: website ?? new URL(localizedPath('projects', lang, key), site).href,
      ...(repository && { codeRepository: repository }),
      ...(license && { license: `https://spdx.org/licenses/${license}` }),
      ...(chips.includes('macOS') && { operatingSystem: 'macOS' }),
      keywords: t.pj.items[key].stack,
      author: { '@id': author },
    };
  });
}
