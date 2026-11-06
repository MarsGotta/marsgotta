import type { Lang } from '../i18n';

/** Public contact channels, shared by the footer, the contact page and the structured data. */
export const email = 'me@marsgotta.com';

/** Her blog, Signals by Mars, on its own subdomain and in the reader's language. */
export const blog = {
  name: 'Signals',
  host: 'signals.marsgotta.com',
  url: (lang: Lang) => `https://signals.marsgotta.com${lang === 'en' ? '/en' : '/'}`,
};

export interface Channel {
  name: string;
  href: string;
  /** Full address, as shown on the contact page. */
  address: string;
  /** Short handle, as shown in the footer. */
  handle: string;
}

export const socialChannels: Channel[] = [
  {
    name: 'GitHub',
    href: 'https://github.com/MarsGotta',
    address: 'github.com/MarsGotta',
    handle: 'MarsGotta',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/marcelagotta',
    address: 'linkedin.com/in/marcelagotta',
    handle: 'marcelagotta',
  },
  {
    name: 'X',
    href: 'https://x.com/marcelagotta',
    address: '@marcelagotta',
    handle: '@marcelagotta',
  },
];
