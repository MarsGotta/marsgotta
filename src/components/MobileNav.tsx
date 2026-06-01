'use client';

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
 * Mobile navigation drawer. Hidden on desktop via CSS (handled by the
 * `.mars-mobile-nav` rule in styles.css; rendered only ≤900px viewport).
 * Renders a hamburger button that opens a slide-in drawer with the same
 * nav items as the desktop `<NavLinks>`. Closes on:
 *   - Link click
 *   - Escape key
 *   - Scrim click
 *   - Resize back to desktop
 */
export function MobileNav({ items, closeLabel, openLabel }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change. `pathname` is intentionally listed as a dependency
  // even though the callback doesn't read it: we want the effect to RE-RUN
  // whenever the URL changes so the drawer auto-closes after a Link click.
  // Removing `pathname` (biome's suggested fix) would break that behaviour.
  // biome-ignore lint/correctness/useExhaustiveDependencies: route-change trigger
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock body scroll when drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close if viewport widens past mobile breakpoint.
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
          <span className="mars-brand-name">
            marcela<span className="accent">.</span>gotta
          </span>
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
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`mars-nav-link ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
              data-hover
              tabIndex={open ? 0 : -1}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
