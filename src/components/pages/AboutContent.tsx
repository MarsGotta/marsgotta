'use client';

import { useTranslations } from 'next-intl';
import type { Content } from '@/data/content';
import { useRouter } from '@/i18n/navigation';
import { NebulaWebGL } from '../cosmic/NebulaWebGL';
import { Starfield } from '../cosmic/Starfield';

type Props = {
  content: Content;
};

export function AboutContent({ content }: Props) {
  const t = useTranslations('about');
  const router = useRouter();
  const a = content.about;
  const skills = content.skills;

  return (
    <div className="page-about variant-cosmic">
      <NebulaWebGL />
      <Starfield />
      <div className="page-inner">
        <div className="about-hero-panel">
          <div className="page-overline">{t('overline')}</div>
          <h1 className="page-title">{a.title}</h1>

          <div className="about-grid">
            <div className="about-bio">
              {a.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            <div className="about-facts">
              {a.facts.map((f) => (
                <div key={f.k} className="about-fact">
                  <div className="about-fact-k">{f.k}</div>
                  <div className="about-fact-v">{f.v}</div>
                </div>
              ))}
              <button
                type="button"
                className="cosmic-cta primary"
                onClick={() => router.push('/contact')}
                data-hover
              >
                <span>{t('contactCta')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="page-section">
          <h2 className="page-h2">{t('journey')}</h2>
          <div className="timeline">
            {a.roles.map((r) => (
              <div key={`${r.year}-${r.role}`} className="timeline-item" data-hover>
                <div className="timeline-year">{r.year}</div>
                <div className="timeline-dot" />
                <div className="timeline-body">
                  <div className="timeline-role">{r.role}</div>
                  <div className="timeline-detail">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-section">
          <h2 className="page-h2">{t('skills')}</h2>
          <div className="skill-groups">
            {skills.groups.map((g) => (
              <div key={g.title} className="skill-group">
                <div className="skill-title">{g.title}</div>
                <div className="skill-tags">
                  {g.items.map((it) => (
                    <span key={it} className="skill-tag" data-hover>
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
