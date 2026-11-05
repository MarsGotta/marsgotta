/**
 * Whether the subscription forms show (design/signals/LEEME.md §6). They do while developing and in
 * any build with SIGNALS_NEWSLETTER=on, production included. Without it the band only offers RSS,
 * so the blog never promises an email that will not arrive.
 */
export const newsletterReady = import.meta.env.DEV || process.env.SIGNALS_NEWSLETTER === 'on';
