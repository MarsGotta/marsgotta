import type { APIRoute } from 'astro';
import { getSignals } from '../data/signals';
import { sitemapXml } from '../lib/sitemap';

export const GET: APIRoute = async ({ site }) =>
  new Response(sitemapXml(site ?? new URL('https://signals.marsgotta.com'), await getSignals()), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
