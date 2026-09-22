"use client";

// Tool 9 — Roster Import. Paste a CSV (or drop a file), the columns map
// themselves, duplicates flag against the roll, and one button commits.
// This is the tool that opens the other four: without a roll, the console
// is a room with no one in it.

import { useRef, useState } from "react";
import Link from "next/link";
import { SAMPLE_ROSTER, RosterParse, parseRosterCsv, studentId, Student, loadDump } from "../../lib/school";
import { useSchoolData } from "./useSchoolData";
import { btn, btnGhost, HeadRow, Loading, monoLabel, Notice, panel } from "./bits";

export default function RosterImport() {
  const data = useSchoolData();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<RosterParse | null>(null);
  const [notice, setNotice] = useState("");
  const backupRef = useRef<HTMLInputElement>(null);

  if (data.loading) return <Loading />;

  /** The whole school, as one file: the roll and the term's ledger. */
  function downloadBackup() {
    const blob = new Blob([data.exportDump()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apt-labs-${data.school || "school"}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Restore replaces the roll and the scores — not the whole device. */
  async function importBackup(f: File | null) {
    if (!f) return;
    const d = loadDump(await f.text());
    if (!d) {
      setNotice("That file is not a school backup. Nothing was touched.");
      return;
    }
    await data.importDump(d);
    setNotice(`Restored ${d.students.length} students and ${d.assessments.length} scores from the backup.`);
    if (backupRef.current) backupRef.current.value = "";
  }

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
          <p className="max-w-[48ch] text-sm leading-6 text-dust">
            Paste the roll as CSV or TSV — a header row is read if it&apos;s there, and without one
            the columns come in as Adm No, Name, Sex, Class, Stream, DOB, Parent, Phone.
          </p>
          <button
            className="font-mono text-label uppercase tracking-[0.15em] text-ash transition hover:text-signal"
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
          className="mt-5 w-full rounded-[21px] border border-ink/10 bg-void p-4 font-mono text-meta leading-6 text-ink outline-none transition-colors placeholder:text-ash focus:border-signal"
        />

        {parsed && parsed.notes.map((n) => (
          <Notice key={n} tone="warn">{n}</Notice>
        ))}

        {parsed && parsed.rows.length > 0 && (
          <div className="mt-5">
            <p className={`${monoLabel} mb-3`}>
              Preview · {fresh} new · {dupes} already on the roll
            </p>
            <div className="max-h-[320px] overflow-y-auto rounded-[21px] border border-ink/10">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-panel">
                  <tr>
                    {["Adm No", "Name", "Sex", "Class", "Stream", "Parent", "Phone", ""].map((h) => (
                      <th key={h} className={`border-b border-ink/10 px-3 py-2 font-mono text-micro uppercase tracking-[0.15em] ${h === "" ? "w-16" : "text-ash"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 500).map((r, i) => (
                    <tr key={i} className={`border-b border-ink/10/50 ${r.dupe ? "opacity-40" : ""}`}>
                      <td className="px-3 py-2 font-mono text-meta text-ash">{r.student.admNo || "—"}</td>
                      <td className="px-3 py-2 text-ui text-ink">{r.student.name}</td>
                      <td className="px-3 py-2 font-mono text-meta text-dust">{r.student.sex || "—"}</td>
                      <td className="px-3 py-2 text-ui text-ink">{r.student.className || "—"}</td>
                      <td className="px-3 py-2 text-ui text-dust">{r.student.stream || "—"}</td>
                      <td className="px-3 py-2 text-ui text-dust">{r.student.parentName || "—"}</td>
                      <td className="px-3 py-2 font-mono text-meta text-dust">{r.student.parentPhone || "—"}</td>
                      <td className="px-3 py-2">
                        {r.dupe && (
                          <span className="font-mono text-micro uppercase tracking-[0.15em] text-signal">On roll</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 500 && (
                <p className="px-3 py-2 font-mono text-label text-ash">
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

        <div className="mt-6 border-t border-ink/10 pt-5">
          <p className={monoLabel}>The school, as one file</p>
          <p className="mt-2 max-w-[52ch] text-sm leading-6 text-dust">
            The roll and the term&apos;s ledger, in one JSON file — nothing on this device ever leaves
            it on its own. Carry it, keep it, restore it. A restore replaces the roll and the scores,
            and nothing else.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className={btnGhost} onClick={downloadBackup}>
              Download the backup
            </button>
            <label className={btnGhost + " cursor-pointer"}>
              Restore a backup
              <input
                ref={backupRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => void importBackup(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        {notice && <Notice>{notice}</Notice>}
      </div>
    </div>
  );
}

