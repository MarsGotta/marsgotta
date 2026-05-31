'use client';

import { Link, usePathname } from '@/i18n/navigation';

type NavItem = {
  id: string;
  href: '/' | '/about' | '/projects' | '/talks' | '/lab' | '/contact';
  label: string;
};

type Props = {
  items: NavItem[];
};

/**
 * Nav links with active-state highlight. Client because it consumes
 * `usePathname()` for active matching.
 */
export function NavLinks({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav className="mars-nav" aria-label="Primary">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`mars-nav-link ${active ? 'active' : ''}`}
            data-hover
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
            {active && <span className="mars-nav-dot" />}
          </Link>
        );
      })}
    </nav>
  );
}
