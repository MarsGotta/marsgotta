import type { APIRoute } from 'astro';
import { sitemapXml } from '../lib/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml(site ?? new URL('https://marsgotta.com')), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
