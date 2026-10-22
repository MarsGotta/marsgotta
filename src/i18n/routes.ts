import type { Lang, Messages } from './index';

export const routeKeys = ['home', 'about', 'projects', 'talks', 'contact'] as const;
export type RouteKey = (typeof routeKeys)[number];

const paths: Record<RouteKey, Record<Lang, string>> = {
  home: { es: '/', en: '/en' },
  about: { es: '/sobre-mi', en: '/en/about' },
  projects: { es: '/proyectos', en: '/en/projects' },
  talks: { es: '/charlas', en: '/en/talks' },
  contact: { es: '/contacto', en: '/en/contact' },
};

/** The copy keeps the prototype's Spanish keys for the navigation labels. */
export const navLabelKeys: Record<RouteKey, keyof Messages['nav']> = {
  home: 'inicio',
  about: 'sobre',
  projects: 'proyectos',
  talks: 'charlas',
  contact: 'contacto',
};

export function localizedPath(route: RouteKey, lang: Lang, hash?: string): string {
  const path = paths[route][lang];
  return hash ? `${path}#${hash}` : path;
}

export interface Page {
  route: RouteKey;
  lang: Lang;
}

/** The page a path belongs to, or null for any other path (assets, the 404, the API). */
export function findPage(pathname: string): Page | null {
  for (const route of routeKeys) {
    for (const [lang, path] of Object.entries(paths[route]) as [Lang, string][]) {
      if (path === pathname) return { route, lang };
    }
  }
  return null;
}
