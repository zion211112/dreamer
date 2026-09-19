"use client";

// Tool 3 — Fee Tracking. One invoice per term, M-Pesa payments are
// append-only lines with their references, and the default-prediction is
// plain arithmetic on what is still open. The fee sheet for a class prints
// on one white A4 sheet, the way every sheet in this console does.

import { useEffect, useMemo, useState } from "react";
import {
  FeePayment,
  FeeTerm,
  commitPayments,
  commitTerm,
  defaultTerm,
  kes,
  loadFeePayments,
  loadFeeTerms,
  MpesaParse,
  parseMpesaStatement,
  paymentId,
  standingFor,
  termSlug
} from "../../lib/fees";
import { useSchoolData } from "./useSchoolData";
import { btn, btnGhost, field, Gate, HeadRow, Loading, monoLabel, Notice, panel, PrintButton } from "./bits";

const RISK_CHIP: Record<string, string> = {
  clear: "border-teal/25 bg-teal/15 text-teal",
  low: "border-teal/15 bg-teal/5 text-teal",
  medium: "border-amber/25 bg-amber/10 text-amber",
  high: "border-amber/40 bg-amber/15 text-amber",
  unbilled: "border-ivory/10 bg-ivory/5 text-dim"
};
const RISK_LABEL: Record<string, string> = {
  clear: "Clear",
  low: "Low",
  medium: "Medium",
  high: "High",
  unbilled: "Not billed"
};

