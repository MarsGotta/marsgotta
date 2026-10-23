import type { Env } from '../env';
import { buttondown } from './buttondown';
import type { NewsletterProvider } from './provider';

/** Accepts every signup and sends nothing: for trying the forms locally. */
const devProvider: NewsletterProvider = {
  async subscribe({ lang, source }) {
    console.log('Dev newsletter: signup accepted', lang, source);
    return { ok: true };
  },
};

/** Without an API key the endpoint says so, rather than promise an email that will not come. */
const unavailable: NewsletterProvider = {
  async subscribe() {
    return { ok: false, reason: 'unavailable' };
  },
};

/** The provider this Worker uses: changing service means changing this file and its own. */
export function newsletterFor(env: Env): NewsletterProvider {
  if (env.NEWSLETTER_PROVIDER === 'dev') return devProvider;
  return env.BUTTONDOWN_API_KEY ? buttondown(env.BUTTONDOWN_API_KEY) : unavailable;
}
