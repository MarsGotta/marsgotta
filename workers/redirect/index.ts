import { withSecurityHeaders } from '../../src/lib/http';
import { canonicalLocation } from './redirect';

/**
 * marcelagotta.com, www.marcelagotta.com and www.marsgotta.com answer with a permanent redirect,
 * with HSTS so a browser never asks those hosts over plain HTTP again.
 */
export default {
  fetch(request: Request): Response {
    return withSecurityHeaders(Response.redirect(canonicalLocation(request.url), 301));
  },
};
