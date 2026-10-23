import type { APIRoute } from 'astro';
import { getSignals } from '../data/signals';
import { llmsTxt } from '../lib/llms';

export const GET: APIRoute = async ({ site }) =>
  new Response(llmsTxt(site ?? new URL('https://signals.marsgotta.com'), await getSignals()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
