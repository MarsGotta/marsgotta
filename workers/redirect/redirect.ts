/** The one host that serves the site; every other domain points here. */
export const CANONICAL_ORIGIN = 'https://marcelagotta.com';

/** Same path and query string on the canonical host. */
export function canonicalLocation(requestUrl: string): string {
  const { pathname, search } = new URL(requestUrl);
  return `${CANONICAL_ORIGIN}${pathname}${search}`;
}
