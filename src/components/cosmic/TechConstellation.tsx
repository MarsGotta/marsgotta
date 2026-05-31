'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

type Tech = { n: string; x: number; y: number; r: number };

const TECHS: Tech[] = [
  { n: 'React', x: 0.22, y: 0.35, r: 22 },
  { n: 'TypeScript', x: 0.5, y: 0.2, r: 26 },
  { n: 'Angular', x: 0.78, y: 0.35, r: 20 },
  { n: 'AI / LLMs', x: 0.5, y: 0.5, r: 32 },
  { n: 'BabylonJS', x: 0.18, y: 0.7, r: 18 },
  { n: 'Lit', x: 0.35, y: 0.82, r: 16 },
  { n: 'WebComponents', x: 0.65, y: 0.82, r: 22 },
  { n: 'Node', x: 0.82, y: 0.7, r: 16 },
  { n: 'Vue', x: 0.1, y: 0.5, r: 14 },
  { n: 'NextJS', x: 0.9, y: 0.5, r: 16 },
  { n: 'Prompt Eng', x: 0.5, y: 0.78, r: 20 },
];

const CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [0, 6],
  [1, 0],
  [1, 2],
  [1, 3],
  [2, 3],
  [3, 10],
  [3, 4],
  [4, 6],
  [5, 6],
  [6, 7],
  [8, 0],
  [9, 0],
  [10, 3],
];

/**
 * Interactive canvas of tech nodes with connecting lines that highlight on hover.
 */
export function TechConstellation() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const theme = resolvedTheme ?? 'dark';

    let w = 0;
    let h = 0;
    let raf = 0;
    const resize = () => {
      w = c.width = c.clientWidth * devicePixelRatio;
      h = c.height = c.clientHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      const mx = (e.clientX - r.left) * devicePixelRatio;
      const my = (e.clientY - r.top) * devicePixelRatio;
      let found: number | null = null;
      for (let i = 0; i < TECHS.length; i++) {
        const tt = TECHS[i];
        if (!tt) continue;
        const tx = tt.x * w;
        const ty = tt.y * h;
        if ((mx - tx) ** 2 + (my - ty) ** 2 < (tt.r * devicePixelRatio * 1.5) ** 2) {
          found = i;
          break;
        }
      }
      setActive(found);
    };
    const onLeave = () => setActive(null);
    c.addEventListener('mousemove', onMove);
    c.addEventListener('mouseleave', onLeave);

    const start = performance.now();
    const draw = () => {
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      for (const [a, b] of CONNECTIONS) {
        const ta = TECHS[a];
        const tb = TECHS[b];
        if (!ta || !tb) continue;
        const ax = ta.x * w;
        const ay = ta.y * h;
        const bx = tb.x * w;
        const by = tb.y * h;
        const hov = active === a || active === b;
        ctx.strokeStyle =
          theme === 'dark'
            ? `rgba(178, 155, 228, ${hov ? 0.6 : 0.15})`
            : `rgba(122, 40, 20, ${hov ? 0.55 : 0.22})`;
        ctx.lineWidth = (hov ? 1.5 : 0.8) * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      TECHS.forEach((tt, i) => {
        const tx = tt.x * w;
        const ty = tt.y * h;
        const pulse = Math.sin(t * 1.5 + i) * 2 + 2;
        const hov = active === i;
        const r = (tt.r + (hov ? 6 : 0) + pulse * 0.5) * devicePixelRatio;

        const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, r * 3);
        grad.addColorStop(0, hov ? 'rgba(233,96,58,0.5)' : 'rgba(233,96,58,0.15)');
        grad.addColorStop(1, 'rgba(233,96,58,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(tx, ty, r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hov
          ? '#E9603A'
          : theme === 'dark'
            ? 'rgba(255,200,180,0.9)'
            : 'rgba(80,24,8,0.95)';
        ctx.beginPath();
        ctx.arc(tx, ty, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = hov
          ? 'rgba(233,96,58,0.8)'
          : theme === 'dark'
            ? 'rgba(255,200,180,0.3)'
            : 'rgba(80,24,8,0.5)';
        ctx.lineWidth = 1 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(tx, ty, r * 0.8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = hov
          ? theme === 'dark'
            ? '#FFF5EE'
            : '#2A0E06'
          : theme === 'dark'
            ? 'rgba(255,245,238,0.55)'
            : 'rgba(58,26,14,0.75)';
        ctx.font = `${hov ? 600 : 500} ${13 * devicePixelRatio}px "Open Sauce Two", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(tt.n, tx, ty + r * 0.9 + 6 * devicePixelRatio);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      c.removeEventListener('mousemove', onMove);
      c.removeEventListener('mouseleave', onLeave);
    };
  }, [resolvedTheme, active]);

  return (
    <canvas ref={canvasRef} className="cosmic-constellation" aria-hidden="true" tabIndex={-1} />
  );
}
