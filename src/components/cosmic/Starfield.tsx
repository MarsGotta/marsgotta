'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

type StarHue = 'amber' | 'pink' | 'white';
type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  tw: number;
  hue: StarHue;
  big: boolean;
};
type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  trail: number;
};

/**
 * Animated starfield with mouse-parallax + occasional shooting stars.
 * Theme-aware: stars are warm in dark mode, violet ghosts in light mode.
 */
export function Starfield() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const theme = resolvedTheme ?? 'dark';
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let shooters: Shooter[] = [];
    let raf = 0;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;

    const spawnShooter = (): Shooter => {
      const fromLeft = Math.random() < 0.5;
      return {
        x: fromLeft ? -50 : w + 50,
        y: Math.random() * h * 0.7,
        vx: (fromLeft ? 1 : -1) * (8 + Math.random() * 6) * devicePixelRatio,
        vy: (2 + Math.random() * 3) * devicePixelRatio,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        trail: 60 + Math.random() * 40,
      };
    };

    const resize = () => {
      w = c.width = c.clientWidth * devicePixelRatio;
      h = c.height = c.clientHeight * devicePixelRatio;
      stars = Array.from({ length: 230 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1,
        r: Math.random() * 1.8 + 0.4,
        tw: Math.random() * Math.PI * 2,
        hue:
          Math.random() < 0.15
            ? ('amber' as const)
            : Math.random() < 0.1
              ? ('pink' as const)
              : ('white' as const),
        big: Math.random() < 0.04,
      }));
      shooters = [];
    };
    resize();

    const onResize = () => resize();
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      ty = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);

    let shooterCooldown = 120;

    const loop = () => {
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.tw += 0.03;
        const tw = (Math.sin(s.tw) + 1) / 2;
        const px = s.x + mx * 80 * s.z * devicePixelRatio;
        const py = s.y + my * 80 * s.z * devicePixelRatio;
        const alpha = 0.55 + tw * 0.45 * s.z;
        let col: string;
        if (theme === 'dark') {
          if (s.hue === 'amber') col = `rgba(255, 190, 120, ${alpha})`;
          else if (s.hue === 'pink') col = `rgba(255, 160, 180, ${alpha})`;
          else col = `rgba(255, 245, 235, ${alpha})`;
        } else {
          col = `rgba(132, 90, 190, ${alpha * 0.5})`;
        }
        ctx.beginPath();
        ctx.fillStyle = col;
        const rx = ((px % w) + w) % w;
        const ry = ((py % h) + h) % h;
        const rad = s.r * s.z * devicePixelRatio;
        ctx.arc(rx, ry, rad, 0, Math.PI * 2);
        ctx.fill();

        if (s.big && theme === 'dark') {
          const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad * 4);
          g.addColorStop(0, `rgba(255,230,200,${alpha * 0.4})`);
          g.addColorStop(1, 'rgba(255,230,200,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(rx, ry, rad * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      shooterCooldown--;
      if (shooterCooldown <= 0 && shooters.length < 2) {
        shooters.push(spawnShooter());
        shooterCooldown = 140 + Math.random() * 220;
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const m = shooters[i];
        if (!m) continue;
        m.x += m.vx;
        m.y += m.vy;
        m.life++;
        const lifeK = Math.min(1, m.life / 10) * (1 - Math.max(0, (m.life - m.maxLife + 15) / 15));
        const tailX = m.x - m.vx * (m.trail / 6);
        const tailY = m.y - m.vy * (m.trail / 6);
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(255,180,110,0)');
        grad.addColorStop(0.6, `rgba(255,180,110,${0.55 * lifeK})`);
        grad.addColorStop(1, `rgba(255,240,220,${lifeK})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(255,240,220,${lifeK})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.2 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();

        if (m.life > m.maxLife || m.x < -100 || m.x > w + 100 || m.y > h + 100) {
          shooters.splice(i, 1);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [resolvedTheme]);

  return <canvas ref={canvasRef} className="mars-starfield" aria-hidden="true" tabIndex={-1} />;
}
