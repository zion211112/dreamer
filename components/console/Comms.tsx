"use client";

// Tool 12 — Communication. Compose once, send per parent. Recipients are
// deduped from the roll — a parent with two children gets one message,
// with the names filled in. No gateway, no server: each link opens the
// parent's app with the message written and "send" is their one tap.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSchoolData } from "./useSchoolData";
import { btnGhost, field, Gate, HeadRow, Loading, monoLabel, Notice, panel } from "./bits";

interface Recipient {
  phone: string;
  parent: string;
  children: string[]; // child ids
  classes: string[];
}

const PRESETS = [
  {
    id: "pta",
    label: "PTA meeting",
    body: "Dear {parent}, the PTA meeting for {class} is on Saturday, 10:00, in the hall. Your presence is requested."
  },
  {
    id: "exams",
    label: "Exams ahead",
    body: "Dear {parent}, {students} sit their end-of-term exams from next Monday. Report cards follow the moment marking is done."
  },
  {
    id: "term",
    label: "Term begins",
    body: "Dear {parent}, the term for {class} begins on Monday. Kindly settle fees and ensure the full uniform. Thank you."
  }
];

function intl(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) return "254" + d.slice(1); // Kenyan 07xx → 2547xx
  return d;
}

function fill(body: string, r: Recipient, nameOf: (id: string) => string, clsOf: (id: string) => string): string {
  const kids = r.children.map((id) => nameOf(id).split(" ")[0]);
  const cls = [...new Set(r.children.map((id) => clsOf(id)).filter(Boolean))];
  return body
    .replace(/\{parent\}/g, r.parent || "parent")
    .replace(/\{students\}/g, kids.join(" & "))
    .replace(/\{class\}/g, cls.join(" and ") || "the school");
}

export default function Comms() {
  const data = useSchoolData();
  const [cls, setCls] = useState("");
  const [message, setMessage] = useState(PRESETS[0].body);
  const [copied, setCopied] = useState(false);

  const classes = useMemo(
    () => [...new Set(data.students.map((s) => s.className).filter(Boolean))].sort(),
    [data.students]
  );

  if (data.loading) return <Loading />;
  if (data.students.length === 0)
    return (
      <Gate
        title="No one to reach yet."
        body="Comms writes to the parents on the roll. Import the roll — with phone numbers — first."
      />
    );

  const inScope = data.students.filter((s) => (cls ? s.className === cls : true));
  const byPhone = new Map<string, Recipient>();
  for (const s of inScope) {
    const p = s.parentPhone.replace(/\D/g, "");
    if (!p) continue;
    const r = byPhone.get(p) || { phone: p, parent: s.parentName, children: [], classes: [] };
    r.children.push(s.id);
    if (s.parentName) r.parent = s.parentName;
    byPhone.set(p, r);
  }
  const recipients = [...byPhone.values()].sort((a, b) => a.parent.localeCompare(b.parent));
  const nameOf = (id: string) => data.students.find((s) => s.id === id)?.name ?? "a student";
  const clsOf = (id: string) => data.students.find((s) => s.id === id)?.className ?? "";
  const unreached = inScope.filter((s) => !s.parentPhone.trim()).length;

  const filled = (r: Recipient) => fill(message, r, nameOf, clsOf);

  async function copyAll() {
    const text = recipients.map((r) => `${r.parent || "parent"} (${r.phone}): ${filled(r)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked — the per-parent links still work */
    }
  }
  return (
    <>
      <HeadRow
        label={`Comms · ${recipients.length} parents · ${inScope.length} students`}
        right={
          <button className={btnGhost} disabled={recipients.length === 0} onClick={() => void copyAll()}>
            {copied ? "Copied" : "Copy all, filled"}
          </button>
        }
      />

      {unreached > 0 && (
        <Notice tone="warn">
          {unreached} student{unreached === 1 ? "" : "s"} in scope have no parent phone —{" "}
          <Link className="text-gold" href="/console/9">
            add the numbers in Roster Import
          </Link>
          .
        </Notice>
      )}

      {/* Compose once; the same message reaches every parent, filled in. */}
      <div className={panel + " mb-[21px]"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={monoLabel}>The message</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.id} className={btnGhost} onClick={() => setMessage(p.body)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-4 w-full rounded-[21px] border border-white/10 bg-void p-4 text-[14px] leading-7 text-ivory outline-none transition-colors placeholder:text-dim focus:border-gold"
          placeholder="Write the message once…"
        />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
          {`{parent}`} fills the parent · {`{students}`} the children · {`{class}`} their class
        </p>
      </div>

      {/* The recipients: one row per phone, every child behind it. */}
      <div className={panel + " p-0"}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
          <span className={monoLabel}>Recipients · one line per phone</span>
          <select value={cls} onChange={(e) => setCls(e.target.value)} className={field + " w-auto"}>
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {recipients.length === 0 ? (
          <p className="px-4 py-5 text-[13px] text-dim md:px-5">
            No phone numbers in scope yet — add them in Roster Import, then this page fills itself.
          </p>
        ) : (
          <ul>
            {recipients.map((r) => {
              const text = filled(r);
              const kids = r.children.map((id) => nameOf(id)).join(" & ");
              return (
                <li key={r.phone} className="flex flex-wrap items-center gap-3 border-b border-white/10/50 px-4 py-3 last:border-0 md:px-5">
                  <div className="min-w-[160px]">
                    <p className="text-[13px] text-ivory">{r.parent || "Parent"}</p>
                    <p className="font-mono text-[11px] text-dim">
                      {r.phone} · {kids}
                    </p>
                  </div>
                  <p className="flex-1 basis-[200px] truncate text-[12px] text-muted" title={text}>
                    {text}
                  </p>
                  <div className="ml-auto flex gap-2">
                    <a
                      className={btnGhost}
                      href={`https://wa.me/${intl(r.phone)}?text=${encodeURIComponent(text)}`}
                      target="_blank"
                      rel="noopener"
                    >
                      WhatsApp
                    </a>
                    <a className={btnGhost} href={`sms:${r.phone}?body=${encodeURIComponent(text)}`}>
                      SMS
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t border-white/10 px-4 py-3 md:px-5">
          <p className="text-[11px] leading-5 text-dim">
            Sending is per parent, on purpose — each link opens the app with the message written, and the send is
            the parent&apos;s one tap. No SMS gateway, no server, nothing leaves the device except the message
            itself.
          </p>
        </div>
      </div>
    </>
  );
}

