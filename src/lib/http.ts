/**
 * HSTS without includeSubDomains: some subdomains are served by third parties. public/_headers
 * sends the same value with every file and page.
 */
export const HSTS = 'max-age=31536000';

/**
 * The headers that public/_headers gives files and pages, for the responses a Worker builds itself
 * (redirects, the form endpoints), which static assets never see.
 */
export function withSecurityHeaders(response: Response): Response {
  // A copy, because the headers of a redirect or a fetched response are immutable.
  const secured = new Response(response.body, response);
  if (!secured.headers.has('Strict-Transport-Security')) {
    secured.headers.set('Strict-Transport-Security', HSTS);
  }
  secured.headers.set('X-Content-Type-Options', 'nosniff');
  return secured;
}

/**
 * Marks a page's ETag as weak. Cloudflare drops a strong ETag when it compresses a response on the
 * way out, and without one a browser can never revalidate the page and get a 304: it downloads it
 * again on every visit. Static assets answer a weak If-None-Match all the same.
 */
export function weakenEtag(headers: Headers): void {
  const etag = headers.get('ETag');
  if (etag?.startsWith('"')) headers.set('ETag', `W/${etag}`);
}
