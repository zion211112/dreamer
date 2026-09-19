import { useState } from "react";

import { CLASS_CATEGORIES, CLASS_STREAMS, baseClassName, composeClassLabel } from "../../lib/school";
import { monoLabel } from "./bits";

// The "Class" entry, expanded classic-style: Category → Class → Stream.
// "Grade 5 · X" is what it composes; the picker owns its own selection and
// reports the label up. Seeded from an incoming value, then self-driven.
interface Props {
  value: string;
  onChange: (label: string) => void;
}

function catFor(cls: string): string {
  return CLASS_CATEGORIES.find((c) => c.classes.includes(cls))?.id ?? "class";
}
function streamFor(value: string): string {
  const parts = value.split("·").map((p) => p.trim());
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function ClassPicker({ value, onChange }: Props) {
  const [cat, setCat] = useState(() => catFor(baseClassName(value)));
  const [cls, setCls] = useState(() => baseClassName(value) || "Form 1");
  const [stream, setStream] = useState(() => streamFor(value));
  const family = CLASS_CATEGORIES.find((c) => c.id === cat) ?? CLASS_CATEGORIES[3];

  const pick = (nCat: string, nCls: string, nStream: string) => {
    setCat(nCat);
    setCls(nCls);
    setStream(nStream);
    onChange(composeClassLabel(nCls, nStream));
  };

  const chip = (on: boolean) =>
    `rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${on ? "border-amber bg-amber/15 text-amber" : "border-ivory/10 text-dim hover:text-ivory"}`;

  return (
    <div className="space-y-2">
      <div>
        <p className={`${monoLabel} mb-1.5`}>Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CLASS_CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => pick(c.id, c.classes[0], "")} className={chip(c.id === cat)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className={`${monoLabel} mb-1.5`}>{family.label} class</p>
        <div className="flex flex-wrap gap-1.5">
          {family.classes.map((c) => (
            <button key={c} type="button" onClick={() => pick(cat, c, "")} className={chip(c === cls)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className={`${monoLabel} mb-1.5`}>Stream</p>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => pick(cat, cls, "")} className={chip(stream === "")}>
            —
          </button>
          {CLASS_STREAMS.map((s) => (
            <button key={s} type="button" onClick={() => pick(cat, cls, s)} className={chip(stream === s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}