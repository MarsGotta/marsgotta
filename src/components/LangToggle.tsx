'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Locale toggle (ES ↔ EN). Uses the next-intl typed router so the locale
 * prefix in the URL is rewritten correctly while preserving the current path.
 *
 * NOTE: we do not declare `pathnames` in routing, so both `usePathname` and
 * `router.replace` operate on plain strings — no params plumbing needed.
 */
export function LangToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale: Locale = locale === 'es' ? 'en' : 'es';

  const onClick = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <button
      type="button"
      className="mars-toggle-btn"
      onClick={onClick}
      title={t('toggleLanguage')}
      aria-label={t('toggleLanguage')}
      data-hover
    >
      <strong>{locale.toUpperCase()}</strong>
      <span style={{ opacity: 0.5 }}>/{otherLocale.toUpperCase()}</span>
    </button>
  );
}
