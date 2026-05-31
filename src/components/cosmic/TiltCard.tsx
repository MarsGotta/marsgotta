'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

/**
 * 3D-tilt card on hover. Tracks pointer position to set CSS custom
 * properties consumed by `transform: rotateX(--rx) rotateY(--ry)` in styles.css.
 */
export function TiltCard({ children, onClick, className = '' }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -10;
      const ry = (px - 0.5) * 12;
      el.style.setProperty('--rx', `${rx}deg`);
      el.style.setProperty('--ry', `${ry}deg`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    };
    const onLeave = () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
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
      className={`cosmic-tilt ${className}`}
      onClick={onClick}
      data-hover
    >
      <div className="cosmic-tilt-inner">{children}</div>
      <div className="cosmic-tilt-sheen" />
    </button>
  );
}
