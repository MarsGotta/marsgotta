import { describe, expect, it, vi } from 'vitest';
import { handleContact, SENDER } from './contact';
import type { Env } from './env';
import site from './index';

function fakeEnv({ allowed = true, sendFails = false } = {}) {
  const send = vi.fn(async () => {
    if (sendFails) throw new Error('E_SENDER_NOT_VERIFIED');
    return { messageId: 'id' };
  });
  const env: Env = {
    ASSETS: { fetch: async () => new Response('asset') },
    CONTACT_EMAIL: { send },
    CONTACT_LIMIT: { limit: async () => ({ success: allowed }) },
  };
  return { env, send };
}

const valid = { name: 'Ana', email: 'ana@example.com', message: 'Hola', lang: 'es' };

function post(fields: Record<string, string>, { json = false } = {}): Request {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return new Request('https://marsgotta.com/api/contact', {
    method: 'POST',
    body,
    headers: json ? { Accept: 'application/json' } : {},
  });
}

describe('contact endpoint', () => {
  it('emails Marcela from the web sender, replying to the visitor', async () => {
    const { env, send } = fakeEnv();
    const response = await handleContact(post(valid, { json: true }), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith({
      to: 'me@marcelagotta.com',
      from: SENDER,
      replyTo: 'ana@example.com',
      subject: 'Contacto web: Ana',
      text: 'Nombre: Ana\nEmail: ana@example.com\nIdioma: es\n\nHola',
    });
  });

  it('redirects a plain form post back to the contact page in its language', async () => {
    const { env } = fakeEnv();
    const spanish = await handleContact(post(valid), env);
    expect(spanish.status).toBe(303);
    expect(spanish.headers.get('Location')).toBe('https://marsgotta.com/contacto#contact-sent');
    const english = await handleContact(post({ ...valid, lang: 'en', email: 'nope' }), env);
    expect(english.headers.get('Location')).toBe('https://marsgotta.com/en/contact#contact-error');
  });

  it('rejects invalid messages without sending them', async () => {
    const { env, send } = fakeEnv();
    const response = await handleContact(post({ ...valid, message: ' ' }, { json: true }), env);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false });
    expect(send).not.toHaveBeenCalled();
  });

  it('pretends to accept spam and drops it', async () => {
    const { env, send } = fakeEnv();
    const response = await handleContact(post({ ...valid, website: 'x' }, { json: true }), env);
    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('stops senders over the rate limit', async () => {
    const { env, send } = fakeEnv({ allowed: false });
    expect((await handleContact(post(valid, { json: true }), env)).status).toBe(429);
    expect(send).not.toHaveBeenCalled();
  });

  it('reports a failed delivery', async () => {
    const { env } = fakeEnv({ sendFails: true });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await handleContact(post(valid, { json: true }), env)).status).toBe(502);
  });

  it('only accepts POST', async () => {
    const { env } = fakeEnv();
    const response = await handleContact(new Request('https://marsgotta.com/api/contact'), env);
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });
});

describe('site worker', () => {
  it('hands everything but the contact endpoint to the static assets', async () => {
    const { env, send } = fakeEnv();
    const page = await site.fetch(new Request('https://marsgotta.com/api/other'), env);
    expect(await page.text()).toBe('asset');
    await site.fetch(post(valid, { json: true }), env);
    expect(send).toHaveBeenCalledOnce();
  });
});
