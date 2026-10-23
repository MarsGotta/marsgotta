/**
 * The bindings declared in signals/wrangler.jsonc, typed by hand like the portfolio's
 * (workers/site/env.ts): the generated runtime types would clash with the DOM types.
 */
export interface Env {
  ASSETS: { fetch(request: Request | URL): Promise<Response> };
  SUBSCRIBE_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
  /** Set with `wrangler secret put BUTTONDOWN_API_KEY -c signals/wrangler.jsonc`, never in the repo. */
  BUTTONDOWN_API_KEY?: string;
  /** `dev` only under `npm run signals:preview:cf`: signups are accepted and go nowhere. */
  NEWSLETTER_PROVIDER?: string;
}
