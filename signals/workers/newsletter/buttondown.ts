import type { NewsletterProvider, SubscribeResult } from './provider';

export const BUTTONDOWN_SUBSCRIBERS = 'https://api.buttondown.com/v1/subscribers';

// Someone already on the list, confirmed, pending or gone, gets the same answer as a new signup:
// the form must not tell anyone who is subscribed.
const ALREADY_LISTED = new Set([
  'email_already_exists',
  'subscriber_already_exists',
  'subscriber_blocked',
  'subscriber_suppressed',
]);
const INVALID = new Set(['email_empty', 'email_invalid', 'email_blocked']);
const TOO_MANY = new Set(['rate_limited', 'ip_address_spammy']);

/**
 * Buttondown, with double opt-in on. Each subscriber is tagged with their language, and each
 * language's RSS-to-email automation sends to its tag only, so a signal reaches its own readers.
 */
export function buttondown(apiKey: string): NewsletterProvider {
  return {
    async subscribe({ email, lang, source, ip }) {
      let response: Response;
      try {
        response = await fetch(BUTTONDOWN_SUBSCRIBERS, {
          method: 'POST',
          // No X-Buttondown-Collision-Behavior: its «add» would resubscribe someone who left
          // without asking them to confirm again.
          headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email_address: email,
            tags: [lang],
            metadata: { source },
            ...(ip ? { ip_address: ip } : {}),
          }),
        });
      } catch (error) {
        console.error('Buttondown unreachable', error);
        return { ok: false, reason: 'unavailable' };
      }
      if (response.ok) return { ok: true };
      const code = await errorCode(response);
      if (code && ALREADY_LISTED.has(code)) return { ok: true };
      // The status and code say what to fix; the address stays out of the logs.
      console.error('Buttondown refused a signup', response.status, code);
      return { ok: false, reason: reasonFor(response.status, code) };
    },
  };
}

type Failure = Extract<SubscribeResult, { ok: false }>['reason'];

function reasonFor(status: number, code: string | null): Failure {
  if (status === 429 || (code && TOO_MANY.has(code))) return 'rate-limited';
  // 422 is Buttondown's own check of the address, stricter than the form's.
  if (status === 422 || (code && INVALID.has(code))) return 'invalid';
  return 'unavailable';
}

async function errorCode(response: Response): Promise<string | null> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('code' in body)) return null;
  return typeof body.code === 'string' ? body.code : null;
}
