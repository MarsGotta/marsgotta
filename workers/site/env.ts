/**
 * The bindings declared in wrangler.jsonc, typed by hand: the generated Workers runtime types
 * would redeclare the globals of the DOM types the rest of the project compiles against.
 */
export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CONTACT_EMAIL: { send(email: OutgoingEmail): Promise<{ messageId: string }> };
  CONTACT_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

export interface OutgoingEmail {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
}
