'use client';

import { useTranslations } from 'next-intl';
import type { Content } from '@/data/content';
import { Starfield } from '../cosmic/Starfield';

type Props = {
  content: Content;
};

export function TalksContent({ content }: Props) {
  const t = useTranslations('talks');

  return (
    <div className="page-talks variant-cosmic">
      <Starfield />
      <div className="page-inner">
        <div className="page-overline">{t('overline')}</div>
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-lede">{t('lede')}</p>

        <div className="talks-list">
          {content.talks.map((talk) => (
            <div key={`${talk.year}-${talk.title}`} className="talk-card" data-hover>
              <div className="talk-year">{talk.year}</div>
              <div className="talk-type">{talk.type}</div>
              <div className="talk-title">{talk.title}</div>
              <div className="talk-venue">{talk.venue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
