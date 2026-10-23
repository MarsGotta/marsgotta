import { canonicalLocation } from './redirect';

/** marcelagotta.com, www.marcelagotta.com and www.marsgotta.com answer with a permanent redirect. */
export default {
  fetch(request: Request): Response {
    return Response.redirect(canonicalLocation(request.url), 301);
  },
};
