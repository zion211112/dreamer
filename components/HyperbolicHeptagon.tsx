type Pt = [number, number];

// Circle through a, b perpendicular to the unit circle (a hyperbolic geodesic)
function geodesicCircle(a: Pt, b: Pt) {
  const [ax, ay] = a;
  const [bx, by] = b;
  const c1 = 1 + ax * ax + ay * ay;
  const c2 = 1 + bx * bx + by * by;
  const det = 2 * (ax * by - ay * bx);
  const cx = (c1 * by - c2 * ay) / det;
  const cy = (ax * c2 - bx * c1) / det;
  const r = Math.sqrt(cx * cx + cy * cy - 1);
  return { c: [cx, cy] as Pt, r };
}

// Inversion of z in a circle (the hyperbolic reflection through the geodesic)
function invert(z: Pt, circle: { c: Pt; r: number }): Pt {
  const dx = z[0] - circle.c[0];
  const dy = z[1] - circle.c[1];
  const d2 = dx * dx + dy * dy;
  const k = (circle.r * circle.r) / d2;
  return [circle.c[0] + k * dx, circle.c[1] + k * dy];
}

// Reflect a polygon across a geodesic
function reflectPoly(v: Pt[], circle: { c: Pt; r: number }): Pt[] {
  return v.map((p) => invert(p, circle));
}

// Centroid key for dedup
function key(v: Pt[]): string {
  let x = 0, y = 0;
  for (const p of v) { x += p[0]; y += p[1]; }
  return `${(x / v.length).toFixed(4)},${(y / v.length).toFixed(4)}`;
}

// Generate the {7,3} tiling by BFS reflection, bounded by depth
function generateTiling(depth: number): Pt[][] {
  const r_h = 0.2663;      // heptagon vertex radius (derived: cosh ρ = cos(π/3)/sin(π/7))
  const n = 7;
  const central: Pt[] = Array.from({ length: n }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    return [r_h * Math.cos(t), r_h * Math.sin(t)];
  });

  const seen = new Map<string, Pt[]>();
  const queue: { v: Pt[]; lvl: number }[] = [{ v: central, lvl: 0 }];
  seen.set(key(central), central);

  while (queue.length > 0) {
    const { v, lvl } = queue.shift()!;
    if (lvl >= depth) continue;
    for (let i = 0; i < n; i++) {
      const a = v[i];
      const b = v[(i + 1) % n];
      const circle = geodesicCircle(a, b);
      const reflected = reflectPoly(v, circle);
      // Drop tiles that drifted outside the disk numerically
      const cX = reflected.reduce((s, p) => s + p[0], 0) / n;
      const cY = reflected.reduce((s, p) => s + p[1], 0) / n;
      if (Math.hypot(cX, cY) > 0.99) continue;
      const kk = key(reflected);
      if (!seen.has(kk)) {
        seen.set(kk, reflected);
        queue.push({ v: reflected, lvl: lvl + 1 });
      }
    }
  }
  return Array.from(seen.values());
}

// SVG path for one geodesic arc between two vertices on a geodesic circle
function arcPath(a: Pt, b: Pt, circle: { c: Pt; r: number }): string {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = circle.c;
  const tA = Math.atan2(ay - cy, ax - cx);
  const tB = Math.atan2(by - cy, bx - cx);
  const tMin = Math.atan2(-cy, -cx);
  const norm = (t: number) => {
    while (t < -Math.PI) t += 2 * Math.PI;
    while (t > Math.PI) t -= 2 * Math.PI;
    return t;
  };
  const dAB = norm(tB - tA);
  const dAm = norm(tMin - tA);
  const through = (dAB > 0 && dAm > 0 && dAm < dAB) || (dAB < 0 && dAm < 0 && dAm > dAB);
  const sweep = through ? (dAB > 0 ? 1 : 0) : dAB > 0 ? 0 : 1;
  const large = Math.abs(dAB) > Math.PI ? 1 : 0;
  return `M ${ax} ${ay} A ${circle.r} ${circle.r} 0 ${large} ${sweep} ${bx} ${by}`;
}

export default function HyperbolicHeptagon({
  depth = 2,
  className = "",
  strokeWidth = 0.0035,
}: {
  depth?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const tiles = generateTiling(depth);
  const paths: string[] = [];
  for (const v of tiles) {
    for (let i = 0; i < v.length; i++) {
      const a = v[i];
      const b = v[(i + 1) % v.length];
      const circle = geodesicCircle(a, b);
      paths.push(arcPath(a, b, circle));
    }
  }

  return (
    <svg
      viewBox="-1.05 -1.05 2.1 2.1"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* objectBoundingBox would anchor cx/cy to each path's own corner,
            giving per-arc streaks. userSpaceOnUse makes 0,0 the true disk
            centre, so the fade runs centre → boundary (whisper at infinity). */}
        <radialGradient
          id="hp-fade"
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="0.92" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The boundary — hyperbolic infinity, kept as a whisper */}
      <circle
        cx="0"
        cy="0"
        r="1"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.6}
        opacity="0.18"
      />

      {/* The tiling */}
      <g
        fill="none"
        stroke="url(#hp-fade)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* The center — the seal */}
      <circle cx="0" cy="0" r={0.006} fill="currentColor" />
    </svg>
  );
}