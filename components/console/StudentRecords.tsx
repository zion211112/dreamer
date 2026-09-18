"use client";

// Tool 1 — Student Records. The roll as a working grid: search, filter by
// class and stream, inline edit, and the JSON backup/restore pair that is
// the school's entire data strategy on this device.

import { useMemo, useRef, useState } from "react";
import { loadDump, Student } from "../../lib/school";
import { useSchoolData } from "./useSchoolData";
import { btn, btnGhost, field, Gate, HeadRow, Loading, Notice, monoLabel, panel } from "./bits";

const editInput =
  "w-full rounded-lg border border-edge bg-void px-3 py-2 text-[13px] text-ivory outline-none focus:border-gold";

export default function StudentRecords() {
  const data = useSchoolData();
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState("");
  const [stream, setStream] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Student | null>(null);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const classes = useMemo(
    () => [...new Set(data.students.map((s) => s.className).filter(Boolean))].sort(),
    [data.students]
  );
  const streams = useMemo(
    () =>
      [...new Set(data.students.filter((s) => cls === "" || s.className === cls).map((s) => s.stream).filter(Boolean))].sort(),
    [data.students, cls]
  );

  if (data.loading) return <Loading />;

  if (data.students.length === 0)
    return (
      <Gate
        title="No students on the roll yet."
        body="Records read the roll the Roster Import tool builds. Once it's in, this grid is the school — searchable, filterable, editable."
      />
    );

  const q = query.trim().toLowerCase();
  const visible = data.students.filter(
    (s) =>
      (!cls || s.className === cls) &&
      (!stream || s.stream === stream) &&
      (q === "" || s.name.toLowerCase().includes(q) || s.admNo.toLowerCase().includes(q) || s.parentPhone.includes(q))
  );

  function startEdit(s?: Student) {
    setNotice("");
    if (s) {
      setForm({ ...s });
      setEditing(s.id);
    } else {
      setForm({
        id: "",
        admNo: "",
        name: "",
        sex: "",
        className: cls || (classes[0] ?? ""),
        stream: "",
        dob: "",
        parentName: "",
        parentPhone: ""
      });
      setEditing("new");
    }
  }

  async function saveForm() {
    if (!form || !form.name.trim()) {
      setNotice("A name, at minimum. The roll needs one.");
      return;
    }
    const id = form.id || `STU-${Date.now().toString(36).toUpperCase()}`;
    await data.upsertStudent({ ...form, id, name: form.name.trim().slice(0, 40) });
    setForm(null);
    setEditing(null);
    setNotice(`${id} saved to the roll.`);
  }

  async function remove(s: Student) {
    if (!window.confirm(`Strike ${s.name} from the roll? Their scores go with them.`)) return;
    await data.removeStudent(s.id);
    setNotice(`${s.name} struck. Their scores were removed with them.`);
  }

  async function importBackup(f: File | null) {
    if (!f) return;
    const d = loadDump(await f.text());
    if (!d) {
      setNotice("That file is not a school backup. Nothing was touched.");
      return;
    }
    await data.importDump(d);
    setNotice(`Restored ${d.students.length} students and ${d.assessments.length} scores from the backup.`);
  }

  function downloadBackup() {
    const blob = new Blob([data.exportDump()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apt-labs-${data.school || "school"}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <HeadRow
        label={`Student records · ${data.students.length} on the roll`}
        right={
          <>
            <button className={btnGhost} onClick={downloadBackup}>
              Export backup
            </button>
            <label className={btnGhost + " cursor-pointer"}>
              Restore backup
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => void importBackup(e.target.files?.[0] ?? null)}
              />
            </label>
            <button className={btn} onClick={() => startEdit()}>
              + Add student
            </button>
          </>
        }
      />

      <div className="mb-[21px] flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, adm no, parent phone…"
          className={field + " max-w-xs"}
        />
        <select value={cls} onChange={(e) => { setCls(e.target.value); setStream(""); }} className={field + " w-auto"}>
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {streams.length > 0 && (
          <select value={stream} onChange={(e) => setStream(e.target.value)} className={field + " w-auto"}>
            <option value="">All streams</option>
            {streams.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      <div className={panel + " p-0"}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Adm No", "Name", "Class · Stream", "Sex", "Parent", "Phone", "Actions"].map((h) => (
                  <th key={h} className="border-b border-edge px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-muted">
                    Nobody in this view. Widen the filters or add a student.
                  </td>
                </tr>
              )}
              {visible.map((s) =>
                editing === s.id && form ? (
                  <tr key={s.id} className="border-b border-edge bg-void">
                    <td className="px-3 py-2">
                      <input value={form.admNo} onChange={(e) => setForm({ ...form, admNo: e.target.value })} className={editInput} placeholder="Adm No" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={editInput} placeholder="Name" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className={editInput + " w-24"} placeholder="Class" />
                        <input value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} className={editInput + " w-24"} placeholder="Stream" />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} className={editInput + " w-16"}>
                        <option value="">—</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} className={editInput} placeholder="Parent" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className={editInput} placeholder="Phone" />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button className="font-mono text-[11px] uppercase tracking-[0.1em] text-gold hover:text-ivory" onClick={() => void saveForm()}>
                        Save
                      </button>
                      <button className="ml-3 font-mono text-[11px] uppercase tracking-[0.1em] text-dim hover:text-ivory" onClick={() => { setEditing(null); setForm(null); }}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (

                  <tr key={s.id} className="border-b border-edge/50 transition-colors hover:bg-panelHi">
                    <td className="px-3 py-2.5 font-mono text-[12px] text-dim">{s.admNo || "—"}</td>
                    <td className="px-3 py-2.5 text-[13px] text-ivory">{s.name}</td>
                    <td className="px-3 py-2.5 text-[13px] text-muted">{[s.className, s.stream].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-muted">{s.sex || "—"}</td>
                    <td className="px-3 py-2.5 text-[13px] text-muted">{s.parentName || "—"}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-muted">{s.parentPhone || "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <button className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim hover:text-gold" onClick={() => startEdit(s)}>
                        Edit
                      </button>
                      <button className="ml-4 font-mono text-[11px] uppercase tracking-[0.1em] text-dim hover:text-red-400" onClick={() => void remove(s)}>
                        Strike
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        {notice && (
          <div className="px-4 py-3">
            <Notice>{notice}</Notice>
          </div>
        )}
      </div>
      <p className={monoLabel + " mt-4"}>{visible.length} of {data.students.length} shown</p>
    </div>
  );
}

