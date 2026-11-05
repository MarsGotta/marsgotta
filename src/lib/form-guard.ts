/**
 * Checks shared by the site's form endpoints (the contact form and the blog's subscription), run
 * before a request costs anything: they only ever take a few short fields from the site itself.
 */

/** Far above any real form of the site: a name, an email and a 5,000-character message. */
export const FORM_MAX_BYTES = 64 * 1024;

/**
 * Whether the request comes from another site. Without this, any page could make its visitors'
 * browsers send the forms: confirmation emails to strangers, each from a different IP.
 */
export function isCrossSite(request: Request): boolean {
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite) return fetchSite !== 'same-origin';
  // Older browsers send no Sec-Fetch-Site, but always an Origin on a cross-site POST.
  const origin = request.headers.get('Origin');
  return origin !== null && origin !== new URL(request.url).origin;
}

/**
 * The body as form data, or null if it is larger than any real form. It counts the bytes as they
 * arrive, because a request can leave out its Content-Length or lie in it.
 */
export async function readLimitedForm(
  request: Request,
  maxBytes = FORM_MAX_BYTES,
): Promise<FormData | null> {
  if (Number(request.headers.get('Content-Length')) > maxBytes) return null;
  if (!request.body) return new FormData();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Response(new Blob(chunks as BlobPart[]), {
    headers: { 'Content-Type': request.headers.get('Content-Type') ?? '' },
  });
  return body.formData().catch(() => new FormData());
}

/**
 * The key a visitor is rate limited by. An IPv6 host usually owns a whole /64, so keying on the full
 * address would give it billions of allowances.
 */
export function rateLimitKey(ip: string | null): string {
  if (!ip) return 'unknown';
  if (!ip.includes(':')) return ip;
  const [head = '', tail] = ip.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const groups =
    tail === undefined
      ? left
      : [
          ...left,
          ...Array<string>(Math.max(0, 8 - left.length - right.length)).fill('0'),
          ...right,
        ];
  const prefix = groups.slice(0, 4).map((group) => group.toLowerCase().replace(/^0+(?=.)/, ''));
  return `${prefix.join(':')}::/64`;
}
