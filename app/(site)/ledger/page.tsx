"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SCHOOL_STATS,
  SEED_MEMBERS,
  SUBSCRIBED_SCHOOLS,
  KEYS,
  TREASURY,
  loadStored,
  saveStored,
  seal,
  shortHash,
  ledgerVersion,
  masterHash,
  ledgerToCsv,
  ledgerToJson,
} from "../../../lib/ledger";
import "./ledger.css";

type FormErrors = Partial<Record<"name" | "skill", string>>;
type Status = "idle" | "loading" | "success";
type Verdict = "" | "found" | "no";

export default function LedgerPage() {
  const [entries, setEntries] = useState<Member[]>(SEED_MEMBERS);
  const [form, setForm] = useState({
    name: "",
    role: OCCUPATIONS[0],
    location: LOCATIONS[0],
    skill: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [verdict, setVerdict] = useState<Verdict>("");

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    if (stored.length > 0) setEntries(stored);
  }, []);

  // "/" jumps to the roll search from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      e.preventDefault();
      document.getElementById("roll-search")?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const total = entries.length;
  const verified = entries.filter((e) => e.verified).length;

  const filtered = entries.filter((e) => {
    if (location !== "all" && e.location !== location) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.occupation.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  const locationCounts = LOCATIONS.map((l) => ({
    name: l,
    n: entries.filter((e) => e.location === l).length,
  }));

  const searchExamples = Array.from(new Set(entries.map((e) => e.occupation))).slice(0, 3);

  function download(filename: string, mime: string, content: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FormErrors = {};
    if (form.name.trim().length < 2) errs.name = "Name needs at least 2 characters.";
    if (form.name.trim().length > 60) errs.name = "60 characters max.";
    if (!form.skill.trim()) errs.skill = "At least one skill. This is your proof.";
    if (form.skill.trim().length > 120) errs.skill = "120 characters max.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("loading");
    setTimeout(() => {
      const nextId = `AL-${String(total + 42).padStart(4, "0")}`;
      const newMember: Member = {
        id: nextId,
        name: form.name.trim(),
        username: form.name.trim().toLowerCase().replace(/\s+/g, "_"),
        occupation: form.role,
        location: form.location,
        skills: form.skill.split(",").map((s) => s.trim()).filter(Boolean),
        paid: false,
        // Sealed, not verified: a hash proves the record exists and has not
        // been altered. Nobody has attested this person's skill yet, so the
        // verified count must not move. Attestation flips this, not a submit.
        verified: false,
        hallPaid: false,
        tier: null,
        testScore: null,
        testTs: 0,
        hall: null,
        certNo: null,
        answers: [],
        hash: seal({ id: nextId, name: form.name.trim(), occupation: form.role, location: form.location }),
      };
      const next = [newMember, ...entries];
      setEntries(next);
      saveStored(KEYS.members, next);
      setStatus("success");
      setForm({ name: "", role: OCCUPATIONS[0], location: LOCATIONS[0], skill: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 600);
  }

  function verifyToken(e: React.FormEvent) {
    e.preventDefault();
    const needle = token.trim().toUpperCase();
    if (!needle) return;
    // Check the record we actually hold: an id, or the short seal. Identity is
    // never returned — this confirms a sealed record exists, nothing more.
    const hit = entries.some(
      (m) =>
        m.id.toUpperCase() === needle ||
        shortHash(m.hash).toUpperCase() === needle
    );
    setVerdict(hit ? "found" : "no");
  }

  const masterSeal = masterHash(entries.map((e) => e.hash));

  return (
    <main className="ledger-page">
      {/* ── Page header ── */}
      <header className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <p className="ledger-brand">APT-LABS <em>/</em> KIRINYAGA NODE <span>LOCAL RECORD</span></p>
            <h1 className="page-title">The Sovereign Ledger</h1>
            <p className="page-desc">
              Names, skills, and seals in one public record. Proof is added by
              others — never claimed by the person on the roll.
            </p>
          </div>
          <div className="ledger-telemetry" aria-label="Ledger status">
            <span className="ledger-beacon"><i aria-hidden="true" /> LOCAL RECORD ACTIVE</span>
            <span className="ledger-mesh">{total} entries · {verified} verified</span>
            <span className="ledger-seal">SEAL {shortHash(masterSeal)}</span>
          </div>
        </div>
      </header>

      <div className="page-body">
        <div className="page-grid">
          {/* ── Roll list ── */}
          <section className="roll-section" aria-labelledby="roll-heading">
            <div className="section-head">
              <h2 id="roll-heading" className="section-title">The roll</h2>
              <div className="section-tools">
                <span className="section-count label" aria-live="polite">
                  {filtered.length} {filtered.length === 1 ? "person" : "people"}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => download("aptlabs_roll.csv", "text/csv", ledgerToCsv(entries))}
                  title="Export the full roll as CSV"
                >
                  CSV
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => download("aptlabs_roll.json", "application/json", ledgerToJson(entries))}
                  title="Export the full roll as JSON"
                >
                  JSON
                </button>
              </div>
            </div>

            <div className="filter-chips" role="group" aria-label="Filter the roll by location">
              <button type="button" className="chip" aria-pressed={location === "all"} onClick={() => setLocation("all")}>
                All<span className="chip-n">{entries.length}</span>
              </button>
              {locationCounts.map(({ name, n }) => (
                <button
                  key={name}
                  type="button"
                  className="chip"
                  aria-pressed={location === name}
                  onClick={() => setLocation(location === name ? "all" : name)}
                >
                  {name}<span className="chip-n">{n}</span>
                </button>
              ))}
            </div>

            <form className="search-form" onSubmit={(e) => e.preventDefault()} role="search" aria-label="Search the roll">
              <label htmlFor="roll-search" className="sr-only">Search by name, role, location, or skill</label>
              <input
                id="roll-search"
                type="search"
                className="field field-search"
                placeholder="Search the roll…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </form>

            {filtered.length === 0 ? (
              <div className="empty-state" role="status">
                <svg className="empty-state-icon" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <p className="empty-state-heading">No one matches that search.</p>
                <p className="empty-state-body">Try a shorter name, a location, or a skill.</p>
                {searchExamples.length > 0 && (
                  <p className="empty-state-suggest">
                    <span className="label">Try</span>
                    {searchExamples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        className="chip"
                        onClick={() => {
                          setLocation("all");
                          setSearch(ex);
                        }}
                      >
                        {ex}
                      </button>
                    ))}
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearch("");
                    setLocation("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="roll-list" aria-label="People on the roll">
                {filtered.map((entry) => {
                  const open = openId === entry.id;
                  return (
                    <li key={entry.id} className={open ? "roll-entry is-open" : "roll-entry"}>
                      <button
                        type="button"
                        className="roll-entry-main"
                        aria-expanded={open}
                        aria-controls={`roll-detail-${entry.id}`}
                        onClick={() => setOpenId(open ? null : entry.id)}
                      >
                        <span className="roll-entry-content">
                          <span className="roll-entry-top">
                            <span className="roll-entry-name">{entry.name}</span>
                            {entry.verified && (
                              <span className="roll-badge">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                Verified
                              </span>
                            )}
                            <span className="roll-entry-role">{entry.occupation}</span>
                          </span>
                          <span className="roll-entry-meta">
                            <span className="roll-meta-item">{entry.location}</span>
                            <span className="roll-meta-sep" aria-hidden="true">·</span>
                            <span className="roll-meta-item">{entry.skills.join(", ")}</span>
                          </span>
                        </span>
                        <svg
                          className="roll-entry-caret"
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      </button>
                      <div id={`roll-detail-${entry.id}`} className="roll-entry-detail" hidden={!open}>
                        <dl className="roll-entry-detail-grid">
                          <dt className="label">Seal</dt>
                          <dd><code className="roll-detail-hash">{entry.hash}</code></dd>
                          <dt className="label">Standing</dt>
                          <dd>
                            {entry.verified ? `Verified${entry.tier ? ` · ${entry.tier} tier` : ""}` : "Unverified"}
                            {entry.paid ? " · paid" : ""}
                          </dd>
                          <dt className="label">Hall</dt>
                          <dd>{entry.hall ?? "—"}</dd>
                          <dt className="label">Certificate</dt>
                          <dd>{entry.certNo ?? "—"}</dd>
                          <dt className="label">Proof</dt>
                          <dd>{entry.skills.join(", ")}</dd>
                        </dl>
                      </div>
                      <div className="roll-entry-foot">
                        <code className="roll-meta-hash">{shortHash(entry.hash)}</code>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ── Under one roof ── */}
            <section className="under-roof" aria-labelledby="under-roof-heading">
              <div className="section-head">
                <h2 id="under-roof-heading" className="label label-signal">Under one roof · pilot</h2>
              </div>
              <dl className="roof-list">
                <div className="cred-row">
                  <dt><span className="label">Pilot schools · ~{SCHOOL_STATS.reduce((n, s) => n + s.students, 0)} students</span></dt>
                  <dd className="cred-value">{SUBSCRIBED_SCHOOLS.join(" · ")}</dd>
                </div>
                <div className="cred-row">
                  <dt><span className="label">Build budget</span></dt>
                  <dd className="cred-value">KES {TREASURY.total.toLocaleString()} · {TREASURY.usedPct}% spent</dd>
                </div>
                <div className="cred-row">
                  <dt><span className="label">Master seal</span></dt>
                  <dd className="cred-value"><code className="roll-meta-hash">{shortHash(masterSeal)}</code></dd>
                </div>
              </dl>
            </section>

            {/* ── Verify a credential ── */}
            <section className="verify-section" aria-labelledby="verify-heading">
              <div className="section-head">
                <h2 id="verify-heading" className="label label-signal">Verify a credential</h2>
                <span className="label">one at a time</span>
              </div>
              <form onSubmit={verifyToken} className="verify-form">
                <label htmlFor="verify-token" className="sr-only">Paste the token from the credential</label>
                <input
                  id="verify-token"
                  type="text"
                  className="field field-search"
                  placeholder="paste the token from the credential"
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setVerdict(""); }}
                  spellCheck={false}
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-primary">Verify</button>
              </form>
              {verdict === "found" && (
                <p className="message message-status" role="status">In the roll. A sealed record matches this token. Identity is not returned.</p>
              )}
              {verdict === "no" && (
                <p className="message message-info" role="status">Not on the roll. No sealed record for this token.</p>
              )}
              <p className="verify-note">Partial matches are not returned. Verification confirms a credential exists — it does not reveal identity.</p>
            </section>
          </section>
        </div>
      </div>
      {/* ── Register panel ── */}
      <div className="page-grid page-grid--register">
        <aside className="register-panel" aria-labelledby="register-heading">
          <div className="panel-inner">
            <p className="label label-signal">Register</p>
            <h2 id="register-heading" className="panel-title">Add yourself to the roll</h2>
            <p className="panel-desc">A name, a skill, and a line of proof. That is all the roll asks.</p>

            {status === "loading" && (
              <div className="message message-status" role="status">Writing to the roll…</div>
            )}
            {status === "success" && (
              <div className="message message-status" role="status">
                You are on the roll and the record is sealed. Verification is a
                separate step — it arrives when someone attests your work.
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit} noValidate aria-label="New roll entry">
              <div className="form-field">
                <label htmlFor="reg-name" className="label-field">Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className={["field", errors.name ? "field--error" : ""].filter(Boolean).join(" ")}
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="Your name — the name you use"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "err-name" : undefined}
                  autoComplete="name"
                  required
                />
                {errors.name && <p id="err-name" className="field-error" role="alert">{errors.name}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="reg-role" className="label-field">What you do</label>
                <select id="reg-role" className="field" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} required>
                  {OCCUPATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="reg-location" className="label-field">Where you are</label>
                <select id="reg-location" className="field" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="reg-skill" className="label-field">Your skill</label>
                <textarea
                  id="reg-skill"
                  className={["field", errors.skill ? "field--error" : ""].filter(Boolean).join(" ")}
                  value={form.skill}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, skill: e.target.value }));
                    if (errors.skill) setErrors((p) => ({ ...p, skill: undefined }));
                  }}
                  placeholder="One line: what you can actually do. This is your proof."
                  aria-invalid={!!errors.skill}
                  aria-describedby={errors.skill ? "err-skill" : "skill-hint"}
                  rows={3}
                  required
                />
                <p id="skill-hint" className="field-hint">The skill that proves you belong on the roll. Specific beats general.</p>
                {errors.skill && <p id="err-skill" className="field-error" role="alert">{errors.skill}</p>}
              </div>

              <button type="submit" className="btn btn-primary submit-btn" disabled={status === "loading"} aria-busy={status === "loading"}>
                {status === "loading" ? "Writing…" : "Put me on the roll →"}
              </button>

              <p className="form-fine-print">
                The seal is a hash of your name, role, and location. It does not
                reveal anything else. Verification checks the seal — not your identity.
              </p>
            </form>
          </div>
        </aside>
      </div>

      {/* ── Footer note ── */}
      <footer className="page-footer-note">
        <div className="page-footer-inner">
          <p className="page-footer-text">
            <span className="label">Ledger version {ledgerVersion(total)}</span>
          </p>
          <nav aria-label="Page navigation" className="page-footer-nav">
            <Link href="/" className="page-footer-link">Back to home</Link>
            <Link href="/benben" className="page-footer-link">The floor</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
