import type { APIRoute } from 'astro';
import { rssResponse } from '../data/feed';

export const GET: APIRoute = ({ site }) =>
  rssResponse('es', site ?? new URL('https://signals.marsgotta.com'));
