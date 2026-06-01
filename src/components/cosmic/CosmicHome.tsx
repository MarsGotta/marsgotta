'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Content } from '@/data/content';
import { useRouter } from '@/i18n/navigation';
import { MagneticCTA } from './MagneticCTA';
import { Moon } from './Moon';
import { NebulaWebGL } from './NebulaWebGL';
import { Planet } from './Planet';
import { Reveal } from './Reveal';
import { Starfield } from './Starfield';
import { TechConstellation } from './TechConstellation';
import { TiltCard } from './TiltCard';

type Props = {
  content: Content;
};

const EMPHASIS_WORDS = new Set(['contigo.', 'you.', 'with']);

/**
 * Home page composition — all sections from the legacy `CosmicHome` ported
 * to consume `content` from the typed data layer + next-intl translations
 * for UI labels.
 *
 * Client component because it runs:
 *   - a per-frame animation loop driving the Mars planet + moons
 *   - scroll listener for parallax
 *   - konami easter-egg key sequence
 */
export function CosmicHome({ content }: Props) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const h = content.hero;

  const [time, setTime] = useState(0);
  const [scroll, setScroll] = useState(0);
  const [konami, setKonami] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      setTime((performance.now() - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const seq = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const expected = seq[i];
      if (expected && (e.key.toLowerCase() === expected.toLowerCase() || e.key === expected)) {
        i++;
        if (i === seq.length) {
          setKonami((k) => !k);
          i = 0;
        }
      } else {
        i = 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const planetY = Math.sin(time * 0.5) * 10 + scroll * 0.15;
  const planetX = Math.cos(time * 0.3) * 8;
  const planetScale = 1 + scroll * 0.0004;

  return (
    <div className={`cosmic-home ${konami ? 'konami' : ''}`}>
      <NebulaWebGL />
      <Starfield />

      <div className="cosmic-hud" aria-hidden="true">
        <div className="cosmic-hud-cell">
          <span>LAT</span> 40.42°N
        </div>
        <div className="cosmic-hud-cell">
          <span>LON</span> 3.70°W
        </div>
        <div className="cosmic-hud-cell">
          <span>T</span> {Math.floor(time)}s
        </div>
        <div className="cosmic-hud-cell">
          <span>SYS</span> OK
        </div>
      </div>

      <section className="cosmic-hero">
        <div className="cosmic-hero-left">
          <Reveal>
            <div className="cosmic-overline">
              <span className="cosmic-dot" />
              {h.overline}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="cosmic-title">
              <span className="cosmic-title-l1">{h.headline[0]}</span>
              <span className="cosmic-title-l2">
                {(h.headline[1] ?? '').split(' ').map((w, i) => {
                  const emph = EMPHASIS_WORDS.has(w);
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: words from a static split, order never changes.
                    <span key={`w-${i}`} className="cosmic-word">
                      {emph ? <em>{w}</em> : w}{' '}
                    </span>
                  );
                })}
              </span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="cosmic-sub">{h.sub}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="cosmic-ctas">
              <MagneticCTA onClick={() => router.push('/lab')} variant="primary">
                <span>{h.cta1}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14m-6-6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </MagneticCTA>
              <MagneticCTA onClick={() => router.push('/projects')} variant="ghost">
                {h.cta2}
              </MagneticCTA>
            </div>
          </Reveal>
        </div>

        <div className="cosmic-hero-right">
          <div className="cosmic-orbit">
            <div className="cosmic-orbit-ring r1" />
            <div className="cosmic-orbit-ring r2" />
            <div className="cosmic-orbit-ring r3" />
            <div
              className="cosmic-planet-wrap"
              style={{
                transform: `translate(${planetX}px, ${planetY}px) scale(${planetScale})`,
              }}
            >
              <Planet size={460} />
              <div className="cosmic-planet-glow" />
            </div>
            <Moon
              name="Phobos"
              rx={215}
              ry={60}
              speed={80}
              offset={0}
              size={14}
              tilt={-12}
              color="#C8B8AA"
              time={time}
            />
            <Moon
              name="Deimos"
              rx={285}
              ry={85}
              speed={28}
              offset={140}
              size={9}
              tilt={-8}
              color="#A89886"
              time={time}
            />
          </div>
        </div>

        <div className="cosmic-scroll-hint">
          <span>{tCommon('scroll')}</span>
          <svg
            className="cosmic-scroll-icon"
            width="12"
            height="28"
            viewBox="0 0 12 28"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6" cy="2" r="1.2" fill="currentColor" opacity="0.35" />
            <circle cx="6" cy="8" r="1.2" fill="currentColor" opacity="0.55" />
            <circle cx="6" cy="14" r="1.4" fill="currentColor" />
            <path
              d="M2 19 L6 24 L10 19"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </section>

      {/* Now bar — replaces the legacy stats block per Mars's feedback (no metrics in hero). */}
      <section className="cosmic-stats cosmic-now-bar">
        <Reveal className="cosmic-now-head">
          <div className="cosmic-now-label">{t('nowLabel')}</div>
        </Reveal>
        {h.now.map((item, i) => (
          <Reveal key={item.text} delay={i * 80} className="cosmic-stat-reveal">
            <div className="cosmic-stat cosmic-now-item" data-hover>
              <div className="cosmic-now-icon" aria-hidden="true">
                {item.icon}
              </div>
              <div className="cosmic-now-text">{item.text}</div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="cosmic-constellation-section">
        <Reveal>
          <div className="cosmic-section-head centered">
            <div className="overline">{t('overlineTechStack')}</div>
            <h2 className="cosmic-section-title">{t('techStackTitle')}</h2>
            <p className="cosmic-section-sub">{t('techStackSub')}</p>
          </div>
        </Reveal>
        <div className="cosmic-constellation-wrap">
          <TechConstellation />
        </div>
      </section>

      <section className="cosmic-featured">
        <Reveal>
          <div className="cosmic-section-head">
            <div className="overline">{t('featuredOverline')}</div>
            <h2 className="cosmic-section-title">{t('featuredTitle')}</h2>
          </div>
        </Reveal>
        <div className="cosmic-project-grid">
          {content.projects.slice(0, 4).map((p, i) => (
            <Reveal key={p.code} delay={i * 100}>
              <TiltCard className="cosmic-project" onClick={() => router.push('/projects')}>
                <div className="cosmic-project-code">
                  {p.code} / {String(content.projects.length).padStart(2, '0')}
                </div>
                <div className="cosmic-project-name">{p.name}</div>
                <div className="cosmic-project-tag">{p.tag}</div>
                <div className="cosmic-project-summary">{p.summary}</div>
                <div className="cosmic-project-tech">
                  {p.tech.slice(0, 3).map((te) => (
                    <span key={te}>{te}</span>
                  ))}
                </div>
                <div className="cosmic-project-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 17L17 7m0 0H9m8 0v8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <button
          type="button"
          className="cosmic-view-all"
          onClick={() => router.push('/projects')}
          data-hover
        >
          {tCommon('viewAllProjects')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14m-6-6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>

      <section className="cosmic-ai">
        <Reveal>
          <div className="cosmic-ai-inner">
            <div className="cosmic-ai-badge">
              <div className="cosmic-ai-pulse" />
              <span>{t('aiBadge')}</span>
            </div>
            <h2 className="cosmic-ai-title">
              {t('aiTitleLine1')}
              <br />
              <em>{t('aiTitleEm')}</em>
            </h2>
            <p className="cosmic-ai-sub">{t('aiSub')}</p>
            <MagneticCTA onClick={() => router.push('/lab')} variant="primary">
              <span>{t('aiCta')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14m-6-6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticCTA>
          </div>
        </Reveal>
      </section>

      {konami && (
        <div className="cosmic-konami">
          <div className="cosmic-konami-inner">
            <div className="cosmic-konami-title">{t('konamiTitle')}</div>
            <div className="cosmic-konami-sub">{t('konamiSub')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
