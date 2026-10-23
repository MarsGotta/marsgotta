import { languages, type Lang } from '../i18n';
import { homePath } from './routes';

/** The forms post here. Only the Worker answers it (signals/workers), never the static pages. */
export const subscribeEndpoint = '/api/subscribe';

/** The three places with a form (design/signals/LEEME.md §4), recorded with each signup. */
export const subscribeSources = ['masthead', 'band', 'post'] as const;
export type SubscribeSource = (typeof subscribeSources)[number];

/** The longest address the standard allows: the field's maxlength and the Worker both hold to it. */
export const emailMaxLength = 254;

// The prototype's check (design/signals/extracted/logic.js): the provider has the last word.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return value.length <= emailMaxLength && EMAIL_PATTERN.test(value);
}

export type SubscribeOutcome = 'sent' | 'invalid' | 'failed';

/**
 * Without JavaScript, the Worker redirects back to the page on one of these fragments. Each form
 * has its own, so the browser scrolls to the form that was used.
 */
export function outcomeFragment(outcome: SubscribeOutcome, source: SubscribeSource): string {
  return `nl-${outcome}-${source}`;
}

export interface SubscribeForm {
  email: string;
  lang: Lang;
  source: SubscribeSource;
  /** The page the form was sent from, where a plain form post returns. */
  page: string;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * What a form sent, with safe defaults for what is missing or tampered with. The page must be a
 * path on this site: the redirect back to it must never lead anywhere else.
 */
export function readSubscribeForm(form: FormData): SubscribeForm {
  const lang = languages.find((code) => code === form.get('lang')) ?? 'es';
  const source = subscribeSources.find((name) => name === form.get('source')) ?? 'band';
  const page = field(form, 'page');
  return {
    email: field(form, 'email'),
    lang,
    source,
    page: /^\/(?!\/)[\w\-./%]*$/.test(page) ? page : homePath(lang),
  };
}
