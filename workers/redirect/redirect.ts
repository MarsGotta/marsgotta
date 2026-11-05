import { redirectTarget } from '../../src/lib/redirects';

/** The one host that serves the site; every other domain points here. */
export const CANONICAL_ORIGIN = 'https://marsgotta.com';

/**
 * Same path and query string on the canonical host. An address of the previous site goes straight
 * to its page, so it takes one hop instead of two.
 */
export function canonicalLocation(requestUrl: string): string {
  const { pathname, search } = new URL(requestUrl);
  return `${CANONICAL_ORIGIN}${redirectTarget(pathname) ?? pathname}${search}`;
}
