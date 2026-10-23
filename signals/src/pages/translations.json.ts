import type { APIRoute } from 'astro';
import { getSignals } from '../data/signals';
import { translationPaths } from '../lib/translations';

/** Read by the Worker to send a visitor to their language on arrival (signals/workers/language.ts). */
export const GET: APIRoute = async () => Response.json(translationPaths(await getSignals()));
