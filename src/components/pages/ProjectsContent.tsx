'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Content } from '@/data/content';
import { Starfield } from '../cosmic/Starfield';

type Props = {
  content: Content;
};

export function ProjectsContent({ content }: Props) {
  const t = useTranslations('projects');
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="page-projects variant-cosmic">
      <Starfield />
      <div className="page-inner">
        <div className="page-overline">{t('overline')}</div>
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-lede">{t('lede')}</p>

        <div className="projects-grid">
          {content.projects.map((p) => (
            <button
              type="button"
              key={p.code}
              className={`project-card ${active === p.code ? 'open' : ''}`}
              onClick={() => setActive(active === p.code ? null : p.code)}
              aria-expanded={active === p.code}
              data-hover
            >
              <div className="project-card-top">
                <div className="project-code">{p.code}</div>
                <div className="project-name">{p.name}</div>
                <div className="project-role">{p.role}</div>
              </div>
              <div className="project-tag">{p.tag}</div>
              <div className="project-summary">{p.summary}</div>
              <div className="project-tech">
                {p.tech.map((te) => (
                  <span key={te}>{te}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
