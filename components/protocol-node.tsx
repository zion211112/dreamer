"use client";

// The protocol node is a local-first demonstration surface. It renders the
// SNA control plane as an interface — contribution → allocation → execution
// → evidence — with every record labelled illustrative, proposed, or
// prototype. Nothing here is a deployment claim, a shared server, or a
// beneficiary count.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export type PnView =
  | "overview"
  | "identity"
  | "contributions"
  | "proposals"
  | "juries"
  | "pools"
  | "assets"
  | "roll"
  | "audit";

/** Where the brand mark resolves when the node is mounted at a sub-route. */
export const PROTOCOL_HOME = "/";

const CONTROL: { view: PnView; label: string; glyph: string }[] = [
  { view: "overview",      label: "Overview",      glyph: "◈" },
  { view: "identity",      label: "Identity",      glyph: "◇" },
  { view: "contributions", label: "Contributions", glyph: "＋" },
  { view: "proposals",     label: "Proposals",     glyph: "□" },
  { view: "juries",        label: "Juries",        glyph: "∿" },
  { view: "pools",         label: "Allocation pools", glyph: "◎" },
];

const EXECUTION: { view: PnView; label: string; glyph: string }[] = [
  { view: "assets", label: "Assets",   glyph: "▣" },
  { view: "roll",   label: "The Roll", glyph: "⌁" },
  { view: "audit",  label: "Audit",    glyph: "≡" },
] as const;

const VIEW_TITLES: Record<PnView, string> = {
  overview: "Overview",
  identity: "Identity",
  contributions: "Contributions",
  proposals: "Proposals",
  juries: "Juries",
  pools: "Allocation pools",
  assets: "Assets",
  roll: "The Roll",
  audit: "Audit",
};

