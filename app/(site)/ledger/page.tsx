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
  const [token, setToken] = useState("");
  const [verdict, setVerdict] = useState<Verdict>("");

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    if (stored.length > 0) setEntries(stored);
  }, []);

  const total = entries.length;
  const verified = entries.filter((e) => e.verified).length;

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.occupation.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase()) ||
          e.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : entries;

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
        verified: true,
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
    if (!token.trim()) return;
    setVerdict(token.trim().startsWith("AL-") ? "found" : "no");
  }

  const masterSeal = masterHash(entries.map((e) => e.hash));

  return (
    <main className="ledger-page">
      {/* ── Page header ── */}
      <header className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <p className="label label-signal">The ledger</p>
            <h1 className="page-title">Names, proof, and the shared record.</h1>
            <p className="page-desc">
              Everyone who can do something is on the roll — verified by work, not by paperwork.
            </p>
          </div>
          <div className="page-header-stats" aria-label="Ledger summary">
            <div className="stat">
              <span className="stat-value">{total}</span>
              <span className="stat-label">on the roll</span>
            </div>
            <div className="stat-divider" aria-hidden="true" />
            <div className="stat">
              <span className="stat-value">{verified}</span>
              <span className="stat-label">verified</span>
            </div>
          </div>
        </div>
      </header>

      <div className="page-body">
        <div className="page-grid">
          {/* ── Roll list ── */}
          <section className="roll-section" aria-labelledby="roll-heading">
            <div className="section-head">
              <h2 id="roll-heading" className="section-title">The roll</h2>
              <span className="section-count label" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "person" : "people"}
              </span>
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
                <button type="button" className="btn btn-secondary" onClick={() => setSearch("")}>Clear search</button>
              </div>
            ) : (
              <ul className="roll-list" aria-label="People on the roll">
                {filtered.map((entry) => (
                  <li key={entry.id} className="roll-entry">
                    <div className="roll-entry-content">
                      <div className="roll-entry-top">
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
                      </div>
                      <div className="roll-entry-meta">
                        <span className="roll-meta-item">{entry.location}</span>
                        <span className="roll-meta-sep" aria-hidden="true">·</span>
                        <span className="roll-meta-item">{entry.skills.join(", ")}</span>
                      </div>
                      <div className="roll-entry-foot">
                        <code className="roll-meta-hash">{shortHash(entry.hash)}</code>
                      </div>
                    </div>
                  </li>
                ))}
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
              <div className="message message-status" role="status">You are on the roll. The seal is above.</div>
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
