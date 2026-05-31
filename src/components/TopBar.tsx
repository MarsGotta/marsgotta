import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LangToggle } from './LangToggle';
import { NavLinks } from './NavLinks';
import { ThemeToggle } from './ThemeToggle';

/**
 * Sticky top navigation. Server Component — nav links + brand are static
 * server-rendered; only the theme/lang toggles are client islands.
 */
export async function TopBar() {
  const t = await getTranslations('nav');

  const navItems = [
    { id: 'home', href: '/' as const, label: t('home') },
    { id: 'about', href: '/about' as const, label: t('about') },
    { id: 'projects', href: '/projects' as const, label: t('projects') },
    { id: 'talks', href: '/talks' as const, label: t('talks') },
    { id: 'lab', href: '/lab' as const, label: t('lab') },
    { id: 'contact', href: '/contact' as const, label: t('contact') },
  ];

  return (
    <div className="mars-topbar">
      <div className="mars-topbar-inner">
        <Link href="/" className="mars-brand" data-hover aria-label="Marcela Gotta">
          <Image
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            className="mars-brand-logo"
            priority
          />
          <span className="mars-brand-name">
            marcela<span className="accent">.</span>gotta
          </span>
        </Link>
        <NavLinks items={navItems} />
        <div className="mars-toggles">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
