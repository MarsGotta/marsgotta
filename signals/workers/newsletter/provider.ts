import type { Lang } from '../../src/i18n';
import type { SubscribeSource } from '../../src/lib/subscribe';

export interface SubscribeInput {
  email: string;
  lang: Lang;
  source: SubscribeSource;
  /** The reader's IP, which the provider's spam checks use. */
  ip: string | null;
}

export type SubscribeResult =
  { ok: true } | { ok: false; reason: 'invalid' | 'rate-limited' | 'unavailable' };

/** What the blog needs from a newsletter service (design/signals/LEEME.md §6). */
export interface NewsletterProvider {
  /** Starts double opt-in: the provider emails a confirmation link. */
  subscribe(input: SubscribeInput): Promise<SubscribeResult>;
}
