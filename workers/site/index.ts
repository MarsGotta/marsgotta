import { findPage } from '../../src/i18n/routes';
import { contactEndpoint } from '../../src/lib/contact';
import { withSecurityHeaders } from '../../src/lib/http';
import { handleContact } from './contact';
import type { Env } from './env';
import { servePage } from './language';

/**
 * Static assets answer every request that matches a file without running this code. The Worker
 * sees the pages and /api/* (assets.run_worker_first), and the paths with no file, which get the
 * 404 page.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === contactEndpoint) return withSecurityHeaders(await handleContact(request, env));
    const page = findPage(pathname);
    return page
      ? withSecurityHeaders(await servePage(request, env, page))
      : env.ASSETS.fetch(request);
  },
};