export default function FeeTracking() {
  const data = useSchoolData();
  const [terms, setTerms] = useState<FeeTerm[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [termName, setTermName] = useState(defaultTerm());
  const [cls, setCls] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");
  // One payment, by hand.
  const [selId, setSelId] = useState("");
  const [payAmt, setPayAmt] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  // The M-Pesa statement, pasted.
  const [mpRaw, setMpRaw] = useState("");
  const [mpParsed, setMpParsed] = useState<MpesaParse | null>(null);

  useEffect(() => {
    (async () => {
      const [t, p] = await Promise.all([loadFeeTerms(), loadFeePayments()]);
      setTerms(t);
      setPayments(p);
      setCls("");
      const active = [...t].sort((a, b) => b.ts - a.ts)[0];
      if (active) {
        setTermName(active.term);
        setAmount(String(active.amount));
      }
    })();
  }, []);

  const classes = useMemo(
    () => [...new Set(data.students.map((s) => s.className).filter(Boolean))].sort(),
    [data.students]
  );

  if (data.loading) return <Loading />;
  if (data.students.length === 0)
    return (
      <Gate
        title="No fees ledger yet."
        body="The ledger reads the roll. Import the roll first — then invoice, reconcile and print from here."
      />
    );

  const termKey = termName.trim() || defaultTerm();
  const active = terms.find((t) => t.term === termKey) ?? null;
  const termPays = payments.filter((p) => p.term === termKey);
  const classOf = cls || classes[0] || "";
  const rows = data.students.filter((s) => s.className === classOf);
  const standings = rows.map((s) => standingFor(active, termPays, s.id));
  const paidTotal = termPays.filter((p) => rows.some((r) => r.id === p.studentId)).reduce((a, p) => a + p.amount, 0);
  const outstanding = active ? active.amount * rows.length - paidTotal : 0;
  const highRisk = standings.filter((s) => s.risk === "high").length;
  const pctIn = active && active.amount > 0 ? Math.min(100, Math.round((paidTotal / (active.amount * rows.length)) * 100)) : null;
  const existingIds = new Set(payments.map((p) => p.id));

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 4000);
  }

  async function invoice() {
    const amt = Math.max(0, parseFloat(amount) || 0);
    const t: FeeTerm = { id: termSlug(termKey), term: termKey, amount: amt, ts: Date.now() };
    await commitTerm(t);
    setTerms((prev) => [...prev.filter((x) => x.id !== t.id), t]);
    flash(`Invoiced ${data.students.length} students at ${kes(amt)} · ${termKey}.`);
  }

  async function recordOne() {
    const sid = selId || rows[0]?.id;
    const amt = parseFloat(payAmt) || 0;
    if (!sid || amt <= 0) return;
    const p: FeePayment = {
      id: paymentId(termKey, sid, payRef.trim()),
      term: termKey,
      studentId: sid,
      amount: amt,
      ref: payRef.trim(),
      on: payDate
    };
    if (existingIds.has(p.id)) return;
    await commitPayments([p]);
    setPayments((prev) => [...prev, p]);
    setPayAmt("");
    setPayRef("");
    flash(`Recorded ${kes(amt)} on ${termKey} — the ledger moved.`);
  }

  function parseMpesa(t: string) {
    setMpParsed(parseMpesaStatement(t, data.students));
  }

  async function commitMpesa() {
    if (!mpParsed) return;
    const matched = mpParsed.lines
      .filter((l) => l.match && !existingIds.has(paymentId(termKey, l.match!.id, l.ref)))
      .map((l) => ({
        id: paymentId(termKey, l.match!.id, l.ref),
        term: termKey,
        studentId: l.match!.id,
        amount: l.amount,
        ref: l.ref,
        on: l.date
      }));
    if (matched.length === 0) {
      setNotice("Nothing new to commit — every line is already on the ledger.");
      return;
    }
    await commitPayments(matched);
    setPayments((prev) => [...prev, ...matched]);
    setMpRaw("");
    setMpParsed(null);
    flash(
      `Reconciled ${matched.length} M-Pesa line${matched.length === 1 ? "" : "s"} on ${termKey}` +
        (mpParsed.notes.length > 0 ? ` · ${mpParsed.notes.length} left out` : "") +
        "."
    );
  }
  return (
    <>
      <HeadRow label={`Fees · ${termKey} · ${classOf || "the roll"}`} right={<PrintButton label="Print fee sheet" />} />
      {notice && <Notice>{notice}</Notice>}

      {/* The invoice: one amount, one term, everyone under it. */}
      <div className={panel + " mb-[21px]"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={monoLabel}>The invoice</span>
          {active ? (
            <span className="rounded-full border border-teal/25 bg-teal/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-teal">
              Invoiced · {kes(active.amount)} each
            </span>
          ) : (
            <span className="rounded-full border border-ivory/10 bg-ivory/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
              Not invoiced yet
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input value={termName} onChange={(e) => setTermName(e.target.value)} className={field + " w-40"} placeholder="Term — 2026 T1" />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min={0}
            className={field + " w-32"}
            placeholder="KSh per student"
          />
          <button className={btn} disabled={!amount || active !== null} onClick={() => void invoice()}>
            Invoice every student
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[21px] border border-ivory/10 bg-ivory/10 sm:grid-cols-4">
          {[
            { k: "Collected", v: kes(paidTotal) },
            { k: "Outstanding", v: active ? kes(Math.max(0, outstanding)) : "—" },
            { k: "High risk", v: String(highRisk) },
            { k: "Balance in", v: pctIn === null ? "—" : `${pctIn}%` }
          ].map((s) => (
            <div key={s.k} className="bg-panel px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">{s.k}</p>
              <p className="mt-1 font-mono text-lg text-ivory">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The ledger: one row per student of the class, one risk answer. */}
      <div className={panel + " mb-[21px]"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={monoLabel}>The ledger · {classOf}</span>
          <select value={classOf} onChange={(e) => { setCls(e.target.value); setSelId(""); }} className={field + " w-auto"}>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {rows.length === 0 ? (
          <p className="mt-4 text-[13px] text-dim">No students in this class yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Student", "Billed", "Paid", "Balance", "Last payment", "Risk"].map((h) => (
                    <th key={h} className="border-b border-ivory/10 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => {
                  const st = standings[i];
                  return (
                    <tr key={s.id} className="border-b border-ivory/10/50">
                      <td className="whitespace-nowrap px-3 py-2 text-[13px] text-ivory">
                        {s.name}
                        {s.admNo && <span className="ml-2 font-mono text-[10px] text-dim">{s.admNo}</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-[12px] text-muted">{active ? kes(st.billed) : "—"}</td>
                      <td className="px-3 py-2 font-mono text-[12px] text-muted">{kes(st.paid)}</td>
                      <td className={`px-3 py-2 font-mono text-[12px] ${st.balance > 0 ? "text-amber" : "text-dim"}`}>
                        {st.balance > 0 ? kes(st.balance) : "Settled"}
                      </td>
                      <td className="px-3 py-2 font-mono text-[12px] text-dim">{st.last || "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          title={st.riskNote}
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${RISK_CHIP[st.risk]}`}
                        >
                          {RISK_LABEL[st.risk]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments: one by hand, or the M-Pesa statement pasted in bulk. */}
      <div className={panel + " p-0"}>
        <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-white/10">
          <div className="p-4 md:p-5">
            <span className={monoLabel}>Record one</span>
            <div className="mt-4 space-y-3">
              <select value={selId || rows[0]?.id || ""} onChange={(e) => setSelId(e.target.value)} className={field + " w-full"}>
                {rows.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.admNo ? ` (${s.admNo})` : ""}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input value={payAmt} onChange={(e) => setPayAmt(e.target.value)} type="number" min={0} className={field} placeholder="Amount, KSh" />
                <input value={payDate} onChange={(e) => setPayDate(e.target.value)} type="date" className={field} />
              </div>
              <input value={payRef} onChange={(e) => setPayRef(e.target.value)} className={field} placeholder="M-Pesa reference — optional" />
              <button className={btn} disabled={!payAmt || parseFloat(payAmt) <= 0} onClick={() => void recordOne()}>
                Record payment
              </button>
              <p className="text-[11px] leading-5 text-dim">
                Payments are recorded, never erased — a M-Pesa ledger is a ledger. To reverse one, record the
                reversal as its own line.
              </p>
            </div>
          </div>
          <div className="p-4 md:p-5">
            <span className={monoLabel}>Paste the M-Pesa statement</span>
            <p className="mt-3 text-[12px] leading-5 text-dim">
              One line per payment: date, reference, name or adm no, amount. What cannot be matched to the roll
              is listed — never dropped silently.
            </p>
            <textarea
              value={mpRaw}
              onChange={(e) => {
                setMpRaw(e.target.value);
                parseMpesa(e.target.value);
              }}
              rows={5}
              spellCheck={false}
              placeholder={"2026-09-01, MZK3A9B2C, A1001, 5000\n2026-09-02, MZK3D4E5F, Amina Wanjiru, 5000"}
              className="mt-3 w-full rounded-[21px] border border-ivory/10 bg-void p-4 font-mono text-[12px] leading-6 text-ivory outline-none transition-colors placeholder:text-dim focus:border-amber"
            />
            {mpParsed && mpParsed.notes.map((n) => (
              <Notice key={n} tone="warn">
                {n}
              </Notice>
            ))}
            {mpParsed && mpParsed.lines.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] text-dim">
                  {mpParsed.lines.filter((l) => l.match).length} match ·{" "}
                  {mpParsed.lines.filter((l) => !l.match).length} out
                </span>
                <button className={btnGhost} disabled={mpParsed.lines.every((l) => !l.match)} onClick={() => void commitMpesa()}>
                  Commit the matches
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The fee sheet: white A4, the only thing that reaches paper. */}
      {rows.length > 0 && (
        <div className="print-sheet bg-white p-6 text-obsidian">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">APT-LABS · {data.school || "School"}</p>
          <h3 className="mt-2 font-display text-2xl">FEE SHEET — {termKey} · {classOf}</h3>
          <p className="mt-1 text-[13px]">
            Generated {new Date().toISOString().slice(0, 10)} · {active ? `${kes(active.amount)} per student` : "not yet invoiced"}
          </p>
          <table className="mt-4 w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["Student", "Adm", "Billed", "Paid", "Balance", "Last payment", "Risk"].map((h) => (
                  <th key={h} className="border-b border-ivory/30 px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-obsidian/70">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => {
                const st = standings[i];
                return (
                  <tr key={s.id}>
                    <td className="border-b border-ivory/50 px-2 py-1.5 text-obsidian/80">{s.name}</td>
                    <td className="border-b border-ivory/50 px-2 py-1.5 font-mono text-[12px] text-obsidian/80">{s.admNo || "—"}</td>
                    <td className="border-b border-ivory/50 px-2 py-1.5 font-mono text-[12px] text-obsidian/80">{active ? kes(st.billed) : "—"}</td>
                    <td className="border-b border-ivory/50 px-2 py-1.5 font-mono text-[12px] text-obsidian/80">{kes(st.paid)}</td>
                    <td className="border-b border-ivory/50 px-2 py-1.5 font-mono text-[12px] text-obsidian/80">{st.balance > 0 ? kes(st.balance) : "Settled"}</td>
                    <td className="border-b border-ivory/50 px-2 py-1.5 font-mono text-[12px] text-obsidian/80">{st.last || "—"}</td>
                    <td className="border-b border-ivory/50 px-2 py-1.5 text-obsidian/80">{RISK_LABEL[st.risk]}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em]">
                  Class totals
                </td>
                <td className="px-2 py-1.5 font-mono text-[12px]">{active ? kes(active.amount * rows.length) : "—"}</td>
                <td className="px-2 py-1.5 font-mono text-[12px]">{kes(paidTotal)}</td>
                <td className="px-2 py-1.5 font-mono text-[12px]">{active ? kes(Math.max(0, outstanding)) : "—"}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
          <div className="mt-8 flex gap-10">
            <p className="w-40 border-t border-ivory/30 pt-1 text-[11px] text-obsidian/60">Bursar</p>
            <p className="w-40 border-t border-ivory/30 pt-1 text-[11px] text-obsidian/60">Head teacher</p>
          </div>
        </div>
      )}
    </>
  );
}