export default function ProtocolNode() {
  const [view, setView] = useState<PnView>("overview");
  const [synced, setSynced] = useState(false);

  const go = useCallback((next: PnView) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // "/" focuses nothing (no search here); but keep a keyboard shortcut to
  // jump to the overview so the control plane is always one keystroke away.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setView("overview");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sync = () => {
    setSynced(true);
    window.setTimeout(() => setSynced(false), 1400);
  };

  return (
    <div className="protocol-node">
      <div className="pn-shell">
        {/* ── Sidebar ── */}
        <aside className="pn-side" aria-label="Protocol node control plane">
          <Link className="pn-brand" href={PROTOCOL_HOME}>
            <span className="pn-mark" aria-hidden="true">A</span>
            <span>APT-LABS</span>
          </Link>

          <div className="pn-node">
            <small>Protocol node</small>
            <strong>Kirinyaga / 01</strong>
            <div className="pn-live">Local node interface</div>
          </div>

          <div className="pn-navlabel">Control plane</div>
          <nav className="pn-navgroup" aria-label="Control plane">
            {CONTROL.map((n) => (
              <button
                key={n.view}
                type="button"
                className="pn-nav"
                aria-current={view === n.view ? "page" : undefined}
                onClick={() => go(n.view)}
              >
                <span className="pn-nav-glyph" aria-hidden="true">{n.glyph}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="pn-navlabel">Execution</div>
          <nav className="pn-navgroup" aria-label="Execution">
            {EXECUTION.map((n) => (
              <button
                key={n.view}
                type="button"
                className="pn-nav"
                aria-current={view === n.view ? "page" : undefined}
                onClick={() => go(n.view)}
              >
                <span className="pn-nav-glyph" aria-hidden="true">{n.glyph}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="pn-foot">
            Opt-in civic infrastructure
            <br />
            Local-first / evidence-first
            <br />
            Protocol state / prototype
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="pn-main">
          <button
            type="button"
            className="pn-mobiletoggle"
            aria-label="Protocol node control plane"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Control plane
          </button>

          <div className="pn-top">
            <div className="pn-crumb">
              APT-LABS / <b>{VIEW_TITLES[view]}</b>
            </div>
            <div>
              <button
                type="button"
                className={`pn-topbtn${synced ? " is-synced" : ""}`}
                onClick={sync}
                aria-live="polite"
              >
                {synced ? "Record synced" : "Sync record"}
              </button>
            </div>
          </div>

          <div className="pn-content">
            <ViewShell active={view} />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* View shell: one active view at a time.                          */
/* ---------------------------------------------------------------- */

const VIEW_ORDER: PnView[] = [
  "overview",
  "identity",
  "contributions",
  "proposals",
  "juries",
  "pools",
  "assets",
  "roll",
  "audit",
];

const VIEW_COMPONENTS: Record<PnView, React.ComponentType> = {
  overview: OverviewView,
  identity: IdentityView,
  contributions: ContributionsView,
  proposals: ProposalsView,
  juries: JuriesView,
  pools: PoolsView,
  assets: AssetsView,
  roll: RollView,
  audit: AuditView,
};

function ViewShell({ active }: { active: PnView }) {
  const Active = VIEW_COMPONENTS[active];
  return (
    <section
      id={`pn-v-${active}`}
      className="pn-view is-active"
      role="region"
      aria-label={VIEW_TITLES[active]}
    >
      <Active />
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 01 — OVERVIEW                                                    */
/* ---------------------------------------------------------------- */

function OverviewView() {
  return (
    <>
      <Command
        eyebrow="APT-LABS / Protocol Node"
        title={(
          <>
            The civic infrastructure
            <br />
            behind the build.
          </>
        )}
        copy="A local control plane connecting contribution, collective decisions, allocation, physical execution and verifiable evidence. Governance mechanisms are explicit protocol objects — not invisible authority."
        specs={[
          ["Node", "Kirinyaga / local"],
          ["Mode", "Opt-in / prototype"],
          ["Ledger", "People + assets"],
          ["Evidence", "Signed / traceable"],
        ]}
      />

      <div className="pn-pulse" role="group" aria-label="Protocol pulse">
        <div className="pn-pulse-main">
          <div className="eyebrow">Protocol pulse</div>
          <strong>Contribution → allocation → execution → evidence</strong>
        </div>
        <div className="pn-pulse-cell"><small>People</small><b>Registered</b></div>
        <div className="pn-pulse-cell"><small>Work</small><b>Attributed</b></div>
        <div className="pn-pulse-cell"><small>Allocations</small><b>Scoped</b></div>
        <div className="pn-pulse-cell"><small>Claims</small><b>Evidence-bound</b></div>
      </div>

      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Node overview</h2>
          <span>No hidden state / no automatic trust elevation</span>
        </div>
        <div className="pn-grid2">
          <div className="pn-panel">
            <div className="pn-panelhead">
              <span>Topology</span>
              <strong>Local execution surface</strong>
            </div>
            <div className="pn-map" role="img" aria-label="Protocol node topology: four local registers around a single execution core">
              <div className="pn-mnode pn-mnode--live pn-mnode--1"><small>01</small><b>People</b></div>
              <div className="pn-mnode pn-mnode--review pn-mnode--2"><small>02</small><b>Proposals</b></div>
              <div className="pn-mnode pn-mnode--live pn-mnode--3"><small>03</small><b>Assets</b></div>
              <div className="pn-mnode pn-mnode--live pn-mnode--4"><small>04</small><b>Evidence</b></div>
              <div className="pn-core" aria-hidden="true" />
              <div className="pn-core-label">protocol<br />node</div>
            </div>
          </div>

          <div className="pn-panel">
            <div className="pn-panelhead">
              <span>Illustrative measures</span>
              <strong>Prototype</strong>
            </div>
            <div className="pn-bars">
              <Bar label="Contribution trace" value={78} />
              <Bar label="Evidence coverage" value={64} gold />
              <Bar label="Allocation spread" value={71} />
              <Bar label="Node health" value={91} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 02 — IDENTITY                                                    */
/* ---------------------------------------------------------------- */

function IdentityView() {
  const rows = [
    {
      id: "ID-01",
      title: "Local participation credential",
      type: "Presence / contribution",
      copy: "Proves a defined eligibility condition without exposing every underlying attribute.",
      state: "Proposed",
    },
    {
      id: "ID-02",
      title: "Skill credential",
      type: "APT Studio / learning",
      copy: "Links a verified skill or completed task to an issuer and evidence bundle.",
      state: "Proposed",
    },
    {
      id: "ID-03",
      title: "Contributor credential",
      type: "The Roll / attribution",
      copy: "Connects a contribution to a person, time, scope and supporting evidence.",
      state: "Prototype",
    },
  ];
  return (
    <>
      <Command
        eyebrow="01 / Identity"
        title={(
          <>
            Prove what matters.
            <br />
            Reveal less.
          </>
        )}
        copy="Identity is a credential layer, not a power meter. Eligibility can be proven without exposing unnecessary personal information to every verifier."
        specs={[
          ["Credential", "Verifiable claim"],
          ["Proof", "Selective disclosure"],
          ["Recovery", "Human + local path"],
          ["Appeal", "Independent review"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Credential objects</h2>
          <span>Prototype policy</span>
        </div>
        <Registry rows={rows} />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 03 — CONTRIBUTIONS                                               */
/* ---------------------------------------------------------------- */

function ContributionsView() {
  const rows = [
    {
      id: "C-109",
      title: "Water node maintenance",
      type: "APT Fab / field work",
      copy: "Maintenance event linked to an asset with service record and verifier signature.",
      state: "Verified",
      tint: "verified",
    },
    {
      id: "C-108",
      title: "Local compute setup",
      type: "APT Studio / node work",
      copy: "Node provisioning and technical handover record.",
      state: "Recorded",
      tint: "recorded",
    },
    {
      id: "C-107",
      title: "Supply-chain mediation",
      type: "Civic process / dispute",
      copy: "Resolution record with roles, evidence bundle and appeal window.",
      state: "Review",
      tint: "review",
    },
  ];
  return (
    <>
      <Command
        eyebrow="02 / Contributions"
        title={(
          <>
            Contribution becomes
            <br />
            inspectable history.
          </>
        )}
        copy="Useful work becomes an evidence-backed event. Contribution may later inform eligibility or reputation, but that mapping remains an explicit protocol rule."
        specs={[
          ["Submit", "Event + evidence"],
          ["Verify", "Issuer / witness"],
          ["Attribute", "Person + asset"],
          ["Record", "The Roll"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Contribution events</h2>
          <span>Illustrative records</span>
        </div>
        <Registry rows={rows} tinted />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 04 — PROPOSALS                                                   */
/* ---------------------------------------------------------------- */

function ProposalsView() {
  return (
    <>
      <Command
        eyebrow="03 / Proposals"
        title={(
          <>
            Public choices.
            <br />
            Explicit rules.
          </>
        )}
        copy="Every proposal declares the question, budget, eligibility, decision method, execution condition and appeal path before a decision is made."
        specs={[
          ["Question", "Publicly stated"],
          ["Budget", "Bounded"],
          ["Rule", "Versioned"],
          ["Appeal", "Defined before execution"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Open proposals</h2>
          <span>No outcome implied</span>
        </div>
        <div className="pn-cards">
          <Card
            meta="PR-014"
            state="Open"
            title="Where should the next service node go?"
            copy="Scope, eligibility, allocation pool, implementation constraints and evidence checklist published together."
            footL="Allocation rule / candidate"
            footR="9d remaining"
          />
          <Card
            meta="PR-013"
            state="Review"
            gold
            title="Approve a community compute expansion."
            copy="Capacity, maintenance burden, procurement record and operator plan exposed before decision."
            footL="Decision / mixed"
            footR="Appeal open"
          />
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 05 — JURIES                                                      */
/* ---------------------------------------------------------------- */

function JuriesView() {
  const rows = [
    { id: "J-009", sub: "Solar service node siting", meta: "6 seats · 9-day term · eligibility proof required", state: "Selected", tint: "live" },
    { id: "J-008", sub: "Supply-chain dispute", meta: "5 seats · 5-day term · decision recorded", state: "Concluded", tint: "neutral" },
    { id: "J-007", sub: "Compute allocation review", meta: "7 seats · 7-day term · conflicts disclosed", state: "Appeal", tint: "gold" },
  ];
  return (
    <>
      <Command
        eyebrow="04 / Juries"
        title={(
          <>
            Sortition, with
            <br />
            receipts.
          </>
        )}
        copy="Temporary panels are protocol objects: eligibility, randomness source, selection proof, conflicts, duration, decision and appeal are recorded."
        specs={[
          ["Selection", "Randomized / scoped"],
          ["Privacy", "Selective reveal"],
          ["Conflict", "Declared"],
          ["Decision", "Signed"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Temporary panels</h2>
          <span>Illustrative protocol objects</span>
        </div>
        <div className="pn-jury" role="group" aria-label="Temporary sortition panels">
          {rows.map((r) => (
            <div className="pn-juryrow" key={r.id}>
              <div className="pn-jid">{r.id}</div>
              <div>
                <div className="pn-jsub">{r.sub}</div>
                <div className="pn-jmeta">{r.meta}</div>
              </div>
              <div className={`pn-jstate${r.tint === "live" ? " pn-jstate--live" : r.tint === "gold" ? " pn-jstate--gold" : ""}`}>
                {r.state}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 06 — ALLOCATION POOLS                                            */
/* ---------------------------------------------------------------- */

function PoolsView() {
  return (
    <>
      <Command
        eyebrow="05 / Allocation pools"
        title={(
          <>
            Capital follows
            <br />
            declared rules.
          </>
        )}
        copy="Funding pools stay separate from the identity ledger. Contributions, matching logic, thresholds, release conditions and post-build evidence are explicit."
        specs={[
          ["Funding", "Community pool"],
          ["Rule", "Versioned matching"],
          ["Release", "Milestone bound"],
          ["Reconcile", "The Roll"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Allocation pools</h2>
          <span>Prototype economics</span>
        </div>
        <div className="pn-cards">
          <Card
            meta="POOL-014"
            state="Pending"
            title="Solar service node"
            copy="Deployment candidate with explicit release conditions and evidence checklist."
            footL="KSh 420K illustrative"
            footR="Release pending"
          />
          <Card
            meta="POOL-013"
            state="Review"
            gold
            title="Local compute node"
            copy="Expansion candidate with hardware, power, maintenance and operator requirements."
            footL="KSh 300K illustrative"
            footR="Review"
          />
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 07 — ASSETS                                                      */
/* ---------------------------------------------------------------- */

function AssetsView() {
  const rows = [
    {
      id: "AF-014",
      title: "Solar service node",
      type: "APT Fab / energy",
      copy: "BOM, sourcing record, installer record and acceptance checklist linked.",
      state: "Designed",
    },
    {
      id: "AS-007",
      title: "Creative compute node",
      type: "APT Studio / compute",
      copy: "Hardware inventory and node test record available; installation remains scoped.",
      state: "Built",
    },
    {
      id: "BB-003",
      title: "School Console",
      type: "BenBen Builds / software",
      copy: "Local prototype; no verified school deployment.",
      state: "Prototype",
    },
  ];
  return (
    <>
      <Command
        eyebrow="06 / Assets"
        title={(
          <>
            From decision
            <br />
            to physical reality.
          </>
        )}
        copy="Allocation is not completion. Assets move through explicit lifecycle states, each requiring the evidence appropriate to that state."
        specs={[
          ["Designed", "Specification"],
          ["Built", "Fabrication evidence"],
          ["Installed", "Handover evidence"],
          ["Verified", "Claim-specific proof"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Asset register</h2>
          <span>The Roll / asset side</span>
        </div>
        <Registry rows={rows} />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 08 — THE ROLL                                                    */
/* ---------------------------------------------------------------- */

function RollView() {
  const rows = [
    { t: "00:12:41", msg: "Contribution C-109 linked to asset AF-014", state: "Signed", tint: "signed" },
    { t: "00:09:20", msg: "Jury J-009 selection proof published", state: "Published", tint: "published" },
    { t: "23:51:02", msg: "Pool POOL-014 threshold recalculated", state: "Recorded", tint: "recorded" },
    { t: "23:44:19", msg: "Asset AF-014 evidence bundle appended", state: "Hashed", tint: "hashed" },
  ];
  return (
    <>
      <Command
        eyebrow="07 / The Roll"
        title={(
          <>
            One ledger.
            <br />
            Two registers.
          </>
        )}
        copy="The Roll links people, contributions, assets, costs and evidence. Governance mechanisms can read the ledger, but the ledger itself does not decide who has power."
        specs={[
          ["People", "Contribution record"],
          ["Assets", "Lifecycle record"],
          ["Evidence", "Cryptographic integrity"],
          ["Governance", "Explicit policy layer"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Audit trail</h2>
          <span>Illustrative records</span>
        </div>
        <div className="pn-auditlist">
          {rows.map((r) => (
            <div className="pn-auditrow" key={r.t}>
              <span>{r.t}</span>
              <p>{r.msg}</p>
              <span className={`pn-auditstate pn-auditstate--${r.tint}`}>{r.state}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 09 — AUDIT                                                       */
/* ---------------------------------------------------------------- */

function AuditView() {
  const rows = [
    { id: "T-08", msg: "Credential issued after verified contribution", state: "Signed", tint: "signed" },
    { id: "T-07", msg: "Proposal rule version updated before opening", state: "Recorded", tint: "recorded" },
    { id: "T-06", msg: "Jury conflict disclosure appended", state: "Published", tint: "published" },
    { id: "T-05", msg: "Pool disbursement withheld pending evidence", state: "Blocked", tint: "blocked" },
  ];
  const principles = [
    ["01 / Identity separation", "Identity assurance does not automatically determine governance weight."],
    ["02 / Privacy", "Reveal only the attributes required for the claim being verified."],
    ["03 / No unilateral mutation", "High-impact transitions require explicit authorization paths."],
    ["04 / Appeals", "Disputed records have a visible path to review and correction."],
    ["05 / External audit", "Exports permit independent reconstruction of protocol decisions."],
  ];
  return (
    <>
      <Command
        eyebrow="08 / Audit"
        title={(
          <>
            Trust is a trail,
            <br />
            not a badge.
          </>
        )}
        copy="High-impact transitions should be reconstructable: rule version, actors, evidence, timing, authorization, outcome and appeal state."
        specs={[
          ["Integrity", "Hashes / signatures"],
          ["Rules", "Versioned"],
          ["Appeals", "Recorded"],
          ["Exports", "Machine-readable"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Capture controls</h2>
          <span>Trace + principles</span>
        </div>
        <div className="pn-audit">
          <div className="pn-auditlist">
            <div className="pn-panelhead">
              <span>Recent transitions</span>
              <strong>Trace</strong>
            </div>
            {rows.map((r) => (
              <div className="pn-auditrow" key={r.id}>
                <span>{r.id}</span>
                <p>{r.msg}</p>
                <span className={`pn-auditstate pn-auditstate--${r.tint}`}>{r.state}</span>
              </div>
            ))}
          </div>
          <aside className="pn-principles">
            <h3>Capture controls.</h3>
            {principles.map(([label, body]) => (
              <div className="pn-principle" key={label}>
                <b>{label}</b>
                {body}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Reusable pieces                                                 */
/* ---------------------------------------------------------------- */

function Command({
  eyebrow,
  title,
  copy,
  specs,
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  specs: [string, string][];
}) {
  return (
    <div className="pn-command">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <div className="pn-specs">
        {specs.map(([k, v]) => (
          <div className="pn-spec" key={k}>
            <small>{k}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, value, gold }: { label: string; value: number; gold?: boolean }) {
  return (
    <div className="pn-bar">
      <small>{label}</small>
      <div
        className="pn-track"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`pn-fill${gold ? " pn-fill--gold" : ""}`} style={{ width: `${value}%` }} />
      </div>
      <div className="pn-val">{value}</div>
    </div>
  );
}

function Registry({
  rows,
  tinted,
}: {
  rows: { id: string; title: string; type: string; copy: string; state: string; tint?: string }[];
  tinted?: boolean;
}) {
  return (
    <div className="pn-registry" role="group" aria-label="Protocol object register">
      {rows.map((r) => (
        <div key={r.id} className={`pn-row${r.tint && tinted ? ` pn-state--${r.tint}` : ""}`}>
          <div className="pn-rowid">{r.id}</div>
          <div>
            <div className="pn-rowtitle">{r.title}</div>
            <div className="pn-rowtype">{r.type}</div>
          </div>
          <div className="pn-rowcopy">{r.copy}</div>
          <div className="pn-state">{r.state}</div>
          <button
            type="button"
            className="pn-open"
            aria-label={`Open ${r.title}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M17 7H8M17 7V16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function Card({
  meta,
  state,
  title,
  copy,
  footL,
  footR,
  gold,
}: {
  meta: string;
  state: string;
  title: string;
  copy: string;
  footL: string;
  footR: string;
  gold?: boolean;
}) {
  return (
    <article className={`pn-card${gold ? " pn-card--gold" : ""}`}>
      <div className="pn-cardmeta">
        <span>{meta}</span>
        <span className="pn-cardmeta-state">{state}</span>
      </div>
      <h3>{title}</h3>
      <p>{copy}</p>
      <div className="pn-cardfoot">
        <span>{footL}</span>
        <span>{footR}</span>
      </div>
    </article>
  );
}
