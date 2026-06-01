'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Orbiting satellite (dark theme) / Martian sun (light theme) that drifts
 * along an elliptical path between the AI section and the footer.
 *
 * Animation lives in `styles.css` under `.cosmic-orbit-sat` + `@keyframes orbit-drift`.
 * Decorative only — `aria-hidden`, ignored by assistive tech.
 */
export function OrbitSatellite() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before hydration we render the dark variant (matches default theme) to
  // avoid a flash; once mounted we render whichever theme is active.
  const isDark = !mounted || resolvedTheme === 'dark';

  return (
    <div className="cosmic-orbit-spacer" aria-hidden="true">
      <svg className="cosmic-orbit-svg" viewBox="0 0 600 180" fill="none">
        <title>Orbital path</title>
        <path
          d="M0 110 Q 300 40 600 110"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.35"
        />
        {isDark ? (
          <g className="cosmic-orbit-sat">
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="#1a0f18"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.9"
            />
            <rect
              x="-32"
              y="-4"
              width="20"
              height="8"
              rx="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x="12"
              y="-4"
              width="20"
              height="8"
              rx="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <line x1="-12" y1="0" x2="-32" y2="0" stroke="currentColor" strokeWidth="1" />
            <line x1="12" y1="0" x2="32" y2="0" stroke="currentColor" strokeWidth="1" />
            <rect
              x="-22"
              y="-3"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.5"
            />
            <rect
              x="-14"
              y="-3"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.5"
            />
            <rect
              x="10"
              y="-3"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.5"
            />
            <rect
              x="18"
              y="-3"
              width="6"
              height="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.5"
            />
            <line x1="0" y1="0" x2="0" y2="-14" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="0" cy="-16" r="1.6" fill="#E9603A" />
            <circle
              cx="0"
              cy="0"
              r="4"
              fill="none"
              stroke="#E9603A"
              strokeWidth="0.8"
              opacity="0.8"
            />
          </g>
        ) : (
          <g className="cosmic-orbit-sat">
            {/* Mars sun: small disc (sun looks smaller from Mars) */}
            <circle cx="0" cy="0" r="22" fill="#F5B27A" opacity="0.35" />
            <circle cx="0" cy="0" r="16" fill="#ED8A4A" opacity="0.55" />
            <circle cx="0" cy="0" r="10" fill="#E9603A" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line
                key={a}
                x1={Math.cos((a * Math.PI) / 180) * 18}
                y1={Math.sin((a * Math.PI) / 180) * 18}
                x2={Math.cos((a * Math.PI) / 180) * 30}
                y2={Math.sin((a * Math.PI) / 180) * 30}
                stroke="#E9603A"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.55"
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
