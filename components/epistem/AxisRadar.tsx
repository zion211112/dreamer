import { HEALTH_AXES, type HealthAxis } from "@/lib/epistemic/taxonomy";
import type { AxisReading } from "@/lib/epistemic/health";

/**
 * THE HEALTH VECTOR, DRAWN.
 *
 * Pure: no state, no handlers, no effects. A radar over nine derived
 * numbers needs nothing from the browser, and a "use client" here would
 * push the file into the client bundle for no reason a reader could name.
 *
 * The load-bearing decision on this surface is what a `null` axis looks
 * like, and it is the reason the component is worth writing at all.
 *
 * ASIANCODER.MD forbids a simplistic quality score and the domain model
 * refuses to fabricate a value: `healthVector` returns `null` where there is
 * not enough to say, and its own comment gives the reason - "an honest null
 * is more useful than a fabricated zero, because it says where the system
 * has not looked". A radar is exactly the surface on which that honesty gets
 * thrown away. Polygons are drawn by joining whatever points exist, so the
 * cheap implementation pulls nulls to the origin and the unknown arrives at
 * the screen looking like the worst possible score.
 *
 * So a null axis is drawn as four separate statements that all survive
 * being printed in black and white, and none of which is a position on the
 * scale:
 *
 *   - a DASHED spoke where a measured one is solid;
 *   - a HOLLOW DIAMOND at the rim where a measured vertex is a filled dot,
 *     so the mark's SHAPE carries the distinction as well as its stroke;
 *   - no vertex in the polygon at all, which leaves the shape visibly open
 *     there rather than dipping to the centre;
 *   - the words "not measured" at the label, where a numeral would be.
 *
 * The polygon connects measured axes only. With one axis missing the shape
 * becomes a straight chord across the gap, which is honest about what was
 * skipped: a reader can see where the instrument did not reach, and that
 * the axes either side of the gap are joined to each other rather than to a
 * centre that was never measured.
 *
 * There is deliberately NO mark at the origin. A measured spoke's lowest
 * possible reading sits at the centre, so anything drawn there reads as
 * "something is zero". An instrument that never puts a mark in that
 * position cannot be misread into reporting one.
 *
 * Accessibility: the SVG carries a role and a name, but it is not the source
 * of truth for any reader. The same nine axes are rendered again as a table,
 * visually hidden, because a shape is not an interface - assistive tech
 * cannot interrogate a polygon, and the numerals inside one are unselectable
 * text. `HealthVector` renders the same rows in full and visibly, so this
 * table is the accessible form of this picture and not a third copy of the
 * data; both are generated from the one `readings` list handed in.
 */

/** Geometry, in viewBox units. Sized so a 12-character mono label fits
    outside the ring on both sides without being clipped. */
const VIEW = 460;
const CENTER = VIEW / 2;
const RADIUS = 118;
const LABEL_GAP = 12;
const LINE_H = 10;
/** Ring fractions. Hairlines only: the rings are the scale, not data. */
const RINGS = [0.25, 0.5, 0.75, 1] as const;
/** Longest rendered line. "ADVERSARIAL" is 11 characters; 12 leaves
    headroom without letting a long axis name sprawl past the viewBox. */
const MAX_LABEL = 12;

interface Spoke {
  axis: HealthAxis;
  /** The reading behind this spoke, or null when the caller supplied none. */
  reading: AxisReading | null;
  /** 0..1, or null when the axis was not measured. Never defaulted. */
  value: number | null;
  cos: number;
  sin: number;
  /** Where the label block hangs. */
  lx: number;
  ly: number;
}

/** A spoke with a number on it. The refinement exists so the value is
    provably a number everywhere it is multiplied into geometry. */
interface MeasuredSpoke extends Spoke {
  value: number;
  reading: AxisReading;
}

