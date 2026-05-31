'use client';

import { useTranslations } from 'next-intl';
import type { Content } from '@/data/content';
import { Starfield } from '../cosmic/Starfield';

type Props = {
  content: Content;
};

export function LabContent({ content }: Props) {
  const t = useTranslations('lab');
  const l = content.lab;

  return (
    <div className="page-lab variant-cosmic">
      <Starfield />
      <div className="page-inner">
        <div className="page-overline">{t('overline')}</div>
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-lede">{l.intro}</p>

        <div className="lab-grid">
          {l.experiments.map((e) => (
            <div key={e.title} className="lab-card" data-hover>
              <div className={`lab-tag lab-tag-${e.tag.toLowerCase().replace(/[^a-z]/g, '')}`}>
                {e.tag}
              </div>
              <div className="lab-title">{e.title}</div>
              <div className="lab-desc">{e.desc}</div>
              <div className="lab-stack mono">{e.stack}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
