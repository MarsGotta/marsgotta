import { email, socialChannels } from '../content/profile';
import { languages, locales, type Lang } from '../i18n';
import { localizedPath, type RouteKey } from '../i18n/routes';

export interface Alternate {
  hreflang: string;
  href: string;
}

/** Absolute URL of a page; the canonical host is always marcelagotta.com. */
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

/** Open Graph locale, such as es_ES. */
export function ogLocale(lang: Lang): string {
  return locales[lang].replace('-', '_');
}

/** schema.org Person for the site's author, with her public profiles. */
export function personSchema(site: URL, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': new URL('/#person', site).href,
    name: 'Marcela Gotta',
    alternateName: 'Mars',
    url: site.href,
    jobTitle: 'Head Frontend Developer',
    worksFor: { '@type': 'Organization', name: 'Sngular' },
    homeLocation: { '@type': 'Place', name: 'Madrid, España' },
    email: `mailto:${email}`,
    knowsLanguage: [...languages],
    description,
    sameAs: socialChannels.map((channel) => channel.href),
  };
}
