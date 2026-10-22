import { contactEndpoint } from '../../src/lib/contact';
import { handleContact } from './contact';
import type { Env } from './env';

/**
 * Static assets answer every request that matches a file without running this code. The Worker
 * sees /api/* (assets.run_worker_first) and the paths with no file, which get the 404 page.
 */
export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    return pathname === contactEndpoint ? handleContact(request, env) : env.ASSETS.fetch(request);
  },
};
