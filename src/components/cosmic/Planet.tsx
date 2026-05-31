type Props = {
  size?: number;
};

/**
 * Stylised Mars planet — cartoon/flat illustration in SVG.
 * Server-renderable, no client JS needed.
 */
export function Planet({ size = 340 }: Props) {
  const craters = [
    { cx: 130, cy: 112, r: 13 },
    { cx: 268, cy: 130, r: 18 },
    { cx: 198, cy: 196, r: 22 },
    { cx: 92, cy: 228, r: 12 },
    { cx: 302, cy: 260, r: 14 },
    { cx: 148, cy: 306, r: 10 },
    { cx: 258, cy: 318, r: 15 },
  ];

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className="mars-planet mars-planet-cartoon"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="car-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.35" stopColor="rgba(230,66,65,0.55)" />
          <stop offset="0.6" stopColor="rgba(180,40,80,0.25)" />
          <stop offset="1" stopColor="rgba(120,30,80,0)" />
        </radialGradient>
        <radialGradient id="car-body" cx="0.4" cy="0.4" r="0.72">
          <stop offset="0" stopColor="#FF8A6A" />
          <stop offset="0.45" stopColor="#E65A48" />
          <stop offset="0.8" stopColor="#B23A30" />
          <stop offset="1" stopColor="#6A1E22" />
        </radialGradient>
        <linearGradient id="car-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(130,30,40,0)" />
          <stop offset="0.5" stopColor="rgba(130,30,40,0.35)" />
          <stop offset="1" stopColor="rgba(130,30,40,0)" />
        </linearGradient>
        <radialGradient id="car-crater" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#8E2830" />
          <stop offset="0.6" stopColor="#6E1E26" />
          <stop offset="1" stopColor="#4A1218" />
        </radialGradient>
        <radialGradient id="car-term" cx="0.35" cy="0.35" r="0.85">
          <stop offset="0.5" stopColor="rgba(0,0,0,0)" />
          <stop offset="0.85" stopColor="rgba(40,10,20,0.35)" />
          <stop offset="1" stopColor="rgba(20,4,12,0.7)" />
        </radialGradient>
        <clipPath id="car-clip">
          <circle cx="200" cy="200" r="160" />
        </clipPath>
      </defs>

      <circle cx="200" cy="200" r="200" fill="url(#car-halo)" />
      <circle cx="200" cy="200" r="160" fill="url(#car-body)" />

      <g clipPath="url(#car-clip)">
        <path
          d="M 40 100 Q 140 80 260 110 Q 360 135 370 150 L 380 190 Q 280 160 180 150 Q 80 140 30 160 Z"
          fill="url(#car-band)"
          opacity="0.75"
        />
        <path
          d="M 20 220 Q 120 200 220 220 Q 320 240 380 230 L 380 270 Q 300 260 200 250 Q 100 240 20 270 Z"
          fill="url(#car-band)"
          opacity="0.6"
        />
        {craters.map((c) => (
          <ellipse
            key={`${c.cx}-${c.cy}`}
            cx={c.cx}
            cy={c.cy}
            rx={c.r}
            ry={c.r * 0.95}
            fill="rgba(90,24,32,0.22)"
          />
        ))}
        <circle cx="200" cy="200" r="160" fill="url(#car-term)" />
      </g>
    </svg>
  );
}
