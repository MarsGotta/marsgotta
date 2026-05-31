type Props = {
  name: string;
  rx: number;
  ry: number;
  speed: number;
  offset: number;
  size: number;
  tilt: number;
  color: string;
  time: number;
};

/**
 * Orbiting moon (Phobos or Deimos) — pure presentational component
 * computed from the `time` prop fed by the parent's animation loop.
 */
export function Moon({ name, rx, ry, speed, offset, size, tilt, color, time }: Props) {
  const angle = time * speed + offset;
  const rad = (angle * Math.PI) / 180;
  const cosT = Math.cos((tilt * Math.PI) / 180);
  const sinT = Math.sin((tilt * Math.PI) / 180);
  const x0 = Math.cos(rad) * rx;
  const y0 = Math.sin(rad) * ry;
  const x = x0 * cosT - y0 * sinT;
  const y = x0 * sinT + y0 * cosT;
  const behind = Math.sin(rad) > 0;

  return (
    <div
      className={`cosmic-moon ${behind ? 'behind' : ''}`}
      style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
    >
      <div className="cosmic-moon-body" style={{ width: size, height: size, background: color }}>
        <span className="cosmic-moon-crater c1" />
        <span className="cosmic-moon-crater c2" />
        <span className="cosmic-moon-crater c3" />
        <span className="cosmic-moon-shade" />
      </div>
      <div className="cosmic-moon-label">{name}</div>
    </div>
  );
}
