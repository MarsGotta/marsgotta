'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

/**
 * Faux-OS cursor — dot follows pointer, ring lags + scales on interactive
 * elements (anything matching `a, button, [role="button"], input, textarea, [data-hover]`).
 *
 * Hidden on touch / coarse-pointer devices: we add a `cursor-default` class
 * to <body> so CSS `cursor: none` is overridden by `body.cursor-default { cursor: auto; }`.
 */
export function CustomCursor() {
  const { resolvedTheme } = useTheme();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(pointer: coarse), (hover: none)');
    const update = () => setCoarsePointer(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (coarsePointer) {
      document.body.classList.add('cursor-default');
      return () => {
        document.body.classList.remove('cursor-default');
      };
    }
    document.body.classList.remove('cursor-default');
  }, [mounted, coarsePointer]);

  useEffect(() => {
    if (!mounted || coarsePointer) return;

    const state = { x: 0, y: 0, tx: 0, ty: 0, hover: false };

    const onMove = (e: MouseEvent) => {
      state.tx = e.clientX;
      state.ty = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive =
        target?.closest('a, button, [role="button"], input, textarea, [data-hover]') ?? null;
      state.hover = Boolean(interactive);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);

    let raf = 0;
    const loop = () => {
      state.x += (state.tx - state.x) * 0.35;
      state.y += (state.ty - state.y) * 0.35;
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) {
        dot.style.transform = `translate(${state.tx - 3}px, ${state.ty - 3}px)`;
      }
      if (ring) {
        const scale = state.hover ? 2.4 : 1;
        ring.style.transform = `translate(${state.x - 14}px, ${state.y - 14}px) scale(${scale})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, [mounted, coarsePointer]);

  if (!mounted || coarsePointer) return null;

  const color = resolvedTheme === 'dark' ? '#E9603A' : '#845ABE';

  return (
    <>
      <div ref={dotRef} className="mars-cursor-dot" style={{ background: color }} />
      <div ref={ringRef} className="mars-cursor-ring" style={{ borderColor: color }} />
    </>
  );
}
