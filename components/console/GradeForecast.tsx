"use client";

// Tool 8 — Grade Forecast. Read-only: it is the whole roll's scores run
// through the KCSE table in lib/kcse — weighted mean out of 400, band,
// points to the band above, the two weakest subjects, and the trend line
// across every exam entered so far. Nothing here is a guess; it is the
// data the school has already trusted us with.

import { useMemo, useState } from "react";
import { forecast } from "../../lib/kcse";
import { useSchoolData } from "./useSchoolData";
import { field, Gate, HeadRow, Loading, monoLabel, panel } from "./bits";

function Spark({ points }: { points: number[] }) {
  if (points.length < 2)
    return <span className="font-mono text-[11px] text-dim">{points.length > 0 ? points[0] : "—"}</span>;
  const w = 96;
  const h = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pts = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / span) * (h - 4) - 2}`)
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts} fill="none" stroke={up ? "#2dd4bf" : "#d4af37"} strokeWidth="2" />
      {pts.split(" ").map((p, i) => {
        const [x, y] = p.split(",");
        return <circle key={i} cx={x} cy={y} r="1.8" fill={i === points.length - 1 ? "#2dd4bf" : "#57534e"} />;
      })}
    </svg>
  );
}

export default function GradeForecast() {
  const data = useSchoolData();
  const classes = useMemo(
    () => [...new Set(data.students.map((s) => s.className).filter(Boolean))].sort(),
    [data.students]
  );
  const [cls, setCls] = useState("");

  if (data.loading) return <Loading />;

  if (data.assessments.length === 0)
    return (
      <Gate
        title="No scores to project yet."
        body="Grade Forecast is the roll's scores run through the KCSE table — mean out of 400, band, and the two weakest subjects per student. Enter scores in Term Reports and the forecast appears here."
        href="/console/2"
        cta="Enter scores"
      />
    );

  const scope = cls || "";
  const rows = data.students.filter((s) => !scope || s.className === scope);

  return (
    <div>
      <HeadRow
        label={`Grade forecast · KCSE mean out of 400`}
        right={
          <select
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            className={field + " w-auto"}
          >
            <option value="">Whole school</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        }
      />

      <div className={panel + " p-0"}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Student", "Mean / 400", "Band", "To next band", "Weakest", "Trend"].map((h) => (
                  <th key={h} className="border-b border-ivory/10 px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const f = forecast(data.assessments, s.id);
                return (
                  <tr key={s.id} className="border-b border-ivory/10/50 transition-colors hover:bg-panelHi">
                    <td className="px-3 py-2.5">
                      <span className="text-[13px] text-ivory">{s.name}</span>
                      {s.admNo && <span className="ml-2 font-mono text-[11px] text-dim">{s.admNo}</span>}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[13px] text-ivory">
                      {f ? f.mean : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {f ? (
                        <span className="font-mono text-[13px] font-bold text-amber">{f.band}</span>
                      ) : (
                        <span className="font-mono text-[12px] text-dim">no scores</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-muted">
                      {f ? (f.gap > 0 ? `${Math.ceil(f.gap)} pts to ${nextBand(f.band)}` : "top band") : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-muted">
                      {f && f.weakest.length > 0
                        ? f.weakest.map((w) => `${w.subject} (${w.pct}%)`).join(" · ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {f ? <Spark points={f.perExam.map((p) => p.mean)} /> : <span className="font-mono text-[11px] text-dim">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={monoLabel + " px-4 py-3"}>
          Weights: Mathematics ×1.5 · sciences ×1.25 · others ×1.0 — one table in lib/kcse, every tool says the same thing.
        </p>
      </div>
    </div>
  );
}

function nextBand(band: string): string {
  const order = ["F", "E", "D", "C-", "C", "C+", "B", "B+", "A-", "A"];
  const i = order.indexOf(band);
  return i >= 0 && i < order.length - 1 ? order[i + 1] : "A";
}
