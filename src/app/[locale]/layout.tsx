import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { routing } from '@/i18n/routing';
import '@/styles/theme.css';
import '@/styles/styles.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://marcelagotta.com'),
  title: {
    default: 'Marcela Gotta — Senior Product Engineer · Building agent harnesses',
    template: '%s · Marcela Gotta',
  },
  description:
    'Senior Product Engineer building open source agent harnesses (Deimos, Orbit, Lunar). 16 years shipping software with focus on product craft and architecture.',
  authors: [{ name: 'Marcela Gotta', url: 'https://marcelagotta.com' }],
  creator: 'Marcela Gotta',
  openGraph: {
    type: 'website',
    siteName: 'Marcela Gotta',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@imarsgotta',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
