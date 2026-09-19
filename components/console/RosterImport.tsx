"use client";

// Tool 9 — Roster Import. Paste a CSV (or drop a file), the columns map
// themselves, duplicates flag against the roll, and one button commits.
// This is the tool that opens the other four: without a roll, the console
// is a room with no one in it.

import { useState } from "react";
import Link from "next/link";
import { SAMPLE_ROSTER, RosterParse, parseRosterCsv, studentId, Student } from "../../lib/school";
import { useSchoolData } from "./useSchoolData";
import { btn, btnGhost, HeadRow, Loading, monoLabel, Notice, panel } from "./bits";

export default function RosterImport() {
  const data = useSchoolData();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<RosterParse | null>(null);
  const [notice, setNotice] = useState("");

  if (data.loading) return <Loading />;

  function refreshParse(t: string) {
    setParsed(parseRosterCsv(t, data.students));
    setNotice("");
  }

  async function commit() {
    if (!parsed || parsed.rows.length === 0) return;
    const rows: Student[] = parsed.rows.map((r) => ({
      ...r.student,
      id: studentId(r.student.admNo, r.student.name, r.student.className)
    }));
    await data.addStudents(rows);
    const dupe = parsed.rows.filter((r) => r.dupe).length;
    setNotice(
      `Committed ${rows.length - dupe} new students` +
        (dupe > 0 ? `, updated ${dupe} already on the roll` : "") +
        ". The roll is open."
    );
    setText("");
    setParsed(null);
  }

  async function onFile(f: File | null) {
    if (!f) return;
    const t = await f.text();
    setText(t);
    refreshParse(t);
  }

  const fresh = parsed ? parsed.rows.filter((r) => !r.dupe).length : 0;
  const dupes = parsed ? parsed.rows.filter((r) => r.dupe).length : 0;

  return (
    <div>
      <HeadRow
        label={`Roster import · ${data.students.length} on the roll`}
        right={
          <label className={btnGhost + " cursor-pointer"}>
            Drop a CSV…
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
        }
      />

      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[48ch] text-sm leading-6 text-muted">
            Paste the roll as CSV or TSV — a header row is read if it&apos;s there, and without one
            the columns come in as Adm No, Name, Sex, Class, Stream, DOB, Parent, Phone.
          </p>
          <button
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim transition hover:text-amber"
            onClick={() => {
              setText(SAMPLE_ROSTER);
              refreshParse(SAMPLE_ROSTER);
            }}
          >
            Try a sample
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            refreshParse(e.target.value);
          }}
          rows={7}
          spellCheck={false}
          placeholder={"Adm No,Name,Sex,Class,Stream\nA1001,Amina Wanjiru,F,Form 1,Science"}
          className="mt-5 w-full rounded-[21px] border border-ivory/10 bg-void p-4 font-mono text-[12px] leading-6 text-ivory outline-none transition-colors placeholder:text-dim focus:border-amber"
        />

        {parsed && parsed.notes.map((n) => (
          <Notice key={n} tone="warn">{n}</Notice>
        ))}

        {parsed && parsed.rows.length > 0 && (
          <div className="mt-5">
            <p className={`${monoLabel} mb-3`}>
              Preview · {fresh} new · {dupes} already on the roll
            </p>
            <div className="max-h-[320px] overflow-y-auto rounded-[21px] border border-ivory/10">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-panel">
                  <tr>
                    {["Adm No", "Name", "Sex", "Class", "Stream", "Parent", "Phone", ""].map((h) => (
                      <th key={h} className={`border-b border-ivory/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] ${h === "" ? "w-16" : "text-dim"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 500).map((r, i) => (
                    <tr key={i} className={`border-b border-ivory/10/50 ${r.dupe ? "opacity-40" : ""}`}>
                      <td className="px-3 py-2 font-mono text-[12px] text-dim">{r.student.admNo || "—"}</td>
                      <td className="px-3 py-2 text-[13px] text-ivory">{r.student.name}</td>
                      <td className="px-3 py-2 font-mono text-[12px] text-muted">{r.student.sex || "—"}</td>
                      <td className="px-3 py-2 text-[13px] text-ivory">{r.student.className || "—"}</td>
                      <td className="px-3 py-2 text-[13px] text-muted">{r.student.stream || "—"}</td>
                      <td className="px-3 py-2 text-[13px] text-muted">{r.student.parentName || "—"}</td>
                      <td className="px-3 py-2 font-mono text-[12px] text-muted">{r.student.parentPhone || "—"}</td>
                      <td className="px-3 py-2">
                        {r.dupe && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-amber">On roll</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 500 && (
                <p className="px-3 py-2 font-mono text-[11px] text-dim">
                  …and {parsed.rows.length - 500} more rows below the fold.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className={btn} disabled={!parsed || parsed.rows.length === 0} onClick={() => void commit()}>
            Commit to the roll
          </button>
          <Link href="/console/6" className={btnGhost}>
            Build the week
          </Link>
        </div>
        {notice && <Notice>{notice}</Notice>}
      </div>
    </div>
  );
}

