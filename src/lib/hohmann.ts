/* Hohmann transfer orbits: half-ellipses tangent to two circular orbits r1 and r2, with
   semi-major axis a = (r1 + r2) / 2 and semi-minor axis b = √(r1·r2). Each stage of the career
   jumps to the next orbit on the opposite side of the sun. */

export interface TransferPoint {
  x: number;
  y: number;
}

/** Where the trajectory touches each orbit: alternately left and right of the sun. */
export function transferPoints(cx: number, cy: number, radii: number[]): TransferPoint[] {
  return radii.map((radius, index) => ({ x: index % 2 === 0 ? cx - radius : cx + radius, y: cy }));
}

/** SVG path through every orbit in `radii`, one Hohmann half-ellipse per jump. */
export function hohmannPath(cx: number, cy: number, radii: number[]): string {
  const points = transferPoints(cx, cy, radii);
  const [start, ...rest] = points;
  if (!start) return '';
  const arcs = rest.map((point, index) => {
    const r1 = radii[index] ?? 0;
    const r2 = radii[index + 1] ?? 0;
    const a = (r1 + r2) / 2;
    const b = Number(Math.sqrt(r1 * r2).toFixed(2));
    return `A${a} ${b} 0 0 1 ${point.x} ${point.y}`;
  });
  return [`M${start.x} ${start.y}`, ...arcs].join(' ');
}