export function AxisRadar({ readings }: { readings: readonly AxisReading[] }) {
  /* Keyed by axis over the fixed nine rather than iterated from the
     readings, so an axis the caller did not measure still gets its spoke.
     A missing entry is indistinguishable from an unmeasured one, and both
     are `not measured` - which is exactly right. */
  const byAxis = new Map(readings.map((r) => [r.axis, r]));

  const spokes: Spoke[] = HEALTH_AXES.map((axis, i) => {
    const a = angleAt(i);
    return {
      axis,
      reading: byAxis.get(axis) ?? null,
      /* Not `?? 0`. A null coerced to a number here is the single line
         that would turn every unmeasured axis into the worst score on the
         screen, and nothing downstream could recover the difference. */
      value: byAxis.get(axis)?.value ?? null,
      cos: Math.cos(a),
      sin: Math.sin(a),
      lx: CENTER + Math.cos(a) * (RADIUS + LABEL_GAP),
      ly: CENTER + Math.sin(a) * (RADIUS + LABEL_GAP),
    };
  });

  const measured = spokes.filter((s): s is MeasuredSpoke => s.value !== null);
  const polygon = measured.map((s) => `${vertex(s)}`).join(" ");

  return (
    <div className="ep-radar">
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width="100%"
        role="img"
        aria-label={`Health vector, ${HEALTH_AXES.length} axes, ${measured.length} measured`}
      >
        {RINGS.map((f) => (
          <circle
            key={f}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS * f}
            fill="none"
            stroke="var(--rule)"
            strokeWidth={1}
          />
        ))}

        {/* Spokes. Dashed where nothing was measured. */}
        {spokes.map((s) => (
          <line
            key={s.axis}
            x1={CENTER}
            y1={CENTER}
            x2={CENTER + s.cos * RADIUS}
            y2={CENTER + s.sin * RADIUS}
            stroke={s.value === null ? "var(--rule-2)" : "var(--rule)"}
            strokeWidth={1}
            strokeDasharray={s.value === null ? "2 4" : undefined}
          />
        ))}

        {/* The reading itself. With fewer than three measured axes there is
            no shape to draw: a polygon through one or two points is not a
            reading, it is an artefact of the join, so the vertex marks
            below carry the reading alone in those cases. */}
        {measured.length >= 3 ? (
          <polygon
            points={polygon}
            fill="var(--signal-a08)"
            stroke="var(--signal)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ) : null}
        {measured.length === 2 ? (
          <polyline
            points={polygon}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={1.5}
          />
        ) : null}

        {measured.map((s) => (
          <circle
            key={`dot-${s.axis}`}
            cx={CENTER + s.cos * RADIUS * s.value}
            cy={CENTER + s.sin * RADIUS * s.value}
            r={2.4}
            fill="var(--signal)"
          />
        ))}

        {/* Unmeasured rims: hollow diamonds, a different mark from the
            filled dot in the same figure. */}
        {spokes
          .filter((s) => s.value === null)
          .map((s) => (
            <path
              key={`mark-${s.axis}`}
              d={diamond(CENTER + s.cos * RADIUS, CENTER + s.sin * RADIUS, 3.6)}
              fill="none"
              stroke="var(--ash)"
              strokeWidth={1}
            />
          ))}

        {/* Labels. The axis name and its reading, so the figure is never
            carried by hue or by shape alone: a sighted reader gets the
            numeral in the same place they read the name. */}
        {spokes.map((s) => {
          const lines = wrap(s.axis);
          const total = lines.length + 1;
          const start = -((total - 1) / 2) * LINE_H;
          const anchor = s.cos < -0.2 ? "end" : s.cos > 0.2 ? "start" : "middle";
          const value = s.value;

          return (
            <text
              key={`label-${s.axis}`}
              className="ep-radar-label"
              x={s.lx}
              y={s.ly}
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {lines.map((line, i) => (
                <tspan
                  key={line}
                  x={s.lx}
                  y={s.ly + start + i * LINE_H}
                  data-part="axis"
                >
                  {line}
                </tspan>
              ))}
              <tspan
                x={s.lx}
                y={s.ly + start + lines.length * LINE_H}
                data-part="value"
                data-null={value === null ? "true" : undefined}
              >
                {value === null ? "not measured" : value.toFixed(2)}
              </tspan>
            </text>
          );
        })}
      </svg>

      {/* The legend is words, because a legend drawn in glyphs teaches a
          shape and this surface exists because a shape was misread. */}
      <p className="ep-radar-label">
        Solid spoke and filled dot = measured. Dashed spoke and hollow
        diamond = not measured. Each ring is a quarter of the 0 to 1 scale.{" "}
        {measured.length === HEALTH_AXES.length
          ? "All nine axes carry a reading."
          : `${measured.length} of ${HEALTH_AXES.length} axes carry a reading. The rest were not looked at, which is not the same as scoring zero.`}
      </p>

      {/* Nothing at all was read. Said in words rather than left as nine
          empty dashed spokes, which would look like a picture of a weak
          vector rather than of an absent one. */}
      {measured.length === 0 ? (
        <p className="ep-radar-label">
          No axis carries a reading. The dashed spokes are the whole picture
          here: this vector is empty, not zero.
        </p>
      ) : null}

      <table className="sr-only">
        <caption>Health vector, as figures</caption>
        <thead>
          <tr>
            <th scope="col">Axis</th>
            <th scope="col">Reading</th>
            <th scope="col">What it asks</th>
            <th scope="col">Basis</th>
          </tr>
        </thead>
        <tbody>
          {spokes.map((s) => (
            <tr key={`row-${s.axis}`}>
              <th scope="row">{s.axis}</th>
              <td>{s.value === null ? "not measured" : s.value.toFixed(2)}</td>
              <td>{s.reading ? s.reading.question : "No reading was taken on this axis."}</td>
              <td>{s.reading ? s.reading.basis.join("; ") : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Axis i, starting at twelve o'clock and running clockwise, so the
    reading order on the figure matches the declared order of HEALTH_AXES. */
function angleAt(i: number): number {
  return ((-90 + (360 / HEALTH_AXES.length) * i) * Math.PI) / 180;
}

function vertex(s: MeasuredSpoke): string {
  const x = CENTER + s.cos * RADIUS * s.value;
  const y = CENTER + s.sin * RADIUS * s.value;
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

/** A hollow diamond drawn as a path, so it needs no transform attribute and
    stays upright at every angle. */
function diamond(x: number, y: number, r: number): string {
  return `M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`;
}

/** Greedy wrap on the enum's own underscores, rendered as spaces.
    Splitting on the underscore rather than on measured width keeps
    CATEGORY_INTEGRITY reading as two words instead of being broken
    mid-word at whatever the font happens to do. */
function wrap(axis: string): string[] {
  const words = axis.split("_");
  const lines: string[] = [];
  let line = words[0];
  for (const word of words.slice(1)) {
    if (`${line} ${word}`.length <= MAX_LABEL) {
      line = `${line} ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines;
}
