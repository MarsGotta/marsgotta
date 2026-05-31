import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LabContent } from '@/components/pages/LabContent';
import { content } from '@/data/content';
import { type Locale, routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('lab') };
}

export default async function LabPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const localeContent = content[locale] ?? content[routing.defaultLocale];
  return <LabContent content={localeContent} />;
}
