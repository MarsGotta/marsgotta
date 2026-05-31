import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactContent } from '@/components/pages/ContactContent';
import { content } from '@/data/content';
import { type Locale, routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('contact') };
}

export default async function ContactPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const localeContent = content[locale] ?? content[routing.defaultLocale];
  return <ContactContent content={localeContent} />;
}
