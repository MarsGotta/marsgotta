import { defaultLang, languages, type Lang } from '../i18n';

/** The form posts here. Only the Worker answers it (workers/site), never the static pages. */
export const contactEndpoint = '/api/contact';

/** Enforced by the form's maxlength and again by the Worker, which cannot trust the browser. */
export const contactLimits = { name: 120, email: 254, message: 5000 } as const;

/** A field people never see: a submission that fills it comes from a bot. */
export const honeypotField = 'website';

/** Without JavaScript, the Worker redirects back to one of these fragments to show the outcome. */
export const contactOutcomes = { sent: 'contact-sent', error: 'contact-error' } as const;
export type ContactOutcome = keyof typeof contactOutcomes;

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  lang: Lang;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

/** The page language the form was sent from, or the default one. */
export function contactLang(form: FormData): Lang {
  return languages.find((lang) => lang === form.get('lang')) ?? defaultLang;
}

export function isSpam(form: FormData): boolean {
  return field(form, honeypotField) !== '';
}

/** The message, or null when a field is empty, too long or not an email address. */
export function parseContactForm(form: FormData): ContactMessage | null {
  // The name ends up in the subject line: collapsing whitespace keeps line breaks out of it.
  const name = field(form, 'name').replace(/\s+/g, ' ');
  const email = field(form, 'email');
  const message = field(form, 'message');
  const valid =
    name.length > 0 &&
    name.length <= contactLimits.name &&
    email.length <= contactLimits.email &&
    EMAIL_PATTERN.test(email) &&
    message.length > 0 &&
    message.length <= contactLimits.message;
  return valid ? { name, email, message, lang: contactLang(form) } : null;
}

/** The email Marcela receives. Replying goes straight to the sender. */
export function contactEmail({ name, email, message, lang }: ContactMessage) {
  return {
    subject: `Contacto web: ${name}`,
    replyTo: email,
    text: `Nombre: ${name}\nEmail: ${email}\nIdioma: ${lang}\n\n${message}`,
  };
}
