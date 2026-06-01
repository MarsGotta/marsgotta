'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { OrbitSatellite } from './cosmic/OrbitSatellite';

/**
 * Cosmic footer with live clock + Mars sol + faux telemetry.
 * Client component because the clock ticks every second.
 */
export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // While not mounted, render a stable shell to avoid hydration mismatch.
  const pad = (n: number) => String(n).padStart(2, '0');
  const utcString = time
    ? `${time.getUTCFullYear()}-${pad(time.getUTCMonth() + 1)}-${pad(time.getUTCDate())} ${pad(time.getUTCHours())}:${pad(time.getUTCMinutes())}:${pad(time.getUTCSeconds())}`
    : '----';

  // Sol 0 = Curiosity landing 2012-08-06 05:17:57 UTC; 1 sol = 88775.244 earth seconds.
  const marsSol = time
    ? Math.floor((time.getTime() - Date.UTC(2012, 7, 6, 5, 17, 57)) / 88775244)
    : 0;

  // Faux Mars distance (sinusoid 0.5–2.5 AU).
  const days = time ? (time.getTime() - Date.UTC(2025, 0, 1)) / 86400000 : 0;
  const au = (1.5 + Math.sin(days / 120) * 1.0).toFixed(3);
  const lightMin = (Number(au) * 8.317).toFixed(2);

  const navKeys = ['home', 'about', 'projects', 'talks', 'lab', 'contact'] as const;
  type NavKey = (typeof navKeys)[number];
  const navHref: Record<NavKey, '/' | '/about' | '/projects' | '/talks' | '/lab' | '/contact'> = {
    home: '/',
    about: '/about',
    projects: '/projects',
    talks: '/talks',
    lab: '/lab',
    contact: '/contact',
  };

  const year = time ? time.getFullYear() : new Date().getUTCFullYear();

  return (
    <footer className="mars-footer cosmic-footer">
      <OrbitSatellite />
      <div className="cosmic-footer-strip">
        <div className="cfs-left">
          <span className="cfs-live-dot" />
          <span className="cfs-live-label">{t('mission')}</span>
          <span className="cfs-sep">{'//'}</span>
          <span className="cfs-name">{t('missionName')}</span>
        </div>
        <div className="cfs-right">
          <span>{t('utc')}</span>
          <strong>{utcString}</strong>
          <span className="cfs-sep">{'//'}</span>
          <span>{t('sol')}</span>
          <strong>{marsSol.toLocaleString()}</strong>
        </div>
      </div>

      <div className="cosmic-footer-body">
        <div className="cfb-col">
          <div className="cfb-label"># {t('connectLabel')}</div>
          <ul className="cfb-nav">
            <li>
              <a className="cfb-link" href="mailto:me@marcelagotta.com" data-hover>
                <span className="cfb-nav-n">E-01</span>
                <span className="cfb-nav-l">me@marcelagotta.com</span>
                <span className="cfb-nav-arr">↗</span>
              </a>
            </li>
            <li>
              <a
                className="cfb-link"
                href="https://github.com/MarsGotta"
                target="_blank"
                rel="noopener noreferrer"
                data-hover
              >
                <span className="cfb-nav-n">G-02</span>
                <span className="cfb-nav-l">GitHub</span>
                <span className="cfb-nav-arr">↗</span>
              </a>
            </li>
            <li>
              <a
                className="cfb-link"
                href="https://www.linkedin.com/in/marcelagotta/"
                target="_blank"
                rel="noopener noreferrer"
                data-hover
              >
                <span className="cfb-nav-n">L-03</span>
                <span className="cfb-nav-l">LinkedIn</span>
                <span className="cfb-nav-arr">↗</span>
              </a>
            </li>
            <li>
              <Link className="cfb-link" href="/talks" data-hover>
                <span className="cfb-nav-n">X-04</span>
                <span className="cfb-nav-l">{t('talksLink')}</span>
                <span className="cfb-nav-arr">↗</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="cfb-col">
          <div className="cfb-label"># {t('navLabel')}</div>
          <ul className="cfb-nav">
            {navKeys.map((k, i) => (
              <li key={k}>
                <Link className="cfb-link" href={navHref[k]} data-hover>
                  <span className="cfb-nav-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cfb-nav-l">{tNav(k)}</span>
                  <span className="cfb-nav-arr">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="cfb-col cfb-telemetry">
          <div className="cfb-label"># TELEMETRY</div>
          <div className="cfb-telem-grid">
            <div className="cfb-telem-row">
              <span className="cfb-telem-k">{t('quadrant')}</span>
              <span className="cfb-telem-v">40.42°N / 3.70°W</span>
            </div>
            <div className="cfb-telem-row">
              <span className="cfb-telem-k">{t('distance')}</span>
              <span className="cfb-telem-v">{au} AU</span>
            </div>
            <div className="cfb-telem-row">
              <span className="cfb-telem-k">{t('signal')}</span>
              <span className="cfb-telem-v">
                <span className="cfb-signal">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                {lightMin} min
              </span>
            </div>
            <div className="cfb-telem-row">
              <span className="cfb-telem-k">{t('status')}</span>
              <span className="cfb-telem-v cfb-status-ok">
                <span className="cfb-status-dot" />
                {t('allSystemsOk')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="cosmic-footer-bottom">
        <div className="cfbb-left">
          <span>© {year}</span>
          <span className="cfs-sep">{'//'}</span>
          <span>{t('rights')}</span>
        </div>
        <div className="cfbb-mid">
          {t.rich('signature', {
            heart: () => (
              <span className="cfbb-emoji" role="img" aria-label="heart">
                {'❤️'}
              </span>
            ),
            coffee: () => (
              <span className="cfbb-emoji" role="img" aria-label="coffee">
                {'☕️'}
              </span>
            ),
          })}
        </div>
        <div className="cfbb-right">
          <button
            type="button"
            className="cfbb-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-hover
            aria-label={tCommon('backToTop')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 19V5m-7 7l7-7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {tCommon('backToTop')}
          </button>
        </div>
      </div>
    </footer>
  );
}
