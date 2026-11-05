/**
 * The Content-Security-Policy of the portfolio and the blog. Everything they load is their own, so
 * every directive is 'self' or 'none'. Scripts are the exception that needs work: the theme bootstrap
 * and Astro's small module scripts are inline, so each one is allowed by its hash.
 */

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

/** The inline scripts a page runs: not those with a src, and not JSON-LD, which is only data. */
export function inlineScripts(html: string): string[] {
  return [...html.matchAll(SCRIPT)]
    .filter(([, attributes = '']) => !/\bsrc=/i.test(attributes))
    .filter(([, attributes = '']) => !/type=["']?application\/ld\+json/i.test(attributes))
    .map(([, , body = '']) => body);
}

/**
 * The _headers file with the policy in its rule for every path. It goes inside that rule: a second
 * rule for the same path would replace the first one instead of adding to it.
 */
export function withPolicy(headersFile: string, policy: string): string {
  const lines = headersFile.split('\n');
  const everyPath = lines.indexOf('/*');
  if (everyPath === -1) throw new Error('_headers has no rule for /*, where the policy goes');
  lines.splice(everyPath + 1, 0, `  Content-Security-Policy: ${policy}`);
  return lines.join('\n');
}

/** The policy, given the sha256 hashes (base64) of every inline script of the site. */
export function contentSecurityPolicy(scriptHashes: readonly string[]): string {
  const hashes = [...new Set(scriptHashes)].sort().map((hash) => `'sha256-${hash}'`);
  return [
    "default-src 'self'",
    ["script-src 'self'", ...hashes].join(' '),
    // Inline styles stay allowed: the stylesheets are inlined for speed and the animations set
    // style attributes, and a hash in style-src would make browsers ignore 'unsafe-inline'.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}
