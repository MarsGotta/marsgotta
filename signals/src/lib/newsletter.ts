import type { Page } from './routes';

/**
 * Whether the subscription forms show (design/signals/LEEME.md §6). They do while developing and in
 * any build with SIGNALS_NEWSLETTER=on, production included. Without it the band only offers RSS,
 * so the blog never promises an email that will not arrive.
 */
export const newsletterReady = import.meta.env.DEV || process.env.SIGNALS_NEWSLETTER === 'on';

/**
 * Whether a page ends with the newsletter band and links to it from the top bar and the footer. Not
 * where Buttondown sends a reader who has just confirmed: asking them to subscribe again would make
 * no sense.
 */
export function asksToSubscribe(page: Page | null): boolean {
  return page?.kind !== 'subscribed';
}
