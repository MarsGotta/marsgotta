import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(llmsTxt(site ?? new URL('https://marcelagotta.com')), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
