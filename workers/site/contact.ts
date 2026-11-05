import { email as recipient } from '../../src/content/profile';
import type { Lang } from '../../src/i18n';
import { localizedPath } from '../../src/i18n/routes';
import {
  contactEmail,
  contactLang,
  contactOutcomes,
  isSpam,
  parseContactForm,
  type ContactOutcome,
} from '../../src/lib/contact';
import { isCrossSite, rateLimitKey, readLimitedForm } from '../../src/lib/form-guard';
import type { Env } from './env';

/** The only sender the binding accepts, on the subdomain onboarded to Email Sending. */
export const SENDER = 'web@mail.marcelagotta.com';

/** What the endpoint answers is about one request: never stored, never sniffed. */
const API_HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

/**
 * Sends the contact form to Marcela. The page script asks for JSON and stays in place; a plain
 * form post, without JavaScript, is redirected back to the contact page with the outcome.
 */
export async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST', ...API_HEADERS } });
  }
  if (isCrossSite(request)) return new Response(null, { status: 403, headers: API_HEADERS });
  const form = await readLimitedForm(request);
  if (!form) return new Response(null, { status: 413, headers: API_HEADERS });
  const reply = (outcome: ContactOutcome, status: number) =>
    respond(request, contactLang(form), outcome, status);

  const { success } = await env.CONTACT_LIMIT.limit({
    key: rateLimitKey(request.headers.get('CF-Connecting-IP')),
  });
  if (!success) return reply('error', 429);
  // Bots are told it worked, so they have no reason to try again.
  if (isSpam(form)) return reply('sent', 200);

  const message = parseContactForm(form);
  if (!message) return reply('error', 400);

  try {
    await env.CONTACT_EMAIL.send({ to: recipient, from: SENDER, ...contactEmail(message) });
  } catch (error) {
    console.error('Contact email failed', error);
    return reply('error', 502);
  }
  return reply('sent', 200);
}

function respond(request: Request, lang: Lang, outcome: ContactOutcome, status: number): Response {
  if (request.headers.get('Accept')?.includes('application/json')) {
    return Response.json({ ok: outcome === 'sent' }, { status, headers: API_HEADERS });
  }
  const page = new URL(localizedPath('contact', lang, contactOutcomes[outcome]), request.url);
  return new Response(null, { status: 303, headers: { Location: page.href, ...API_HEADERS } });
}
