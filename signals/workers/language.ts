import { weakenEtag } from '../../src/lib/http';
import { languageCookie, siteReferer, wantedLanguage } from '../../workers/site/language';
import { pathLang } from '../src/lib/routes';
import type { Env } from './env';

/** Every page with its translation, written by the build (src/pages/translations.json.ts). */
const TRANSLATIONS = '/translations.json';

/**
 * Serves a page in the visitor's language, as the portfolio does (workers/site/language.ts).
 * Arriving from outside the blog, a visitor whose earlier choice or browser asks for the other
 * language goes to the same page in it, if it exists. Inside the blog nothing redirects: following
 * the ES/EN switch is a choice, remembered in a cookie for the next visit.
 */
export async function servePage(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const lang = pathLang(url.pathname);
  const from = siteReferer(request, url.origin);

  const wanted = from ? null : wantedLanguage(request);
  if (wanted && wanted !== lang) {
    const translation = (await translations(env, url))[url.pathname];
    if (translation) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: new URL(translation + url.search, url).href,
          Vary: 'Accept-Language, Cookie',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  const asset = await env.ASSETS.fetch(request);
  if (!asset.headers.get('Content-Type')?.startsWith('text/html')) return asset;
  // A copy, because the headers of a fetched response are immutable.
  const response = new Response(asset.body, asset);
  response.headers.append('Vary', 'Accept-Language, Cookie');
  weakenEtag(response.headers);
  if (from && pathLang(from.pathname) !== lang) {
    response.headers.append('Set-Cookie', languageCookie(lang));
    // A response that sets a cookie is this visitor's alone: no shared cache keeps it.
    response.headers.set('Cache-Control', 'private, no-cache');
  }
  return response;
}

async function translations(env: Env, url: URL): Promise<Record<string, string>> {
  try {
    const response = await env.ASSETS.fetch(new URL(TRANSLATIONS, url));
    return response.ok ? await response.json() : {};
  } catch {
    return {};
  }
}
