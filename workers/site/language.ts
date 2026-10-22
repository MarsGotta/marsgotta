import type { Lang } from '../../src/i18n';
import { findPage, localizedPath, type Page } from '../../src/i18n/routes';
import { negotiateLanguage } from '../../src/lib/language';
import type { Env } from './env';

const ONE_YEAR_S = 60 * 60 * 24 * 365;
// Crawlers and link previews get the URL they ask for: each language is its own page, listed with
// hreflang, and search engines advise against redirecting them by language.
const CRAWLER = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse/i;

/**
 * Serves a page in the visitor's language. Arriving from outside the site, a visitor whose earlier
 * choice or browser asks for the other language goes to the same page in it. Inside the site nothing
 * redirects: following the ES/EN switch is a choice, remembered in a cookie for the next visit.
 */
export async function servePage(request: Request, env: Env, page: Page): Promise<Response> {
  const url = new URL(request.url);
  const from = siteReferer(request, url.origin);

  if (!from) {
    const wanted = wantedLanguage(request);
    if (wanted && wanted !== page.lang) {
      const location = new URL(localizedPath(page.route, wanted) + url.search, url);
      return new Response(null, {
        status: 302,
        headers: {
          Location: location.href,
          Vary: 'Accept-Language, Cookie',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  const asset = await env.ASSETS.fetch(request);
  // A copy, because the headers of a fetched response are immutable.
  const response = new Response(asset.body, asset);
  response.headers.append('Vary', 'Accept-Language, Cookie');
  const previous = from && findPage(from.pathname);
  if (previous && previous.lang !== page.lang) {
    response.headers.append(
      'Set-Cookie',
      `lang=${page.lang}; Path=/; Max-Age=${ONE_YEAR_S}; SameSite=Lax; Secure`,
    );
  }
  return response;
}

/** The page the visitor came from, when it was on this site. */
function siteReferer(request: Request, origin: string): URL | null {
  try {
    const referer = new URL(request.headers.get('Referer') ?? '');
    return referer.origin === origin ? referer : null;
  } catch {
    return null;
  }
}

function wantedLanguage(request: Request): Lang | null {
  // Browsers mark a page they open with these headers; crawlers and agents' fetchers, listed in
  // CRAWLER or not, do not send them.
  const opensPage =
    request.headers.get('Sec-Fetch-Mode') === 'navigate' &&
    request.headers.get('Sec-Fetch-Dest') === 'document';
  if (!opensPage || CRAWLER.test(request.headers.get('User-Agent') ?? '')) return null;
  const chosen = /(?:^|;\s*)lang=(es|en)(?:;|$)/.exec(request.headers.get('Cookie') ?? '');
  return chosen ? (chosen[1] as Lang) : negotiateLanguage(request.headers.get('Accept-Language'));
}
