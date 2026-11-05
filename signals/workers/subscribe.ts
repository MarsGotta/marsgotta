import { isSpam } from '../../src/lib/contact';
import { isCrossSite, rateLimitKey, readLimitedForm } from '../../src/lib/form-guard';
import {
  isEmail,
  outcomeFragment,
  readSubscribeForm,
  type SubscribeForm,
  type SubscribeOutcome,
} from '../src/lib/subscribe';
import type { Env } from './env';
import { newsletterFor } from './newsletter';

/** What the endpoint answers is about one request: never stored, never sniffed. */
const API_HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

/**
 * Starts a newsletter signup. The page script asks for JSON and stays in place; a plain form post,
 * without JavaScript, is redirected back to its page with the outcome as the fragment.
 */
export async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST', ...API_HEADERS } });
  }
  if (isCrossSite(request)) return new Response(null, { status: 403, headers: API_HEADERS });
  const sent = await readLimitedForm(request);
  if (!sent) return new Response(null, { status: 413, headers: API_HEADERS });
  const form = readSubscribeForm(sent);
  const reply = (outcome: SubscribeOutcome, status: number) =>
    respond(request, form, outcome, status);

  const ip = request.headers.get('CF-Connecting-IP');
  const { success } = await env.SUBSCRIBE_LIMIT.limit({ key: rateLimitKey(ip) });
  if (!success) return reply('failed', 429);
  // Bots are told it worked, so they have no reason to try again.
  if (isSpam(sent)) return reply('sent', 200);
  if (!isEmail(form.email)) return reply('invalid', 400);

  const result = await newsletterFor(env).subscribe({
    email: form.email,
    lang: form.lang,
    source: form.source,
    ip,
  });
  if (result.ok) return reply('sent', 200);
  if (result.reason === 'invalid') return reply('invalid', 400);
  return reply('failed', result.reason === 'rate-limited' ? 429 : 503);
}

function respond(
  request: Request,
  form: SubscribeForm,
  outcome: SubscribeOutcome,
  status: number,
): Response {
  if (request.headers.get('Accept')?.includes('application/json')) {
    return Response.json({ ok: outcome === 'sent' }, { status, headers: API_HEADERS });
  }
  const page = new URL(`${form.page}#${outcomeFragment(outcome, form.source)}`, request.url);
  return new Response(null, { status: 303, headers: { Location: page.href, ...API_HEADERS } });
}
