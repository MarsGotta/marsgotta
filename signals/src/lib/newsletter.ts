/**
 * Whether the subscription forms show (design/signals/LEEME.md §6). They do while developing and in
 * review builds (SIGNALS_NEWSLETTER=on). Production keeps them hidden until Buttondown is ready, so
 * the blog never promises an email that will not arrive.
 */
export const newsletterReady = import.meta.env.DEV || process.env.SIGNALS_NEWSLETTER === 'on';
