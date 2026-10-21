import { canonicalLocation } from './redirect';

/** www.marcelagotta.com, marsgotta.com and www.marsgotta.com answer with a permanent redirect. */
export default {
  fetch(request: Request): Response {
    return Response.redirect(canonicalLocation(request.url), 301);
  },
};
