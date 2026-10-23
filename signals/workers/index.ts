import { subscribeEndpoint } from '../src/lib/subscribe';
import type { Env } from './env';
import { servePage } from './language';
import { handleSubscribe } from './subscribe';

/**
 * The Worker sees the pages and /api/subscribe (assets.run_worker_first in signals/wrangler.jsonc).
 * Scripts, styles and fonts are served straight from the static assets without running this code.
 */
export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === subscribeEndpoint) return handleSubscribe(request, env);
    return servePage(request, env);
  },
};
