'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

type NavItem = {
  id: string;
  href: '/' | '/about' | '/projects' | '/talks' | '/lab' | '/contact';
  label: string;
};

type Props = {
  items: NavItem[];
  closeLabel: string;
  openLabel: string;
};

/**
 * Mobile navigation drawer with editorial layout: numbered list of links
 * (01-06) with display-font labels and an up-right arrow per row.
 * Hidden on desktop via CSS (`.mars-mobile-nav` rule, rendered only ≤900px).
 * Closes on: Link click, Escape, scrim click, resize back to desktop.
 */
export function MobileNav({ items, closeLabel, openLabel }: Props) {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change. The dep on `pathname` is intentional: we re-run
  // the effect whenever the URL changes so the drawer auto-closes after a
  // Link click. Removing the dep (biome's suggested fix) breaks that.
  // biome-ignore lint/correctness/useExhaustiveDependencies: route-change trigger
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="mars-mobile-nav">
      <button
        type="button"
        className="mars-mobile-burger"
        aria-label={openLabel}
        aria-expanded={open}
        aria-controls="mars-mobile-drawer"
        onClick={() => setOpen(true)}
        data-hover
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className={`mars-mobile-scrim ${open ? 'open' : ''}`}
        aria-label={closeLabel}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <nav
        id="mars-mobile-drawer"
        className={`mars-mobile-drawer ${open ? 'open' : ''}`}
        aria-label="Primary mobile"
        aria-hidden={!open}
      >
        <div className="mars-mobile-drawer-head">
          <button
            type="button"
            className="mars-mobile-drawer-close"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            data-hover
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ol className="mars-mobile-menu">
          {items.map((item, i) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <li key={item.id} className={`mars-mobile-menu-item ${active ? 'active' : ''}`}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  data-hover
                  tabIndex={open ? 0 : -1}
                >
                  <span className="mars-mobile-menu-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="mars-mobile-menu-label">{item.label}</span>
                  <svg
                    className="mars-mobile-menu-arrow"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 17L17 7m0 0H9m8 0v8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mars-mobile-drawer-foot">
          <span>{t('menuFooterCoords')}</span>
          <span className="sep">{'//'}</span>
          <span>{t('menuFooterLocation')}</span>
        </div>
      </nav>
    </div>
  );
}
