'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'>;

/**
 * Magnetic CTA — button that follows the cursor on hover. Pure UX flourish.
 */
export function MagneticCTA({ children, onClick, variant = 'primary', ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    const onLeave = () => {
      el.style.transform = '';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className={`cosmic-cta cosmic-cta-magnetic ${variant}`}
      onClick={onClick}
      data-hover
      {...rest}
    >
      <span className="cosmic-cta-inner">{children}</span>
    </button>
  );
}
